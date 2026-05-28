import webpush from 'web-push';
import { Resend } from 'resend';
import { prisma } from '../../../../packages/db/index';

// Initialize Web Push
const initWebPush = () => {
  const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail = process.env.VAPID_EMAIL || 'admin@xavier300.com.ng';

  if (publicVapidKey && privateVapidKey) {
    webpush.setVapidDetails(
      `mailto:${vapidEmail}`,
      publicVapidKey,
      privateVapidKey
    );
    return true;
  }
  return false;
};

const isPushConfigured = initWebPush();
const resend = new Resend(process.env.RESEND_API_KEY);

export const notificationService = {
  /**
   * Send a push notification to a user's browser via VAPID
   */
  async sendPushNotification(userId: string, title: string, body: string, url: string = '/dashboard') {
    if (!isPushConfigured) {
      console.warn('Web push is not configured. Missing VAPID keys.');
      return false;
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { pushSubscription: true, notificationsEnabled: true }
      });

      if (!user || !user.notificationsEnabled || !user.pushSubscription) {
        return false; // Push is disabled or no subscription available
      }

      const subscription = user.pushSubscription as any;
      const payload = JSON.stringify({
        title,
        body,
        url,
        icon: '/icon512_maskable.png', // Assuming we'll have an app icon
        badge: '/icon512_maskable.png'
      });

      await webpush.sendNotification(subscription, payload);
      return true;
    } catch (error: any) {
      // If the subscription has expired or is no longer valid, we should remove it
      if (error.statusCode === 410 || error.statusCode === 404) {
        await prisma.user.update({
          where: { id: userId },
          data: { pushSubscription: null }
        });
      }
      console.error('Error sending push notification:', error);
      return false;
    }
  },

  /**
   * Send a fallback email notification
   */
  async sendEmailNotification(email: string, subject: string, content: string) {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.log(`[MOCK EMAIL to ${email}] ${subject}: ${content}`);
        return true;
      }

      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@xavier300.com.ng',
        to: email,
        subject: subject,
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
            <h2>${subject}</h2>
            <p>${content}</p>
            <br/>
            <p>Best regards,<br/>The Xavier 300 Team</p>
          </div>
        `
      });
      return true;
    } catch (error) {
      console.error('Error sending fallback email:', error);
      return false;
    }
  },

  /**
   * Send reminder with fallback logic
   */
  async sendReminder(userId: string, email: string, title: string, body: string) {
    const pushSuccess = await this.sendPushNotification(userId, title, body);
    
    if (!pushSuccess) {
      // Fallback to email if push failed (e.g. they denied permissions or keys rotated)
      await this.sendEmailNotification(email, title, body);
    }
  },

  /**
   * Email for when a user creates a new ticket
   */
  async sendTicketCreatedEmail(email: string, ticketId: string, subject: string) {
    const htmlContent = `
      <p>Hello,</p>
      <p>We have received your support request: <strong>"${subject}"</strong>.</p>
      <p>Your Ticket ID is: <strong>${ticketId}</strong>.</p>
      <p>Our admin team will review your request and get back to you shortly. You can view your ticket and respond in the <a href="${process.env.NEXT_PUBLIC_APP_URL}/support/${ticketId}">Support Center</a>.</p>
    `;
    await this.sendEmailNotification(email, `Support Ticket Received - #${ticketId.slice(0, 8)}`, htmlContent);
  },

  /**
   * Email for when an admin responds to a ticket
   */
  async sendTicketUpdatedEmail(email: string, ticketId: string) {
    const htmlContent = `
      <p>Hello,</p>
      <p>An admin has responded to your support ticket (ID: ${ticketId}).</p>
      <p>Please click <a href="${process.env.NEXT_PUBLIC_APP_URL}/support/${ticketId}">here</a> to view the response and continue the conversation.</p>
    `;
    await this.sendEmailNotification(email, `Update on your Support Ticket - #${ticketId.slice(0, 8)}`, htmlContent);
  }
};
