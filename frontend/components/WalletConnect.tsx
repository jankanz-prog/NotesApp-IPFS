'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useWalletStore } from '@/store/walletStore';
import { useAuthStore } from '@/store/authStore';
import { useTransactionStatus } from '@/hooks/useTransactionStatus';
import { Wallet, ChevronDown, LogOut, Copy, Check, AlertTriangle, Link, Unlink, Send, History, AlertCircle, Download, X } from 'lucide-react';
import SendAdaModal from './SendAdaModal';
import TransactionHistory from './TransactionHistory';

export default function WalletConnect() {
  const {
    availableWallets,
    selectedWallet,
    walletAddressBech32,
    balanceAda,
    isConnecting,
    isConnected,
    error,
    detectWallets,
    selectWallet,
    connectWallet,
    disconnectWallet,
    clearError,
  } = useWalletStore();

  const { user, linkWallet, unlinkWallet } = useAuthStore();

  // Start transaction status polling
  useTransactionStatus();

  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [showNoWalletModal, setShowNoWalletModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showUnlinkConfirm || showNoWalletModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showUnlinkConfirm, showNoWalletModal]);

  useEffect(() => {
    // Detect wallets on mount (client-side only)
    detectWallets();
  }, [detectWallets]);

  const handleCopyAddress = () => {
    if (walletAddressBech32) {
      navigator.clipboard.writeText(walletAddressBech32);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 20) return address;
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  // Connected state
  if (isConnected && walletAddressBech32) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3 py-2 bg-tan/50 border border-faded-copper/30 rounded-lg hover:bg-tan transition-all duration-300 magnetic"
        >
          <Wallet className="w-4 h-4 text-green-600" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-green-700">
              {balanceAda ? `${balanceAda} ₳` : '...'}
            </span>
            <span className="text-xs text-green-600">
              {formatAddress(walletAddressBech32)}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-green-600" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            {/* Balance Section */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
              <p className="text-xs text-gray-500 mb-1">Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {balanceAda || '0.00'} <span className="text-lg">₳</span>
              </p>
            </div>
            
            {/* Address Section */}
            <div className="p-3 border-b border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
              <div className="flex items-center gap-2">
                <p className="text-xs font-mono text-gray-700 truncate flex-1">
                  {walletAddressBech32}
                </p>
                <button
                  onClick={handleCopyAddress}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Copy address"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Network Badge */}
            <div className="px-3 py-2 border-b border-gray-100">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Preview Network
              </span>
            </div>
            
            {/* Send ADA Button */}
            <button
              onClick={() => {
                setShowDropdown(false);
                setShowSendModal(true);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-purple-600 hover:bg-purple-50 transition"
            >
              <Send className="w-4 h-4" />
              <span className="text-sm">Send ADA</span>
            </button>
            
            {/* Transaction History Button */}
            <button
              onClick={() => {
                setShowDropdown(false);
                setShowHistoryModal(true);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 transition"
            >
              <History className="w-4 h-4" />
              <span className="text-sm">Transaction History</span>
            </button>

            {/* Unlink Wallet Button - only show if wallet is linked to account */}
            {user?.walletAddress && (
              <button
                onClick={() => {
                  setShowDropdown(false);
                  setShowUnlinkConfirm(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-orange-600 hover:bg-orange-50 transition"
              >
                <Unlink className="w-4 h-4" />
                <span className="text-sm">Unlink from Account</span>
              </button>
            )}
            
            <button
              onClick={() => {
                disconnectWallet();
                setShowDropdown(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 transition rounded-b-lg"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Disconnect Wallet</span>
            </button>
          </div>
        )}

        {/* Send ADA Modal */}
        <SendAdaModal
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
        />

        {/* Transaction History Modal */}
        <TransactionHistory
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
        />

        {/* Unlink Wallet Confirmation Modal */}
        {showUnlinkConfirm && mounted && createPortal(
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in"
            onClick={() => setShowUnlinkConfirm(false)}
            style={{ margin: 0 }}
          >
            <div 
              className="glass rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                  Unlink Wallet?
                </h3>
                <p className="text-sm text-gray-600 text-center mb-6">
                  This will remove the connection between your wallet and your account. 
                  You can link it again later.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUnlinkConfirm(false)}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      setIsUnlinking(true);
                      await unlinkWallet();
                      setIsUnlinking(false);
                      disconnectWallet();
                      setShowUnlinkConfirm(false);
                    }}
                    disabled={isUnlinking}
                    className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium disabled:opacity-50"
                  >
                    {isUnlinking ? 'Unlinking...' : 'Unlink'}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  // Not connected state
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 bg-coffee-bean text-almond-cream rounded-lg hover:bg-toffee-brown transition-all duration-300 shadow-lg hover:shadow-xl magnetic ripple-effect"
      >
        <Wallet className="w-4 h-4" />
        <span className="text-sm font-medium">Connect Wallet</span>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">Select Wallet</p>
            <p className="text-xs text-gray-500">Connect your Cardano wallet</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border-b border-red-100">
              <p className="text-xs text-red-600">{error}</p>
              <button
                onClick={clearError}
                className="text-xs text-red-700 underline mt-1"
              >
                Dismiss
              </button>
            </div>
          )}

          {availableWallets.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500 mb-2">No wallets detected</p>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  setShowNoWalletModal(true);
                }}
                className="text-xs text-blue-600 hover:underline"
              >
                Learn how to install →
              </button>
            </div>
          ) : (
            <div className="p-2">
              {availableWallets.map((wallet) => (
                <button
                  key={wallet}
                  onClick={() => {
                    selectWallet(wallet);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    selectedWallet === wallet
                      ? 'bg-purple-50 border border-purple-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Wallet className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {wallet}
                  </span>
                  {selectedWallet === wallet && (
                    <span className="ml-auto text-xs text-purple-600">Selected</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Show user's linked wallet if they have one */}
          {user?.walletAddress && (
            <div className="p-3 bg-blue-50 border-b border-blue-100">
              <div className="flex items-center gap-2 text-blue-700">
                <Link className="w-4 h-4" />
                <span className="text-xs font-medium">Linked Wallet</span>
              </div>
              <p className="text-xs font-mono text-blue-600 mt-1 truncate">
                {user.walletAddress.slice(0, 20)}...{user.walletAddress.slice(-10)}
              </p>
            </div>
          )}

          {/* Link error */}
          {linkError && (
            <div className="p-3 bg-orange-50 border-b border-orange-100">
              <div className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs">{linkError}</span>
              </div>
              <button
                onClick={() => setLinkError(null)}
                className="text-xs text-orange-700 underline mt-1"
              >
                Dismiss
              </button>
            </div>
          )}

          {selectedWallet && (
            <div className="p-3 border-t border-gray-100">
              <button
                onClick={async () => {
                  setLinkError(null);
                  await connectWallet();
                  
                  const walletState = useWalletStore.getState();
                  if (walletState.isConnected && walletState.walletAddressBech32) {
                    // Check if user already has a linked wallet
                    if (user?.walletAddress) {
                      // Verify it matches
                      if (user.walletAddress !== walletState.walletAddressBech32) {
                        setLinkError('This wallet does not match your linked wallet. Please use your linked wallet.');
                        disconnectWallet();
                        return;
                      }
                    } else {
                      // No wallet linked yet, link this one
                      setIsLinking(true);
                      const result = await linkWallet(walletState.walletAddressBech32);
                      setIsLinking(false);
                      
                      if (!result.success) {
                        setLinkError(result.error || 'Failed to link wallet');
                        disconnectWallet();
                        return;
                      }
                    }
                    setShowDropdown(false);
                  }
                }}
                disabled={isConnecting || isLinking}
                className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                {isConnecting ? 'Connecting...' : isLinking ? 'Linking...' : `Connect ${selectedWallet}`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* No Wallet Detected Modal */}
      {showNoWalletModal && mounted && createPortal(
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in"
          onClick={() => setShowNoWalletModal(false)}
          style={{ margin: 0 }}
        >
          <div 
            className="glass rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-600 to-blue-600">
              <h2 className="text-lg font-bold text-white">Wallet Required</h2>
              <button
                onClick={() => setShowNoWalletModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                No Cardano Wallet Detected
              </h3>
              
              <p className="text-sm text-gray-600 text-center mb-6">
                To use blockchain features like sending ADA and saving notes on-chain, 
                you need to install a Cardano wallet browser extension.
              </p>

              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Recommended: Lace Wallet
                </h4>
                <p className="text-sm text-purple-700 mb-3">
                  Lace is a user-friendly Cardano wallet developed by IOG (Input Output Global).
                </p>
                <ul className="text-xs text-purple-600 space-y-1 mb-3">
                  <li>• Easy to use interface</li>
                  <li>• Secure key management</li>
                  <li>• Supports Preview testnet</li>
                  <li>• Free to install</li>
                </ul>
              </div>

              <div className="space-y-3">
                <a
                  href="https://www.lace.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                >
                  <Download className="w-4 h-4" />
                  Install Lace Wallet
                </a>
                
                <button
                  onClick={() => {
                    setShowNoWalletModal(false);
                    detectWallets();
                  }}
                  className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
                >
                  I've installed it - Refresh
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                After installing, refresh this page or click the button above to detect your wallet.
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
