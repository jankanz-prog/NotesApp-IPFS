/**
 * Script to fix Google OAuth usernames
 * Run this once to update existing users with random usernames to their proper Google names
 * 
 * Usage: npx ts-node fix-google-usernames.ts
 */

import { PrismaClient } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function fixGoogleUsernames() {
  try {
    console.log('🔍 Finding users with Google OAuth...');
    
    // Find all users with Google provider
    const googleUsers = await prisma.user.findMany({
      where: {
        provider: 'google',
        googleId: { not: null },
      },
    });

    console.log(`📊 Found ${googleUsers.length} Google OAuth users`);

    for (const user of googleUsers) {
      // Check if username looks like it has a random suffix (contains underscore with random chars)
      const hasRandomSuffix = /_[a-z0-9]{5,7}$/.test(user.username);
      
      if (hasRandomSuffix) {
        // Extract the base username (before the underscore)
        const baseUsername = user.username.split('_')[0];
        
        console.log(`\n👤 User: ${user.email}`);
        console.log(`   Current username: ${user.username}`);
        console.log(`   Suggested username: ${baseUsername}`);
        
        // Check if the base username is available
        const existingUser = await prisma.user.findFirst({
          where: {
            username: baseUsername,
            NOT: { id: user.id },
          },
        });

        let newUsername = baseUsername;
        
        if (existingUser) {
          console.log(`   ⚠️  Username "${baseUsername}" is taken, keeping current username`);
          continue;
        }

        // Update the username
        await prisma.user.update({
          where: { id: user.id },
          data: { username: newUsername },
        });

        console.log(`   ✅ Updated to: ${newUsername}`);
      } else {
        console.log(`\n✓ User ${user.email} already has a clean username: ${user.username}`);
      }
    }

    console.log('\n✨ Done! All Google usernames have been fixed.');
  } catch (error) {
    console.error('❌ Error fixing usernames:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixGoogleUsernames();
