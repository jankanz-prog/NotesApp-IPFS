import { create } from 'zustand';

// Define Cardano wallet API interface (CIP-30 standard)
interface CardanoWalletApi {
  getChangeAddress: () => Promise<string>;
  getUsedAddresses: () => Promise<string[]>;
  getBalance: () => Promise<string>;
  signTx: (tx: string, partialSign?: boolean) => Promise<string>;
  submitTx: (tx: string) => Promise<string>;
}

interface CardanoWallet {
  name: string;
  icon: string;
  enable: () => Promise<CardanoWalletApi>;
  isEnabled: () => Promise<boolean>;
}

declare global {
  interface Window {
    cardano?: {
      lace?: CardanoWallet;
    };
    // Explicitly ignore EVM wallets - this app ONLY supports Cardano/Lace
    ethereum?: unknown; // Type as unknown to prevent accidental usage
  }
}

interface WalletState {
  // Wallet API after connection
  walletApi: CardanoWalletApi | null;
  
  // Connected wallet address (hex format from wallet)
  walletAddressHex: string | null;
  
  // Connected wallet address (bech32 format for display)
  walletAddressBech32: string | null;
  
  // Wallet balance in ADA
  balanceAda: string | null;
  
  // Connection status
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  
  // Actions
  detectLaceWallet: () => boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  clearError: () => void;
}

// Helper to parse CBOR balance from wallet API
const parseBalance = (cborHex: string): string => {
  try {
    // The balance is returned as CBOR-encoded value
    // For simple cases, it's just a single integer in hex
    // Parse as BigInt and convert to ADA (divide by 1,000,000)
    const lovelace = BigInt('0x' + cborHex.slice(2)); // Skip CBOR prefix
    const ada = Number(lovelace) / 1_000_000;
    return ada.toFixed(2);
  } catch {
    // Fallback: try direct hex parse
    try {
      const lovelace = parseInt(cborHex, 16);
      const ada = lovelace / 1_000_000;
      return ada.toFixed(2);
    } catch {
      return '0.00';
    }
  }
};

export const useWalletStore = create<WalletState>((set, get) => ({
  walletApi: null,
  walletAddressHex: null,
  walletAddressBech32: null,
  balanceAda: null,
  isConnecting: false,
  isConnected: false,
  error: null,

  /**
   * Check if Lace wallet is available in the browser
   * Returns true if Lace wallet extension is detected
   * 
   * IMPORTANT: This function ONLY checks for Lace wallet (Cardano/CIP-30)
   * It explicitly ignores any EVM wallets (MetaMask, etc.)
   */
  detectLaceWallet: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    // Check for Lace wallet specifically (CIP-30)
    // Lace wallet injects itself as window.cardano.lace
    const isLaceAvailable = 
      typeof window.cardano !== 'undefined' &&
      window.cardano !== null &&
      typeof window.cardano.lace !== 'undefined' &&
      window.cardano.lace !== null &&
      typeof window.cardano.lace.enable === 'function';
    
    if (isLaceAvailable) {
      console.log('✅ Lace wallet detected successfully');
      // Log info if MetaMask is also present
      if (window.ethereum) {
        console.log('ℹ️ MetaMask detected but will be ignored - using Lace wallet');
      }
    } else {
      console.log('❌ Lace wallet not detected. Please install from https://www.lace.io/');
    }
    
    return isLaceAvailable;
  },

  /**
   * Connect to Lace wallet using CIP-30 standard
   * This is the ONLY wallet connection method - exclusively for Lace
   * 
   * IMPORTANT: This function explicitly rejects any EVM wallets (MetaMask, etc.)
   */
  connectWallet: async () => {
    if (typeof window === 'undefined') {
      set({ error: 'Wallet connection is only available in the browser' });
      return;
    }

    // Check if Lace wallet is available first (priority check)
    if (!window.cardano?.lace) {
      set({ 
        error: 'Lace wallet not detected. Please install the Lace wallet extension from https://www.lace.io/' 
      });
      return;
    }

    // Log warning if EVM wallet is present but continue with Lace
    if (window.ethereum) {
      console.warn('⚠️ EVM wallet (MetaMask) detected. This app will use Lace wallet (Cardano) instead.');
    }

    const laceWallet = window.cardano.lace;
    
    // Verify enable function exists
    if (typeof laceWallet.enable !== 'function') {
      set({ 
        error: 'Lace wallet API is not available. Please ensure you have the latest version of Lace wallet installed.' 
      });
      return;
    }

    set({ isConnecting: true, error: null });

    try {
      console.log('Attempting to connect to Lace wallet...');
      
      // Enable the Lace wallet (CIP-30 standard - prompts user for permission)
      const api = await laceWallet.enable();
      console.log('Lace wallet enabled successfully');
      
      // Verify API methods exist
      if (!api.getChangeAddress || !api.getBalance) {
        throw new Error('Lace wallet API is incomplete. Please update your Lace wallet extension.');
      }
      
      // Get the change address (hex format)
      const addressHex = await api.getChangeAddress();
      console.log('Retrieved wallet address:', addressHex);
      
      // Get balance
      const balanceCbor = await api.getBalance();
      const balanceAda = parseBalance(balanceCbor);
      console.log('Retrieved balance:', balanceAda, 'ADA');
      
      // Convert hex address to bech32 using dynamic import
      let addressBech32 = addressHex;
      try {
        const { hexToBech32 } = await import('@/lib/cardano');
        addressBech32 = await hexToBech32(addressHex);
        console.log('Converted to bech32:', addressBech32);
      } catch (e) {
        console.warn('Could not convert address to bech32:', e);
        // If conversion fails, use hex address as fallback
      }

      set({
        walletApi: api,
        walletAddressHex: addressHex,
        walletAddressBech32: addressBech32,
        balanceAda,
        isConnected: true,
        isConnecting: false,
        error: null,
      });

      console.log('✅ Lace wallet connected successfully');
      console.log('Address (bech32):', addressBech32);
      console.log('Balance:', balanceAda, 'ADA');
    } catch (error: any) {
      console.error('❌ Lace wallet connection error:', error);
      
      // Provide user-friendly error messages - explicitly mention Lace wallet
      let errorMessage = 'Failed to connect to Lace wallet. Please try again.';
      
      // Check if user rejected the connection
      if (error.code === 2 || error.message?.toLowerCase().includes('user declined')) {
        errorMessage = 'Connection rejected. Please approve the connection request in your Lace wallet popup.';
      }
      // Check if wallet is locked
      else if (error.message?.toLowerCase().includes('locked')) {
        errorMessage = 'Lace wallet is locked. Please unlock your wallet and try again.';
      }
      // Check if error message mentions MetaMask or EVM
      else if (error.message && (error.message.toLowerCase().includes('metamask') || error.message.toLowerCase().includes('ethereum'))) {
        errorMessage = 'This app only supports Lace wallet (Cardano), not MetaMask or other EVM wallets. Please install Lace wallet from https://www.lace.io/';
      }
      // Generic API error
      else if (error.code === 1) {
        errorMessage = 'Connection rejected. Please approve the connection request in your Lace wallet.';
      }
      // Wallet not installed
      else if (error.code === 3) {
        errorMessage = 'Lace wallet is not installed. Please install Lace wallet from https://www.lace.io/';
      }
      // Custom error message
      else if (error.message) {
        errorMessage = error.message;
      }
      
      set({
        isConnecting: false,
        error: errorMessage,
      });
    }
  },

  disconnectWallet: () => {
    set({
      walletApi: null,
      walletAddressHex: null,
      walletAddressBech32: null,
      balanceAda: null,
      isConnected: false,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
