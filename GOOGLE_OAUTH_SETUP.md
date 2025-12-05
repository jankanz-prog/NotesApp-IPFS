# Google OAuth2 Setup Guide

This guide will help you set up Google OAuth2 authentication for the Notes App.

---

## 📋 Prerequisites

- Google Account
- Access to Google Cloud Console

---

## 🔧 Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: **"NotesApp"** (or your preferred name)
4. Click **"Create"**

### 2. Enable Google+ API

1. In the Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"**
3. Click on it and press **"Enable"**

### 3. Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** (for testing) or **"Internal"** (for organization use)
3. Click **"Create"**
4. Fill in the required fields:
   - **App name**: NotesApp
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **"Save and Continue"**
6. **Scopes**: Click **"Add or Remove Scopes"**
   - Select: `email`, `profile`, `openid`
   - Click **"Update"** → **"Save and Continue"**
7. **Test users** (if External): Add your email for testing
8. Click **"Save and Continue"** → **"Back to Dashboard"**

### 4. Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"**
4. Configure:
   - **Name**: NotesApp Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `http://localhost:4000`
   - **Authorized redirect URIs**:
     - `http://localhost:3000`
     - `http://localhost:3000/login`
5. Click **"Create"**
6. **Copy the Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

### 5. Update Environment Variables

#### Backend (.env)
```env
GOOGLE_CLIENT_ID="your-actual-client-id-here.apps.googleusercontent.com"
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-actual-client-id-here.apps.googleusercontent.com"
```

⚠️ **Important**: Replace `your-actual-client-id-here` with your actual Client ID from step 4.

### 6. Restart the Servers

After updating the environment variables, restart both servers:

**Backend:**
```bash
cd backend
# Stop the server (Ctrl+C) and restart
npm run dev
```

**Frontend:**
```bash
cd frontend
# Stop the server (Ctrl+C) and restart
npm run dev
```

---

## ✅ Testing OAuth2 Login

1. Open your browser and go to: `http://localhost:3000/login`
2. Click the **"Sign in with Google"** button
3. Select your Google account
4. Grant permissions
5. You should be redirected to the notes page

---

## 🔒 Security Notes

### For Production:

1. **Update Authorized Origins**:
   - Add your production domain (e.g., `https://yourdomain.com`)
   
2. **Update Authorized Redirect URIs**:
   - Add production URLs (e.g., `https://yourdomain.com/login`)

3. **OAuth Consent Screen**:
   - Submit for verification if using "External" type
   - Add privacy policy and terms of service URLs

4. **Environment Variables**:
   - Never commit `.env` files to version control
   - Use secure environment variable management in production

---

## 🐛 Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Make sure `http://localhost:3000` is added to **Authorized JavaScript origins**
- Check that the redirect URI matches exactly (including trailing slashes)

### "Error 401: invalid_client"
- Verify the Client ID is correct in both `.env` files
- Make sure you copied the entire Client ID

### Google Sign-In button not showing
- Check browser console for errors
- Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in `.env.local`
- Restart the frontend server after changing environment variables

### "Access blocked: This app's request is invalid"
- Complete the OAuth consent screen configuration
- Add your email as a test user (for External apps)

---

## 📚 Additional Resources

- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Websites](https://developers.google.com/identity/sign-in/web)
- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)

---

## 🎉 Features

With Google OAuth2 enabled, users can:

- ✅ Sign in with their Google account (no password needed)
- ✅ Automatically create an account on first login
- ✅ Link Google account to existing email-based accounts
- ✅ Use their Google profile picture
- ✅ Enjoy one-tap sign-in experience

---

**Happy coding! 🚀**
