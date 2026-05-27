import express from 'express';
import { prisma } from '../../../../packages/db/index';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/weekly', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    // Fetch top 20
    const top20 = await prisma.weeklyScore.findMany({
      orderBy: { avgScore: 'desc' },
      take: 20,
      include: {
        user: {
          select: { fullName: true }
        }
      }
    });

    const leaderboard = top20.map((score, index) => {
      const parts = score.user.fullName.trim().split(' ');
      const fname = parts[0] || 'User';
      const linitial = parts.length > 1 ? parts[parts.length - 1][0] + '.' : '';
      return {
        rank: index + 1,
        userId: score.userId,
        name: `${fname} ${linitial}`.trim(),
        avgScore: score.avgScore,
        examsCount: score.examsCount
      };
    });

    // Find current user if they are not in the top 20
    let currentUserRank = leaderboard.find(l => l.userId === userId);
    if (!currentUserRank) {
      const userScore = await prisma.weeklyScore.findUnique({
        where: { userId },
        include: { user: { select: { fullName: true } } }
      });

      if (userScore) {
        // Calculate rank by counting how many have higher score
        const rankCount = await prisma.weeklyScore.count({
          where: { avgScore: { gt: userScore.avgScore } }
        });

        const parts = userScore.user.fullName.trim().split(' ');
        const fname = parts[0] || 'User';
        const linitial = parts.length > 1 ? parts[parts.length - 1][0] + '.' : '';

        currentUserRank = {
          rank: rankCount + 1,
          userId: userScore.userId,
          name: `${fname} ${linitial}`.trim(),
          avgScore: userScore.avgScore,
          examsCount: userScore.examsCount
        };
      }
    }

    res.json({ success: true, data: { leaderboard, currentUser: currentUserRank || null } });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
  }
});

router.get('/previous', authenticate, async (req: AuthRequest, res) => {
  try {
    // We assume the most recent week in the archive that has records is the previous week
    const latestArchive = await prisma.leaderboardArchive.findFirst({
      orderBy: { weekStart: 'desc' },
      select: { weekStart: true }
    });

    if (!latestArchive) {
      return res.json({ success: true, data: { champions: [] } });
    }

    const champions = await prisma.leaderboardArchive.findMany({
      where: { weekStart: latestArchive.weekStart },
      orderBy: { rank: 'asc' },
      take: 3,
      include: {
        user: { select: { fullName: true } }
      }
    });

    const formatted = champions.map(c => {
      const parts = c.user.fullName.trim().split(' ');
      const fname = parts[0] || 'User';
      const linitial = parts.length > 1 ? parts[parts.length - 1][0] + '.' : '';
      return {
        rank: c.rank,
        name: `${fname} ${linitial}`.trim(),
        avgScore: c.avgScore,
        examsCount: c.examsCount,
        weekStart: c.weekStart
      };
    });

    res.json({ success: true, data: { champions: formatted } });
  } catch (error) {
    console.error('Previous leaderboard error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch previous leaderboard' });
  }
});

export const leaderboardRoutes = router;
