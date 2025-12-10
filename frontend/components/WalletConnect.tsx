'use client';

import { useEffect, useState } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { useAuthStore } from '@/store/authStore';
import { useTransactionStatus } from '@/hooks/useTransactionStatus';
import { Wallet, ChevronDown, LogOut, Copy, Check, AlertTriangle, Link, Unlink, Send, History, AlertCircle, Download, X } from 'lucide-react';
import SendAdaModal from './SendAdaModal';
import TransactionHistory from './TransactionHistory';
import { motion, AnimatePresence } from 'framer-motion';

export default function WalletConnect() {
  const {
    walletAddressBech32,
    balanceAda,
    isConnecting,
    isConnected,
    error,
    detectLaceWallet,
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

  const [isLaceAvailable, setIsLaceAvailable] = useState(false);

  useEffect(() => {
    // Auto-detect Lace wallet on mount (client-side only)
    const checkWallet = () => {
      const available = detectLaceWallet();
      setIsLaceAvailable(available);
    };
    
    // Check immediately
    checkWallet();
    
    // Also check after a short delay (wallet might load after page)
    const timer = setTimeout(checkWallet, 1000);
    
    return () => clearTimeout(timer);
  }, [detectLaceWallet]);

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
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3 py-2 glass-light border border-mauve/20 rounded-xl hover:border-mauve/40 transition-all duration-200"
        >
          <Wallet className="w-4 h-4 text-green-400" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-mauve">
              {balanceAda ? `${balanceAda} ₳` : '...'}
            </span>
            <span className="text-xs text-mauve/70">
              {formatAddress(walletAddressBech32)}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-mauve/60" />
        </motion.button>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-80 glass-dark border border-mauve/20 rounded-xl shadow-xl z-50"
            >
              {/* Balance Section */}
              <div className="p-4 border-b border-mauve/20 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                <p className="text-xs text-mauve/60 mb-1">Balance</p>
                <p className="text-2xl font-bold text-mauve">
                  {balanceAda || '0.00'} <span className="text-lg">₳</span>
                </p>
              </div>
              
              {/* Address Section */}
              <div className="p-3 border-b border-mauve/20">
                <p className="text-xs text-mauve/60 mb-1">Wallet Address</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-mono text-mauve truncate flex-1">
                    {walletAddressBech32}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCopyAddress}
                    className="p-1 hover:bg-mauve/10 rounded transition-colors"
                    title="Copy address"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-mauve/60" />
                    )}
                  </motion.button>
                </div>
              </div>
              
              {/* Network Badge */}
              <div className="px-3 py-2 border-b border-mauve/20">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  Preview Network
                </span>
              </div>
              
              {/* Send ADA Button */}
              <button
                onClick={() => {
                  setShowDropdown(false);
                  setShowSendModal(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-mauve-magic hover:bg-mauve/10 transition"
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
                className="w-full flex items-center gap-2 px-3 py-2 text-mauve/80 hover:bg-mauve/10 transition"
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
                  className="w-full flex items-center gap-2 px-3 py-2 text-orange-400 hover:bg-orange-500/20 transition"
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
                className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/20 transition rounded-b-xl"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Disconnect Wallet</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
        <AnimatePresence>
          {showUnlinkConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setShowUnlinkConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-dark rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden border border-mauve/20"
              >
                <div className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-orange-500/20 rounded-full">
                    <AlertCircle className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-bold text-mauve text-center mb-2">
                    Unlink Wallet?
                  </h3>
                  <p className="text-sm text-mauve/70 text-center mb-6">
                    This will remove the connection between your Lace wallet and your account. 
                    You can link it again later.
                  </p>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowUnlinkConfirm(false)}
                      className="flex-1 py-2 bg-nightfall-dark text-mauve rounded-xl hover:bg-mauve/10 transition font-medium border border-mauve/20"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => {
                        setIsUnlinking(true);
                        await unlinkWallet();
                        setIsUnlinking(false);
                        disconnectWallet();
                        setShowUnlinkConfirm(false);
                      }}
                      disabled={isUnlinking}
                      className="flex-1 py-2 bg-orange-500/20 text-orange-400 rounded-xl hover:bg-orange-500/30 transition font-medium disabled:opacity-50 border border-orange-500/30"
                    >
                      {isUnlinking ? 'Unlinking...' : 'Unlink'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Not connected state - Show Lace wallet connection button
  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={async () => {
          if (!isLaceAvailable) {
            setShowNoWalletModal(true);
            return;
          }
          
          setLinkError(null);
          clearError();
          
          try {
            await connectWallet();
            
            // Wait a bit for state to update
            await new Promise(resolve => setTimeout(resolve, 500));
            
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
            }
          } catch (err) {
            console.error('Connection error:', err);
          }
        }}
        disabled={isConnecting || isLinking}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-royal-violet via-lavender-purple to-mauve-magic hover:from-lavender-purple hover:via-mauve-magic hover:to-mauve text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Wallet className="w-4 h-4" />
        <span className="text-sm font-medium">
          {isConnecting ? 'Connecting...' : isLinking ? 'Linking...' : 'Connect Lace Wallet'}
        </span>
      </motion.button>

      {/* Error Display */}
      <AnimatePresence>
        {(error || linkError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 glass-dark border border-red-500/30 rounded-xl shadow-xl z-50 p-3"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-red-300">{error || linkError}</p>
                <button
                  onClick={() => {
                    clearError();
                    setLinkError(null);
                  }}
                  className="text-xs text-red-400 underline mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show user's linked wallet if they have one */}
      {isConnected && user?.walletAddress && (
        <div className="absolute right-0 mt-2 w-80 glass-light border border-mauve/20 rounded-xl p-3 text-xs">
          <div className="flex items-center gap-2 text-mauve-magic mb-1">
            <Link className="w-4 h-4" />
            <span className="font-medium">Linked Wallet</span>
          </div>
          <p className="text-xs font-mono text-mauve/70 truncate">
            {user.walletAddress.slice(0, 20)}...{user.walletAddress.slice(-10)}
          </p>
        </div>
      )}

      {/* No Wallet Detected Modal */}
      <AnimatePresence>
        {showNoWalletModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowNoWalletModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-dark rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-mauve/20"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-mauve/20 flex items-center justify-between bg-gradient-to-r from-royal-violet/30 to-lavender-purple/30">
                <h2 className="text-lg font-bold text-mauve">Lace Wallet Required</h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowNoWalletModal(false)}
                  className="p-1 hover:bg-mauve/10 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-mauve" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-orange-500/20 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-orange-400" />
                </div>
                
                <h3 className="text-lg font-bold text-mauve text-center mb-2">
                  Lace Wallet Not Detected
                </h3>
                
                <p className="text-sm text-mauve/70 text-center mb-6">
                  To use blockchain features like sending ADA and saving notes on-chain, 
                  you need to install the Lace wallet browser extension.
                </p>

                <div className="glass-light rounded-xl p-4 mb-6 border border-mauve/20">
                  <h4 className="font-semibold text-mauve mb-2 flex items-center gap-2">
                    <Download className="w-4 h-4 text-mauve-magic" />
                    Install Lace Wallet
                  </h4>
                  <p className="text-sm text-mauve/80 mb-3">
                    Lace is a user-friendly Cardano wallet developed by IOG (Input Output Global).
                  </p>
                  <ul className="text-xs text-mauve/70 space-y-1 mb-3">
                    <li>• Easy to use interface</li>
                    <li>• Secure key management</li>
                    <li>• Supports Preview testnet</li>
                    <li>• Free to install</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href="https://www.lace.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-royal-violet to-lavender-purple hover:from-lavender-purple hover:to-mauve-magic text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Install Lace Wallet
                  </motion.a>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowNoWalletModal(false);
                      const available = detectLaceWallet();
                      setIsLaceAvailable(available);
                      if (available) {
                        // Auto-connect after detection
                        setTimeout(() => connectWallet(), 500);
                      }
                    }}
                    className="w-full py-2 bg-nightfall-dark text-mauve rounded-xl hover:bg-mauve/10 transition font-medium text-sm border border-mauve/20"
                  >
                    I've installed it - Refresh
                  </motion.button>
                </div>

                <p className="text-xs text-mauve/60 text-center mt-4">
                  After installing, refresh this page or click the button above to detect your Lace wallet.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
