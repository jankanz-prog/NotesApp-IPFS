import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password } = req.body;

    // Validation
    if (!email || !username || !password) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      res.status(400).json({ error: 'User with this email or username already exists' });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        provider: 'local',
        profilePicture: req.body.profilePicture || null,
      },
      select: {
        id: true,
        email: true,
        username: true,
        profilePicture: true,
        createdAt: true,
      },
    });

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }

  
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { emailOrUsername, password } = req.body;

    // Validation
    if (!emailOrUsername || !password) {
      res.status(400).json({ error: 'Email/Username and password are required' });
      return;
    }

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername },
          { username: emailOrUsername },
        ],
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check if user registered with OAuth (no password)
    if (!user.passwordHash) {
      res.status(401).json({ error: 'This account uses Google Sign-In. Please sign in with Google.' });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
        walletAddress: user.walletAddress,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        walletAddress: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }

};

export const updateProfilePicture = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { profilePicture } = req.body;

    if (!profilePicture) {
      res.status(400).json({ error: 'Profile picture URL is required' });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { profilePicture },
      select: {
        id: true,
        email: true,
        username: true,
        profilePicture: true,
        walletAddress: true,
      },
    });

    res.json({ message: 'Profile picture updated', user });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({ error: 'Failed to update profile picture' });
  }
};

export const linkWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { walletAddress } = req.body;

    if (!walletAddress) {
      res.status(400).json({ error: 'Wallet address is required' });
      return;
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // If user already has a wallet linked, check if it matches
    if (currentUser.walletAddress) {
      if (currentUser.walletAddress !== walletAddress) {
        res.status(400).json({ 
          error: 'A different wallet is already linked to this account',
          linkedWallet: currentUser.walletAddress,
        });
        return;
      }
      // Same wallet, just return success
      res.json({ 
        message: 'Wallet already linked', 
        walletAddress: currentUser.walletAddress,
      });
      return;
    }

    // Check if this wallet is already linked to another account
    const existingWalletUser = await prisma.user.findFirst({
      where: { walletAddress },
    });

    if (existingWalletUser) {
      res.status(400).json({ 
        error: 'This wallet is already linked to another account',
      });
      return;
    }

    // Link the wallet to this user
    const user = await prisma.user.update({
      where: { id: userId },
      data: { walletAddress },
      select: {
        id: true,
        email: true,
        username: true,
        profilePicture: true,
        walletAddress: true,
      },
    });

    res.json({ 
      message: 'Wallet linked successfully', 
      user,
    });
  } catch (error) {
    console.error('Link wallet error:', error);
    res.status(500).json({ error: 'Failed to link wallet' });
  }
};

export const unlinkWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { walletAddress: null },
      select: {
        id: true,
        email: true,
        username: true,
        profilePicture: true,
        walletAddress: true,
      },
    });

    res.json({ message: 'Wallet unlinked successfully', user });
  } catch (error) {
    console.error('Unlink wallet error:', error);
    res.status(500).json({ error: 'Failed to unlink wallet' });
  }
};