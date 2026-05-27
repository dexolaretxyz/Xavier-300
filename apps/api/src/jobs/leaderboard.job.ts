import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '../../../../packages/db/index';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

export const leaderboardQueue = new Queue('leaderboard', { connection: connection as any });

export const initLeaderboardJob = async () => {
  // Remove existing repeatable jobs if they exist to avoid duplicates
  const repeatableJobs = await leaderboardQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await leaderboardQueue.removeRepeatableByKey(job.key);
  }

  // Add the job: Monday at 00:00 WAT (Africa/Lagos timezone)
  await leaderboardQueue.add('reset-weekly', {}, {
    repeat: {
      pattern: '0 0 * * 1',
      tz: 'Africa/Lagos'
    }
  });

  console.log('Leaderboard reset job scheduled for Monday 00:00 WAT');
};

const processLeaderboardReset = async (job: Job) => {
  console.log('Running leaderboard reset job...');
  try {
    // 1. Get top 3 of current week
    const top3 = await prisma.weeklyScore.findMany({
      orderBy: { avgScore: 'desc' },
      take: 3
    });

    if (top3.length > 0) {
      // 2. Archive them
      const weekStart = top3[0].weekStart;
      const archiveData = top3.map((score, index) => ({
        weekStart,
        userId: score.userId,
        rank: index + 1,
        avgScore: score.avgScore,
        examsCount: score.examsCount
      }));

      await prisma.leaderboardArchive.createMany({
        data: archiveData
      });
    }

    // 3. Delete all weekly scores to reset the board
    await prisma.weeklyScore.deleteMany({});
    
    console.log('Leaderboard reset successful.');
  } catch (error) {
    console.error('Failed to reset leaderboard:', error);
    throw error;
  }
};

export const leaderboardWorker = new Worker('leaderboard', processLeaderboardReset, { connection: connection as any });

leaderboardWorker.on('completed', job => {
  console.log(`${job.id} has completed!`);
});
leaderboardWorker.on('failed', (job, err) => {
  console.error(`${job?.id} has failed with ${err.message}`);
});
