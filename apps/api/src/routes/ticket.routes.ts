import express from 'express';
import { prisma } from '../../../../packages/db/index';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';
import { notificationService } from '../services/notification.service';

const router = express.Router();

const createTicketSchema = z.object({
  subject: z.string().min(5, 'Subject is too short'),
  description: z.string().min(10, 'Description is too short').max(1000, 'Description is too long'),
  category: z.enum(['PAYMENT', 'ACCESS', 'EXAM_BUG', 'ACCOUNT', 'OTHER']),
});

const replySchema = z.object({
  message: z.string().min(2, 'Message is too short'),
});

// GET /api/tickets - List user's tickets
router.get('/', authenticate, async (req: express.Request, res, next) => {
  try {
    const authReq = req as AuthRequest;
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: authReq.user!.userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });
    
    res.json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
});

// GET /api/tickets/:id - Get specific ticket details + messages
router.get('/:id', authenticate, async (req: express.Request, res, next) => {
  try {
    const authReq = req as AuthRequest;
    const ticket = await prisma.supportTicket.findFirst({
      where: { 
        id: req.params.id as string,
        userId: authReq.user!.userId
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ success: false, error: { message: 'Ticket not found' } });
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
});

// POST /api/tickets - Create a new ticket
router.post('/', authenticate, async (req: express.Request, res, next) => {
  try {
    const authReq = req as AuthRequest;
    const data = createTicketSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: authReq.user!.userId }});

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: authReq.user!.userId,
        subject: data.subject,
        description: data.description,
        type: data.category as any,
        status: 'OPEN',
        messages: {
          create: {
            senderId: authReq.user!.userId,
            message: data.description,
            isAdmin: false
          }
        }
      }
    });

    // Send confirmation email
    if (user && user.email) {
      await notificationService.sendTicketCreatedEmail(user.email, ticket.id, ticket.subject);
    }

    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { message: (error as any).errors[0].message } });
    }
    next(error);
  }
});

// POST /api/tickets/:id/messages - Reply to a ticket
router.post('/:id/messages', authenticate, async (req: express.Request, res, next) => {
  try {
    const authReq = req as AuthRequest;
    const { message } = replySchema.parse(req.body);

    const ticket = await prisma.supportTicket.findFirst({
      where: { 
        id: req.params.id as string,
        userId: authReq.user!.userId
      }
    });

    if (!ticket) {
      return res.status(404).json({ success: false, error: { message: 'Ticket not found' } });
    }

    // Add message
    const newMessage = await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: authReq.user!.userId,
        message: message,
        isAdmin: false
      }
    });

    // Update ticket status to OPEN if it was RESOLVED, since user replied
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { status: 'OPEN', updatedAt: new Date() }
    });

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { message: (error as any).errors[0].message } });
    }
    next(error);
  }
});

export default router;
