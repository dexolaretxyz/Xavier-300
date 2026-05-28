import express from 'express';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
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

dotenv.config({ path: '../../.env' }); // Load root .env

const app = express();
const PORT = process.env.PORT || 4000;

Sentry.init({
  dsn: process.env.SENTRY_DSN || "YOUR_SENTRY_DSN",
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

// Initialize Cron Jobs
initLeaderboardJob();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Xavier 300 API running on port ${PORT}`);
    // Initialize node-cron jobs
    initLeaderboardJob();
    initNotificationJobs();
  });
}

export default app;
