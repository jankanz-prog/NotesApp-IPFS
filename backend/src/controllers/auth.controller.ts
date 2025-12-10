import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
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
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not set in environment variables');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, jwtSecret, {
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
  } catch (error: any) {
    console.error('Login error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Failed to login', details: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    // But only proceed if user exists and has a password (not OAuth only)
    if (!user || !user.passwordHash) {
      res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry,
      },
    });

    // In production, send email here
    // For now, we'll log it (in development) or you can integrate with email service
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    console.log('Password Reset Link:', resetUrl);
    console.log('Reset Token:', resetToken);
    
    // TODO: Send email with reset link
    // await sendPasswordResetEmail(user.email, resetUrl);

    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.',
      // In development, include the reset URL (remove in production)
      ...(process.env.NODE_ENV === 'development' && { resetUrl }),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ error: 'Token and password are required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long' });
      return;
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
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

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { username, profilePicture } = req.body;

    // Check if username is taken by another user
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        res.status(400).json({ error: 'Username is already taken' });
        return;
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username && { username }),
        profilePicture: profilePicture ?? undefined,
      },
      select: {
        id: true,
        email: true,
        username: true,
        profilePicture: true,
        walletAddress: true,
      },
    });

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
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
