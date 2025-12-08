import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import prisma from '../db';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({ error: 'Google credential is required' });
      return;
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      res.status(400).json({ error: 'Invalid Google token' });
      return;
    }

    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { googleId },
    });

    if (!user) {
      // Check if email already exists (from regular registration)
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Link Google account to existing user
        user = await prisma.user.update({
          where: { email },
          data: {
            googleId,
            provider: 'google',
            profilePicture: picture || existingUser.profilePicture,
          },
        });
      } else {
        // Create new user
        const username = email.split('@')[0] + '_' + Math.random().toString(36).substring(7);
        
        user = await prisma.user.create({
          data: {
            email,
            username,
            googleId,
            provider: 'google',
            profilePicture: picture,
            passwordHash: null, // No password for OAuth users
          },
        });
      }
    } else {
      // Update profile picture if changed
      if (picture && user.profilePicture !== picture) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { profilePicture: picture },
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
        walletAddress: user.walletAddress,
      },
    });
  } catch (error: any) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
};
