import express from 'express';
import prisma from '../lib/db';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';

const router = express.Router();

// GET /leaderboard/weekly
router.get('/weekly', authenticate, async (req: express.Request, res, next) => {
  const authReq = req as AuthRequest;
  try {
    const userId = authReq.user!.userId;

    // Get the start of the current week (Monday)
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);

    // Fetch Top 20 for this week
    const top20 = await prisma.weeklyScore.findMany({
      where: { weekStart },
      orderBy: { avgScore: 'desc' },
      take: 20,
      include: {
        user: {
          select: {
            fullName: true,
            id: true
          }
        }
      }
    });

    // Format top 20 (Privacy: Adaeze O.)
    const formattedTop20 = top20.map((score, index) => {
      const names = score.user.fullName.split(' ');
      const firstName = names[0];
      const lastInitial = names.length > 1 ? `${names[names.length - 1][0]}.` : '';
      
      return {
        rank: index + 1,
        userId: score.userId,
        name: `${firstName} ${lastInitial}`.trim(),
        avgScore: score.avgScore,
        examsCount: score.examsCount
      };
    });

    // Check if current user is in top 20
    const userInTop20 = formattedTop20.find(entry => entry.userId === userId);
    
    let currentUserEntry = null;

    if (userInTop20) {
      currentUserEntry = userInTop20;
    } else {
      // Find current user's score if not in top 20
      const userScore = await prisma.weeklyScore.findUnique({
        where: { userId }
      });

      if (userScore && userScore.weekStart.getTime() === weekStart.getTime()) {
        // Calculate their actual rank
        const betterScoresCount = await prisma.weeklyScore.count({
          where: {
            weekStart,
            avgScore: { gt: userScore.avgScore }
          }
        });
        
        const me = await prisma.user.findUnique({ where: { id: userId } });
        const names = me!.fullName.split(' ');
        const firstName = names[0];
        const lastInitial = names.length > 1 ? `${names[names.length - 1][0]}.` : '';

        currentUserEntry = {
          rank: betterScoresCount + 1,
          userId,
          name: `${firstName} ${lastInitial}`.trim(),
          avgScore: userScore.avgScore,
          examsCount: userScore.examsCount
        };
      } else {
        // User hasn't taken any exams this week
        const me = await prisma.user.findUnique({ where: { id: userId } });
        currentUserEntry = {
          rank: '-',
          userId,
          name: me!.fullName.split(' ')[0],
          avgScore: 0,
          examsCount: 0
        };
      }
    }

    res.json({
      success: true,
      data: {
        leaderboard: formattedTop20,
        currentUser: currentUserEntry
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /leaderboard/previous
router.get('/previous', authenticate, async (req: express.Request, res, next) => {
  try {
    const previousChampions = await prisma.leaderboardArchive.findMany({
      orderBy: { weekStart: 'desc' }, // Get most recent archive
      take: 3,
      include: {
        user: {
          select: { fullName: true, id: true }
        }
      }
    });

    // Only return if they belong to the same recent week
    if (previousChampions.length > 0) {
      const targetWeek = previousChampions[0].weekStart.getTime();
      const validChamps = previousChampions.filter(c => c.weekStart.getTime() === targetWeek);
      
      const formatted = validChamps.map(champ => {
        const names = champ.user.fullName.split(' ');
        const firstName = names[0];
        const lastInitial = names.length > 1 ? `${names[names.length - 1][0]}.` : '';
        
        return {
          rank: champ.rank,
          userId: champ.userId,
          name: `${firstName} ${lastInitial}`.trim(),
          avgScore: champ.avgScore,
          examsCount: champ.examsCount,
          weekStart: champ.weekStart
        };
      });

      // Ensure they are ordered by rank 1, 2, 3
      formatted.sort((a, b) => a.rank - b.rank);

      return res.json({ success: true, data: formatted });
    }

    res.json({ success: true, data: [] });
  } catch (error) {
    next(error);
  }
});

export default router;
