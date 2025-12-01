# 📘 Notes App + Wallet + IPFS (Cardano)

A modern full-stack application built using entity["software","Next.js","react framework"] with a built-in backend (App Router + Route Handlers).
Features include rich-text notes, drawing canvas, IPFS pinning, and Cardano wallet integration.

---

## 🚀 Tech Stack

### **Frontend + Backend (Unified via Next.js)**
- entity["software","Next.js","react framework"] 16 (App Router)
- React 19
- TypeScript 5
- entity["software","Tailwind CSS","utility-first css framework"] v4
- shadcn/ui (Radix UI primitives)
- React Hook Form + Zod
- Lucide React + React Icons

### **Database**
- Choice of:
  - entity["software","PostgreSQL","relational database"]
  - entity["software","MySQL","relational database"]
- ORM: Prisma ORM

### **Blockchain & Storage**
- Cardano Wallet API
- IPFS (gateway-based pinning or provider API)

---

## 📂 Project Structure

project-root/
│
├── app/
│ ├── (auth)/
│ │ ├── login/
│ │ └── register/
│ ├── (dashboard)/
│ │ ├── notes/
│ │ ├── wallet/
│ │ └── settings/
│ ├── api/
│ │ ├── auth/
│ │ ├── notes/
│ │ ├── ipfs/
│ │ └── wallet/
│ └── layout.tsx
│
├── components/
│ ├── notes/
│ ├── forms/
│ ├── wallet/
│ └── ui/
│
├── lib/
│ ├── db.ts
│ ├── auth.ts
│ ├── ipfs.ts
│ ├── wallet.ts
│ └── validators/
│
├── prisma/
│ └── schema.prisma
│
├── styles/
│ └── globals.css
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
- JWT-based session or NextAuth configuration
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

1. Install Dependencies
```
npm install
```

2. Setup Environment Variables

Create .env:
```
DATABASE_URL="postgresql://user:pass@localhost:5432/notesdb"
```

Add IPFS provider keys, Cardano API provider keys, etc.

3. Initialize Database
```
npx prisma migrate dev
```

4. Run Dev Server
```
npm run dev
```

---

## 📦 Build for Production
```
npm run build
npm run start
```

---

## 🧩 Roadmap

- Offline mode (local IndexedDB cache)
- End-to-end encryption for notes
- Realtime sync
- Cardano smart contract integration
- Multi-tab notebook categories

---
