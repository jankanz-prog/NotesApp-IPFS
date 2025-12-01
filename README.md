
# 📘 Notes App + Wallet + IPFS (Cardano)

A modern full-stack application with separate **frontend** (Next.js) and **backend** (Node.js + TypeScript + Prisma) projects.  
Features include rich-text notes, drawing canvas, IPFS pinning, and Cardano wallet integration.

---

## 🚀 Tech Stack

### **Frontend**
- Next.js 16 (App Router + React framework)
- React 19
- TypeScript 5
- Tailwind CSS v4
- shadcn/ui (Radix UI primitives)
- React Hook Form + Zod
- Lucide React + React Icons

### **Backend**
- Node.js + TypeScript
- Express (or NestJS)
- Prisma ORM
- PostgreSQL or MySQL
- JWT authentication / NextAuth optional
- IPFS integration
- Cardano wallet integration

---
<img width="646" height="533" alt="image" src="https://github.com/user-attachments/assets/f1606a7b-1f2e-4ecd-be3d-df4026a823d3" />

## 📂 Project Structure

project-root/
├── frontend/ -------------------- # Next.js + React (Client)
│   ├── app/ --------------------- # Pages (App Router)
│   │   ├── (auth)/ -------------- # login, register routes
│   │   ├── (dashboard)/ --------- # notes, wallet, settings routes
│   │   └── layout.tsx
│   ├── components/ -------------- # Reusable React components
│   ├── lib/ --------------------- # Frontend helper functions
│   ├── styles/ ------------------ # Tailwind CSS globals
│   └── package.json
│
├── backend/ --------------------- # Node.js + Express/NestJS (Server)
│   ├── src/ 
│   │   ├── controllers/ --------- # API route handlers
│   │   ├── services/ ------------ # Business logic
│   │   ├── routes/ -------------- # Express route definitions
│   │   └── db.ts ---------------- # Prisma client initialization
│   ├── prisma/ 
│   │   └── schema.prisma -------- # Database schema
│   └── package.json
│
├── .gitignore
└── README.md
---

## 📝 Features

### **Notes System**
- Rich-text editor: headings, bold, italics, font size, font types
- Drawing canvas for sketches & diagrams
- Mark a note as favorite
- Set importance level (1–5)
- Auto-save system
- Export note to IPFS (saves IPFS hash)
- Metadata syncing for Cardano wallet users

### **User System**
- Registration & Login
- JWT-based session or NextAuth
- User profile & settings
- Wallet connection stored securely

### **Wallet + Cardano Integration**
- Read wallet info
- Store addresses in DB
- Optional note metadata push to chain
- IPFS hash stored in transaction metadata

### **IPFS Support**
- Upload note content
- Upload drawing canvas snapshots
- Receive + store IPFS CID
- Retrieve from gateway

---

## 🗄️ Database Models (Prisma)

### **User Table (Recommended)**
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  username      String   @unique
  passwordHash  String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  notes         Note[]
  walletAddress String?  // Cardano wallet address
}
```

### **Note Table**
```prisma
model Note {
  id          String   @id @default(cuid())
  userId      String
  title       String
  content     String    // JSON: text + editor state
  drawing     String?   // base64 OR IPFS hash
  favorite    Boolean   @default(false)
  importance  Int       @default(1)
  color       String?   // optional label color
  ipfsHash    String?   // filled when exported

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user        User      @relation(fields: [userId], references: [id])
}
```

---

## ▶️ Getting Started

### **Backend**
1. Install dependencies
\`\`\`
cd backend
npm install
\`\`\`

2. Setup environment variables (\`.env\`):
\`\`\`
DATABASE_URL="postgresql://user:pass@localhost:5432/notesdb"
IPFS_API_KEY="your_ipfs_key"
CARDANO_API_KEY="your_cardano_key"
\`\`\`

3. Initialize database
\`\`\`
npx prisma migrate dev
\`\`\`

4. Run backend server
\`\`\`
npm run dev
\`\`\`

---

### **Frontend**
1. Install dependencies
\`\`\`
cd frontend
npm install
\`\`\`

2. Configure API base URL in \`.env\`:
\`\`\`
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
\`\`\`

3. Run dev server
\`\`\`
npm run dev
\`\`\`

---

## 📦 Build for Production

**Backend**
\`\`\`
cd backend
npm run build
npm run start
\`\`\`

**Frontend**
\`\`\`
cd frontend
npm run build
npm run start
\`\`\`

---

## 🧩 Roadmap
- Offline mode (local IndexedDB cache)
- End-to-end encryption for notes
- Realtime sync
- Cardano smart contract integration
- Multi-tab notebook categories

---


