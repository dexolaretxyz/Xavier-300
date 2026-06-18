import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CHEW questions seeding...');

  const dbCerts = await prisma.certification.findMany();
  const certMap = new Map(dbCerts.map((c) => [c.slug, c.id]));

  const chewSlugs = ['chew-objective', 'chew-theory', 'chew-practical'];
  const chewCertIds = chewSlugs.map(slug => certMap.get(slug)).filter(Boolean) as string[];
  await prisma.question.deleteMany({
    where: { certificationId: { in: chewCertIds } }
  });

  const files = ['chew-objective.json', 'chew-objective-extra.json', 'chew-theory.json', 'chew-practical.json'];
  let totalInserted = 0;

  for (const file of files) {
    const filePath = path.join(__dirname, 'questions', file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      continue;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const questions = JSON.parse(fileContent);

    const formattedQuestions = questions.map((q: any) => {
      const certId = certMap.get(q.certificationSlug);
      if (!certId) {
        throw new Error(`Certification with slug "${q.certificationSlug}" not found in database!`);
      }
      return {
        certificationId: certId,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        topic: q.topic,
        difficulty: q.difficulty || 'MEDIUM',
        status: 'APPROVED',
        source: 'ADMIN',
      };
    });

    await prisma.question.createMany({
      data: formattedQuestions,
    });

    totalInserted += formattedQuestions.length;
    console.log(`Seeding CHEW questions... ${totalInserted}/170 inserted`);
  }

  console.log('✅ Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Error during CHEW seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
