import dotenv from 'dotenv';
import path from 'path';

// Load root .env (for shared variables like DATABASE_URL)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
// Load API-specific .env (for JWT_SECRET, PORT, etc.)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('DEBUG DATABASE_URL:', process.env.DATABASE_URL);

// Catch uncaught errors to prevent silent crashes on Railway
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

import express from 'express';
import * as Sentry from '@sentry/node';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { authRouter } from './routes/auth.routes';
import domainRoutes from './routes/domain.routes';
import userRoutes from './routes/user.routes';
import examRoutes from './routes/exam.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import paymentRoutes from './routes/payment.routes';
import questionRoutes from './routes/question.routes';
import ticketRoutes from './routes/ticket.routes';
import adminRoutes from './routes/admin.routes';
import { initLeaderboardJob } from './jobs/leaderboard.job';
import { initNotificationJobs } from './jobs/notification.job';
import { initDailyResetJob } from './jobs/daily-reset.job';

const app = express();
app.set('trust proxy', 1); // Trust Railway's reverse proxy (fixes rate limit error)
const PORT = process.env.PORT || 4000;

// Initialize Sentry safely — profiling uses native bindings that can crash on some platforms
try {
  const sentryDsn = process.env.SENTRY_DSN;
  if (sentryDsn && sentryDsn !== 'YOUR_SENTRY_DSN') {
    let integrations: any[] = [];
    try {
      const { nodeProfilingIntegration } = require('@sentry/profiling-node');
      integrations.push(nodeProfilingIntegration());
    } catch (e) {
      console.warn('[SENTRY] Profiling integration unavailable, skipping.');
    }
    Sentry.init({
      dsn: sentryDsn,
      integrations,
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
    });
    console.log('[SENTRY] Initialized successfully.');
  } else {
    console.log('[SENTRY] No valid DSN configured, skipping initialization.');
  }
} catch (err: any) {
  console.error('[SENTRY] Failed to initialize:', err.message);
}

// Initialize Cron Jobs
initLeaderboardJob();
initDailyResetJob();

// Middleware
app.use(compression());
app.use(helmet());
app.use(cors({ origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 100,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests to auth endpoints. Please try again later.' } }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Xavier 300 API is running' });
});

// Routes — MUST be mounted here
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/domains', domainRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// Sentry Error Handler (must be before other error handlers)
Sentry.setupExpressErrorHandler(app);

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
});

import { seedProductionClasptek } from './seed-production';

if (require.main === module) {
  const serverPort = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;
  app.listen(serverPort, '0.0.0.0', () => {
    console.log(`Xavier 300 API running on port ${serverPort} and bound to 0.0.0.0`);
    
    // Run production seed check for Clasptek_ Mock
    seedProductionClasptek().catch(err => {
      console.error('Failed to run production clasptek seed on startup:', err);
    });

    // Initialize node-cron jobs
    initLeaderboardJob();
    initDailyResetJob();
    initNotificationJobs();
  });
}

export default app;
