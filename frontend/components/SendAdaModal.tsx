'use client';

import { useState } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { X, Send, Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import api from '@/lib/api';

interface SendAdaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SendAdaModal({ isOpen, onClose }: SendAdaModalProps) {
  const { walletApi, balanceAda } = useWalletStore();
  
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!walletApi) {
      setError('Wallet not connected');
      return;
    }

    if (!recipientAddress.trim()) {
      setError('Please enter a recipient address');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Minimum 1 ADA
    if (parseFloat(amount) < 1) {
      setError('Minimum amount is 1 ADA');
      return;
    }

    setError(null);
    setIsSending(true);
    setTxHash(null);

    try {
      // Dynamic import to avoid SSR issues
      const { Blaze, Blockfrost, Core, WebWallet } = await import('@blaze-cardano/sdk');

      const projectId = process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID;
      if (!projectId) {
        throw new Error('Blockfrost API key not configured');
      }

      const provider = new Blockfrost({
        network: 'cardano-preview',
        projectId,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wallet = new WebWallet(walletApi as any);
      const blaze = await Blaze.from(provider, wallet);

      // Convert ADA to Lovelace (1 ADA = 1,000,000 Lovelace)
      const lovelaceAmount = BigInt(Math.floor(parseFloat(amount) * 1_000_000));

      // Build transaction
      const tx = await blaze
        .newTransaction()
        .payLovelace(
          Core.Address.fromBech32(recipientAddress.trim()),
          lovelaceAmount
        )
        .complete();

      console.log('Transaction built:', tx.toCbor());

      // Sign transaction
      const signedTx = await blaze.signTransaction(tx);
      console.log('Transaction signed');

      // Submit to blockchain
      const hash = await blaze.provider.postTransactionToChain(signedTx);
      console.log('Transaction submitted. Hash:', hash);

      // Get sender wallet address
      const senderAddressHex = await walletApi.getChangeAddress();
      const senderAddress = Core.Address.fromBytes(
        Core.HexBlob(senderAddressHex)
      ).toBech32();

      // Save transaction to database
      try {
        await api.post('/transactions', {
          senderWallet: senderAddress,
          recipientWallet: recipientAddress.trim(),
          amount: parseFloat(amount),
          txHash: hash,
        });
        console.log('Transaction saved to database');
      } catch (saveErr) {
        console.warn('Failed to save transaction to database:', saveErr);
        // Don't fail the whole operation if saving fails
      }

      setTxHash(hash);
    } catch (err: any) {
      console.error('Transaction error:', err);
      setError(err.message || 'Transaction failed');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setRecipientAddress('');
    setAmount('');
    setError(null);
    setTxHash(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="glass-dark rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-purple-500/30 animate-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-purple-500/20 flex items-center justify-between bg-gradient-to-r from-purple-600/10 to-pink-600/10">
          <h2 className="text-xl font-bold text-purple-100">Send ADA</h2>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-purple-500/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-purple-300" />
          </button>
        </div>

        {/* Success State */}
        {txHash ? (
          <div className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-purple-100 mb-2">
                Transaction Submitted!
              </h3>
              <p className="text-sm text-purple-300/70 mb-4">
                Your transaction has been submitted to the blockchain.
              </p>
              
              <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-4 mb-4">
                <p className="text-xs text-purple-300/60 mb-2">Transaction Hash</p>
                <p className="text-xs font-mono text-purple-200 break-all">
                  {txHash}
                </p>
              </div>

              <a
                href={`https://preview.cardanoscan.io/transaction/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium"
              >
                View on CardanoScan
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <button
              onClick={handleClose}
              className="w-full mt-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl transition-all font-semibold shadow-lg"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Form */}
            <div className="p-6 space-y-5">
              {/* Balance Display */}
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4">
                <p className="text-xs text-purple-300/70 mb-1">Available Balance</p>
                <p className="text-2xl font-bold text-purple-100">
                  {balanceAda || '0.00'} <span className="text-lg">₳</span>
                </p>
              </div>

              {/* Recipient Address */}
              <div>
                <label className="block text-sm font-semibold text-purple-200 mb-2">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="addr_test1..."
                  className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/20 rounded-xl text-purple-100 placeholder:text-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all text-sm font-mono"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-purple-200 mb-2">
                  Amount (ADA)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="1"
                    step="0.1"
                    className="w-full px-4 py-3 pr-12 bg-slate-900/50 border border-purple-500/20 rounded-xl text-purple-100 placeholder:text-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-300 text-lg font-semibold">
                    ₳
                  </span>
                </div>
                <p className="text-xs text-purple-300/60 mt-2">Minimum: 1 ADA</p>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Network Warning */}
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <p className="text-xs text-yellow-300">
                  <strong>Preview Network:</strong> This is testnet ADA, not real funds.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-purple-500/20 flex gap-3 bg-slate-950/50">
              <button
                onClick={handleClose}
                className="flex-1 py-3 bg-slate-800/50 text-purple-200 rounded-xl hover:bg-slate-800 transition-colors font-medium border border-purple-500/20"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={isSending || !recipientAddress || !amount}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg shadow-purple-500/25"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send ADA
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
