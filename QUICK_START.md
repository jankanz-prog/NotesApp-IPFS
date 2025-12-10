# 🚀 NotesChain - Quick Start Guide

## Prerequisites
- Node.js (v18 or higher)
- MySQL or PostgreSQL database
- Git

---

## 🏃 Quick Setup (5 Minutes)

### 1. Database Setup
```bash
# Create a new MySQL database
mysql -u root -p
CREATE DATABASE notesdb;
EXIT;
```

### 2. Backend Setup
```bash
# Navigate to backend folder
cd backend

# Install dependencies (if not already done)
npm install

# Configure environment variables
# Edit .env file with your database credentials

# Run Prisma migrations
npx prisma generate
npx prisma migrate dev

# Start backend server
npm run dev
```
✅ Backend should be running on http://localhost:4000

### 3. Frontend Setup
```bash
# Open a new terminal
# Navigate to frontend folder
cd frontend

# Install dependencies (if not already done)
npm install

# Start frontend development server
npm run dev
```
✅ Frontend should be running on http://localhost:3000

---

## 🎯 Test the Application

### Step 1: Visit the Landing Page
Open your browser and go to: **http://localhost:3000**

You should see:
- Beautiful hero section
- Feature cards
- "Get Started" button

### Step 2: Create an Account
1. Click "Get Started" or "Sign Up"
2. Fill in:
   - Email: `test@example.com`
   - Username: `testuser`
   - Password: `Test123!`
3. Complete the 3-step registration
4. You'll be automatically logged in and redirected to notes

### Step 3: Create Your First Note
1. Click "New Note" button in the sidebar
2. Enter title: "My First Note"
3. Select a folder (optional)
4. Click "Create Note"
5. Start typing in the editor
6. Note auto-saves as you type!

### Step 4: Explore Features
- ✅ **Search**: Type in the search bar to filter notes
- ✅ **Folders**: Create folders to organize notes
- ✅ **Favorites**: Click the star icon to favorite a note
- ✅ **Colors**: Use the palette icon to change note color
- ✅ **Profile**: Click your avatar to edit profile

---

## 🎨 What's Working

### ✅ Authentication
- Login with email/username + password
- Registration with validation
- Session persistence
- Auto-logout on token expiry

### ✅ Notes Management
- Create, edit, delete notes
- Real-time search
- Folder organization
- Favorites and archives
- Auto-save (500ms debounce)
- Color coding

### ✅ User Interface
- Responsive design (mobile, tablet, desktop)
- Smooth animations
- Loading states
- Toast notifications
- Error handling
- Empty states

### ✅ Blockchain Features
- Wallet connection (requires Cardano wallet extension)
- Note sync to blockchain
- Transaction status tracking
- IPFS integration (requires IPFS node)

---

## 🔧 Troubleshooting

### Backend won't start?
```bash
# Check if port 4000 is available
netstat -ano | findstr :4000

# Check database connection in .env
# Make sure DATABASE_URL is correct
```

### Frontend won't start?
```bash
# Check if port 3000 is available
netstat -ano | findstr :3000

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Can't login?
```bash
# Make sure backend is running
# Check backend console for errors
# Verify database has users table
npx prisma studio
```

### Notes not saving?
```bash
# Check browser console for errors
# Verify backend API is responding
curl http://localhost:4000/health
```

---

## 📱 Demo Flow for Teacher

### 1. Landing Page (30 seconds)
- Show professional design
- Explain features
- Click "Get Started"

### 2. Registration (1 minute)
- Fill in form
- Show validation
- Complete 3 steps
- Success animation

### 3. Notes Dashboard (3 minutes)
- Create a note
- Show auto-save
- Demonstrate search
- Create folders
- Toggle favorites
- Change colors
- Delete a note

### 4. Profile Page (1 minute)
- Edit username
- Upload profile picture
- Show wallet address
- Logout

### 5. Technical Highlights (1 minute)
- Show code structure
- Explain tech stack
- Demonstrate responsive design
- Show API integration

---

## 🎓 Key Features to Highlight

1. **Real Backend Integration** - Not just mock data
2. **Modern UI/UX** - Professional design
3. **Responsive** - Works on all devices
4. **Blockchain Ready** - Cardano + IPFS
5. **Production Quality** - Error handling, validation
6. **State Management** - Zustand stores
7. **Type Safety** - Full TypeScript
8. **Database** - Prisma ORM

---

## 📊 Tech Stack

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **Axios** - HTTP client

### Backend
- **Express** - Node.js framework
- **Prisma** - Database ORM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **MySQL** - Database

### Blockchain
- **Cardano** - Blockchain network
- **IPFS** - Decentralized storage
- **Blaze SDK** - Cardano integration

---

## ✅ Checklist Before Demo

- [ ] Backend server running (http://localhost:4000)
- [ ] Frontend server running (http://localhost:3000)
- [ ] Database connected and migrated
- [ ] Test account created
- [ ] Sample notes created
- [ ] Browser console clear of errors
- [ ] Network tab shows successful API calls

---

## 🎉 You're Ready!

Your NotesChain application is fully functional and ready to demonstrate. All features work end-to-end with real data, professional UI/UX, and production-quality code.

**Good luck with your presentation!** 🚀
