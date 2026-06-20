import { examService, shuffleOptions } from './src/services/exam.service';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runTests() {
  console.log('🧪 Starting Grading & Shuffling Logic Tests...\n');

  // Test 1: Option Shuffle and Key Remapping
  console.log('--- Test 1: Option Shuffling & Key Remapping ---');
  const originalOptions = {
    A: 'Paris',
    B: 'London',
    C: 'Berlin',
    D: 'Rome'
  };
  const originalCorrectAnswer = 'A'; // Paris is correct
  const seed = 12345;

  const { shuffledOptions, newCorrectAnswer } = shuffleOptions(originalOptions, originalCorrectAnswer, seed);

  console.log('Shuffled Options:', shuffledOptions);
  console.log('New Correct Answer Key:', newCorrectAnswer);

  assert(shuffledOptions[newCorrectAnswer] === 'Paris', 'The remapped correct answer key must point to "Paris"');
  assert(Object.keys(shuffledOptions).length === 4, 'Shuffled options must still have 4 choices');
  assert(
    Object.values(shuffledOptions).every(val => ['Paris', 'London', 'Berlin', 'Rome'].includes(val)),
    'Shuffled options must contain all the original texts'
  );

  // Test 2: calculateResults grading logic
  console.log('\n--- Test 2: calculateResults ---');
  
  const mockQuestions = [
    { id: 'q1', text: 'What is the capital of France?', questionType: 'MCQ', topic: 'Geography' },
    { id: 'q2', text: 'What is 2+2?', questionType: 'MCQ', topic: 'Math' },
    { id: 'q3', text: 'Explain gravity', questionType: 'THEORY', topic: 'Physics' } // Theory question (skipped in MCQ score)
  ];

  const sessionKeys = [
    { id: 'q1', correctAnswer: 'B' }, // Paris shuffled to B
    { id: 'q2', correctAnswer: 'D' }, // 4 shuffled to D
    { id: 'q3', correctAnswer: '' }    // Theory has no correctAnswer
  ];

  // Case 2a: Perfect score (all MCQs correct)
  const userAnswers1 = {
    q1: 'B',
    q2: 'd', // lowercase check
    q3: 'Some text...'
  };

  const results1 = examService.calculateResults(userAnswers1, sessionKeys, mockQuestions);
  console.log('Perfect score results:', results1);
  assert(results1.correctAnswers === 2, 'Should have 2 correct answers');
  assert(results1.totalQuestions === 2, 'Should track 2 total questions (excluding theory from MCQ/PRACTICAL scoring)');
  assert(results1.score === 100, 'Score should be 100% since all MCQs are correct');

  // Case 2b: Partial score
  const userAnswers2 = {
    q1: ' B ', // trailing whitespace check
    q2: 'A',   // wrong answer
    q3: 'Some text...'
  };

  const results2 = examService.calculateResults(userAnswers2, sessionKeys, mockQuestions);
  console.log('Partial score results:', results2);
  assert(results2.correctAnswers === 1, 'Should have 1 correct answer');
  assert(results2.score === 50, 'Score should be 50%');

  // Case 2c: Case insensitivity & Trim check
  const userAnswers3 = {
    q1: 'b',
    q2: '  D  '
  };
  const results3 = examService.calculateResults(userAnswers3, sessionKeys, mockQuestions);
  assert(results3.correctAnswers === 2, 'Trim and case-insensitivity should result in perfect score');

  // Test 3: Daily seed consistency
  console.log('\n--- Test 3: Daily Seed Consistency ---');
  const date1 = new Date('2026-06-20T10:00:00+01:00'); // WAT Time
  const date2 = new Date('2026-06-20T23:59:00+01:00'); // same WAT day
  const date3 = new Date('2026-06-21T00:01:00+01:00'); // next WAT day

  const seed1 = examService.getDailySeed(date1);
  const seed2 = examService.getDailySeed(date2);
  const seed3 = examService.getDailySeed(date3);

  console.log('Seed 1 (10:00):', seed1);
  console.log('Seed 2 (23:59):', seed2);
  console.log('Seed 3 (next day 00:01):', seed3);

  assert(seed1 === seed2, 'Seeds generated on the same WAT day must be identical');
  assert(seed1 !== seed3, 'Seeds generated on different WAT days must be different');

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
