# 🚀 Quick Start - Google OAuth2

## ⚡ 5-Minute Setup

### Step 1: Get Google Client ID (2 minutes)

1. Go to: https://console.cloud.google.com/
2. Create new project → Enable Google+ API
3. OAuth consent screen → External → Fill basic info
4. Credentials → Create OAuth Client ID → Web application
5. Add authorized origins:
   - `http://localhost:3000`
   - `http://localhost:4000`
6. **Copy the Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

### Step 2: Update Environment Files (1 minute)

**Backend** - `backend/.env`:
```env
GOOGLE_CLIENT_ID="PASTE_YOUR_CLIENT_ID_HERE"
```

**Frontend** - `frontend/.env.local`:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID="PASTE_YOUR_CLIENT_ID_HERE"
```

⚠️ **Use the SAME Client ID for both files!**

### Step 3: Restart Servers (1 minute)

**Backend:**
```bash
cd backend
# Press Ctrl+C to stop
npm run dev
```

**Frontend:**
```bash
cd frontend
# Press Ctrl+C to stop
npm run dev
```

### Step 4: Test It! (1 minute)

1. Open: http://localhost:3000/login
2. Click **"Sign in with Google"**
3. Choose your Google account
4. ✅ You're in!

---

## 🎯 What You Get

- ✅ One-click Google Sign-In
- ✅ No password needed
- ✅ Auto profile picture
- ✅ Secure authentication
- ✅ One-tap sign-in

---

## 🐛 Quick Fixes

**Button not showing?**
→ Check Client ID in `.env.local` and restart frontend

**"Invalid client"?**
→ Verify Client ID is correct (no extra spaces)

**"Redirect mismatch"?**
→ Add `http://localhost:3000` to Google Console authorized origins

---

## 📚 Full Documentation

- Detailed setup: `GOOGLE_OAUTH_SETUP.md`
- Implementation details: `OAUTH_IMPLEMENTATION_SUMMARY.md`

---

**That's it! You're ready to use Google Sign-In! 🎉**
