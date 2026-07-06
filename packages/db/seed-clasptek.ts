import { PrismaClient, Difficulty } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Running Clasptek_ Mock Database Update...');

  // 1. Find Cybersecurity Domain
  const domain = await prisma.domain.findUnique({
    where: { slug: 'cybersecurity' }
  });

  if (!domain) {
    throw new Error('Could not find the "cybersecurity" domain in the database. Please seed the domains first.');
  }

  // 2. Create or Update Clasptek_ Mock Certification
  const certification = await prisma.certification.upsert({
    where: { slug: 'clasptek-mock' },
    update: {
      name: 'Clasptek_ Mock',
      description: 'Clasptek Cybersecurity curriculum mock exam',
      examDuration: 25,
      questionCount: 40,
      difficulty: Difficulty.MEDIUM,
      domainId: domain.id
    },
    create: {
      slug: 'clasptek-mock',
      name: 'Clasptek_ Mock',
      description: 'Clasptek Cybersecurity curriculum mock exam',
      examDuration: 25,
      questionCount: 40,
      difficulty: Difficulty.MEDIUM,
      domainId: domain.id
    }
  });

  console.log(`✅ Certification "Clasptek_ Mock" ready (ID: ${certification.id})`);

  // 3. Clear existing questions for this mock to prevent duplicates
  const deleted = await prisma.question.deleteMany({
    where: { certificationId: certification.id }
  });
  console.log(`🧹 Cleared ${deleted.count} existing questions for Clasptek_ Mock.`);

  // 4. Load new questions from clasptek-mock.json
  const questionsPath = path.join(__dirname, 'questions', 'clasptek-mock.json');
  if (!fs.existsSync(questionsPath)) {
    throw new Error(`clasptek-mock.json not found at: ${questionsPath}`);
  }

  const questionsJson = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
  const formattedQuestions = questionsJson.map((q: any) => ({
    certificationId: certification.id,
    text: q.text,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation || 'No explanation provided.',
    topic: q.topic || 'General Cybersecurity',
    difficulty: q.difficulty === 'EASY' ? Difficulty.EASY : q.difficulty === 'HARD' ? Difficulty.HARD : Difficulty.MEDIUM,
    source: 'ADMIN',
    status: 'APPROVED',
    questionType: 'MCQ'
  }));

  // 5. Insert questions
  await prisma.question.createMany({
    data: formattedQuestions
  });

  console.log(`🎉 Successfully imported ${formattedQuestions.length} questions for Clasptek_ Mock!`);
}

main()
  .catch((e) => {
    console.error('❌ Error updating database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
