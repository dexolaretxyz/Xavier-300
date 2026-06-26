import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Fetching unverified users...');
  
  const unverifiedUsers = await prisma.user.findMany({
    where: {
      emailVerified: false
    }
  });

  if (unverifiedUsers.length === 0) {
    console.log('✨ No unverified users found! Everyone is already approved.');
    return;
  }

  console.log(`👤 Found ${unverifiedUsers.length} unverified user(s):`);
  for (const user of unverifiedUsers) {
    console.log(`  - ${user.fullName} (${user.email}) - Registered: ${user.createdAt.toLocaleString()}`);
  }

  console.log('\n⚡ Approving and activating accounts...');
  
  const result = await prisma.user.updateMany({
    where: {
      emailVerified: false
    },
    data: {
      emailVerified: true,
      verificationToken: null,
      tokenExpiresAt: null,
      trialStartedAt: new Date(),
      subscriptionStatus: 'FREE_TRIAL'
    }
  });

  console.log(`\n💚 Successfully approved and activated ${result.count} user account(s)!`);
}

main()
  .catch(err => {
    console.error('Error approving users:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
