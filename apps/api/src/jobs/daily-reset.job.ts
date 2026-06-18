import cron from 'node-cron';
import redis from '../lib/redis';

export const initDailyResetJob = () => {
  // Runs at 00:00 WAT = 23:00 UTC
  cron.schedule('0 23 * * *', async () => {
    console.log('Daily question cache reset — new questions will be served for today');
    try {
      // Clear all daily question caches from Redis
      const keys = await redis.keys('daily-questions:*');
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`Cleared ${keys.length} question cache entries`);
      }
      
      // Reset daily attempt counters
      const attemptKeys = await redis.keys('daily-attempts:*');
      if (attemptKeys.length > 0) {
        await redis.del(...attemptKeys);
        console.log(`Reset ${attemptKeys.length} daily attempt counters`);
      }
      
      console.log('Daily reset complete');
    } catch (err: any) {
      console.error('Error running daily question cache reset:', err);
    }
  }, {
    timezone: 'Africa/Lagos'
  });

  console.log('🕒 Daily Reset Job scheduled (Cron: 0 23 * * * @ Africa/Lagos)');
};
