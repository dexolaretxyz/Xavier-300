import jwt from 'jsonwebtoken';
import prisma from '../lib/db';
import redis from '../lib/redis';
import { Question } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';

function getDailySeed(date: Date = new Date()): number {
  // Convert to WAT (UTC+1)
  const wat = new Date(date.getTime() + (60 * 60 * 1000));
  // Create seed from year + month + day
  const dateString = `${wat.getFullYear()}${String(wat.getMonth() + 1).padStart(2, '0')}${String(wat.getDate()).padStart(2, '0')}`;
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

export function shuffleOptions(
  options: Record<string, string>, 
  seed: number
): Record<string, string> {
  const entries = Object.entries(options);
  const shuffled = seededShuffle(entries, seed);
  return Object.fromEntries(shuffled);
}

export const examService = {
  // Shuffles options and remaps the correct answer key using a seed
  shuffleQuestionOptions(question: any, seed: number) {
    if (question.questionType === 'THEORY') {
      return question;
    }
    const optionsObj = question.options as Record<string, string>;
    const correctAnswerLetter = question.correctAnswer as string;
    const correctText = optionsObj[correctAnswerLetter];

    const shuffledOptionsObj = shuffleOptions(optionsObj, seed);
    const shuffledEntries = Object.entries(shuffledOptionsObj);

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

  // 1. Get random approved questions for the exam using daily seed and userId
  async getRandomQuestions(
    certId: string, 
    count: number, 
    userId: string
  ): Promise<Question[]> {
    const allQuestions = await prisma.question.findMany({
      where: { certificationId: certId, status: 'APPROVED' }
    });

    if (allQuestions.length < count) {
      throw new Error(`Not enough approved questions. Found ${allQuestions.length}, required ${count}.`);
    }

    const dailySeed = getDailySeed();
    const userSeed = userId.split('').reduce((acc, char) => 
      acc + char.charCodeAt(0), 0);
    const combinedSeed = dailySeed + userSeed;

    const shuffled = seededShuffle(allQuestions, combinedSeed);
    const selected = shuffled.slice(0, count);

    return selected.map(q => 
      this.shuffleQuestionOptions(q, combinedSeed + q.id.charCodeAt(0))
    ) as any[];
  },

  // 2. Cache Daily Questions Per User Per Cert
  async getDailyQuestionsForUser(
    certId: string,
    userId: string,
    count: number
  ): Promise<Question[]> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const cacheKey = `daily-questions:${certId}:${userId}:${today}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const questions = await this.getRandomQuestions(certId, count, userId);

    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // Next midnight
    const ttl = Math.floor((midnight.getTime() - now.getTime()) / 1000);

    await redis.setex(cacheKey, ttl, JSON.stringify(questions));

    return questions;
  },

  // 3. Calculate results and identify weak topics
  calculateResults(userAnswers: Record<string, string>, questions: any[], combinedSeed: number = 0) {
    let correctAnswersCount = 0;
    const totalQuestions = questions.length;
    const topicStats: Record<string, { correct: number; total: number }> = {};

    for (const q of questions) {
      const topic = q.topic || 'General';
      if (!topicStats[topic]) {
        topicStats[topic] = { correct: 0, total: 0 };
      }
      topicStats[topic].total += 1;

      if (q.questionType === 'THEORY') {
        continue;
      }

      const shuffledQ = this.shuffleQuestionOptions(q, combinedSeed + q.id.charCodeAt(0));

      if (userAnswers[q.id] === shuffledQ.correctAnswer) {
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
      .filter(t => t.score < 70)
      .sort((a, b) => a.score - b.score);

    return {
      score: scorePercentage,
      correctAnswers: correctAnswersCount,
      totalQuestions,
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
