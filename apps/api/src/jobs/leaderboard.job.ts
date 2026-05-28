import cron from 'node-cron';
import prisma from '../lib/db';

// Runs every Monday at 00:00 WAT (Africa/Lagos timezone)
export const initLeaderboardJob = () => {
  cron.schedule('0 0 * * 1', async () => {
    console.log('🏁 Starting Weekly Leaderboard Reset Job...');
    try {
      // Find the start of the week that just ended
      const now = new Date();
      // Since it runs right at Monday 00:00, the "current" week in JS terms is the new week.
      // So the week that just ended is the week of (now - 1 day)
      const dateLastWeek = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const day = dateLastWeek.getDay();
      const diff = dateLastWeek.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(dateLastWeek.setDate(diff));
      weekStart.setHours(0, 0, 0, 0);

      // 1. Fetch the Top 3 from the week that just ended
      const top3 = await prisma.weeklyScore.findMany({
        where: { weekStart },
        orderBy: { avgScore: 'desc' },
        take: 3
      });

      // 2. Archive the Top 3
      if (top3.length > 0) {
        const archives = top3.map((score, index) => ({
          weekStart: score.weekStart,
          userId: score.userId,
          rank: index + 1,
          avgScore: score.avgScore,
          examsCount: score.examsCount
        }));
        
        await prisma.leaderboardArchive.createMany({
          data: archives
        });
        console.log(`🏆 Archived top 3 users for week of ${weekStart.toISOString()}`);
      } else {
        console.log('No scores found to archive for the previous week.');
      }

      // 3. Reset (Delete) all WeeklyScore records to start fresh
      const deleteResult = await prisma.weeklyScore.deleteMany({
        where: { weekStart }
      });
      
      console.log(`🧹 Cleaned up ${deleteResult.count} weekly score records for the fresh week.`);
      console.log('✅ Weekly Leaderboard Reset Job completed successfully.');
    } catch (error) {
      console.error('❌ Error executing Weekly Leaderboard Reset Job:', error);
    }
  }, {
    timezone: "Africa/Lagos"
  });

  console.log('🕒 Weekly Leaderboard Job scheduled (Cron: 0 0 * * 1 @ Africa/Lagos)');
};
