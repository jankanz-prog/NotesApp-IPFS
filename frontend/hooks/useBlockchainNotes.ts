'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { useNotesStore, Note, NoteStatus } from '@/store/notesStore';

// Check interval for pending transactions (20 seconds as per requirements)
const CHECK_INTERVAL = 20000;

export type NoteAction = 'CREATE' | 'UPDATE' | 'DELETE';

interface UseBlockchainNotesReturn {
  isWalletConnected: boolean;
  sendNoteToBlockchain: (note: Note, action: NoteAction) => Promise<string | null>;
  isProcessing: boolean;
}

export const useBlockchainNotes = (): UseBlockchainNotesReturn => {
  const { walletApi, isConnected } = useWalletStore();
  const { notes, updateNote, updateNoteLocal, getPendingNotes } = useNotesStore();
  const isProcessingRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Send a note transaction to the blockchain
   */
  const sendNoteToBlockchain = useCallback(async (
    note: Note,
    action: NoteAction
  ): Promise<string | null> => {
    if (!walletApi || !isConnected) {
      console.warn('Wallet not connected - skipping blockchain transaction');
      return null;
    }

    isProcessingRef.current = true;

    try {
      // Dynamic import to avoid SSR issues
      const { sendNoteTransaction } = await import('@/lib/cardano');

      const result = await sendNoteTransaction(walletApi, {
        noteId: note.id,
        title: note.title,
        content: note.content,
        action,
        folderId: note.folderId,
      });

      if (result.success && result.txHash) {
        // Update note with transaction hash and SUBMITTED status
        await updateNote(note.id, {
          txHash: result.txHash,
          status: 'SUBMITTED' as NoteStatus,
        });
        console.log(`Note ${action} transaction submitted:`, result.txHash);
        return result.txHash;
      } else {
        // Mark as FAILED if transaction failed
        await updateNote(note.id, {
          status: 'FAILED' as NoteStatus,
        });
        console.error('Transaction failed:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Blockchain transaction error:', error);
      await updateNote(note.id, {
        status: 'FAILED' as NoteStatus,
      });
      return null;
    } finally {
      isProcessingRef.current = false;
    }
  }, [walletApi, isConnected, updateNote]);

  /**
   * Check status of pending transactions
   */
  const checkPendingTransactions = useCallback(async () => {
    const pendingNotes = getPendingNotes();
    
    if (pendingNotes.length === 0) return;

    console.log(`Checking ${pendingNotes.length} pending transactions...`);

    for (const note of pendingNotes) {
      // Only check notes that have a txHash (SUBMITTED status)
      if (!note.txHash) continue;

      try {
        const { checkTransactionStatus } = await import('@/lib/cardano');
        const status = await checkTransactionStatus(note.txHash);

        if (status === 'confirmed') {
          // Update local state immediately for better UX
          updateNoteLocal(note.id, { status: 'CONFIRMED' });
          // Then persist to database
          await updateNote(note.id, { status: 'CONFIRMED' as NoteStatus });
          console.log(`Note ${note.id} confirmed on-chain!`);
        } else if (status === 'not_found') {
          // Transaction might have failed or been dropped
          console.warn(`Transaction ${note.txHash} not found, might be pending...`);
        }
        // If status is 'pending', do nothing and check again next interval
      } catch (error) {
        console.error(`Error checking transaction for note ${note.id}:`, error);
      }
    }
  }, [getPendingNotes, updateNote, updateNoteLocal]);

  /**
   * Start background worker to check pending transactions
   */
  useEffect(() => {
    // Start checking immediately
    checkPendingTransactions();

    // Set up interval
    intervalRef.current = setInterval(checkPendingTransactions, CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkPendingTransactions]);

  return {
    isWalletConnected: isConnected,
    sendNoteToBlockchain,
    isProcessing: isProcessingRef.current,
  };
};
