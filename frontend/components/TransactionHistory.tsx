'use client';

import { useEffect, useState } from 'react';
import { X, ExternalLink, User, Clock, ArrowUpRight, ArrowDownLeft, Loader2, RefreshCw } from 'lucide-react';
import { useWalletStore } from '@/store/walletStore';
import api from '@/lib/api';

interface Counterparty {
  id: string | null;
  username: string | null;
  profilePicture: string | null;
  walletAddress: string;
  isRegistered: boolean;
}

interface Transaction {
  id: string;
  senderWallet: string;
  recipientWallet: string;
  amount: number;
  txHash: string;
  status: string;
  createdAt: string;
  type: 'sent' | 'received';
  counterparty: Counterparty;
}

interface TransactionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionHistory({ isOpen, onClose }: TransactionHistoryProps) {
  const { walletApi } = useWalletStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryingTx, setRetryingTx] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTransactions();
    }
  }, [isOpen]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/transactions/history');
      setTransactions(response.data.transactions);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async (tx: Transaction) => {
    if (!walletApi) {
      setError('Please connect your wallet to retry');
      return;
    }

    setRetryingTx(tx.id);
    setError(null);

    try {
      // Dynamic import to avoid SSR issues
      const { Blaze, Blockfrost, Core, WebWallet } = await import('@blaze-cardano/sdk');

      const projectId = process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID;
      if (!projectId) throw new Error('Blockfrost API key not configured');

      const provider = new Blockfrost({
        network: 'cardano-preview',
        projectId,
      });

      const wallet = new WebWallet(walletApi as any);
      const blaze = await Blaze.from(provider, wallet);

      // Convert ADA to Lovelace
      const lovelaceAmount = BigInt(Math.floor(tx.amount * 1_000_000));

      // Build transaction
      const newTx = await blaze
        .newTransaction()
        .payLovelace(
          Core.Address.fromBech32(tx.recipientWallet),
          lovelaceAmount
        )
        .complete();

      // Sign and submit
      const signedTx = await blaze.signTransaction(newTx);
      const newTxHash = await blaze.provider.postTransactionToChain(signedTx);

      // Get sender address
      const senderAddressHex = await walletApi.getChangeAddress();
      const senderAddress = Core.Address.fromBytes(
        Core.HexBlob(senderAddressHex)
      ).toBech32();

      // Save new transaction
      await api.post('/transactions', {
        senderWallet: senderAddress,
        recipientWallet: tx.recipientWallet,
        amount: tx.amount,
        txHash: newTxHash,
      });

      // Refresh list
      await fetchTransactions();
    } catch (err: any) {
      console.error('Retry failed:', err);
      setError(err.message || 'Retry failed');
    } finally {
      setRetryingTx(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 12)}...${address.slice(-8)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-500/20 text-green-300 border border-green-500/30';
      case 'SUBMITTED':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      case 'FAILED':
        return 'bg-red-500/20 text-red-300 border border-red-500/30';
      default:
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="glass-dark rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col border border-purple-500/30 animate-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-purple-500/20 flex items-center justify-between flex-shrink-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-purple-100">Transaction History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-purple-500/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-purple-300" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-3" />
              <p className="text-purple-300/60 text-sm">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-red-400 mb-3">{error}</p>
              <button
                onClick={fetchTransactions}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Try again
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <ArrowUpRight className="w-10 h-10 text-purple-400/50" />
              </div>
              <p className="text-purple-200 font-medium mb-1">No transactions yet</p>
              <p className="text-sm text-purple-300/60">
                Your transactions will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-purple-500/10">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-5 hover:bg-purple-500/5 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    {/* Counterparty Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Type indicator */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        tx.type === 'sent' 
                          ? 'bg-red-500/20 border border-red-500/30' 
                          : 'bg-green-500/20 border border-green-500/30'
                      }`}>
                        {tx.counterparty.profilePicture ? (
                          <img
                            src={tx.counterparty.profilePicture}
                            alt={tx.counterparty.username || 'User'}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                        ) : tx.type === 'sent' ? (
                          <ArrowUpRight className="w-6 h-6 text-red-400" />
                        ) : (
                          <ArrowDownLeft className="w-6 h-6 text-green-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                            tx.type === 'sent' 
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                              : 'bg-green-500/20 text-green-300 border border-green-500/30'
                          }`}>
                            {tx.type === 'sent' ? 'Sent to' : 'Received from'}
                          </span>
                          <span className="font-semibold text-purple-100">
                            {tx.counterparty.isRegistered
                              ? tx.counterparty.username
                              : 'Unknown User'}
                          </span>
                          {tx.counterparty.isRegistered && (
                            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-lg border border-blue-500/30">
                              Registered
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-purple-300/60 font-mono truncate">
                          {formatAddress(tx.counterparty.walletAddress)}
                        </p>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right flex-shrink-0">
                      <p className={`text-xl font-bold mb-2 ${
                        tx.type === 'sent' ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {tx.type === 'sent' ? '-' : '+'}{tx.amount.toFixed(2)} <span className="text-base">₳</span>
                      </p>
                      <div className="flex items-center gap-2 justify-end flex-wrap">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${getStatusColor(
                            tx.status
                          )}`}
                        >
                          {tx.status}
                        </span>
                        {/* Retry button for failed sent transactions */}
                        {tx.status === 'FAILED' && tx.type === 'sent' && (
                          <button
                            onClick={() => handleRetry(tx)}
                            disabled={retryingTx === tx.id}
                            className="flex items-center gap-1 text-xs px-2.5 py-1 bg-orange-500/20 text-orange-300 rounded-lg hover:bg-orange-500/30 transition-colors disabled:opacity-50 border border-orange-500/30 font-medium"
                          >
                            {retryingTx === tx.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <RefreshCw className="w-3 h-3" />
                            )}
                            Retry
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="mt-4 pt-3 border-t border-purple-500/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-purple-300/60">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDate(tx.createdAt)}</span>
                    </div>
                    <a
                      href={`https://preview.cardanoscan.io/transaction/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors font-medium"
                    >
                      <span className="font-mono">{tx.txHash.slice(0, 16)}...</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-purple-500/20 bg-slate-950/50 flex-shrink-0 flex items-center justify-between">
          <p className="text-xs text-purple-300/60">
            Showing all transactions on <span className="font-semibold text-yellow-400">Preview Network</span>
          </p>
          <button
            onClick={fetchTransactions}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors text-xs font-medium border border-purple-500/30 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
