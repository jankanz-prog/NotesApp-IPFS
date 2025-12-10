# Blockfrost API Setup Guide

## What is Blockfrost?

Blockfrost is a hosted API service for Cardano blockchain. It's required for:
- Sending ADA transactions
- Checking transaction status
- Querying blockchain data

## Setup Instructions

### Step 1: Create Blockfrost Account

1. Go to https://blockfrost.io/
2. Click "Sign Up" (it's free!)
3. Verify your email address
4. Log in to your dashboard

### Step 2: Create a Project

1. In the Blockfrost dashboard, click "Add Project"
2. **Important**: Select **"Cardano Preview"** as the network (NOT Mainnet)
3. Give your project a name (e.g., "NotesChain Preview")
4. Click "Create Project"

### Step 3: Get Your Project ID

1. Click on your newly created project
2. You'll see your **Project ID** - it looks like: `previewXXXXXXXXXXXXXXXXXXXXXXXX`
3. Copy this Project ID

### Step 4: Add to Environment Variables

1. In the `frontend` folder, create a file named `.env.local`
2. Add the following line:

```
NEXT_PUBLIC_BLOCKFROST_PROJECT_ID=previewXXXXXXXXXXXXXXXXXXXXXXXX
```

Replace `previewXXXXXXXXXXXXXXXXXXXXXXXX` with your actual Project ID.

### Step 5: Restart Frontend Server

1. Stop your frontend development server (Ctrl+C)
2. Start it again: `npm run dev`
3. The Blockfrost API key will now be loaded

## Environment Variables Template

Create `frontend/.env.local` with:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Blockfrost API Key for Cardano Preview Network
NEXT_PUBLIC_BLOCKFROST_PROJECT_ID=your_preview_project_id_here
```

## Verification

To verify it's working:
1. Connect your Lace wallet
2. Try to send ADA
3. If configured correctly, you should see the transaction form without errors

## Troubleshooting

### Error: "Blockfrost API key not configured"
- Make sure the `.env.local` file exists in the `frontend` folder
- Check that the variable name is exactly: `NEXT_PUBLIC_BLOCKFROST_PROJECT_ID`
- Verify you're using the Preview network project ID (starts with `preview`)
- Restart your frontend server after adding the variable

### Error: "Invalid project ID"
- Make sure you copied the entire Project ID
- Check there are no extra spaces
- Verify you selected "Cardano Preview" network when creating the project

### Free Tier Limits
- Blockfrost free tier includes:
  - 50,000 requests per day
  - Rate limit: 10 requests per second
- This is more than enough for development and testing

## Security Notes

- ⚠️ Never commit `.env.local` to Git (it's already in `.gitignore`)
- ⚠️ The Preview network uses test ADA (no real value)
- ✅ The `NEXT_PUBLIC_` prefix makes it available in the browser (safe for Preview network)
- ✅ For production, use environment variables on your hosting platform

## Additional Resources

- Blockfrost Documentation: https://docs.blockfrost.io/
- Cardano Preview Faucet: https://docs.cardano.org/cardano-testnet/tools/faucet/
- Cardano Preview Explorer: https://preview.cardanoscan.io/

---

**Need Help?**
If you encounter issues, check:
1. Project ID is correct
2. Using Preview network (not Mainnet)
3. Frontend server was restarted
4. `.env.local` file is in the `frontend` folder
