import { prisma } from './index';
import mcqQuestions from './chew-mcq-questions.json';
import essayQuestions from './chew-essay-questions.json';

async function seedCHEWQuestions() {
  console.log('Seeding CHEW questions...');
  
  let inserted = 0;
  const allQuestions = [...mcqQuestions, ...essayQuestions];
  
  for (const q of allQuestions) {
    const cert = await prisma.certification.findUnique({
      where: { slug: q.certificationSlug }
    });
    
    if (!cert) {
      console.warn(`Cert not found: ${q.certificationSlug}`);
      continue;
    }
    
    await prisma.question.create({
      data: {
        certificationId: cert.id,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        topic: q.topic,
        difficulty: q.difficulty as any,
        source: 'AI',
        status: 'APPROVED',
        markingGuide: q.markingGuide || null,
        questionType: q.questionType || 'MCQ',
      }
    });
    
    inserted++;
    if (inserted % 10 === 0) {
      console.log(`Progress: ${inserted}/${allQuestions.length}`);
    }
  }
  
  console.log(`✅ Seeded ${inserted} CHEW questions`);
  await prisma.$disconnect();
}

seedCHEWQuestions().catch(console.error);
