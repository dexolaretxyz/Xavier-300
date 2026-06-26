import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_do_not_use_in_prod';

// Lazy initialise — only creates client when needed
function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === 're_your_key_here' || apiKey.startsWith('re_your_key')) {
    console.warn('[EMAIL SKIP] RESEND_API_KEY is not set or is a placeholder — emails will be mocked.');
    return null;
  }
  return new Resend(apiKey);
}

// Magic Link Verification Email
async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                 'https://xavier-300.vercel.app'
  
  // Magic link — clicking this verifies the email
  const verifyLink = `${appUrl}/verify?token=${token}&email=${encodeURIComponent(email)}`
  
  console.log('[VERIFY EMAIL] Sending to:', email)
  console.log('[VERIFY EMAIL] Link:', verifyLink)
  
  try {
    const resend = getResendClient()
    const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev'
    
    if (!resend) {
      console.log('[VERIFY EMAIL] (MOCKED) Sending to:', email)
      console.log('[VERIFY EMAIL] Link:', verifyLink)
      return
    }
    
    const { data, error } = await resend.emails.send({
      from: `Xavier 300 <${fromEmail}>`,
      to: [email],
      subject: 'Verify your Xavier 300 account',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" 
                content="width=device-width,initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;
                     background:#F5F2EC;
                     font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="background:#F5F2EC;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="520" cellpadding="0" cellspacing="0"
                       style="background:#FFFFFF;
                              border-radius:20px;
                              padding:48px 40px;
                              text-align:center;">
                  
                  <!-- Logo -->
                  <tr>
                    <td style="padding-bottom:24px;">
                      <div style="width:60px;height:60px;
                                  background:#3730A3;
                                  border-radius:50%;
                                  margin:0 auto;
                                  display:flex;
                                  align-items:center;
                                  justify-content:center;">
                        <span style="color:white;font-size:28px;
                                     font-weight:bold;
                                     line-height:60px;">X</span>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Heading -->
                  <tr>
                    <td style="padding-bottom:12px;">
                      <h1 style="color:#1A1A18;font-size:28px;
                                 font-weight:700;margin:0;">
                        Verify Your Email
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Body text -->
                  <tr>
                    <td style="padding-bottom:32px;">
                      <p style="color:#4A4A42;font-size:16px;
                                line-height:1.6;margin:0;">
                        Welcome to Xavier 300! Click the button 
                        below to verify your email address and 
                        get full access to all certification 
                        practice exams.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- CTA Button -->
                  <tr>
                    <td style="padding-bottom:32px;">
                      <a href="${verifyLink}"
                         style="display:inline-block;
                                background:#3730A3;
                                color:#FFFFFF;
                                padding:18px 48px;
                                border-radius:100px;
                                text-decoration:none;
                                font-size:18px;
                                font-weight:700;
                                letter-spacing:0.01em;">
                        ✅ Verify My Email
                      </a>
                    </td>
                  </tr>
                  
                  <!-- Expiry notice -->
                  <tr>
                    <td style="padding-bottom:24px;">
                      <p style="color:#8A8A7E;font-size:14px;
                                margin:0;">
                        ⏰ This link expires in 
                        <strong>24 hours</strong>.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Fallback link -->
                  <tr>
                    <td style="padding-bottom:24px;">
                      <p style="color:#8A8A7E;font-size:13px;
                                margin:0 0 8px;">
                        Button not working? Copy and paste 
                        this link into your browser:
                      </p>
                      <p style="margin:0;">
                        <a href="${verifyLink}"
                           style="color:#3730A3;font-size:12px;
                                  word-break:break-all;">
                          ${verifyLink}
                        </a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="border-top:1px solid #EDEAE2;
                               padding-top:24px;">
                      <p style="color:#8A8A7E;font-size:13px;
                                margin:0;">
                        If you did not create a Xavier 300 account,
                        you can safely ignore this email.
                      </p>
                      <p style="color:#8A8A7E;font-size:12px;
                                margin:8px 0 0;">
                        Xavier 300 · Practice like it is real. 
                        Pass like you prepared. 🇳🇬
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `Verify your Xavier 300 account

Click this link to verify your email:
${verifyLink}

This link expires in 24 hours.

If you did not create a Xavier 300 account, ignore this email.

Xavier 300 — Practice like it is real. Pass like you prepared.`
    })
    
    if (error) {
      console.error('[VERIFY EMAIL] Resend error:', 
        JSON.stringify(error))
      return
    }
    
    console.log('[VERIFY EMAIL] SUCCESS — ID:', data?.id)
  } catch (err: any) {
    console.error('[VERIFY EMAIL] Exception:', err?.message)
  }
}

// Password Reset Email
async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                 'https://xavier-300.vercel.app';
  const resetLink = `${appUrl}/reset-password?token=${resetToken}`;

  console.log('[RESET EMAIL] Sending to:', email);

  try {
    const resend = getResendClient();
    const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

    if (!resend) {
      console.log('[RESET EMAIL] (MOCKED) Sending reset link to:', email, '| Link:', resetLink);
      return;
    }

    const { data, error } = await resend.emails.send({
      from: `Xavier 300 <${fromEmail}>`,
      to: [email],
      subject: 'Reset Your Xavier 300 Password',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;
                     background:#F5F2EC;
                     font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="background:#F5F2EC;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="480" cellpadding="0" cellspacing="0"
                       style="background:#FFFFFF;border-radius:20px;
                              padding:40px;text-align:center;">
                  <tr>
                    <td style="padding-bottom:16px;font-size:48px;">
                      🔐
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <h1 style="color:#1A1A18;font-size:26px;
                                 font-weight:700;margin:0 0 12px;">
                        Reset Your Password
                      </h1>
                      <p style="color:#4A4A42;font-size:15px;
                                line-height:1.6;margin:0 0 28px;">
                        Click the button below to reset your 
                        Xavier 300 password. This link expires 
                        in 1 hour.
                      </p>
                      <a href="${resetLink}"
                         style="display:inline-block;
                                background:#3730A3;color:#FFFFFF;
                                padding:16px 40px;
                                border-radius:100px;
                                text-decoration:none;
                                font-size:16px;font-weight:600;
                                margin:0 0 24px;">
                        Reset Password
                      </a>
                      <p style="color:#8A8A7E;font-size:13px;
                                margin:0 0 28px;">
                        If the button doesn't work, copy this link:
                        <br/>
                        <a href="${resetLink}" 
                           style="color:#3730A3;word-break:break-all;">
                          ${resetLink}
                        </a>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="border-top:1px solid #EDEAE2;
                               padding-top:20px;">
                      <p style="color:#8A8A7E;font-size:12px;
                                margin:0;">
                        If you didn't request a password reset, 
                        ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `Reset your Xavier 300 password: ${resetLink}

This link expires in 1 hour.

If you did not request this, ignore this email.`
    });

    if (error) {
      console.error('[RESET EMAIL] Resend error:', error);
      return;
    }

    console.log('[RESET EMAIL] SUCCESS — ID:', data?.id);

  } catch (err: any) {
    console.error('[RESET EMAIL] Exception:', err?.message);
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

  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  },

  sendVerificationEmail,
  sendPasswordResetEmail
};
