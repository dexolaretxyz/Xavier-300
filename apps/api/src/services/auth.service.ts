import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_do_not_use_in_prod';

// ---------------------------------------------------------------------------
// Email transport — Gmail SMTP / General SMTP support
// ---------------------------------------------------------------------------
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

if (!smtpUser || !smtpPass) {
  console.warn('[EMAIL] GMAIL_USER/SMTP_USER or GMAIL_APP_PASSWORD/SMTP_PASS not set — emails will not be sent.');
}

const transporter = (smtpUser && smtpPass)
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 10000, // 10 seconds max timeout
      greetingTimeout: 10000,
      tls: { rejectUnauthorized: false }, // Useful fallback if certificates act up
      pool: true,
      maxConnections: 5, // Allow slightly more connections in global pool
      maxMessages: 100,
      family: 4 // Fix ENETUNREACH error on Railway (force IPv4)
    } as nodemailer.TransportOptions)
  : null;

// Shared branded HTML email template
function buildEmailHtml(title: string, bodyHtml: string): string {
  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#1a1a18;padding:32px 40px;text-align:center;">
        <div style="display:inline-block;width:44px;height:44px;background:#f97316;border-radius:10px;line-height:44px;font-size:24px;font-weight:900;color:white;margin-bottom:12px;">X</div>
        <h1 style="color:#ffffff;font-size:22px;margin:0;letter-spacing:-0.5px;">Xavier 300</h1>
        <p style="color:#9ca3af;font-size:13px;margin:6px 0 0;">Nigeria's #1 Tech Certification Practice Platform</p>
      </div>
      <div style="padding:40px;">
        <h2 style="color:#111827;font-size:20px;margin:0 0 16px;">${title}</h2>
        ${bodyHtml}
      </div>
      <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} Xavier 300. All rights reserved.</p>
      </div>
    </div>
  `;
}

export async function sendVerificationEmail(email: string, otp: string) {
  const fromEmail = smtpUser || 'no-reply@xavier300';

  console.log(`Attempting to send OTP via Nodemailer to: ${email}`);
  console.log(`SMTP User present: ${!!smtpUser}`);

  if (!transporter) {
    console.warn(`[EMAIL SKIP] Gmail/SMTP not configured. OTP for ${email} is: ${otp}`);
    return;
  }

  const html = buildEmailHtml(
    'Verify your email address',
    `
      <p style="color:#6b7280;font-size:15px;margin:0 0 28px;line-height:1.7;">
        Welcome to Xavier 300! Use the verification code below to activate your account.
        This code is valid for <strong>1 hour</strong>.
      </p>
      <div style="background:#f9fafb;border:2px dashed #e5e7eb;border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;">
        <div style="font-size:48px;font-weight:900;letter-spacing:12px;color:#f97316;font-family:monospace;">${otp}</div>
      </div>
      <p style="color:#9ca3af;font-size:13px;margin:0;">
        If you did not create a Xavier 300 account, you can safely ignore this email.
      </p>
    `
  );

  try {
    const info = await transporter.sendMail({
      from: `Xavier 300 <${fromEmail}>`,
      to: email,
      subject: 'Your Xavier 300 Verification Code',
      html,
    });
    console.log(`SUCCESS — Message ID: ${info.messageId}`);
    console.log(`[EMAIL OK] OTP sent to ${email}. Message ID: ${info.messageId}`);
  } catch (error: any) {
    console.error(`[EMAIL ERROR] Failed to send OTP to ${email}:`, error?.message || error);
    // Don't throw — the OTP is stored in DB, user can request resend later
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const fromEmail = smtpUser || 'no-reply@xavier300';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://xavier-300.vercel.app';
  const resetLink = `${appUrl}/reset-password?token=${token}`;

  if (!transporter) {
    console.warn(`[EMAIL SKIP] Gmail not configured. Reset link for ${email}: ${resetLink}`);
    return;
  }

  const html = buildEmailHtml(
    'Reset your password',
    `
      <p style="color:#6b7280;font-size:15px;margin:0 0 28px;line-height:1.7;">
        We received a request to reset your Xavier 300 password. Click the button below to create a new password.
        This link expires in <strong>1 hour</strong>.
      </p>
      <div style="text-align:center;margin-bottom:28px;">
        <a href="${resetLink}"
          style="display:inline-block;background:#f97316;color:white;text-decoration:none;padding:14px 36px;border-radius:100px;font-weight:700;font-size:16px;">
          Reset Password
        </a>
      </div>
      <p style="color:#9ca3af;font-size:13px;margin:0;">
        If you did not request a password reset, please ignore this email. Your password will not change.
      </p>
    `
  );

  try {
    const info = await transporter.sendMail({
      from: `Xavier 300 <${fromEmail}>`,
      to: email,
      subject: 'Reset your Xavier 300 Password',
      html,
    });
    console.log(`[EMAIL OK] Password reset email sent to ${email}. Message ID: ${info.messageId}`);
  } catch (error: any) {
    console.error(`[EMAIL ERROR] Failed to send reset email to ${email}:`, error?.message || error);
  }
}

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
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  sendVerificationEmail,
  sendPasswordResetEmail
};
