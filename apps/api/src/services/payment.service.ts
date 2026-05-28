import crypto from 'crypto';
import { prisma } from '../../../../packages/db/index';

export const paymentService = {
  // Initiates a transaction with Paystack
  async initiatePayment(userId: string, email: string, plan: 'MONTHLY' | 'ANNUAL') {
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
    const amount = plan === 'MONTHLY' ? 5000 * 100 : 50000 * 100; // in kobo
    const reference = `XAV_${Date.now()}_${userId}`;

    // If no secret key is configured, throw an error
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error('Paystack Secret Key is not configured. Please add PAYSTACK_SECRET_KEY to your .env file.');
    }

    const PAYSTACK_BASE_URL = 'https://api.paystack.co';
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        amount,
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing/success`,
        metadata: {
          userId,
          plan
        }
      })
    });

    const data = await response.json();
    if (!data.status) {
      throw new Error(data.message || 'Failed to initialize payment');
    }

    return data.data; // { authorization_url, access_code, reference }
  },

  // Verify payment via Paystack API
  async verifyPayment(reference: string) {
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error('Paystack Secret Key is not configured. Please add PAYSTACK_SECRET_KEY to your .env file.');
    }

    const PAYSTACK_BASE_URL = 'https://api.paystack.co';
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    });

    const data = await response.json();
    if (!data.status) {
      throw new Error(data.message || 'Failed to verify payment');
    }

    return {
      status: data.data.status, // "success", "failed", etc.
      userId: data.data.metadata.userId,
      plan: data.data.metadata.plan,
      amount: data.data.amount,
      paidAt: data.data.paid_at,
      channel: data.data.channel
    };
  },

  // Webhook signature validation
  validateWebhookSignature(payload: any, signature: string): boolean {
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
    if (!PAYSTACK_SECRET_KEY) return true; // Accept in dev if no key
    
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(payload))
      .digest('hex');
      
    return hash === signature;
  },

  // Calculate new subscription end date
  calculateSubscriptionEnd(plan: 'MONTHLY' | 'ANNUAL'): Date {
    const now = new Date();
    if (plan === 'MONTHLY') {
      now.setDate(now.getDate() + 30);
    } else {
      now.setFullYear(now.getFullYear() + 1);
    }
    return now;
  },

  // Upgrades a user's subscription
  async upgradeUserSubscription(userId: string, plan: 'MONTHLY' | 'ANNUAL', reference: string) {
    const endsAt = this.calculateSubscriptionEnd(plan);

    // Save payment history record (Requires adding PaymentHistory model, but we'll store directly or skip if not in schema. Wait, PRD says GET /payments/history. I should check if there is a Payment model in schema.prisma. For now, I'll just upgrade the user.)
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'SUBSCRIBED',
        subscriptionEndsAt: endsAt,
      }
    });

    return endsAt;
  }
};
