import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.middleware';
import { prisma } from '../../../../packages/db/index';
import { questionService } from '../services/question.service';

const router = Router();

// Middleware to ensure user is an ADMIN
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: { message: 'Admin access required' } });
  }
  next();
};

router.use(authenticate, requireAdmin);

// ==========================================
// 1. QUESTION MANAGEMENT
// ==========================================

/**
 * GET /api/admin/questions
 * Get all questions with optional filters
 */
router.get('/questions', async (req: any, res: any) => {
  try {
    const { status, source, certificationId } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (source) where.source = source;
    if (certificationId) where.certificationId = certificationId;

    const questions = await prisma.question.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        certification: { select: { name: true } },
        contributedBy: { select: { fullName: true, email: true } }
      },
      take: 200 // Limit for UI performance
    });

    return res.json({ success: true, data: questions });
  } catch (error) {
    console.error('Admin get questions error:', error);
    return res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

/**
 * PATCH /api/admin/questions/:id
 * Approve, reject, or edit a question
 */
router.patch('/questions/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Can also include edits to text, options, etc.

    if (!['PENDING_REVIEW', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid status' } });
    }

    const updated = await prisma.question.update({
      where: { id },
      data: req.body // Destructure specific fields in production to prevent arbitrary overwrites
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Admin update question error:', error);
    return res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

/**
 * POST /api/admin/questions/generate
 * Trigger AI generation
 */
router.post('/questions/generate', async (req: any, res: any) => {
  try {
    const schema = z.object({
      certificationId: z.string().cuid(),
      topic: z.string().min(2),
      count: z.number().min(1).max(50),
      difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'ADVANCED']).optional()
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { message: 'Invalid payload', details: parsed.error.issues } });
    }

    const { certificationId, topic, count, difficulty } = parsed.data;
    
    // This runs asynchronously in background or awaits if small count. 
    // For large counts, consider a background job.
    const generatedCount = await questionService.generateQuestionsWithAI(certificationId, topic, count, difficulty);

    return res.json({ success: true, data: { generatedCount } });
  } catch (error: any) {
    console.error('Admin generate questions error:', error);
    return res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
});

// ==========================================
// 2. USER MANAGEMENT
// ==========================================

/**
 * GET /api/admin/users
 */
router.get('/users', async (req: any, res: any) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        subscriptionStatus: true,
        trialStartedAt: true,
        createdAt: true
      },
      take: 100
    });
    return res.json({ success: true, data: users });
  } catch (error) {
    console.error('Admin get users error:', error);
    return res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

/**
 * PATCH /api/admin/users/:id
 */
router.patch('/users/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { role, subscriptionStatus } = req.body;

    const data: any = {};
    if (role) data.role = role;
    if (subscriptionStatus) data.subscriptionStatus = subscriptionStatus;

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, role: true, subscriptionStatus: true }
    });

    return res.json({ success: true, data: user });
  } catch (error) {
    console.error('Admin update user error:', error);
    return res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// ==========================================
// 3. PLATFORM ANALYTICS (STATS)
// ==========================================

/**
 * GET /api/admin/stats
 */
router.get('/stats', async (req: any, res: any) => {
  try {
    const totalUsers = await prisma.user.count();
    const activeSubscribers = await prisma.user.count({ where: { subscriptionStatus: 'ACTIVE' } });
    const trialUsers = await prisma.user.count({ where: { subscriptionStatus: 'FREE_TRIAL' } });
    
    // Exclude free trials for revenue rough calculation (assume 50k per active for demo)
    const revenueMTD = activeSubscribers * 50000;

    const totalQuestions = await prisma.question.count();
    const pendingQuestions = await prisma.question.count({ where: { status: 'PENDING_REVIEW' } });
    const totalExams = await prisma.examAttempt.count();

    return res.json({
      success: true,
      data: {
        totalUsers,
        activeSubscribers,
        trialUsers,
        revenueMTD,
        totalQuestions,
        pendingQuestions,
        totalExams
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// ==========================================
// 4. TICKETS MANAGEMENT
// ==========================================

/**
 * GET /api/admin/tickets
 */
router.get('/tickets', async (req: any, res: any) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, email: true } }
      }
    });
    return res.json({ success: true, data: tickets });
  } catch (error) {
    console.error('Admin get tickets error:', error);
    return res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

/**
 * PATCH /api/admin/tickets/:id
 */
router.patch('/tickets/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const data: any = {};
    if (status) data.status = status;
    if (adminNote) data.adminNote = adminNote;

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data
    });

    return res.json({ success: true, data: ticket });
  } catch (error) {
    console.error('Admin update ticket error:', error);
    return res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

export default router;
