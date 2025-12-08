'use client';

// Recovery utilities to restore notes from Cardano blockchain
// The blockchain acts as the Permanent Source of Truth

const NOTES_APP_LABEL = '42819';
const BLOCKFROST_API = 'https://cardano-preview.blockfrost.io/api/v0';

interface BlockchainNote {
  txHash: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  noteId: string;
  title: string;
  content: string;
  folderId?: string;
  createdAt: string;
  blockTime: number;
}

interface TransactionMetadata {
  label: string;
  json_metadata: {
    action?: string;
    note_id?: string;
    title?: string | string[];
    content?: string | string[];
    folder_id?: string;
    created_at?: string;
  };
}

/**
 * Reconstruct content from chunked metadata
 * Cardano has a 64-byte limit, so long strings are stored as arrays
 */
const reconstructContent = (data: string | string[] | undefined): string => {
  if (!data) return '';
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.join('');
  return '';
};

/**
 * Fetch all transactions for a wallet address
 */
const fetchWalletTransactions = async (
  walletAddress: string,
  projectId: string
): Promise<string[]> => {
  const allTxHashes: string[] = [];
  let page = 1;
  const count = 100;

  while (true) {
    const response = await fetch(
      `${BLOCKFROST_API}/addresses/${walletAddress}/transactions?page=${page}&count=${count}&order=desc`,
      {
        headers: { project_id: projectId },
      }
    );

    if (response.status === 404) {
      // No transactions found
      break;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`);
    }

    const transactions = await response.json();
    
    if (transactions.length === 0) break;

    allTxHashes.push(...transactions.map((tx: { tx_hash: string }) => tx.tx_hash));
    
    if (transactions.length < count) break;
    page++;
  }

  return allTxHashes;
};

/**
 * Fetch metadata for a specific transaction
 */
const fetchTransactionMetadata = async (
  txHash: string,
  projectId: string
): Promise<TransactionMetadata[] | null> => {
  const response = await fetch(
    `${BLOCKFROST_API}/txs/${txHash}/metadata`,
    {
      headers: { project_id: projectId },
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch metadata: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetch transaction details to get block time
 */
const fetchTransactionDetails = async (
  txHash: string,
  projectId: string
): Promise<{ block_time: number } | null> => {
  const response = await fetch(
    `${BLOCKFROST_API}/txs/${txHash}`,
    {
      headers: { project_id: projectId },
    }
  );

  if (!response.ok) return null;
  return response.json();
};

/**
 * Recover all notes from the blockchain for a given wallet address
 * This reconstructs the note history from transaction metadata
 */
export const recoverNotesFromBlockchain = async (
  walletAddress: string
): Promise<BlockchainNote[]> => {
  const projectId = process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID;
  if (!projectId) {
    throw new Error('NEXT_PUBLIC_BLOCKFROST_PROJECT_ID is not set');
  }

  console.log('Starting blockchain recovery for address:', walletAddress);

  // Step 1: Get all transactions for the wallet
  const txHashes = await fetchWalletTransactions(walletAddress, projectId);
  console.log(`Found ${txHashes.length} transactions`);

  const recoveredNotes: BlockchainNote[] = [];

  // Step 2: Check each transaction for our app's metadata
  for (const txHash of txHashes) {
    try {
      const metadata = await fetchTransactionMetadata(txHash, projectId);
      
      if (!metadata) continue;

      // Find our app's metadata label
      const appMetadata = metadata.find((m) => m.label === NOTES_APP_LABEL);
      
      if (!appMetadata || !appMetadata.json_metadata) continue;

      const data = appMetadata.json_metadata;
      
      // Get block time for ordering
      const txDetails = await fetchTransactionDetails(txHash, projectId);
      const blockTime = txDetails?.block_time || 0;

      recoveredNotes.push({
        txHash,
        action: (data.action as 'CREATE' | 'UPDATE' | 'DELETE') || 'CREATE',
        noteId: data.note_id || txHash,
        title: reconstructContent(data.title),
        content: reconstructContent(data.content),
        folderId: data.folder_id,
        createdAt: data.created_at || new Date(blockTime * 1000).toISOString(),
        blockTime,
      });

      console.log(`Recovered note from tx: ${txHash}`);
    } catch (error) {
      console.warn(`Failed to process tx ${txHash}:`, error);
    }
  }

  // Step 3: Process notes to get final state
  // Sort by block time to process in chronological order
  recoveredNotes.sort((a, b) => a.blockTime - b.blockTime);

  return recoveredNotes;
};

/**
 * Get the latest state of each note (handling CREATE, UPDATE, DELETE)
 * Returns only notes that should exist (not deleted)
 */
export const getLatestNoteStates = (
  recoveredNotes: BlockchainNote[]
): Map<string, BlockchainNote> => {
  const noteStates = new Map<string, BlockchainNote>();

  // Process in chronological order
  for (const note of recoveredNotes) {
    if (note.action === 'DELETE') {
      noteStates.delete(note.noteId);
    } else {
      noteStates.set(note.noteId, note);
    }
  }

  return noteStates;
};

/**
 * Convert recovered blockchain notes to the format expected by the API
 */
export const convertToApiFormat = (
  note: BlockchainNote
): {
  title: string;
  content: string;
  folderId?: string;
  txHash: string;
  status: 'CONFIRMED';
} => {
  return {
    title: note.title,
    content: note.content,
    folderId: note.folderId,
    txHash: note.txHash,
    status: 'CONFIRMED',
  };
};
