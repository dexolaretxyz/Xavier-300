import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import path from 'path';

// Load the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy',
});

const TOPICS: Record<string, string[]> = {
  'microsoft-power-bi': ['DAX Functions', 'Data Modelling', 'Visualisations', 'Power Query', 'Row-Level Security', 'Deployment'],
  'data-analysis': ['Statistical Analysis', 'Data Cleaning', 'Excel Functions', 'Pivot Tables', 'Data Visualisation', 'SQL Basics'],
  'cybersecurity': ['Network Security', 'Cryptography', 'Ethical Hacking', 'Incident Response', 'Compliance', 'Cloud Security'],
  'data-science': ['Machine Learning', 'Python Programming', 'Deep Learning', 'Data Preprocessing', 'Model Evaluation', 'NLP'],
  'microsoft-azure': ['Azure Core Services', 'Azure Storage', 'Azure Compute', 'Azure Networking', 'Identity and Governance', 'Azure Security'],
  'microsoft-excel': ['Advanced Formulas', 'Data Formatting', 'Macros and VBA', 'Pivot Tables and Charts', 'Data Validation', 'Power Query Basics'],
  'devops': ['CI/CD Pipelines', 'Containerization', 'Kubernetes', 'Infrastructure as Code', 'Monitoring and Logging', 'Version Control'],
  'full-stack-web-dev': ['HTML/CSS', 'JavaScript ES6+', 'React Components', 'Backend Integration', 'Web Security', 'Performance Optimization'],
  'project-management': ['Agile Methodologies', 'Scrum Framework', 'Risk Management', 'Stakeholder Communication', 'Sprint Planning', 'Project Tracking']
};

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];

// How many questions to generate per (Domain -> Topic -> Difficulty)
// 6 topics * 3 difficulties = 18 combinations.
// To get > 200 questions, we need at least 12 per combination (18 * 12 = 216).
const QUESTIONS_PER_BATCH = 12;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function generateMockQuestions(certificationId: string, certName: string, topic: string, difficulty: string): Promise<any[]> {
  const questions = [];
  for (let i = 0; i < QUESTIONS_PER_BATCH; i++) {
    questions.push({
      certificationId,
      text: `[${difficulty}] Sample question ${i + 1} about ${topic} in ${certName}?`,
      options: {
        A: `Incorrect option A for ${topic}`,
        B: `Incorrect option B for ${topic}`,
        C: `Correct option for ${topic}`,
        D: `Incorrect option D for ${topic}`
      },
      correctAnswer: 'C',
      explanation: `This is the mock explanation for question ${i + 1} regarding ${topic}. Option C is correct because it explicitly handles the requirement.`,
      difficulty,
      topic,
      source: 'AI',
      status: 'APPROVED'
    });
  }
  return questions;
}

async function generateRealQuestions(certificationId: string, certName: string, topic: string, difficulty: string): Promise<any[]> {
  const prompt = `System: You are an expert exam question writer for tech certifications.

Generate ${QUESTIONS_PER_BATCH} multiple-choice questions for the certification "${certName}".
Specific topic: "${topic}"
Difficulty level: ${difficulty}

Output ONLY a raw JSON array of objects. Do not include markdown formatting, backticks, or other text.
Each object must have exactly this structure:
{
  "text": "The question text?",
  "options": {
    "A": "First option",
    "B": "Second option",
    "C": "Third option",
    "D": "Fourth option"
  },
  "correctAnswer": "A", // or B, C, D
  "explanation": "Detailed explanation of why the answer is correct."
}`;

  try {
    const message = await anthropic.messages.create({
      max_tokens: 4000, // Large token limit for 12 questions
      model: 'claude-3-5-sonnet-20241022',
      messages: [{ role: 'user', content: prompt }]
    });

    let textResponse = (message.content[0] as any).text;
    
    // Strip markdown JSON fences
    textResponse = textResponse.trim();
    if (textResponse.startsWith('```json')) textResponse = textResponse.replace(/```json/g, '');
    if (textResponse.startsWith('```')) textResponse = textResponse.replace(/```/g, '');
    textResponse = textResponse.trim();

    const parsed = JSON.parse(textResponse);
    return parsed.map((q: any) => ({
      certificationId,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty,
      topic,
      source: 'AI',
      status: 'APPROVED'
    }));

  } catch (error) {
    console.error(`Failed to generate real questions for ${topic} - ${difficulty}:`, error);
    // Fallback to mock on error
    return generateMockQuestions(certificationId, certName, topic, difficulty);
  }
}

async function main() {
  console.log("Starting Question Seeding Process...");
  const useRealAI = !!process.env.ANTHROPIC_API_KEY && process.env.USE_REAL_AI === 'true';
  console.log(`Mode: ${useRealAI ? 'REAL AI (Anthropic)' : 'MOCK GENERATION'}`);

  const allCertifications = await prisma.certification.findMany({ include: { domain: true } });

  for (const cert of allCertifications) {
    const slug = cert.domain.slug;
    const topics = TOPICS[slug];
    if (!topics) {
      console.warn(`No topics found for domain slug: ${slug}. Skipping cert ${cert.name}.`);
      continue;
    }

    console.log(`\n--- Processing Certification: ${cert.name} ---`);
    let questionsCreatedForCert = 0;

    for (const topic of topics) {
      for (const difficulty of DIFFICULTIES) {
        process.stdout.write(`Generating ${difficulty} questions for topic: ${topic}... `);
        
        let newQuestions = [];
        if (useRealAI) {
          newQuestions = await generateRealQuestions(cert.id, cert.name, topic, difficulty);
          await delay(2500); // Wait >2s to avoid rate limits
        } else {
          newQuestions = await generateMockQuestions(cert.id, cert.name, topic, difficulty);
        }

        if (newQuestions.length > 0) {
          await prisma.question.createMany({
            data: newQuestions
          });
          questionsCreatedForCert += newQuestions.length;
          console.log(`Created ${newQuestions.length} questions.`);
        } else {
          console.log(`Failed to create questions.`);
        }
      }
    }

    console.log(`Total questions created for ${cert.name}: ${questionsCreatedForCert}`);
  }

  console.log("\nSeeding Complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
