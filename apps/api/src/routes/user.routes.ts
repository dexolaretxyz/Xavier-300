import express from 'express';
import { prisma } from '../../../../packages/db/index';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';

const router = express.Router();

// GET /users/me - Get current user profile
router.get('/me', authenticate, async (req: express.Request, res, next) => {
  try {
    const authReq = req as AuthRequest;
    const user = await prisma.user.findUnique({
      where: { id: authReq.user!.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        state: true,
        occupation: true,
        yearsExperience: true,
        subscriptionStatus: true,
        trialStartedAt: true,
        notificationsEnabled: true,
        notificationTime: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

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

// PATCH /users/me - Update user settings
router.patch('/me', authenticate, async (req: express.Request, res, next) => {
  try {
    const authReq = req as AuthRequest;
    const { notificationsEnabled, notificationTime, theme, fullName, phone, state, occupation, yearsExperience } = req.body;
    
    const updateData: any = {};
    if (typeof notificationsEnabled === 'boolean') updateData.notificationsEnabled = notificationsEnabled;
    if (notificationTime) updateData.notificationTime = notificationTime;
    if (theme) updateData.theme = theme;
    if (fullName) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (state !== undefined) updateData.state = state;
    if (occupation !== undefined) updateData.occupation = occupation;
    if (yearsExperience !== undefined) updateData.yearsExperience = Number(yearsExperience);

    const user = await prisma.user.update({
      where: { id: authReq.user!.userId },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        phone: true,
        state: true,
        occupation: true,
        yearsExperience: true,
        notificationsEnabled: true,
        notificationTime: true,
        theme: true
      }
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

import bcrypt from 'bcryptjs';

// POST /users/change-password - Change user password
router.post('/change-password', authenticate, async (req: express.Request, res, next) => {
  try {
    const authReq = req as AuthRequest;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: { message: 'Current and new passwords are required' } });
    }

    const user = await prisma.user.findUnique({
      where: { id: authReq.user!.userId }
    });

    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({ success: false, error: { message: 'Incorrect current password' } });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword }
    });

    res.json({ success: true, data: { message: 'Password updated successfully' } });
  } catch (error) {
    next(error);
  }
});

// POST /users/push-subscription - Save push subscription
router.post('/push-subscription', authenticate, async (req: express.Request, res, next) => {
  try {
    const authReq = req as AuthRequest;
    const subscription = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ success: false, error: { message: 'Invalid subscription data' } });
    }

    await prisma.user.update({
      where: { id: authReq.user!.userId },
      data: { pushSubscription: subscription }
    });

    res.json({ success: true, data: { message: 'Push subscription saved' } });
  } catch (error) {
    next(error);
  }
});

// GET /users/activity/today - Check if user practiced today
router.get('/activity/today', authenticate, async (req: express.Request, res, next) => {
  try {
    const authReq = req as AuthRequest;
    const startOfToday = startOfDay(new Date());

    const examsToday = await prisma.examAttempt.count({
      where: {
        userId: authReq.user!.userId,
        createdAt: { gte: startOfToday }
      }
    });

    res.json({ 
      success: true, 
      data: { 
        hasPracticedToday: examsToday > 0,
        examsCount: examsToday
      } 
    });
  } catch (error) {
    next(error);
  }
});

export default router;
