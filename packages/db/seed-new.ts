import { PrismaClient, Difficulty, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning existing database records...');
  
  // Delete in order of dependencies to avoid foreign key constraints
  await prisma.leaderboardArchive.deleteMany();
  await prisma.weeklyScore.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.question.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.domain.deleteMany();

  console.log('🌱 Seeding new domains and certifications...');

  const domains = [
    { name: 'Microsoft Power BI', slug: 'power-bi', description: 'Master Power BI, DAX, and data modeling (PL-300)', priority: 9, iconMark: 'chart-pie' },
    { name: 'Data Analysis', slug: 'data-analysis', description: 'General data analysis, statistics, SQL, and Excel', priority: 8, iconMark: 'bar-chart' },
    { name: 'Data Science', slug: 'data-science', description: 'Data Science, Python, Machine Learning, and algorithms', priority: 7, iconMark: 'brain' },
    { name: 'Cybersecurity', slug: 'cybersecurity', description: 'Information security, network security, and CompTIA Security+', priority: 6, iconMark: 'shield' },
    { name: 'Microsoft Azure', slug: 'azure', description: 'Azure cloud concepts, core services, and AZ-900', priority: 5, iconMark: 'cloud' },
    { name: 'Microsoft Excel', slug: 'excel', description: 'Advanced formulas, charts, macros, and MOS Excel', priority: 4, iconMark: 'table' },
    { name: 'DevOps', slug: 'devops', description: 'CI/CD, Docker, Kubernetes, and cloud deployments', priority: 3, iconMark: 'infinity' },
    { name: 'Full Stack Web Dev', slug: 'fullstack', description: 'HTML5, CSS, React, Node.js, and web security', priority: 2, iconMark: 'code' },
    { name: 'Project Management', slug: 'project-management', description: 'Project lifecycle, Agile/Waterfall, and PMP/CAPM', priority: 1, iconMark: 'kanban' },
    { name: 'Nigerian Professional Exams', slug: 'nigerian-professional-exams', description: 'Nigerian national professional qualifying examinations for healthcare and other regulated professions', priority: 1, iconMark: 'shield-check' }
  ];

  for (const dom of domains) {
    await prisma.domain.create({ data: dom });
  }

  const dbDomains = await prisma.domain.findMany();
  const domainMap = new Map(dbDomains.map(d => [d.slug, d.id]));

  const certifications = [
    { slug: 'power-bi', domainSlug: 'power-bi', name: 'Microsoft Power BI Data Analyst (PL-300)', description: 'Official practice exam for PL-300 certification', difficulty: Difficulty.MEDIUM },
    { slug: 'data-analysis', domainSlug: 'data-analysis', name: 'Data Analysis (General)', description: 'Comprehensive practice exam for data analysts', difficulty: Difficulty.MEDIUM },
    { slug: 'data-science', domainSlug: 'data-science', name: 'Data Science (IBM/Google)', description: 'Mock exam covering core Data Science and ML objectives', difficulty: Difficulty.HARD },
    { slug: 'cybersecurity', domainSlug: 'cybersecurity', name: 'Cybersecurity (CompTIA Security+)', description: 'Practice exam for Security+ objectives', difficulty: Difficulty.MEDIUM },
    { slug: 'azure', domainSlug: 'azure', name: 'Microsoft Azure Fundamentals (AZ-900)', description: 'Practice exam for Azure AZ-900 objectives', difficulty: Difficulty.EASY },
    { slug: 'excel', domainSlug: 'excel', name: 'Microsoft Excel (MOS)', description: 'Practice exam for Excel associate and expert levels', difficulty: Difficulty.MEDIUM },
    { slug: 'devops', domainSlug: 'devops', name: 'DevOps (AWS/Azure DevOps)', description: 'CI/CD, containers, and orchestration practice exam', difficulty: Difficulty.HARD },
    { slug: 'fullstack', domainSlug: 'fullstack', name: 'Full Stack Web Development (Meta/AWS)', description: 'Mock exam covering frontend, backend, and web security', difficulty: Difficulty.MEDIUM },
    { slug: 'project-management', domainSlug: 'project-management', name: 'Project Management (PMP/CAPM)', description: 'Practice exam covering PMBOK and Agile frameworks', difficulty: Difficulty.HARD },
    { slug: 'chew-objective', domainSlug: 'nigerian-professional-exams', name: 'CHEW Qualifying Exam — Objective', description: 'Community Health Extension Worker National Professional Qualifying Examination — Objective (Multiple Choice) Section', difficulty: Difficulty.MEDIUM },
    { slug: 'chew-theory', domainSlug: 'nigerian-professional-exams', name: 'CHEW Qualifying Exam — Theory', description: 'Community Health Extension Worker National Professional Qualifying Examination — Theory Section Practice', difficulty: Difficulty.MEDIUM },
    { slug: 'chew-practical', domainSlug: 'nigerian-professional-exams', name: 'CHEW Qualifying Exam — Practical', description: 'Community Health Extension Worker National Professional Qualifying Examination — Practical Session Practice', difficulty: Difficulty.HARD }
  ];

  for (const cert of certifications) {
    const domainId = domainMap.get(cert.domainSlug);
    if (!domainId) continue;
    await prisma.certification.create({
      data: {
        slug: cert.slug,
        name: cert.name,
        description: cert.description,
        difficulty: cert.difficulty,
        domainId: domainId,
        examDuration: 30,
        questionCount: 40
      }
    });
  }

  console.log('✅ Domains and Certifications created.');

  // Seeding questions from JSON files
  console.log('📚 Seeding questions from JSON files...');
  const dbCerts = await prisma.certification.findMany();
  const certMap = new Map(dbCerts.map(c => [c.slug, c.id]));

  const questionsDir = path.join(__dirname, 'questions');
  if (fs.existsSync(questionsDir)) {
    const files = fs.readdirSync(questionsDir).filter(f => f.endsWith('.json'));
    let totalQuestionsSeeded = 0;
    
    for (const file of files) {
      const filePath = path.join(questionsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const questions = JSON.parse(fileContent);
      
      const formattedQuestions = questions.map((q: any) => {
        const certId = certMap.get(q.certificationSlug);
        if (!certId) {
          throw new Error(`Certification slug ${q.certificationSlug} not found in DB!`);
        }
        return {
          certificationId: certId,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          topic: q.topic,
          difficulty: q.difficulty || 'MEDIUM',
          source: 'ADMIN',
          status: 'APPROVED'
        };
      });

      await prisma.question.createMany({ data: formattedQuestions });
      console.log(`🎉 Seeded ${formattedQuestions.length} questions for ${file}`);
      totalQuestionsSeeded += formattedQuestions.length;
    }
    console.log(`✅ Seeding complete. Total questions seeded: ${totalQuestionsSeeded}`);
  } else {
    console.log('⚠️ Questions directory not found. Skipping question seeding.');
  }

  // Create Super Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@xavier300.com.ng';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Xavier300';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: passwordHash,
      fullName: 'Super Admin',
      phone: '08000000000',
      state: 'Lagos',
      occupation: 'Administrator',
      yearsExperience: 10,
      role: Role.ADMIN,
      emailVerified: true,
    },
  });

  console.log('👑 Super Admin user ready.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
