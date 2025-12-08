'use client';

import { useEffect, useRef, useCallback } from 'react';
import api from '@/lib/api';

// Check interval for pending transactions (20 seconds)
const CHECK_INTERVAL = 20000;

interface Transaction {
  id: string;
  txHash: string;
  status: string;
}

/**
 * Hook to poll and update status of pending ADA transactions
 */
export const useTransactionStatus = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Check transaction status on Blockfrost
   */
  const checkTransactionOnChain = useCallback(async (txHash: string): Promise<'pending' | 'confirmed' | 'not_found'> => {
    try {
      const projectId = process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID;
      if (!projectId) return 'not_found';

      const response = await fetch(
        `https://cardano-preview.blockfrost.io/api/v0/txs/${txHash}`,
        {
          headers: { project_id: projectId },
        }
      );

      if (response.status === 200) return 'confirmed';
      if (response.status === 404) return 'pending';
      return 'not_found';
    } catch (error) {
      console.error('Error checking transaction status:', error);
      return 'not_found';
    }
  }, []);

  /**
   * Update transaction status in database
   */
  const updateTransactionStatus = useCallback(async (txHash: string, status: string) => {
    try {
      await api.patch('/transactions/status', { txHash, status });
      console.log(`Transaction ${txHash} status updated to ${status}`);
    } catch (error) {
      console.error('Failed to update transaction status:', error);
    }
  }, []);

  /**
   * Check all pending transactions
   */
  const checkPendingTransactions = useCallback(async () => {
    try {
      const response = await api.get('/transactions/history');
      const transactions: Transaction[] = response.data.transactions || [];
      
      // Filter only SUBMITTED (pending) transactions
      const pendingTxs = transactions.filter(tx => tx.status === 'SUBMITTED');
      
      if (pendingTxs.length === 0) return;

      console.log(`Checking ${pendingTxs.length} pending ADA transactions...`);

      for (const tx of pendingTxs) {
        const status = await checkTransactionOnChain(tx.txHash);
        
        if (status === 'confirmed') {
          await updateTransactionStatus(tx.txHash, 'CONFIRMED');
        } else if (status === 'not_found') {
          // After some time, mark as failed if still not found
          // For now, just log - could add timestamp check
          console.warn(`Transaction ${tx.txHash} not found on chain`);
        }
      }
    } catch (error) {
      console.error('Error checking pending transactions:', error);
    }
  }, [checkTransactionOnChain, updateTransactionStatus]);

  /**
   * Start background polling
   */
  useEffect(() => {
    // Check immediately on mount
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
    checkPendingTransactions,
    checkTransactionOnChain,
  };
};
