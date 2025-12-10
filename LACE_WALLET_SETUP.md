# Lace Wallet Connection Guide

## Overview
This application uses **Lace Wallet** (Cardano blockchain wallet) for connecting to the Cardano Preview testnet. This guide will help you set up and troubleshoot the wallet connection.

## Important Notes
- ⚠️ **This app ONLY supports Lace Wallet (Cardano)**
- ⚠️ **MetaMask and other EVM wallets are NOT supported**
- ✅ Uses CIP-30 standard for Cardano wallet connections
- ✅ Connects to Cardano Preview testnet

## Installation

### Step 1: Install Lace Wallet
1. Visit [https://www.lace.io/](https://www.lace.io/)
2. Download the browser extension for your browser:
   - Chrome/Brave: Chrome Web Store
   - Firefox: Firefox Add-ons
   - Edge: Edge Add-ons
3. Install the extension
4. Create a new wallet or restore an existing one
5. **Important**: Switch to Preview testnet in Lace settings

### Step 2: Get Preview Testnet ADA
1. Open Lace wallet
2. Go to Settings → Network → Select "Preview"
3. Copy your wallet address
4. Visit the Cardano Testnet Faucet: [https://docs.cardano.org/cardano-testnet/tools/faucet/](https://docs.cardano.org/cardano-testnet/tools/faucet/)
5. Request test ADA (you'll receive ~1000 ADA for testing)

### Step 3: Connect to the App
1. Open the NotesChain app
2. Click "Connect Lace Wallet" button
3. Approve the connection request in the Lace popup
4. Your wallet will be connected and linked to your account

## Troubleshooting

### Issue: "Lace wallet not detected"
**Solutions:**
1. Make sure Lace wallet extension is installed
2. Refresh the page (Ctrl+R or Cmd+R)
3. Check if the extension is enabled in your browser
4. Try disabling other wallet extensions (especially MetaMask)
5. Click "I've installed it - Refresh" button in the modal

### Issue: "Connection rejected"
**Solutions:**
1. Make sure you approve the connection in the Lace popup
2. Check if Lace wallet is unlocked
3. Try disconnecting and reconnecting

### Issue: "Lace wallet is locked"
**Solutions:**
1. Click the Lace extension icon
2. Enter your password to unlock
3. Try connecting again

### Issue: "This app only supports Lace wallet"
**Solutions:**
1. Disable MetaMask or other EVM wallet extensions
2. Make sure you're using Lace wallet, not another Cardano wallet
3. Clear browser cache and reload

### Issue: Balance shows 0.00 ADA
**Solutions:**
1. Make sure you're on Preview testnet (not Mainnet)
2. Request test ADA from the faucet
3. Wait a few minutes for the transaction to confirm
4. Disconnect and reconnect the wallet to refresh balance

### Issue: "Failed to convert address to bech32"
**Solutions:**
1. This is usually not a problem - the app will use hex format
2. Make sure you have the latest version of Lace installed
3. Try refreshing the page

## Features

### Once Connected
- ✅ View your wallet address and balance
- ✅ Send ADA to other addresses
- ✅ Save notes to the blockchain (with metadata)
- ✅ View transaction history
- ✅ Link wallet to your account (persistent connection)

### Wallet Dropdown Menu
When connected, click your wallet to access:
- **Balance**: View your current ADA balance
- **Address**: Copy your wallet address
- **Send ADA**: Transfer ADA to another address
- **Transaction History**: View all your transactions
- **Unlink from Account**: Remove wallet link (optional)
- **Disconnect Wallet**: Disconnect from the app

## Technical Details

### CIP-30 Standard
The app uses the CIP-30 (Cardano Improvement Proposal 30) standard for wallet connections. This is the official standard for Cardano dApp connectors.

### Wallet Detection
```javascript
// The app checks for Lace wallet at:
window.cardano.lace

// Required methods:
- enable() - Request wallet connection
- getChangeAddress() - Get wallet address
- getBalance() - Get wallet balance
- signTx() - Sign transactions
- submitTx() - Submit transactions
```

### Network
- **Network**: Cardano Preview Testnet
- **Explorer**: [https://preview.cardanoscan.io/](https://preview.cardanoscan.io/)
- **Faucet**: [Cardano Testnet Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet/)

## Security Notes

1. **Never share your seed phrase** - The app never asks for it
2. **Always verify transactions** - Check the details in Lace popup before approving
3. **Use Preview testnet** - This is test ADA with no real value
4. **Keep Lace updated** - Always use the latest version

## Support

If you encounter issues:
1. Check the browser console (F12) for error messages
2. Make sure Lace wallet is properly installed and unlocked
3. Verify you're on Preview testnet
4. Try disconnecting and reconnecting
5. Clear browser cache and cookies

## Useful Links

- **Lace Wallet**: [https://www.lace.io/](https://www.lace.io/)
- **Lace Documentation**: [https://www.lace.io/blog](https://www.lace.io/blog)
- **Cardano Preview Explorer**: [https://preview.cardanoscan.io/](https://preview.cardanoscan.io/)
- **CIP-30 Standard**: [https://cips.cardano.org/cips/cip30/](https://cips.cardano.org/cips/cip30/)
- **Testnet Faucet**: [https://docs.cardano.org/cardano-testnet/tools/faucet/](https://docs.cardano.org/cardano-testnet/tools/faucet/)

---

**Note**: This app is designed exclusively for Cardano blockchain. It does not support Ethereum, Polygon, or other EVM chains.
