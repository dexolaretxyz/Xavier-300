import express from 'express';
import { prisma } from '../../../../packages/db/index';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();

// GET /domains - List all domains with their certifications
router.get('/', authenticate, async (req: express.Request, res, next) => {
  try {
    const domains = await prisma.domain.findMany({
      include: {
        certifications: {
          select: {
            id: true,
            name: true,
            slug: true,
            difficulty: true,
            _count: {
              select: { questions: true }
            }
          }
        }
      },
      orderBy: { priority: 'desc' }
    });
    
    res.json({ success: true, data: domains });
  } catch (error) {
    next(error);
  }
});

// GET /domains/:slug - Get domain details with its certifications
router.get('/:slug', authenticate, async (req: express.Request, res, next) => {
  try {
    const slug = req.params.slug as string;
    
    // Ignore if slug is 'certifications', let the next route handle it
    if (slug === 'certifications') return next();

    const domain = await prisma.domain.findUnique({
      where: { slug },
      include: {
        certifications: {
          include: {
            _count: {
              select: { questions: { where: { status: 'APPROVED' } } }
            }
          }
        }
      }
    });

    if (!domain) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Domain not found' } });
    }

    res.json({ success: true, data: domain });
  } catch (error) {
    next(error);
  }
});

// GET /domains/certifications/:slug - Get certification details
router.get('/certifications/:slug', authenticate, async (req: express.Request, res, next) => {
  try {
    const slug = req.params.slug as string;
    
    const cert = await prisma.certification.findUnique({
      where: { slug },
      include: {
        domain: true,
        _count: {
          select: { questions: { where: { status: 'APPROVED' } } }
        }
      }
    });

    if (!cert) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Certification not found' } });
    }

    res.json({ success: true, data: cert });
  } catch (error) {
    next(error);
  }
});

export default router;
