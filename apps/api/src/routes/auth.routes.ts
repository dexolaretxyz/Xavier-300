import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/db';
import { authService } from '../services/auth.service';
import jwt from 'jsonwebtoken';

const router = Router();

// Zod Schemas
const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(10, 'Phone number must be valid'),
  state: z.string().min(2, 'State is required'),
  occupation: z.string().min(2, 'Occupation is required'),
  yearsExperience: z.number().min(0, 'Years of experience cannot be negative')
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// Routes
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = signupSchema.parse(req.body);
    
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      if (
        !existingUser.emailVerified && 
        existingUser.tokenExpiresAt && 
        new Date() > existingUser.tokenExpiresAt &&
        new Date().getTime() - existingUser.createdAt.getTime() 
        > 24 * 60 * 60 * 1000
      ) {
        // Delete the stuck account and continue with signup
        await prisma.user.delete({ where: { id: existingUser.id } });
      } else if (!existingUser.emailVerified) {
        res.status(400).json({
          success: false,
          error: {
            code: 'EMAIL_UNVERIFIED_EXISTS',
            message: 'An account with this email exists but is not verified. Please check your email for the verification link.',
            canResend: true,
            email: data.email
          }
        });
        return;
      } else {
        res.status(400).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'An account with this email already exists. Please login instead.',
            canLogin: true
          }
        });
        return;
      }
    }

    const passwordHash = await authService.hashPassword(data.password);
    const token = authService.generateVerificationToken();
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        phone: data.phone,
        state: data.state,
        occupation: data.occupation,
        yearsExperience: data.yearsExperience,
        verificationToken: token,
        tokenExpiresAt,
        // PAYMENT_DISABLED: Changed from FREE_TRIAL to SUBSCRIBED
        subscriptionStatus: 'SUBSCRIBED',
        subscriptionEndsAt: new Date('2030-12-31')
      }
    });

    // Fire and forget email dispatch to eliminate latency
    authService.sendVerificationEmail(user.email, token).catch((e) => console.error('[EMAIL DISPATCH]', e));

    res.status(201).json({ success: true, message: 'User created. Please check your email for the verification link.' });
  } catch (error: any) {
    console.error('[SIGNUP ERROR]', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: (error as any).errors } });
    } else {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create user' } });
    }
  }
});

router.get('/verify-email', async (req: Request, res: Response): Promise<any> => {
  const { token, email } = req.query as { 
    token: string, 
    email: string 
  }
  
  if (!token || !email) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_PARAMS', 
               message: 'Token and email are required' }
    })
  }
  
  const user = await prisma.user.findUnique({
    where: { email }
  })
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User not found' }
    })
  }
  
  if (user.emailVerified) {
    return res.status(400).json({
      success: false,
      error: { code: 'ALREADY_VERIFIED', 
               message: 'Email already verified' }
    })
  }
  
  if (user.verificationToken !== token) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_TOKEN', 
               message: 'Invalid or expired verification link' }
    })
  }
  
  if (user.tokenExpiresAt && new Date() > user.tokenExpiresAt) {
    return res.status(400).json({
      success: false,
      error: { code: 'TOKEN_EXPIRED', 
               message: 'Verification link has expired. Request a new one.' }
    })
  }
  
  // Mark as verified
  await prisma.user.update({
    where: { email },
    data: {
      emailVerified: true,
      verificationToken: null,
      tokenExpiresAt: null,
      trialStartedAt: new Date(),
      subscriptionStatus: 'SUBSCRIBED',
      subscriptionEndsAt: new Date('2030-12-31')
    }
  })
  
  // Generate tokens for auto-login
  const { accessToken, refreshToken } = authService.generateTokens(
    user.id, 
    user.role
  )
  
  return res.json({
    success: true,
    message: 'Email verified successfully',
    data: { accessToken, refreshToken, user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      subscriptionStatus: 'SUBSCRIBED'
    }}
  })
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        emailVerified: true,
        role: true,
        fullName: true,
        subscriptionStatus: true,
        trialStartedAt: true,
        subscriptionEndsAt: true
      }
    });
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
      return;
    }

    const isValid = await authService.comparePassword(data.password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
      return;
    }

    if (!user.emailVerified) {
      res.status(403).json({ success: false, error: { code: 'UNVERIFIED_EMAIL', message: 'Please verify your email first' } });
      return;
    }

    const tokens = authService.generateTokens(user.id, user.role);

    res.json({ success: true, data: { tokens, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, subscriptionStatus: user.subscriptionStatus } } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.message } });
  }
});

router.post('/refresh', (req: Request, res: Response): void => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ success: false, error: { code: 'MISSING_TOKEN', message: 'Refresh token is required' } });
    return;
  }

  try {
    const secret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_do_not_use_in_prod';
    const decoded = jwt.verify(refreshToken, secret) as { userId: string; role: string };
    
    // Generate new access token
    const accessToken = jwt.sign({ userId: decoded.userId, role: decoded.role }, process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod', { expiresIn: '15m' });
    
    res.json({ success: true, data: { accessToken } });
  } catch (error) {
    res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired refresh token' } });
  }
});

router.post('/resend-verification', async (req: Request, res: Response): Promise<any> => {
  try {
    const email = z.string().email().parse(req.body.email);
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Email not found' }
      });
    }
    
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_VERIFIED', message: 'Email already verified' }
      });
    }

    const token = authService.generateVerificationToken();
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: token, tokenExpiresAt }
    });

    // Fire and forget email dispatch
    authService.sendVerificationEmail(user.email, token).catch((e) => console.error('[EMAIL DISPATCH]', e));

    res.json({ success: true, message: 'Verification email sent. Check your inbox.' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.message } });
  }
});

router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const email = z.string().email().parse(req.body.email);
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (user) {
      const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
      // Fire and forget password reset email
      authService.sendPasswordResetEmail(user.email, resetToken).catch((e) => console.error('[EMAIL DISPATCH]', e));
    }

    // Always return success to prevent email enumeration
    res.json({ success: true, message: 'If the email exists, a password reset link has been sent.' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.message } });
  }
});

router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = z.object({
      token: z.string(),
      newPassword: z.string().min(8)
    }).parse(req.body);

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { userId: string };
    const passwordHash = await authService.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { passwordHash }
    });

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'INVALID_REQUEST', message: 'Invalid token or password format' } });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  // Client should clear the refresh token and access token on their end.
  // To strictly invalidate a refresh token on server, we would need a token blacklist or Redis.
  // For now, we return success.
  res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/debug-email', async (req: Request, res: Response): Promise<any> => {
  const apiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;
  
  return res.json({
    hasResendKey: !!apiKey,
    keyPrefix: apiKey ? apiKey.substring(0, 10) : null,
    emailFrom: emailFrom,
    nodeEnv: process.env.NODE_ENV
  });
});

export const authRouter = router;
