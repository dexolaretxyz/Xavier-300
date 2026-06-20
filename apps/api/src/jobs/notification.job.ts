import { Queue, Worker, Job } from 'bullmq';
import prisma from '../lib/db';
import { notificationService } from '../services/notification.service';
import IORedis from 'ioredis';

const isLocal = !process.env.RAILWAY_ENVIRONMENT && !process.env.RAILWAY_STATIC_URL;
const isInternalRedis = process.env.REDIS_URL?.includes('railway.internal');
const redisUrl = (process.env.REDIS_URL && !(isLocal && isInternalRedis)) ? process.env.REDIS_URL : undefined;
const hasRedis = !!redisUrl;

const connection = hasRedis ? new IORedis(redisUrl as string, {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    if (times > 3) return null; // Stop retrying after 3 attempts
    return Math.min(times * 50, 2000);
  }
}) : null;

if (connection) {
  connection.on('error', (err) => {
    console.error('Redis connection error:', err.message);
  });
}

// Queue for scheduling the daily notification sweep
export const notificationSweepQueue = connection ? new Queue('notification-sweep', { connection: connection as any }) : null;
if (notificationSweepQueue) {
  notificationSweepQueue.on('error', (err) => {
    console.error('notificationSweepQueue error:', err.message);
  });
}

// Queue for individual user notifications
export const userNotificationQueue = connection ? new Queue('user-notification', { connection: connection as any }) : null;
if (userNotificationQueue) {
  userNotificationQueue.on('error', (err) => {
    console.error('userNotificationQueue error:', err.message);
  });
}

/**
 * Worker that runs once a day (e.g., at midnight) to schedule individual
 * jobs for each user at their preferred `notificationTime`.
 */
export const sweepWorker = connection ? new Worker('notification-sweep', async () => {
  console.log('Starting daily notification sweep...');
  
  const users = await prisma.user.findMany({
    where: {
      notificationsEnabled: true,
      role: 'STUDENT',
      // only check active or trial users
      subscriptionStatus: { in: ['ACTIVE' as any, 'FREE_TRIAL' as any, 'SUBSCRIBED' as any] }
    },
    select: { id: true, email: true, notificationTime: true, fullName: true }
  });

  for (const user of users) {
    // Schedule a job for the specific time today
    const [hours, minutes] = (user.notificationTime || '09:00').split(':').map(Number);
    
    const now = new Date();
    const scheduledTime = new Date(
      now.getFullYear(), 
      now.getMonth(), 
      now.getDate(), 
      hours, 
      minutes, 
      0
    );

    // If the time has already passed today, skip or schedule for tomorrow
    if (scheduledTime.getTime() > now.getTime()) {
      const delay = scheduledTime.getTime() - now.getTime();
      
      await userNotificationQueue?.add('send-reminder', {
        userId: user.id,
        email: user.email,
        name: user.fullName
      }, { delay });
    }
  }
  
  console.log(`Scheduled reminders for ${users.length} users.`);
}, { connection: connection as any }) : null;

if (sweepWorker) {
  sweepWorker.on('error', (err) => {
    console.error('sweepWorker error:', err.message);
  });
}

/**
 * Worker that executes the actual individual notification job
 * It checks if the user has already practiced today before sending.
 */
export const userWorker = connection ? new Worker('user-notification', async (job: Job) => {
  const { userId, email, name } = job.data;

  // Check if they took an exam today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const examsToday = await prisma.examAttempt.count({
    where: {
      userId,
      createdAt: { gte: startOfDay }
    }
  });

  if (examsToday === 0) {
    const title = 'Time to Practice! 📚';
    const body = `Hi ${name.split(' ')[0]}, you haven't taken a mock exam today. Keep your streak alive!`;
    
    await notificationService.sendReminder(userId, email, title, body);
    console.log(`Sent reminder to ${email}`);
  } else {
    console.log(`Skipped reminder for ${email} (already practiced)`);
  }
}, { connection: connection as any }) : null;

if (userWorker) {
  userWorker.on('error', (err) => {
    console.error('userWorker error:', err.message);
  });
}

/**
 * Initializes the BullMQ repeatable job.
 * Runs every day at 00:05 (5 minutes past midnight) to schedule the day's reminders.
 */
export const initNotificationJobs = async () => {
  if (!notificationSweepQueue) {
    console.log('Redis is not configured. Notification jobs are disabled.');
    return;
  }
  
  await notificationSweepQueue.add('daily-sweep', {}, {
    repeat: {
      pattern: '5 0 * * *' // 00:05 AM every day
    }
  });
  console.log('🕒 Daily Notification Sweep Job scheduled (Cron: 5 0 * * *)');
};
