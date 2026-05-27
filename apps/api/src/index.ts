import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';

dotenv.config({ path: '../../.env' }); // Load root .env

const app = express();
const PORT = process.env.PORT || 4000;

// Security and utility middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Rate limitings
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per IP
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests to auth endpoints. Please try again later.' } }
});

// Routes
app.use('/auth', authLimiter, authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Xavier 300 API is running on http://localhost:${PORT}`);
  });
}

export default app;
