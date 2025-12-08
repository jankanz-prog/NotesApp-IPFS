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
        return 'bg-green-100 text-green-700';
      case 'SUBMITTED':
        return 'bg-yellow-100 text-yellow-700';
      case 'FAILED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchTransactions}
                className="mt-2 text-blue-600 hover:underline text-sm"
              >
                Try again
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <ArrowUpRight className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Your transactions will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    {/* Counterparty Info */}
                    <div className="flex items-center gap-3">
                      {/* Type indicator */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'sent' ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        {tx.counterparty.profilePicture ? (
                          <img
                            src={tx.counterparty.profilePicture}
                            alt={tx.counterparty.username || 'User'}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : tx.type === 'sent' ? (
                          <ArrowUpRight className="w-5 h-5 text-red-600" />
                        ) : (
                          <ArrowDownLeft className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                            tx.type === 'sent' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {tx.type === 'sent' ? 'Sent to' : 'Received from'}
                          </span>
                          <span className="font-medium text-gray-900">
                            {tx.counterparty.isRegistered
                              ? tx.counterparty.username
                              : 'Unknown User'}
                          </span>
                          {tx.counterparty.isRegistered && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                              Registered
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 font-mono">
                          {formatAddress(tx.counterparty.walletAddress)}
                        </p>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <p className={`font-bold ${
                        tx.type === 'sent' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {tx.type === 'sent' ? '-' : '+'}{tx.amount.toFixed(2)} ₳
                      </p>
                      <div className="flex items-center gap-2 justify-end mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
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
                            className="flex items-center gap-1 text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition disabled:opacity-50"
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
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(tx.createdAt)}</span>
                    </div>
                    <a
                      href={`https://preview.cardanoscan.io/transaction/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <span className="font-mono">{tx.txHash.slice(0, 16)}...</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <p className="text-xs text-gray-500 text-center">
            Showing all transactions on Preview Network
          </p>
        </div>
      </div>
    </div>
  );
}
