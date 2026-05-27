import express from 'express';
import { prisma } from '../../../../packages/db/index';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';

const router = express.Router();

// GET /users/me/stats - Dashboard statistics
router.get('/me/stats', authenticate, async (req: express.Request, res, next) => {
  const authReq = req as AuthRequest;
  try {
    const userId = authReq.user!.userId;
    
    // Calculate "this week" range
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    // Exams taken this week
    const recentAttempts = await prisma.examAttempt.findMany({
      where: {
        userId,
        startedAt: { gte: weekStart, lte: weekEnd },
        status: 'COMPLETED'
      },
      include: {
        certification: true
      },
      orderBy: { completedAt: 'desc' }
    });

    const examsTakenThisWeek = recentAttempts.length;
    
    // Average score
    const avgScore = examsTakenThisWeek > 0
      ? recentAttempts.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0) / examsTakenThisWeek
      : 0;

    // Last 2 certs attempted
    const lastCertifications = await prisma.examAttempt.findMany({
      where: { userId },
      select: { certification: true },
      distinct: ['certificationId'],
      orderBy: { startedAt: 'desc' },
      take: 2
    });

    // Rank preview (mock or real if WeeklyScore exists)
    const currentWeekScore = await prisma.weeklyScore.findFirst({
      where: { userId, weekStart: { gte: weekStart } }
    });

    res.json({
      success: true,
      data: {
        examsTakenThisWeek,
        averageScore: Math.round(avgScore),
        currentStreak: 0, // Requires complex tracking, mock for now
        rank: null, // To be implemented with leaderboard in step 10
        recentCertifications: lastCertifications.map((a: any) => a.certification),
        weakAreas: [] // AI weak areas, populate later from JSON fields
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
