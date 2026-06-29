import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load env from root
dotenv.config({ path: path.resolve(__dirname, '../../../.env'), override: true });
console.log('Using URL:', process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.user.count();
    console.log('Success! User count:', count);
  } catch (err: any) {
    console.error('Error connecting:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
