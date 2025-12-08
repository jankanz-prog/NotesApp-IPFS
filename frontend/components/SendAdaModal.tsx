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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="glass rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Send ADA</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Success State */}
        {txHash ? (
          <div className="p-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Transaction Submitted!
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Your transaction has been submitted to the blockchain.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
                <p className="text-xs font-mono text-gray-700 break-all">
                  {txHash}
                </p>
              </div>

              <a
                href={`https://preview.cardanoscan.io/transaction/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm"
              >
                View on CardanoScan
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <button
              onClick={handleClose}
              className="w-full mt-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Balance Display */}
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-purple-600 mb-1">Available Balance</p>
                <p className="text-lg font-bold text-purple-700">
                  {balanceAda || '0.00'} ₳
                </p>
              </div>

              {/* Recipient Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="addr_test1..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 text-sm font-mono"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    ₳
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum: 1 ADA</p>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Network Warning */}
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-700">
                  <strong>Preview Network:</strong> This is testnet ADA, not real funds.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={isSending || !recipientAddress || !amount}
                className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
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
