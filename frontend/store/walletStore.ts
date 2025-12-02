import { create } from 'zustand';

// Define Cardano wallet types
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
    cardano?: Record<string, CardanoWallet>;
  }
}

interface WalletState {
  // Available wallets detected in browser
  availableWallets: string[];
  
  // Currently selected wallet name
  selectedWallet: string | null;
  
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
  detectWallets: () => void;
  selectWallet: (walletName: string) => void;
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
  availableWallets: [],
  selectedWallet: null,
  walletApi: null,
  walletAddressHex: null,
  walletAddressBech32: null,
  balanceAda: null,
  isConnecting: false,
  isConnected: false,
  error: null,

  detectWallets: () => {
    if (typeof window !== 'undefined' && window.cardano) {
      // Filter to only include actual wallet extensions
      const walletNames = Object.keys(window.cardano).filter(key => {
        const wallet = window.cardano![key];
        return wallet && typeof wallet.enable === 'function';
      });
      set({ availableWallets: walletNames });
    }
  },

  selectWallet: (walletName: string) => {
    set({ selectedWallet: walletName, error: null });
  },

  connectWallet: async () => {
    const { selectedWallet } = get();
    
    if (!selectedWallet) {
      set({ error: 'Please select a wallet first' });
      return;
    }

    if (typeof window === 'undefined' || !window.cardano) {
      set({ error: 'No Cardano wallets detected' });
      return;
    }

    const walletProvider = window.cardano[selectedWallet];
    if (!walletProvider) {
      set({ error: `Wallet ${selectedWallet} not found` });
      return;
    }

    set({ isConnecting: true, error: null });

    try {
      // Enable the wallet (this prompts user for permission)
      const api = await walletProvider.enable();
      
      // Get the change address (hex format)
      const addressHex = await api.getChangeAddress();
      
      // Get balance
      const balanceCbor = await api.getBalance();
      const balanceAda = parseBalance(balanceCbor);
      
      // Convert hex address to bech32 using dynamic import
      let addressBech32 = addressHex;
      try {
        const { hexToBech32 } = await import('@/lib/cardano');
        addressBech32 = await hexToBech32(addressHex);
      } catch (e) {
        console.warn('Could not convert address to bech32:', e);
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

      console.log('Wallet connected:', selectedWallet);
      console.log('Address (bech32):', addressBech32);
      console.log('Balance:', balanceAda, 'ADA');
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      set({
        isConnecting: false,
        error: error.message || 'Failed to connect wallet',
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
      selectedWallet: null,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
