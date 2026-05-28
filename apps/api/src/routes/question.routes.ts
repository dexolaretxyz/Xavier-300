import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.middleware';
import { prisma } from '../../../../packages/db/index';

const router = Router();

// Zod schema for question validation
const QuestionSchema = z.object({
  certificationId: z.string().cuid(),
  text: z.string().min(10),
  options: z.object({
    A: z.string().min(1),
    B: z.string().min(1),
    C: z.string().min(1),
    D: z.string().min(1),
  }),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']),
  explanation: z.string().min(10),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  topic: z.string().min(2),
});

/**
 * POST /api/questions
 * Submit a new question (Teacher or Admin)
 */
router.post('/', authenticate, async (req: any, res: any) => {
  try {
    const userRole = req.user.role;
    if (userRole !== 'TEACHER' && userRole !== 'ADMIN') {
      return res.status(403).json({ success: false, error: { message: 'Insufficient permissions' } });
    }

    const parsed = QuestionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { message: 'Invalid question data', details: parsed.error.issues } });
    }

    const { certificationId, text, options, correctAnswer, explanation, difficulty, topic } = parsed.data;

    // Check if certification exists
    const cert = await prisma.certification.findUnique({ where: { id: certificationId } });
    if (!cert) {
      return res.status(404).json({ success: false, error: { message: 'Certification not found' } });
    }

    const question = await prisma.question.create({
      data: {
        certificationId,
        text,
        options,
        correctAnswer,
        explanation,
        difficulty,
        topic,
        source: userRole === 'ADMIN' ? 'ADMIN' : 'TEACHER',
        status: userRole === 'ADMIN' ? 'APPROVED' : 'PENDING_REVIEW', // Admin questions are auto-approved
        contributedById: req.user.id
      }
    });

    return res.status(201).json({ success: true, data: question });
  } catch (error) {
    console.error('Submit question error:', error);
    return res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

/**
 * GET /api/questions/my
 * Teacher can view their own submitted questions and statuses
 */
router.get('/my', authenticate, async (req: any, res: any) => {
  try {
    const userRole = req.user.role;
    if (userRole !== 'TEACHER' && userRole !== 'ADMIN') {
      return res.status(403).json({ success: false, error: { message: 'Insufficient permissions' } });
    }

    const questions = await prisma.question.findMany({
      where: { contributedById: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        certification: {
          select: { name: true }
        }
      }
    });

    return res.json({ success: true, data: questions });
  } catch (error) {
    console.error('Get my questions error:', error);
    return res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

export default router;
