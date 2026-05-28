import { PrismaClient } from '../../packages/db';
const prisma = new PrismaClient();

async function run() {
  try {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);

    const top20 = await prisma.weeklyScore.findMany({
      where: { weekStart },
      orderBy: { avgScore: 'desc' },
      take: 20,
      include: { user: { select: { fullName: true, id: true } } }
    });
    console.log("top20:", top20);
    
    const formattedTop20 = top20.map((score, index) => {
      const names = score.user.fullName.split(' ');
      const firstName = names[0];
      const lastInitial = names.length > 1 ? `${names[names.length - 1][0]}.` : '';
      return { rank: index + 1, userId: score.userId, name: `${firstName} ${lastInitial}`.trim(), avgScore: score.avgScore, examsCount: score.examsCount };
    });
    console.log("formatted:", formattedTop20);
    
    console.log("Done.");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
