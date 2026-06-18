import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

let resendClient: any = null;

function getResendClient() {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('RESEND_API_KEY not set - email notifications disabled');
      return null;
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_do_not_use_in_prod';

export const authService = {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  },

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  generateTokens(userId: string, role: string) {
    const accessToken = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId, role }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  },

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  },

  async sendVerificationEmail(email: string, otp: string) {
    const fromEmail = process.env.EMAIL_FROM || 'noreply@xavier300.com.ng';
    
    try {
      const client = getResendClient();
      if (!client) {
        console.warn(`[EMAIL SKIP] Resend not configured. OTP for ${email}: ${otp}`);
        return;
      }
      const result = await client.emails.send({
        from: `Xavier 300 <${fromEmail}>`,
        to: email,
        subject: 'Your Xavier 300 Verification Code',
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
            <div style="background: #1a1a18; padding: 32px 40px; text-align: center;">
              <div style="display: inline-block; width: 40px; height: 40px; background: #f97316; border-radius: 8px; line-height: 40px; font-size: 22px; font-weight: 900; color: white; margin-bottom: 16px;">X</div>
              <h1 style="color: #ffffff; font-size: 22px; margin: 0; letter-spacing: -0.5px;">Xavier 300</h1>
            </div>
            <div style="padding: 40px;">
              <h2 style="color: #111827; font-size: 20px; margin: 0 0 8px;">Verify your email address</h2>
              <p style="color: #6b7280; font-size: 15px; margin: 0 0 32px; line-height: 1.6;">
                Use the code below to verify your Xavier 300 account. This code is valid for <strong>15 minutes</strong>.
              </p>
              <div style="background: #f9fafb; border: 2px dashed #e5e7eb; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
                <div style="font-size: 42px; font-weight: 900; letter-spacing: 10px; color: #f97316; font-family: monospace;">${otp}</div>
              </div>
              <p style="color: #9ca3af; font-size: 13px; margin: 0;">
                If you did not create a Xavier 300 account, you can safely ignore this email.
              </p>
            </div>
            <div style="background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 40px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Xavier 300. Nigeria's #1 Tech Certification Platform.</p>
            </div>
          </div>
        `,
      });
      console.log(`[EMAIL OK] Verification email sent to ${email}. Resend ID: ${(result as any)?.data?.id || 'unknown'}`);
    } catch (error: any) {
      console.error(`[EMAIL ERROR] Failed to send verification email to ${email}:`, error?.message || error);
      throw new Error(`Failed to send verification email: ${error?.message || error}`);
    }
  },

  async sendPasswordResetEmail(email: string, token: string) {
    const fromEmail = process.env.EMAIL_FROM || 'noreply@xavier300.com.ng';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/reset-password?token=${token}`;
    
    try {
      const client = getResendClient();
      if (!client) {
        console.warn('Email not sent - Resend not configured');
        return;
      }
      await client.emails.send({
        from: `Xavier 300 <${fromEmail}>`,
        to: email,
        subject: 'Reset your Xavier 300 Password',
        html: `<p>Click the link below to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p>`,
      });
    } catch (error) {
      console.error('Error sending reset email:', error);
    }
  }
};
