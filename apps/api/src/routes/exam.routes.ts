import express from 'express';
import { prisma } from '../../../../packages/db/index';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { startOfDay, endOfDay } from 'date-fns';
import { aiService } from '../services/ai.service';
import { examService } from '../services/exam.service';
import { z } from 'zod';

const router = express.Router();

// GET /exams/attempts/today - Get attempt count for today
router.get('/attempts/today', authenticate, async (req: express.Request, res, next) => {
  const authReq = req as AuthRequest;
  try {
    const { certId } = req.query;
    if (!certId || typeof certId !== 'string') {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'certId is required' } });
    }

    const now = new Date();
    
    const count = await prisma.examAttempt.count({
      where: {
        userId: authReq.user!.userId,
        certificationId: certId as string,
        startedAt: {
          gte: startOfDay(now),
          lte: endOfDay(now)
        }
      }
    });

    res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
});

// POST /exams/start - Start a new exam session
router.post('/start', authenticate, async (req: express.Request, res, next) => {
  const authReq = req as AuthRequest;
  try {
    const { certId } = z.object({ certId: z.string() }).parse(req.body);
    const userId = authReq.user!.userId;

    // 1. Validate attempt limit
    const now = new Date();
    const attemptsToday = await prisma.examAttempt.count({
      where: {
        userId,
        certificationId: certId,
        startedAt: { gte: startOfDay(now), lte: endOfDay(now) }
      }
    });

    if (attemptsToday >= 3) {
      return res.status(403).json({ success: false, error: { code: 'LIMIT_REACHED', message: 'Daily attempt limit (3) reached for this certification.' } });
    }

    // 2. Get Certification config
    const cert = await prisma.certification.findUnique({ where: { id: certId } });
    if (!cert) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Certification not found' } });
    }

    // 3. Get and shuffle questions
    let questions;
    try {
      questions = await examService.getRandomQuestions(certId, cert.questionCount);
    } catch (err: any) {
      return res.status(400).json({ success: false, error: { code: 'NOT_ENOUGH_QUESTIONS', message: err.message } });
    }

    const shuffledQuestions = questions.map(q => {
      const shuffled = examService.shuffleOptions(q);
      // Strip correct answer before sending to client
      return {
        id: shuffled.id,
        text: shuffled.text,
        options: shuffled.options,
        // No correctAnswer or explanation included!
      };
    });

    // 4. Create ExamAttempt record
    const attempt = await prisma.examAttempt.create({
      data: {
        userId,
        certificationId: certId,
        totalQuestions: questions.length,
        attemptNumber: attemptsToday + 1,
        answers: {}, // Empty JSON
        status: 'IN_PROGRESS'
      }
    });

    // 5. Generate Session Token
    const sessionToken = examService.generateSessionToken(attempt.id, userId);

    res.json({
      success: true,
      data: {
        attemptId: attempt.id,
        sessionToken,
        questions: shuffledQuestions,
        examDuration: cert.examDuration
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /exams/:id/submit - Submit an exam
router.post('/:id/submit', authenticate, async (req: express.Request, res, next) => {
  const authReq = req as AuthRequest;
  try {
    const attemptId = req.params.id as string;
    const { sessionToken, answers, timeTaken, integrityFlag } = z.object({
      sessionToken: z.string(),
      answers: z.record(z.string(), z.string()),
      timeTaken: z.number(),
      integrityFlag: z.boolean().default(false)
    }).parse(req.body);

    // 1. Verify token
    const decoded = examService.verifySessionToken(sessionToken);
    if (!decoded || decoded.attemptId !== attemptId || decoded.userId !== authReq.user!.userId) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired session token' } });
    }

    // 2. Fetch attempt and original questions
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: { certification: true }
    });

    if (!attempt || attempt.status !== 'IN_PROGRESS') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Exam is not in progress' } });
    }

    const questionIds = Object.keys(answers);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } }
    });

    // 3. Calculate Results
    const results = examService.calculateResults(answers, questions);

    // 4. Save initial results (without AI recommendations)
    const updatedAttempt = await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        status: integrityFlag ? 'INTEGRITY_VIOLATION' : 'COMPLETED',
        completedAt: new Date(),
        timeTaken,
        score: results.score,
        correctAnswers: results.correctAnswers,
        answers,
        integrityFlag,
        weakTopics: results.weakTopics,
        aiRecommendations: []
      }
    });

    // 4.5 Update Weekly Score for Leaderboard
    if (!integrityFlag) {
      // Find the start of the current week (Monday 00:00:00)
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
      const weekStart = new Date(now.setDate(diff));
      weekStart.setHours(0, 0, 0, 0);

      const existingWeeklyScore = await prisma.weeklyScore.findUnique({
        where: { userId: authReq.user!.userId }
      });

      if (!existingWeeklyScore || existingWeeklyScore.weekStart.getTime() !== weekStart.getTime()) {
        // Reset or create for new week
        await prisma.weeklyScore.upsert({
          where: { userId: authReq.user!.userId },
          update: {
            weekStart,
            totalScore: results.score,
            examsCount: 1,
            avgScore: results.score
          },
          create: {
            userId: authReq.user!.userId,
            weekStart,
            totalScore: results.score,
            examsCount: 1,
            avgScore: results.score
          }
        });
      } else {
        // Update current week
        const newTotal = existingWeeklyScore.totalScore + results.score;
        const newCount = existingWeeklyScore.examsCount + 1;
        await prisma.weeklyScore.update({
          where: { userId: authReq.user!.userId },
          data: {
            totalScore: newTotal,
            examsCount: newCount,
            avgScore: newTotal / newCount
          }
        });
      }
    }

    // 5. Trigger AI Recommendations generation asynchronously (non-blocking)
    if (results.weakTopics.length > 0) {
      aiService.generateRecommendations(results.weakTopics, attempt.certification.name)
        .then(async (recommendations) => {
          await prisma.examAttempt.update({
            where: { id: attemptId },
            data: { aiRecommendations: recommendations as any }
          });
        })
        .catch(console.error);
    }

    res.json({ success: true, data: { attemptId: updatedAttempt.id } });
  } catch (error) {
    next(error);
  }
});

// GET /exams/:id/results - Get exam results
router.get('/:id/results', authenticate, async (req: express.Request, res, next) => {
  const authReq = req as AuthRequest;
  try {
    const attemptId = req.params.id as string;

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: { certification: true }
    });

    if (!attempt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Attempt not found' } });
    }

    if (attempt.userId !== authReq.user!.userId && authReq.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    if (attempt.status === 'IN_PROGRESS') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Exam not completed yet' } });
    }

    // Include the actual questions and answers to show correct/incorrect on frontend
    const questionIds = Object.keys(attempt.answers as Record<string, string>);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } }
    });

    res.json({ success: true, data: { attempt, questions } });
  } catch (error) {
    next(error);
  }
});

export default router;
