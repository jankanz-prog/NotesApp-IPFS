'use client';

import { useWalletStore } from '@/store/walletStore';

/**
 * Custom hook to consume wallet state and actions
 * Provides a clean interface for Lace wallet operations (CIP-30)
 * 
 * IMPORTANT: This hook is exclusively for Lace Wallet (Cardano)
 * No EVM/MetaMask functionality is supported
 */
export const useWallet = () => {
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

  /**
   * Check if Lace wallet is available
   */
  const isLaceAvailable = detectLaceWallet();

  /**
   * Connect to Lace wallet specifically
   * This is the ONLY wallet connection method
   */
  const connectLace = async () => {
    if (!isLaceAvailable) {
      throw new Error('Lace wallet not detected. Please install the Lace wallet extension from https://www.lace.io/');
    }
    await connectWallet();
  };

  /**
   * Format wallet address for display
   */
  const formatAddress = (address: string | null, length: number = 8): string => {
    if (!address) return '';
    if (address.length <= length * 2) return address;
    return `${address.slice(0, length)}...${address.slice(-length)}`;
  };

  return {
    // State
    walletAddress: walletAddressBech32,
    balance: balanceAda,
    isConnecting,
    isConnected,
    isLaceAvailable,
    error,
    
    // Actions
    connectWallet: connectLace,
    connectLace, // Alias for clarity
    disconnectWallet,
    clearError,
    
    // Utilities
    formatAddress,
  };
};
