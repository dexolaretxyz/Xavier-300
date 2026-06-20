import express from 'express';
import prisma from '../lib/db';
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
    const { certId, certificationId, slug } = z.object({
      certId: z.string().optional(),
      certificationId: z.string().optional(),
      slug: z.string().optional(),
    }).parse(req.body);

    const userId = authReq.user!.userId;
    const lookupId = certId || certificationId;

    if (!lookupId && !slug) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'certId, certificationId, or slug is required' } });
    }

    // Get Certification config
    const cert = await prisma.certification.findFirst({
      where: lookupId ? { id: lookupId } : { slug }
    });
    if (!cert) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Certification not found' } });
    }

    const resolvedCertId = cert.id;

    // Check for existing active attempt (IN_PROGRESS) for this user and certification
    const activeAttempt = await prisma.examAttempt.findFirst({
      where: {
        userId,
        certificationId: resolvedCertId,
        status: 'IN_PROGRESS'
      },
      orderBy: { startedAt: 'desc' }
    });

    if (activeAttempt) {
      // Calculate remaining time
      const elapsedSeconds = Math.floor((Date.now() - activeAttempt.startedAt.getTime()) / 1000);
      const totalDurationSeconds = cert.examDuration * 60;
      const timeRemaining = Math.max(0, totalDurationSeconds - elapsedSeconds);

      // Recreate the questions using the original start time
      let dailyResult;
      try {
        dailyResult = await examService.getDailyQuestionsForUser(resolvedCertId, userId, cert.questionCount, activeAttempt.startedAt);
      } catch (err: any) {
        return res.status(400).json({ success: false, error: { code: 'NOT_ENOUGH_QUESTIONS', message: err.message } });
      }

      const { questions } = dailyResult;

      const clientQuestions = questions.map((q: any) => ({
        id: q.id,
        text: q.text,
        options: q.options as any,
        questionType: q.questionType || 'MCQ',
        imageUrl: q.imageUrl || null,
        imageAlt: q.imageAlt || null,
      }));

      const sessionToken = examService.generateSessionToken(activeAttempt.id, userId);
      const questionType = questions[0]?.questionType || 'MCQ';

      return res.json({
        success: true,
        data: {
          attemptId: activeAttempt.id,
          sessionToken,
          questionType,
          questions: clientQuestions,
          examDuration: cert.examDuration,
          duration: cert.examDuration,
          timeRemaining,
          isResumed: true,
          answers: activeAttempt.answers || {},
          theoryAnswers: activeAttempt.theoryAnswers || {}
        }
      });
    }

    // 1. Validate attempt limit
    const now = new Date();
    const attemptsToday = await prisma.examAttempt.count({
      where: {
        userId,
        certificationId: resolvedCertId,
        startedAt: { gte: startOfDay(now), lte: endOfDay(now) }
      }
    });

    if (attemptsToday >= 3) {
      return res.status(403).json({ success: false, error: { code: 'LIMIT_REACHED', message: 'Daily attempt limit (3) reached for this certification.' } });
    }

    const startedAt = new Date();

    // 3. Get shuffled questions + session answer keys
    let dailyResult;
    try {
      dailyResult = await examService.getDailyQuestionsForUser(resolvedCertId, userId, cert.questionCount, startedAt);
    } catch (err: any) {
      return res.status(400).json({ success: false, error: { code: 'NOT_ENOUGH_QUESTIONS', message: err.message } });
    }

    const { questions, sessionKeys } = dailyResult;

    // 4. Strip correct answers before sending to client
    const clientQuestions = questions.map((q: any) => ({
      id: q.id,
      text: q.text,
      options: q.options as any,
      questionType: q.questionType || 'MCQ',
      imageUrl: q.imageUrl || null,
      imageAlt: q.imageAlt || null,
    }));

    // 5. Create ExamAttempt record
    const attempt = await prisma.examAttempt.create({
      data: {
        userId,
        certificationId: resolvedCertId,
        totalQuestions: questions.length,
        attemptNumber: attemptsToday + 1,
        answers: {}, // Empty JSON
        status: 'IN_PROGRESS',
        startedAt
      }
    });

    // 6. Store session answer keys in Redis for reliable grading
    await examService.storeExamSession(attempt.id, userId, sessionKeys, cert.examDuration);

    // 7. Generate Session Token
    const sessionToken = examService.generateSessionToken(attempt.id, userId);

    // Determine question type from the certification's question pool
    const questionType = questions[0]?.questionType || 'MCQ';

    res.json({
      success: true,
      data: {
        attemptId: attempt.id,
        sessionToken,
        questionType,
        questions: clientQuestions,
        examDuration: cert.examDuration,
        duration: cert.examDuration
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
    const { sessionToken, answers, theoryAnswers, examType, timeTaken, integrityFlag } = z.object({
      sessionToken: z.string().optional(),
      answers: z.record(z.string(), z.string()).optional(),
      theoryAnswers: z.record(z.string(), z.string()).optional(),
      examType: z.enum(['MCQ', 'THEORY', 'PRACTICAL']).optional(),
      timeTaken: z.number(),
      integrityFlag: z.boolean().default(false)
    }).parse(req.body);

    // 1. Verify token if provided
    if (sessionToken) {
      const decoded = examService.verifySessionToken(sessionToken);
      if (!decoded || decoded.attemptId !== attemptId || decoded.userId !== authReq.user!.userId) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired session token' } });
      }
    }

    // 2. Fetch attempt and original questions
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: { certification: true }
    });

    if (!attempt || attempt.status !== 'IN_PROGRESS') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Exam is not in progress' } });
    }

    if (attempt.userId !== authReq.user!.userId) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    const resolvedAnswers = answers || theoryAnswers || {};
    const questionIds = Object.keys(resolvedAnswers);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } }
    });

    const isTheory = examType === 'THEORY' || 
                     attempt.certification.slug.includes('essay') || 
                     attempt.certification.slug.includes('theory') ||
                     questions.some(q => q.questionType === 'THEORY');

    if (isTheory) {
      // Handle theory submission
      const updatedAttempt = await prisma.examAttempt.update({
        where: { id: attemptId },
        data: {
          status: integrityFlag ? 'INTEGRITY_VIOLATION' : 'COMPLETED',
          completedAt: new Date(),
          timeTaken,
          theoryAnswers: resolvedAnswers as any,
          answers: resolvedAnswers as any, // Store in answers too for compatibility
          score: 0, // Will be updated once AI marks
          correctAnswers: 0,
          integrityFlag,
          totalQuestions: questions.length,
          theoryScores: [] // Will be filled by AI
        }
      });

      // Trigger AI marking asynchronously
      if (!integrityFlag) {
        aiService.markTheoryAnswers(questions, resolvedAnswers)
          .then(async (scores) => {
            const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
            const maxPossible = scores.reduce((sum, s) => sum + s.maxScore, 0);
            const percentage = maxPossible > 0 ? (totalScore / maxPossible) * 100 : 0;

            const theoryScoresMap = scores.reduce((acc, s) => {
              acc[s.questionId] = {
                score: s.score,
                maxScore: s.maxScore,
                feedback: s.feedback,
                pointsCovered: s.pointsCovered,
                pointsMissed: s.pointsMissed
              };
              return acc;
            }, {} as Record<string, any>);

            await prisma.examAttempt.update({
              where: { id: attemptId },
              data: {
                theoryScores: theoryScoresMap as any,
                score: Math.round(percentage),
                correctAnswers: scores.filter(s => s.score >= 7).length
              }
            });
          })
          .catch(console.error);
      }

      return res.json({ success: true, data: { attemptId: updatedAttempt.id, marking: 'pending' } });
    }

    // 3. Reconstruct session answer keys deterministically using start time
    const dailySeed = examService.getDailySeed(attempt.startedAt);
    const userSeed = attempt.userId.split('').reduce((acc, char) => 
      acc + char.charCodeAt(0), 0);
    const combinedSeed = dailySeed + userSeed;

    const sessionKeys = questions.map(q => {
      const questionSeed = combinedSeed + q.id.split('').reduce(
        (acc, char) => acc + char.charCodeAt(0), 0
      );
      const { sessionCorrectAnswer } = examService.shuffleQuestionOptions(q, questionSeed);
      return {
        id: q.id,
        correctAnswer: sessionCorrectAnswer
      };
    });

    const mcqAnswers = answers || {};
    const results = examService.calculateResults(mcqAnswers, sessionKeys, questions);

    // 4. Save initial results (without AI recommendations)
    const updatedAttempt = await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        status: integrityFlag ? 'INTEGRITY_VIOLATION' : 'COMPLETED',
        completedAt: new Date(),
        timeTaken,
        score: results.score,
        correctAnswers: results.correctAnswers,
        answers: mcqAnswers,
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

// POST /exams/:id/submit-theory - Submit a theory exam with AI marking
router.post('/:id/submit-theory', authenticate, async (req: express.Request, res, next) => {
  const authReq = req as AuthRequest;
  try {
    const attemptId = req.params.id as string;
    const { sessionToken, theoryAnswers, timeTaken, integrityFlag } = z.object({
      sessionToken: z.string(),
      theoryAnswers: z.record(z.string(), z.string()),
      timeTaken: z.number(),
      integrityFlag: z.boolean().default(false)
    }).parse(req.body);

    // 1. Verify token
    const decoded = examService.verifySessionToken(sessionToken);
    if (!decoded || decoded.attemptId !== attemptId || decoded.userId !== authReq.user!.userId) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired session token' } });
    }

    // 2. Fetch attempt
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: { certification: true }
    });

    if (!attempt || attempt.status !== 'IN_PROGRESS') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Exam is not in progress' } });
    }

    const questionIds = Object.keys(theoryAnswers);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } }
    });

    // 3. Save initial attempt record with PENDING_REVIEW status
    const updatedAttempt = await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        status: integrityFlag ? 'INTEGRITY_VIOLATION' : 'COMPLETED',
        completedAt: new Date(),
        timeTaken,
        theoryAnswers: theoryAnswers as any,
        answers: theoryAnswers as any, // Store in answers too for compatibility
        score: 0, // Will be updated once AI marks
        correctAnswers: 0,
        integrityFlag,
        totalQuestions: questions.length,
        theoryScores: [] // Will be filled by AI
      }
    });

    // 4. Return immediately so UI doesn't hang, then run AI marking async
    res.json({ success: true, data: { attemptId: updatedAttempt.id, marking: 'pending' } });

    // 5. Trigger AI marking asynchronously
    if (!integrityFlag) {
      aiService.markTheoryAnswers(questions, theoryAnswers)
        .then(async (scores) => {
          const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
          const maxPossible = scores.reduce((sum, s) => sum + s.maxScore, 0);
          const percentage = maxPossible > 0 ? (totalScore / maxPossible) * 100 : 0;

          const theoryScoresMap = scores.reduce((acc, s) => {
            acc[s.questionId] = {
              score: s.score,
              maxScore: s.maxScore,
              feedback: s.feedback,
              pointsCovered: s.pointsCovered,
              pointsMissed: s.pointsMissed
            };
            return acc;
          }, {} as Record<string, any>);

          await prisma.examAttempt.update({
            where: { id: attemptId },
            data: {
              theoryScores: theoryScoresMap as any,
              score: Math.round(percentage),
              correctAnswers: scores.filter(s => s.score >= 7).length // 7/10 = pass per question
            }
          });
        })
        .catch(console.error);
    }
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

    // Get question IDs from either MCQ answers or theory answers
    const mcqAnswers = attempt.answers as Record<string, string> || {};
    const theoryAnswers = attempt.theoryAnswers as Record<string, string> || {};
    const questionIds = [
      ...Object.keys(mcqAnswers),
      ...Object.keys(theoryAnswers)
    ].filter((id, idx, arr) => arr.indexOf(id) === idx); // unique

    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } }
    });

    const dailySeed = examService.getDailySeed(attempt.startedAt);
    const userSeed = attempt.userId.split('').reduce((acc, char) => 
      acc + char.charCodeAt(0), 0);
    const combinedSeed = dailySeed + userSeed;

    const shuffledQuestions = questions.map(q => {
      if (q.questionType === 'THEORY') {
        return q;
      }
      const questionSeed = combinedSeed + q.id.split('').reduce(
        (acc, char) => acc + char.charCodeAt(0), 0
      );
      const { question: shuffledQ, sessionCorrectAnswer } = examService.shuffleQuestionOptions(q, questionSeed);
      return {
        ...shuffledQ,
        correctAnswer: sessionCorrectAnswer
      };
    });

    res.json({ success: true, data: { attempt, questions: shuffledQuestions } });
  } catch (error) {
    next(error);
  }
});

// GET /exams/:id/theory-results - Get theory exam results
router.get('/:id/theory-results', authenticate, async (req: express.Request, res, next) => {
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

    const theoryAnswers = attempt.theoryAnswers as Record<string, string> || {};
    const questionIds = Object.keys(theoryAnswers);

    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } }
    });

    res.json({ success: true, data: { attempt, questions } });
  } catch (error) {
    next(error);
  }
});

export default router;
