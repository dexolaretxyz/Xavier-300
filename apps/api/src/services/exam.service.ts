import jwt from 'jsonwebtoken';
import prisma from '../lib/db';
import redis from '../lib/redis';
import { Question } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';

function getDailySeed(date: Date = new Date()): number {
  // Convert to WAT (UTC+1)
  const wat = new Date(date.getTime() + (60 * 60 * 1000));
  // Create seed from year + month + day in UTC (which matches WAT timezone offset)
  const dateString = `${wat.getUTCFullYear()}${String(wat.getUTCMonth() + 1).padStart(2, '0')}${String(wat.getUTCDate()).padStart(2, '0')}`;
  return parseInt(dateString);
}

function seededShuffle<T>(array: T[], seed: number): T[] {
  const arr = [...array];
  let currentSeed = seed;
  
  function seededRandom() {
    currentSeed = (currentSeed * 1664525 + 1013904223) & 0xffffffff;
    return (currentSeed >>> 0) / 0xffffffff;
  }
  
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Shuffles option entries and returns new options mapped to A/B/C/D labels
 * plus the NEW correct answer key after shuffle.
 */
export function shuffleOptions(
  options: Record<string, string>,
  correctAnswer: string,
  seed: number
): { shuffledOptions: Record<string, string>; newCorrectAnswer: string } {
  const correctText = options[correctAnswer]; // Save the correct answer TEXT
  const entries = Object.entries(options);
  const shuffled = seededShuffle(entries, seed);

  const labels = ['A', 'B', 'C', 'D'];
  const shuffledOptions: Record<string, string> = {};
  let newCorrectAnswer = correctAnswer; // fallback

  shuffled.forEach(([_oldKey, text], index) => {
    const newLabel = labels[index];
    shuffledOptions[newLabel] = text;
    if (text === correctText) {
      newCorrectAnswer = newLabel;
    }
  });

  return { shuffledOptions, newCorrectAnswer };
}

/** Session-level answer key for a single question */
export interface SessionQuestionKey {
  id: string;
  correctAnswer: string; // The post-shuffle correct answer key (A/B/C/D)
}

/** Full session data stored in Redis */
export interface ExamSessionData {
  examAttemptId: string;
  userId: string;
  questions: SessionQuestionKey[];
  startedAt: string;
  expiresAt: string;
}

export const examService = {
  /**
   * Shuffles a question's options deterministically and returns
   * BOTH the shuffled question AND the new correct answer key.
   * The ORIGINAL database correctAnswer is NOT modified.
   */
  shuffleQuestionOptions(question: any, seed: number): { question: any; sessionCorrectAnswer: string } {
    if (question.questionType === 'THEORY') {
      return { question, sessionCorrectAnswer: question.correctAnswer };
    }
    const optionsObj = question.options as Record<string, string>;
    const correctAnswerLetter = question.correctAnswer as string;

    const { shuffledOptions, newCorrectAnswer } = shuffleOptions(
      optionsObj,
      correctAnswerLetter,
      seed
    );

    return {
      question: {
        ...question,
        options: shuffledOptions,
        // NOTE: We do NOT overwrite correctAnswer on the question object
        // to avoid confusion. The session correct answer is separate.
      },
      sessionCorrectAnswer: newCorrectAnswer
    };
  },

  // 1. Get random approved questions for the exam using daily seed and userId
  async getRandomQuestions(
    certId: string, 
    count: number, 
    userId: string,
    date: Date = new Date()
  ): Promise<{ questions: any[]; sessionKeys: SessionQuestionKey[] }> {
    const allQuestions = await prisma.question.findMany({
      where: { certificationId: certId, status: 'APPROVED' }
    });

    if (allQuestions.length < count) {
      throw new Error(`Not enough approved questions. Found ${allQuestions.length}, required ${count}.`);
    }

    const dailySeed = getDailySeed(date);
    const userSeed = userId.split('').reduce((acc, char) => 
      acc + char.charCodeAt(0), 0);
    const combinedSeed = dailySeed + userSeed;

    const shuffled = seededShuffle(allQuestions, combinedSeed);
    const selected = shuffled.slice(0, count);

    const questions: any[] = [];
    const sessionKeys: SessionQuestionKey[] = [];

    for (const q of selected) {
      const questionSeed = combinedSeed + q.id.split('').reduce(
        (acc, char) => acc + char.charCodeAt(0), 0
      );
      const { question: shuffledQ, sessionCorrectAnswer } = this.shuffleQuestionOptions(q, questionSeed);
      questions.push(shuffledQ);
      sessionKeys.push({
        id: q.id,
        correctAnswer: sessionCorrectAnswer
      });
    }

    return { questions, sessionKeys };
  },

  // 2. Cache Daily Questions Per User Per Cert
  async getDailyQuestionsForUser(
    certId: string,
    userId: string,
    count: number,
    date: Date = new Date()
  ): Promise<{ questions: any[]; sessionKeys: SessionQuestionKey[] }> {
    const today = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const cacheKey = `daily-questions:${certId}:${userId}:${today}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return parsed;
    }

    const result = await this.getRandomQuestions(certId, count, userId, date);

    const midnight = new Date(date);
    midnight.setHours(24, 0, 0, 0); // Next midnight
    const ttl = Math.floor((midnight.getTime() - date.getTime()) / 1000);

    await redis.setex(cacheKey, ttl, JSON.stringify(result));

    return result;
  },

  /**
   * Store exam session data in Redis for reliable grading at submit time.
   * This captures the exact answer keys the student was shown.
   */
  async storeExamSession(
    attemptId: string,
    userId: string,
    sessionKeys: SessionQuestionKey[],
    examDurationMinutes: number
  ): Promise<void> {
    const sessionData: ExamSessionData = {
      examAttemptId: attemptId,
      userId,
      questions: sessionKeys,
      startedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + (examDurationMinutes + 5) * 60 * 1000).toISOString()
    };

    // Store for exam duration + 5 min buffer
    const ttlSeconds = (examDurationMinutes + 5) * 60;
    await redis.setex(
      `exam-session:${attemptId}`,
      ttlSeconds,
      JSON.stringify(sessionData)
    );
  },

  /**
   * Retrieve exam session data from Redis.
   * Returns null if session expired or not found.
   */
  async getExamSession(attemptId: string): Promise<ExamSessionData | null> {
    const data = await redis.get(`exam-session:${attemptId}`);
    if (!data) return null;
    return JSON.parse(data);
  },

  /**
   * Score an exam using the SESSION answer keys (post-shuffle),
   * NOT the database answer keys (pre-shuffle).
   * 
   * This is the CORRECT way to grade because:
   * - Student sees shuffled options during exam
   * - Student submits keys (A/B/C/D) based on shuffled positions
   * - Session keys record where the correct answer landed after shuffle
   */
  calculateResults(
    userAnswers: Record<string, string>,
    sessionKeys: SessionQuestionKey[],
    questions: any[]
  ) {
    let correctAnswersCount = 0;
    let totalGradedQuestions = 0;
    const topicStats: Record<string, { correct: number; total: number }> = {};

    // Build a lookup for question metadata (topic, type)
    const questionMap = new Map<string, any>();
    for (const q of questions) {
      questionMap.set(q.id, q);
    }

    for (const sessionQ of sessionKeys) {
      const dbQuestion = questionMap.get(sessionQ.id);
      const topic = dbQuestion?.topic || 'General';
      
      if (!topicStats[topic]) {
        topicStats[topic] = { correct: 0, total: 0 };
      }
      topicStats[topic].total += 1;

      // Skip theory questions from MCQ scoring
      if (dbQuestion?.questionType === 'THEORY') {
        continue;
      }

      totalGradedQuestions += 1;

      const studentAnswer = userAnswers[sessionQ.id]?.trim().toUpperCase();
      const correctAnswer = sessionQ.correctAnswer?.trim().toUpperCase();

      if (studentAnswer && studentAnswer === correctAnswer) {
        correctAnswersCount += 1;
        topicStats[topic].correct += 1;
      }
    }

    const scorePercentage = totalGradedQuestions > 0
      ? (correctAnswersCount / totalGradedQuestions) * 100
      : 0;

    const weakTopics = Object.entries(topicStats)
      .map(([topic, stats]) => ({
        topic,
        score: Math.round((stats.correct / stats.total) * 100),
        total: stats.total
      }))
      .filter(t => t.score < 70)
      .sort((a, b) => a.score - b.score);

    return {
      score: scorePercentage,
      correctAnswers: correctAnswersCount,
      totalQuestions: totalGradedQuestions,
      weakTopics
    };
  },

  // 4. Generate signed session token with 35min expiry
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
  },

  getDailySeed
};
