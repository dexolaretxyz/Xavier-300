import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting Question Database Integrity Audit...');
  
  const questions = await prisma.question.findMany({
    include: {
      certification: true,
    },
  });

  console.log(`📊 Found ${questions.length} total questions in the database.`);

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const q of questions) {
    const certName = q.certification?.name || 'Unknown';
    const context = `[ID: ${q.id} | Cert: ${certName} | Type: ${q.questionType}]`;

    // 1. Check for Question text
    if (!q.text || q.text.trim() === '') {
      console.error(`❌ ERROR: Question text is empty or missing! ${context}`);
      totalErrors++;
      continue;
    }

    if (q.questionType === 'MCQ' || q.questionType === 'PRACTICAL') {
      // 2. Check options structure
      if (!q.options) {
        console.error(`❌ ERROR: MCQ/PRACTICAL question is missing options! ${context}`);
        totalErrors++;
        continue;
      }

      let optionsObj: Record<string, any>;
      try {
        optionsObj = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options as Record<string, any>);
      } catch (err) {
        console.error(`❌ ERROR: Options is not a valid JSON! ${context}`);
        totalErrors++;
        continue;
      }

      const keys = Object.keys(optionsObj);
      const expectedKeys = ['A', 'B', 'C', 'D'];
      const missingKeys = expectedKeys.filter(k => !keys.includes(k));

      if (missingKeys.length > 0) {
        console.warn(`⚠️ WARNING: Options missing expected key(s): ${missingKeys.join(', ')}. Keys found: ${keys.join(', ')}. ${context}`);
        totalWarnings++;
      }

      // Check for empty option values
      for (const [key, val] of Object.entries(optionsObj)) {
        if (!val || String(val).trim() === '') {
          console.error(`❌ ERROR: Option '${key}' has an empty value! ${context}`);
          totalErrors++;
        }
      }

      // Check for duplicate option values
      const values = Object.values(optionsObj).map(v => String(v).trim().toLowerCase());
      const uniqueValues = new Set(values);
      if (values.length !== uniqueValues.size) {
        // Find duplicates
        const duplicates = values.filter((v, idx) => values.indexOf(v) !== idx);
        console.warn(`⚠️ WARNING: Duplicate option values found: "${duplicates.join('", "')}". ${context}`);
        totalWarnings++;
      }

      // 3. Check correct answer key
      if (!q.correctAnswer || q.correctAnswer.trim() === '') {
        console.error(`❌ ERROR: Correct answer is missing! ${context}`);
        totalErrors++;
        continue;
      }

      const ansKey = q.correctAnswer.trim().toUpperCase();
      if (!['A', 'B', 'C', 'D'].includes(ansKey)) {
        console.error(`❌ ERROR: Invalid correctAnswer key: "${ansKey}". Must be one of A, B, C, D. ${context}`);
        totalErrors++;
      } else if (!optionsObj[ansKey]) {
        console.error(`❌ ERROR: correctAnswer "${ansKey}" points to an option that does not exist in the options object! ${context}`);
        totalErrors++;
      }
    } else if (q.questionType === 'THEORY') {
      // For theory, check if there is an explanation or marking guide
      if (!q.explanation || q.explanation.trim() === '') {
        console.warn(`⚠️ WARNING: Theory question has empty explanation. ${context}`);
        totalWarnings++;
      }
      if (!q.markingGuide) {
        console.warn(`⚠️ WARNING: Theory question is missing marking guide. ${context}`);
        totalWarnings++;
      }
    }
  }

  console.log('\n======================================');
  console.log(`📋 Audit Summary:`);
  console.log(`❌ Total Errors: ${totalErrors}`);
  console.log(`⚠️ Total Warnings: ${totalWarnings}`);
  console.log('======================================');

  if (totalErrors > 0) {
    console.log('🔴 Audit Failed. Please resolve the database errors before deploying.');
    process.exit(1);
  } else {
    console.log('🟢 Audit Passed successfully with no critical errors!');
    process.exit(0);
  }
}

main()
  .catch(err => {
    console.error('Fatal error during audit:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
