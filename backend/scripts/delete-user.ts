import prisma from '../src/db';

const emailOrUsername = process.argv[2];

if (!emailOrUsername) {
  console.error('Usage: ts-node scripts/delete-user.ts <email-or-username>');
  process.exit(1);
}

async function deleteUser() {
  try {
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
      console.log(`User with email/username "${emailOrUsername}" not found.`);
      process.exit(1);
    }

    console.log(`Found user: ${user.email} (${user.username})`);
    console.log('Deleting user and all associated data...');

    // Delete user (cascades to notes, folders, transactions)
    await prisma.user.delete({
      where: { id: user.id },
    });

    console.log('User deleted successfully!');
  } catch (error) {
    console.error('Error deleting user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser();



