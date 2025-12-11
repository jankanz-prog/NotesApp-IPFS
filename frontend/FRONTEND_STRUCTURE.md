# Frontend Structure

Complete directory structure of the Notes App frontend.

```
frontend/
├── app/                          # Next.js App Router pages
│   ├── favicon.ico               # App favicon
│   ├── globals.css               # Global styles & CSS variables
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Home/Landing page
│   │
│   ├── login/                    # Authentication pages
│   │   └── page.tsx             # Login page with Google OAuth
│   │
│   ├── register/                 # Registration pages
│   │   └── page.tsx             # User registration page
│   │
│   ├── notes/                    # Notes application pages
│   │   ├── page.tsx             # Main notes dashboard (3-column layout)
│   │   ├── (.)notes-new/        # Intercepted route for quick note creation
│   │   │   └── page.tsx         # Modal overlay for new note
│   │   └── [id]/                # Dynamic route for individual notes
│   │       └── page.tsx         # Note detail page
│   │
│   └── profile/                  # User profile pages
│       └── page.tsx             # User profile & settings page
│
├── components/                   # React components
│   ├── BlockchainRecovery.tsx    # Blockchain recovery modal component
│   ├── GoogleOAuthWrapper.tsx    # Google OAuth provider wrapper
│   ├── NoteEditor.tsx           # Note editing component with auto-save
│   ├── NoteList.tsx             # Note list display component
│   ├── SendAdaModal.tsx         # Send ADA transaction modal
│   ├── Sidebar.tsx              # Sidebar navigation component
│   ├── ThemeProvider.tsx        # Theme context provider (light/dark)
│   ├── TransactionHistory.tsx   # Transaction history display
│   └── WalletConnect.tsx        # Lace wallet connection component
│
├── hooks/                        # Custom React hooks
│   ├── useBlockchainNotes.ts    # Hook for blockchain note operations
│   ├── useTransactionStatus.ts  # Hook for transaction status polling
│   └── useWallet.ts             # Hook for wallet operations
│
├── lib/                          # Utility libraries
│   ├── api.ts                   # Axios API client with JWT auth
│   ├── blockchainRecovery.ts    # Blockchain recovery utilities
│   ├── cardano.ts               # Cardano transaction utilities (64-byte chunking)
│   └── stubs/                   # Node.js stubs for browser compatibility
│       └── fs.js                # File system stub
│
├── store/                        # Zustand state management
│   ├── authStore.ts             # Authentication state store
│   ├── foldersStore.ts         # Folders state store
│   ├── notesStore.ts           # Notes state store with optimistic UI
│   └── walletStore.ts          # Wallet state store
│
├── public/                       # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── .next/                        # Next.js build output (generated)
│
├── node_modules/                 # Dependencies (generated)
│
├── package.json                  # Dependencies & scripts
├── package-lock.json             # Lock file
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── next.config.ts                # Next.js configuration
├── postcss.config.mjs             # PostCSS configuration
├── eslint.config.mjs              # ESLint configuration
├── next-env.d.ts                 # Next.js TypeScript declarations
└── README.md                     # Project documentation
```

## Key Features by Directory

### `/app` - Pages (Next.js App Router)
- **Layout**: Root layout with ThemeProvider, GoogleOAuthWrapper, and Toaster
- **Home**: Landing page with features showcase
- **Auth**: Login and registration with Google OAuth support
- **Notes**: Main application with 3-column layout (Sidebar | Note List | Editor)
- **Profile**: User settings and profile management

### `/components` - Reusable Components
- **UI Components**: Sidebar, NoteList, NoteEditor
- **Wallet Components**: WalletConnect, SendAdaModal, TransactionHistory
- **Providers**: ThemeProvider, GoogleOAuthWrapper
- **Blockchain**: BlockchainRecovery for note recovery from chain

### `/hooks` - Custom Hooks
- **useWallet**: Wallet connection and operations
- **useBlockchainNotes**: Blockchain sync operations
- **useTransactionStatus**: Background polling for transaction status

### `/lib` - Utilities
- **api.ts**: Centralized API client with JWT authentication
- **cardano.ts**: Cardano transaction building with 64-byte metadata chunking
- **blockchainRecovery.ts**: Recovery utilities for fetching notes from blockchain

### `/store` - State Management (Zustand)
- **authStore**: User authentication state
- **notesStore**: Notes CRUD with optimistic UI and auto-save
- **foldersStore**: Folder management
- **walletStore**: Wallet connection state

## Technology Stack

- **Framework**: Next.js 16.0.6 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom CSS variables
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **HTTP Client**: Axios
- **Blockchain**: Cardano (Lace Wallet, CIP-30)
- **OAuth**: Google OAuth 2.0

## Design System

- **Theme**: Light/Dark mode support
- **Design**: Glassmorphism, Neumorphism, Gradient accents
- **Animations**: Micro-interactions, smooth transitions
- **Typography**: Geist Sans & Geist Mono fonts
- **Colors**: Custom CSS variables for theming

