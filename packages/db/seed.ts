import { PrismaClient, Difficulty, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Domains
  const domains = [
    { name: 'Data Analysis', slug: 'data-analysis', description: 'Master data analysis tools and techniques', priority: 3, iconMark: 'chart-pie' },
    { name: 'Data Science', slug: 'data-science', description: 'Data Science and Machine Learning', priority: 3, iconMark: 'brain' },
    { name: 'Cybersecurity', slug: 'cybersecurity', description: 'Information security and ethical hacking', priority: 3, iconMark: 'shield' },
    { name: 'Microsoft Azure', slug: 'microsoft-azure', description: 'Azure Cloud computing certifications', priority: 2, iconMark: 'cloud' },
    { name: 'Microsoft Excel', slug: 'microsoft-excel', description: 'Excel associate and expert levels', priority: 2, iconMark: 'table' },
    { name: 'DevOps', slug: 'devops', description: 'CI/CD, containers, and cloud native', priority: 2, iconMark: 'infinity' },
    { name: 'Full Stack Web Dev', slug: 'full-stack-web-dev', description: 'Front-end and back-end development', priority: 2, iconMark: 'code' },
    { name: 'Project Management', slug: 'project-management', description: 'Agile, Scrum, and PMP', priority: 1, iconMark: 'kanban' },
    { name: 'Microsoft Power BI', slug: 'microsoft-power-bi', description: 'Power BI Data Analyst (PL-300)', priority: 1, iconMark: 'bar-chart' },
    { name: 'Nigerian Professional Exams', slug: 'nigerian-professional-exams', description: 'Nigerian national professional qualifying examinations for healthcare and other regulated professions', priority: 1, iconMark: 'shield-check' }
  ];

  for (const domain of domains) {
    await prisma.domain.upsert({
      where: { slug: domain.slug },
      update: {},
      create: domain,
    });
  }
  
  // Fetch domains to use their IDs for certifications
  const dbDomains = await prisma.domain.findMany();
  const domainMap = new Map(dbDomains.map((d) => [d.slug, d.id]));

  // 2. Create Certifications
  const certifications = [
    { domainSlug: 'data-analysis', name: 'Microsoft Power BI Data Analyst', slug: 'pl-300', description: 'PL-300 Certification', difficulty: Difficulty.MEDIUM },
    { domainSlug: 'data-analysis', name: 'Google Data Studio', slug: 'google-data-studio', description: 'Google Looker/Data Studio', difficulty: Difficulty.EASY },
    { domainSlug: 'data-analysis', name: 'Excel Analytics', slug: 'excel-analytics', description: 'Advanced Excel Analytics', difficulty: Difficulty.MEDIUM },
    
    { domainSlug: 'data-science', name: 'IBM Data Science', slug: 'ibm-data-science', description: 'IBM Data Science Professional', difficulty: Difficulty.HARD },
    { domainSlug: 'data-science', name: 'Google ML', slug: 'google-ml', description: 'Google Machine Learning Engineer', difficulty: Difficulty.HARD },
    { domainSlug: 'data-science', name: 'Python for DS', slug: 'python-for-ds', description: 'Python for Data Science', difficulty: Difficulty.MEDIUM },
    
    { domainSlug: 'cybersecurity', name: 'CompTIA Security+', slug: 'comptia-security-plus', description: 'CompTIA Security+ Certification', difficulty: Difficulty.MEDIUM },
    { domainSlug: 'cybersecurity', name: 'CEH', slug: 'ceh', description: 'Certified Ethical Hacker', difficulty: Difficulty.HARD },
    { domainSlug: 'cybersecurity', name: 'CISSP', slug: 'cissp', description: 'Certified Information Systems Security Professional', difficulty: Difficulty.HARD },

    { domainSlug: 'microsoft-azure', name: 'AZ-900', slug: 'az-900', description: 'Azure Fundamentals', difficulty: Difficulty.EASY },
    { domainSlug: 'microsoft-azure', name: 'AZ-104', slug: 'az-104', description: 'Azure Administrator', difficulty: Difficulty.MEDIUM },
    { domainSlug: 'microsoft-azure', name: 'AZ-204', slug: 'az-204', description: 'Azure Developer Associate', difficulty: Difficulty.MEDIUM },

    { domainSlug: 'microsoft-excel', name: 'MOS Excel Associate', slug: 'mos-excel-associate', description: 'Microsoft Office Specialist: Excel Associate', difficulty: Difficulty.EASY },
    { domainSlug: 'microsoft-excel', name: 'MOS Excel Expert', slug: 'mos-excel-expert', description: 'Microsoft Office Specialist: Excel Expert', difficulty: Difficulty.MEDIUM },

    { domainSlug: 'devops', name: 'AWS DevOps', slug: 'aws-devops', description: 'AWS Certified DevOps Engineer', difficulty: Difficulty.HARD },
    { domainSlug: 'devops', name: 'Azure DevOps', slug: 'azure-devops', description: 'Designing and Implementing Microsoft DevOps Solutions', difficulty: Difficulty.HARD },
    { domainSlug: 'devops', name: 'Docker/K8s', slug: 'docker-k8s', description: 'Certified Kubernetes Administrator (CKA)', difficulty: Difficulty.HARD },

    { domainSlug: 'full-stack-web-dev', name: 'Meta Front-End', slug: 'meta-front-end', description: 'Meta Front-End Developer', difficulty: Difficulty.MEDIUM },
    { domainSlug: 'full-stack-web-dev', name: 'AWS Developer', slug: 'aws-developer', description: 'AWS Certified Developer', difficulty: Difficulty.MEDIUM },
    { domainSlug: 'full-stack-web-dev', name: 'Node.js', slug: 'node-js', description: 'OpenJS Node.js Application Developer', difficulty: Difficulty.MEDIUM },

    { domainSlug: 'project-management', name: 'PMP', slug: 'pmp', description: 'Project Management Professional', difficulty: Difficulty.HARD },
    { domainSlug: 'project-management', name: 'CAPM', slug: 'capm', description: 'Certified Associate in Project Management', difficulty: Difficulty.MEDIUM },
    { domainSlug: 'project-management', name: 'PMI-ACP', slug: 'pmi-acp', description: 'PMI Agile Certified Practitioner', difficulty: Difficulty.MEDIUM },
    { domainSlug: 'nigerian-professional-exams', name: 'CHEW Qualifying Exam — Objective', slug: 'chew-objective', description: 'Community Health Extension Worker National Professional Qualifying Examination — Objective (Multiple Choice) Section', difficulty: Difficulty.MEDIUM },
    { domainSlug: 'nigerian-professional-exams', name: 'CHEW Qualifying Exam — Theory', slug: 'chew-theory', description: 'Community Health Extension Worker National Professional Qualifying Examination — Theory Section Practice', difficulty: Difficulty.MEDIUM },
    { domainSlug: 'nigerian-professional-exams', name: 'CHEW Qualifying Exam — Practical', slug: 'chew-practical', description: 'Community Health Extension Worker National Professional Qualifying Examination — Practical Session Practice', difficulty: Difficulty.HARD }
  ];

  for (const cert of certifications) {
    const domainId = domainMap.get(cert.domainSlug);
    if (!domainId) continue;

    await prisma.certification.upsert({
      where: { slug: cert.slug },
      update: {},
      create: {
        name: cert.name,
        slug: cert.slug,
        description: cert.description,
        domainId: domainId,
        difficulty: cert.difficulty,
        examDuration: 30,
        questionCount: 40,
      },
    });
  }

  // 2.5 Generate dummy questions so we can take mock exams!
  console.log('Seeding dummy questions...');
  const dbCerts = await prisma.certification.findMany();
  for (const c of dbCerts) {
    const existing = await prisma.question.count({ where: { certificationId: c.id } });
    if (existing < 40) {
      const questionsToCreate = [];
      const topics = ['Fundamentals', 'Advanced Concepts', 'Security', 'Architecture', 'Best Practices'];
      for (let i = existing; i < 40; i++) {
        questionsToCreate.push({
          certificationId: c.id,
          text: `Sample mock exam question ${i + 1} for ${c.name}. This is an auto-generated dummy question to allow testing the exam engine. What is the correct answer?`,
          options: {
            A: 'The designated correct answer',
            B: 'A plausible but incorrect distractor option',
            C: 'Another incorrect option that sounds technical',
            D: 'A completely unrelated distractor',
          },
          correctAnswer: 'A',
          explanation: `Option A is correct because this is a dummy question seeded for ${c.name}. In a real scenario, this would contain a detailed technical explanation of the concept.`,
          topic: topics[i % topics.length],
          difficulty: Difficulty.MEDIUM,
          status: 'APPROVED',
          source: 'AI'
        });
      }
      // Create questions in batches to avoid Prisma limits
      await prisma.question.createMany({ data: questionsToCreate as any });
      console.log(`Created ${40 - existing} dummy questions for ${c.name}`);
    }
  }

  // 3. Create Super Admin User
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

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
