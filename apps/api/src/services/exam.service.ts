import jwt from 'jsonwebtoken';
import prisma from '../lib/db';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';

function cryptoShuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const examService = {
  // 1. Get random approved questions for the exam
  async getRandomQuestions(certificationId: string, count: number = 40) {
    // Note: PostgreSQL `ORDER BY RANDOM()` can be slow on large tables, 
    // but Prisma doesn't natively support it easily. 
    // We'll fetch IDs and shuffle in memory if the table isn't huge, or use raw SQL.
    // For MVP, we will fetch all approved question IDs, shuffle, and pick `count`.
    
    const allQuestions = await prisma.question.findMany({
      where: {
        certificationId,
        status: 'APPROVED'
      },
      select: { id: true }
    });

    if (allQuestions.length < count) {
      throw new Error(`Not enough approved questions. Found ${allQuestions.length}, required ${count}.`);
    }

    // Shuffle using cryptoShuffle
    const shuffledAll = cryptoShuffle(allQuestions);
    const selectedIds = shuffledAll.slice(0, count).map(q => q.id);

    const questions = await prisma.question.findMany({
      where: {
        id: { in: selectedIds }
      }
    });

    // Postgres findMany order is not guaranteed. We shuffle the final array to match random order.
    return cryptoShuffle(questions);
  },

  // 2. Shuffle options (A,B,C,D) and remap the correct answer
  shuffleOptions(question: any) {
    if (question.questionType === 'THEORY') {
      return question; // Theory questions don't have option choices to shuffle
    }
    const optionsObj = question.options as Record<string, string>;
    const correctAnswerLetter = question.correctAnswer as string;
    const correctText = optionsObj[correctAnswerLetter];

    const entries = Object.entries(optionsObj);
    // Shuffle entries using cryptoShuffle
    const shuffledEntries = cryptoShuffle(entries);

    const labels = ['A', 'B', 'C', 'D'];
    const newOptions: Record<string, string> = {};
    let newCorrectAnswer = '';

    shuffledEntries.forEach(([oldKey, text], index) => {
      const newLabel = labels[index];
      newOptions[newLabel] = text as string;
      if (text === correctText) {
        newCorrectAnswer = newLabel;
      }
    });

    return {
      ...question,
      options: newOptions,
      correctAnswer: newCorrectAnswer
    };
  },

  // 3. Calculate results and identify weak topics
  calculateResults(userAnswers: Record<string, string>, questions: any[]) {
    let correctAnswersCount = 0;
    const totalQuestions = questions.length;
    const topicStats: Record<string, { correct: number; total: number }> = {};

    for (const q of questions) {
      const topic = q.topic || 'General';
      if (!topicStats[topic]) {
        topicStats[topic] = { correct: 0, total: 0 };
      }
      topicStats[topic].total += 1;

      if (userAnswers[q.id] === q.correctAnswer) {
        correctAnswersCount += 1;
        topicStats[topic].correct += 1;
      }
    }

    const scorePercentage = (correctAnswersCount / totalQuestions) * 100;

    const weakTopics = Object.entries(topicStats)
      .map(([topic, stats]) => ({
        topic,
        score: Math.round((stats.correct / stats.total) * 100),
        total: stats.total
      }))
      .filter(t => t.score < 70) // Less than 70% is weak
      .sort((a, b) => a.score - b.score);

    return {
      score: scorePercentage,
      correctAnswers: correctAnswersCount,
      totalQuestions,
      weakTopics
    };
  },

  // 4. Generate signed session token with 35min expiry (30min exam + 5min grace)
  generateSessionToken(examAttemptId: string, userId: string) {
    return jwt.sign(
      { attemptId: examAttemptId, userId },
      JWT_SECRET,
      { expiresIn: '35m' }
    );
  },
  
  verifySessionToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET) as { attemptId: string; userId: string };
    } catch (e) {
      return null;
    }
  }
};
