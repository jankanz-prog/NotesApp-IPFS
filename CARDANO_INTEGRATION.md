# Cardano Blockchain Integration for Notes App

This document describes the implementation of Cardano blockchain integration for the Notes App, allowing notes to be recorded on-chain with transaction metadata.

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   CREATE    │  │   UPDATE    │  │   DELETE    │  │   STATUS    │        │
│  │    Note     │  │    Note     │  │    Note     │  │   Badge     │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────────────┘        │
└─────────┼────────────────┼────────────────┼────────────────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           NOTES PAGE (page.tsx)                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  1. Save to Database (immediate) ──► Fast UX for user                │  │
│  │  2. Send to Blockchain (async) ──► If wallet connected               │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
          │                                    │
          ▼                                    ▼
┌─────────────────────┐          ┌────────────────────────────────────────────┐
│   LOCAL DATABASE    │          │         BLOCKCHAIN LAYER                   │
│   (PostgreSQL)      │          │  ┌─────────────────────────────────────┐   │
│                     │          │  │   useBlockchainNotes Hook           │   │
│  ┌───────────────┐  │          │  │   - sendNoteToBlockchain()          │   │
│  │    Notes      │  │          │  │   - Background Worker (20s)         │   │
│  │  - id         │  │          │  └──────────────┬──────────────────────┘   │
│  │  - title      │  │          │                 │                          │
│  │  - content    │  │          │                 ▼                          │
│  │  - txHash     │◄─┼──────────┼──── Transaction Hash                       │
│  │  - status     │◄─┼──────────┼──── Status Updates                         │
│  └───────────────┘  │          │                 │                          │
└─────────────────────┘          │                 ▼                          │
                                 │  ┌─────────────────────────────────────┐   │
                                 │  │   Cardano Library (cardano.ts)      │   │
                                 │  │   - Blaze SDK                       │   │
                                 │  │   - Metadata Construction           │   │
                                 │  │   - 64-byte Chunking                │   │
                                 │  └──────────────┬──────────────────────┘   │
                                 │                 │                          │
                                 │                 ▼                          │
                                 │  ┌─────────────────────────────────────┐   │
                                 │  │   Blockfrost API                    │   │
                                 │  │   - Submit Transaction              │   │
                                 │  │   - Check TX Status                 │   │
                                 │  └──────────────┬──────────────────────┘   │
                                 │                 │                          │
                                 └─────────────────┼──────────────────────────┘
                                                   │
                                                   ▼
                                 ┌─────────────────────────────────────────────┐
                                 │         CARDANO BLOCKCHAIN                  │
                                 │         (Preview Network)                   │
                                 │                                             │
                                 │   Transaction with Metadata:                │
                                 │   ┌─────────────────────────────────────┐   │
                                 │   │  Label: 42819                       │   │
                                 │   │  {                                  │   │
                                 │   │    "action": "CREATE/UPDATE/DELETE" │   │
                                 │   │    "note_id": "cuid..."             │   │
                                 │   │    "title": "Note Title"            │   │
                                 │   │    "content": ["chunk1", "chunk2"]  │   │
                                 │   │    "created_at": "ISO timestamp"    │   │
                                 │   │  }                                  │   │
                                 │   └─────────────────────────────────────┘   │
                                 └─────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         NOTE LIFECYCLE FLOW                                │
└────────────────────────────────────────────────────────────────────────────┘

User Action          Database              Blockchain           Status
    │                   │                      │                  │
    │  Create Note      │                      │                  │
    ├──────────────────►│                      │                  │
    │                   │ Save with            │                  │
    │                   │ status: PENDING ─────┼─────────────────►│ PENDING
    │                   │                      │                  │    │
    │                   │ (No blockchain TX    │                  │    │
    │                   │  - note is empty)    │                  │    │
    │                   │                      │                  │    │
    │  Save Note        │                      │                  │    │
    │  (with content)   │                      │                  │    │
    ├──────────────────►│                      │                  │    │
    │                   │ Update content       │                  │    │
    │                   │                      │                  │    │
    │  (if wallet       │                      │                  │    │
    │   connected AND   │                      │                  │    │
    │   has content)    │                      │                  │    │
    ├───────────────────┼─────────────────────►│                  │    │
    │                   │                      │ Build TX         │    │
    │                   │                      │ Sign TX          │    │
    │                   │                      │ Submit TX        │    │
    │                   │                      │     │            │    │
    │                   │◄─────────────────────┼─────┘            │    │
    │                   │ Update txHash        │                  │    │
    │                   │ status: SUBMITTED ───┼─────────────────►│ SUBMITTED
    │                   │                      │                  │    │
    │                   │                      │                  │    │
    │  Background       │                      │                  │    │
    │  Worker (20s)     │                      │                  │    │
    │       │           │                      │                  │    │
    │       ▼           │                      │                  │    │
    │  Check txHash ────┼─────────────────────►│                  │    │
    │                   │                      │ Query Blockfrost │    │
    │                   │                      │     │            │    │
    │                   │◄─────────────────────┼─────┘            │    │
    │                   │ If confirmed:        │                  │    │
    │                   │ status: CONFIRMED ───┼─────────────────►│ CONFIRMED
    │                   │                      │                  │    │
    ▼                   ▼                      ▼                  ▼    ▼
```

### Transaction Rules

1. **Save Button**: Local save only - saves to database, NO blockchain transaction
2. **Sync to Chain Button**: Explicit blockchain sync - only when user clicks this button
   - Requires wallet to be connected
   - Requires note to have content
   - Saves locally first, then sends to blockchain
3. **On Delete**: Transaction sent only if note was previously on chain (has txHash)
4. **Concurrent Protection**: Sync button disabled while transaction is pending

### UI Buttons

```
┌────────────────────────────────────────────────────────────────────┐
│  [Delete] [Save]  |  [Status Badge] [View TX]  [Sync to Chain]     │
│     ↓       ↓                                        ↓             │
│   Local   Local                               Blockchain TX        │
│   Delete  Save                                (explicit only)      │
└────────────────────────────────────────────────────────────────────┘
```

---

## Status State Machine

```
                    ┌─────────────┐
                    │   PENDING   │
                    │  (default)  │
                    └──────┬──────┘
                           │
                           │ Transaction submitted
                           │ to blockchain
                           ▼
                    ┌─────────────┐
                    │  SUBMITTED  │
                    │ (waiting)   │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              │ TX confirmed            │ TX failed/dropped
              │ (200 from Blockfrost)   │ (error or timeout)
              ▼                         ▼
       ┌─────────────┐          ┌─────────────┐
       │  CONFIRMED  │          │   FAILED    │
       │  (on-chain) │          │  (retry?)   │
       └─────────────┘          └─────────────┘
```

---

## File Structure

```
frontend/
├── .env.local                          # Environment variables
│   ├── NEXT_PUBLIC_BLOCKFROST_PROJECT_ID
│   └── NEXT_PUBLIC_BLOCKFROST_IPFS_KEY
│
├── lib/
│   └── cardano.ts                      # Cardano blockchain utilities
│       ├── sendNoteTransaction()       # Build, sign, submit TX
│       ├── checkTransactionStatus()    # Query Blockfrost API
│       └── formatContent()             # 64-byte chunking
│
├── hooks/
│   └── useBlockchainNotes.ts           # Blockchain integration hook
│       ├── sendNoteToBlockchain()      # Send note action to chain
│       └── checkPendingTransactions()  # Background worker
│
├── store/
│   └── notesStore.ts                   # Zustand store
│       ├── Note interface (+ txHash, status)
│       ├── updateNoteLocal()           # Optimistic updates
│       └── getPendingNotes()           # For background worker
│
└── app/notes/
    └── page.tsx                        # Notes UI
        ├── Blockchain integration on CRUD
        ├── Status badges (Pending/Submitted/Confirmed/Failed)
        └── Transaction link to Cardanoscan

backend/
├── prisma/
│   └── schema.prisma                   # Database schema
│       └── Note model (+ txHash, status, NoteStatus enum)
│
└── src/controllers/
    └── notes.controller.ts             # API endpoints
        ├── createNote (+ txHash, status)
        └── updateNote (+ txHash, status)
```

---

## Transaction Metadata Structure

The metadata uses **label 42819** (a unique identifier to avoid collisions with other dApps).

```json
{
  "42819": {
    "action": "CREATE",
    "note_id": "clx1234567890",
    "title": "My Note Title",
    "content": "Short content here",
    "folder_id": "clx0987654321",
    "created_at": "2024-12-04T10:00:00.000Z"
  }
}
```

### Content Chunking (64-byte limit)

Cardano metadata has a **64-byte limit per string**. Long content is automatically chunked:

```json
{
  "content": [
    "This is the first 64 characters of a very long note that needs",
    " to be split into multiple chunks because Cardano has a strict ",
    "64-byte limit per string in transaction metadata."
  ]
}
```

---

## UI Status Indicators

| Status | Badge | Description |
|--------|-------|-------------|
| PENDING | 🕐 Gray | Note saved locally, waiting for blockchain TX |
| SUBMITTED | 🔄 Yellow (spinning) | TX submitted, waiting for confirmation (~20s) |
| CONFIRMED | ✅ Green | TX confirmed on-chain |
| FAILED | ❌ Red | TX failed to submit or was rejected |

---

## Environment Variables

```env
# Blockfrost Project ID for Cardano Preview Network
NEXT_PUBLIC_BLOCKFROST_PROJECT_ID=previewXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Blockfrost IPFS Key (for future IPFS storage)
NEXT_PUBLIC_BLOCKFROST_IPFS_KEY=ipfsXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## Testing the Integration

1. **Start the backend server** (port 4000)
2. **Start the frontend** (`npm run dev`)
3. **Connect your Cardano wallet** (Eternl, Nami, Lace, etc.)
4. **Create a new note** - Watch status change: Pending → Submitted → Confirmed
5. **Click "View TX"** in the editor to see the transaction on [Cardanoscan](https://preview.cardanoscan.io)

---

## Blockchain Recovery Feature

If notes are lost from the database, users can recover them from the blockchain.

### Recovery Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      BLOCKCHAIN RECOVERY FLOW                            │
└──────────────────────────────────────────────────────────────────────────┘

  User clicks                                              
  "Recover from Chain"                                     
        │                                                  
        ▼                                                  
┌───────────────────┐     ┌─────────────────────────────────────────────┐
│  Get all TXs for  │────►│  Blockfrost API                             │
│  wallet address   │     │  /addresses/{addr}/transactions             │
└───────────────────┘     └─────────────────────────────────────────────┘
        │                                                  
        ▼                                                  
┌───────────────────┐     ┌─────────────────────────────────────────────┐
│  For each TX,     │────►│  Blockfrost API                             │
│  fetch metadata   │     │  /txs/{hash}/metadata                       │
└───────────────────┘     └─────────────────────────────────────────────┘
        │                                                  
        ▼                                                  
┌───────────────────┐                                      
│  Filter TXs with  │  Only transactions with label 42819  
│  our app label    │  contain our notes                   
└───────────────────┘                                      
        │                                                  
        ▼                                                  
┌───────────────────┐                                      
│  Process actions: │  CREATE → Add note                   
│  CREATE/UPDATE/   │  UPDATE → Replace note               
│  DELETE           │  DELETE → Remove note                
└───────────────────┘                                      
        │                                                  
        ▼                                                  
┌───────────────────┐                                      
│  Show recoverable │  User selects which notes to import  
│  notes to user    │                                      
└───────────────────┘                                      
        │                                                  
        ▼                                                  
┌───────────────────┐     ┌─────────────────────────────────────────────┐
│  Import selected  │────►│  Local Database                             │
│  notes to DB      │     │  Notes restored with CONFIRMED status       │
└───────────────────┘     └─────────────────────────────────────────────┘
```

### How to Use

1. **Connect your Cardano wallet** in the header
2. Click **"Recover from Chain"** button (appears when wallet is connected)
3. Click **"Scan Blockchain"** to search for your notes
4. **Select notes** you want to recover
5. Click **"Import"** to restore them to your database

### Files Involved

```
frontend/
├── lib/
│   └── blockchainRecovery.ts    # Recovery utilities
│       ├── recoverNotesFromBlockchain()
│       ├── getLatestNoteStates()
│       └── convertToApiFormat()
│
└── components/
    └── BlockchainRecovery.tsx   # Recovery UI modal
```

---

## References

- [Blockfrost API Documentation](https://docs.blockfrost.io/)
- [Blaze Cardano SDK](https://github.com/butaneprotocol/blaze-cardano)
- [CIP-10: Metadata Labels Registry](https://github.com/cardano-foundation/CIPs/blob/master/CIP-0010/registry.json)
- [Cardanoscan Preview Explorer](https://preview.cardanoscan.io)
