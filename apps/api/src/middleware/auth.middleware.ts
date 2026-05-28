import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No token provided' } });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
  }
};

export const requireRole = (role: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    if (req.user.role !== role && req.user.role !== 'ADMIN') { // ADMIN can access anything
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
      return;
    }

    next();
  };
};

export const requireSubscription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { subscriptionStatus: true, subscriptionEndsAt: true, trialStartedAt: true }
    });

    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'User not found' } });
      return;
    }

    // Check if free trial is still active (7 days)
    if (user.subscriptionStatus === 'FREE_TRIAL') {
      const trialDays = (Date.now() - new Date(user.trialStartedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (trialDays > 7) {
        res.status(403).json({ success: false, error: { code: 'TRIAL_EXPIRED', message: 'Free trial has expired' } });
        return;
      }
      return next();
    }

    // Check if subscribed and not expired
    if (user.subscriptionStatus === 'SUBSCRIBED' && user.subscriptionEndsAt) {
      if (new Date() > new Date(user.subscriptionEndsAt)) {
        res.status(403).json({ success: false, error: { code: 'SUBSCRIPTION_EXPIRED', message: 'Subscription has expired' } });
        return;
      }
      return next();
    }

    // If admin, bypass subscription check
    if (req.user.role === 'ADMIN') {
      return next();
    }

    res.status(403).json({ success: false, error: { code: 'SUBSCRIPTION_REQUIRED', message: 'Active subscription required' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to verify subscription status' } });
  }
};
