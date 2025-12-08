import { Request, Response } from 'express';
import prisma from '../db';

// Create a new transaction record
export const createTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { senderWallet, recipientWallet, amount, txHash } = req.body;

    if (!senderWallet || !recipientWallet || !amount || !txHash) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    // Check if transaction already exists
    const existingTx = await prisma.transaction.findUnique({
      where: { txHash },
    });

    if (existingTx) {
      res.status(400).json({ error: 'Transaction already recorded' });
      return;
    }

    const transaction = await prisma.transaction.create({
      data: {
        senderId: userId,
        senderWallet,
        recipientWallet,
        amount: parseFloat(amount),
        txHash,
        status: 'SUBMITTED',
      },
    });

    res.status(201).json({ message: 'Transaction recorded', transaction });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to record transaction' });
  }
};

// Get user's transaction history (sent AND received)
export const getTransactionHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    // Get user's wallet address
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true, username: true },
    });

    // Get SENT transactions (user is sender)
    const sentTransactions = await prisma.transaction.findMany({
      where: { senderId: userId },
      orderBy: { createdAt: 'desc' },
    });

    // Get RECEIVED transactions (user's wallet is recipient)
    const receivedTransactions = currentUser?.walletAddress
      ? await prisma.transaction.findMany({
          where: { recipientWallet: currentUser.walletAddress },
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                profilePicture: true,
              },
            },
          },
        })
      : [];

    // Process sent transactions
    const sentWithInfo = await Promise.all(
      sentTransactions.map(async (tx) => {
        const recipientUser = await prisma.user.findFirst({
          where: { walletAddress: tx.recipientWallet },
          select: {
            id: true,
            username: true,
            profilePicture: true,
          },
        });

        return {
          ...tx,
          type: 'sent' as const,
          counterparty: recipientUser
            ? {
                id: recipientUser.id,
                username: recipientUser.username,
                profilePicture: recipientUser.profilePicture,
                walletAddress: tx.recipientWallet,
                isRegistered: true,
              }
            : {
                id: null,
                username: null,
                profilePicture: null,
                walletAddress: tx.recipientWallet,
                isRegistered: false,
              },
        };
      })
    );

    // Process received transactions
    const receivedWithInfo = receivedTransactions.map((tx) => ({
      id: tx.id,
      senderWallet: tx.senderWallet,
      recipientWallet: tx.recipientWallet,
      amount: tx.amount,
      txHash: tx.txHash,
      status: tx.status,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
      type: 'received' as const,
      counterparty: {
        id: tx.sender.id,
        username: tx.sender.username,
        profilePicture: tx.sender.profilePicture,
        walletAddress: tx.senderWallet,
        isRegistered: true,
      },
    }));

    // Combine and sort by date
    const allTransactions = [...sentWithInfo, ...receivedWithInfo].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json({ transactions: allTransactions });
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({ error: 'Failed to get transaction history' });
  }
};

// Update transaction status (for background worker)
export const updateTransactionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { txHash, status } = req.body;

    if (!txHash || !status) {
      res.status(400).json({ error: 'txHash and status are required' });
      return;
    }

    const transaction = await prisma.transaction.update({
      where: { txHash },
      data: { status },
    });

    res.json({ message: 'Transaction status updated', transaction });
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({ error: 'Failed to update transaction status' });
  }
};

// Lookup user by wallet address (public endpoint for recipient info)
export const lookupWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      res.status(400).json({ error: 'Wallet address is required' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: { walletAddress },
      select: {
        username: true,
        profilePicture: true,
      },
    });

    if (user) {
      res.json({ found: true, user });
    } else {
      res.json({ found: false, user: null });
    }
  } catch (error) {
    console.error('Lookup wallet error:', error);
    res.status(500).json({ error: 'Failed to lookup wallet' });
  }
};
