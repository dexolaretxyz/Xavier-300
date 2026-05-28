import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { paymentService } from '../services/payment.service';
import prisma from '../lib/db';

const router = express.Router();

// POST /payments/initiate - Create Paystack transaction
router.post('/initiate', authenticate, async (req: express.Request, res, next) => {
  const authReq = req as AuthRequest;
  try {
    const { plan } = req.body;
    if (plan !== 'MONTHLY' && plan !== 'ANNUAL') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Invalid plan selected' } });
    }

    const user = await prisma.user.findUnique({ where: { id: authReq.user!.userId } });
    if (!user) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });

    const paymentData = await paymentService.initiatePayment(user.id, user.email, plan);

    res.json({ success: true, data: paymentData });
  } catch (error: any) {
    next(error);
  }
});

// POST /payments/verify - Manually verify a payment reference
router.post('/verify', authenticate, async (req: express.Request, res, next) => {
  try {
    const { reference } = req.body;
    if (!reference) return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Reference is required' } });

    const result = await paymentService.verifyPayment(reference);
    
    if (result.status === 'success') {
      await paymentService.upgradeUserSubscription(result.userId, result.plan as 'MONTHLY'|'ANNUAL', reference);
      return res.json({ success: true, message: 'Payment verified and subscription upgraded' });
    } else {
      return res.status(400).json({ success: false, error: { code: 'PAYMENT_FAILED', message: 'Payment was not successful on Paystack' } });
    }
  } catch (error: any) {
    next(error);
  }
});

// POST /payments/webhook - Paystack webhook (Public)
router.post('/webhook', async (req: express.Request, res, next) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    
    // Validate signature using raw body attached by express.json
    const rawBody = (req as any).rawBody;
    if (!rawBody || !paymentService.validateWebhookSignature(rawBody, signature)) {
      return res.status(400).send('Invalid signature');
    }

    const event = req.body;

    if (event.event === 'charge.success') {
      const data = event.data;
      const userId = data.metadata.userId;
      const plan = data.metadata.plan;
      const reference = data.reference;

      if (data.status === 'success') {
        await paymentService.upgradeUserSubscription(userId, plan, reference);
      }
    }

    res.status(200).send('Webhook received');
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// GET /payments/history - Get payment history directly from Paystack
router.get('/history', authenticate, async (req: express.Request, res, next) => {
  const authReq = req as AuthRequest;
  try {
    const user = await prisma.user.findUnique({ where: { id: authReq.user!.userId } });
    if (!user) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
    if (!PAYSTACK_SECRET_KEY) {
      return res.json({ success: true, data: [] }); // Empty history for dev without keys
    }

    const response = await fetch(`https://api.paystack.co/transaction?email=${user.email}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
    });

    const data = await response.json();
    if (!data.status) {
      return res.status(400).json({ success: false, error: { code: 'PAYSTACK_ERROR', message: data.message } });
    }

    const formattedHistory = data.data.map((tx: any) => ({
      reference: tx.reference,
      amount: tx.amount / 100, // convert from kobo to NGN
      status: tx.status,
      paidAt: tx.paid_at,
      plan: tx.metadata?.plan || 'UNKNOWN',
      channel: tx.channel
    }));

    res.json({ success: true, data: formattedHistory });
  } catch (error: any) {
    next(error);
  }
});

export default router;
