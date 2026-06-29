import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'clasptek@gmail.com' }
  });
  console.log('User status:', user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
