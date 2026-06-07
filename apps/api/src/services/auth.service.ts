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
        console.warn('Email not sent - Resend not configured');
        return;
      }
      await client.emails.send({
        from: `Xavier 300 <${fromEmail}>`,
        to: email,
        subject: 'Verify your Xavier 300 Account',
        html: `<p>Welcome to Xavier 300!</p><p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 15 minutes.</p>`,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send verification email: ${error}`);
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
