"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Clock, Medal, Award, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Data Fetching Hooks ---
function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const [{ data: weekly }, { data: previous }] = await Promise.all([
        api.get('/api/leaderboard/weekly'),
        api.get('/api/leaderboard/previous')
      ]);
      return {
        weekly: weekly.data.leaderboard,
        currentUser: weekly.data.currentUser,
        previous: previous.data
      };
    }
  });
}

// --- Helper Components ---
const PodiumSpot = ({ rank, user, height, color, delay }: { rank: number, user: any, height: string, color: string, delay: number }) => {
  if (!user) return <div className={`w-1/3 flex flex-col justify-end opacity-30 ${height}`} />;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="w-1/3 flex flex-col items-center justify-end group"
    >
      <div className="text-center mb-4 z-10 relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
          {rank === 1 && <Crown />}
        </div>
        <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center font-display font-bold text-2xl shadow-lg border-4 ${
          rank === 1 ? 'bg-yellow-100 border-yellow-400 text-yellow-700' : 
          rank === 2 ? 'bg-slate-100 border-slate-300 text-slate-600' : 
          'bg-orange-100 border-orange-300 text-orange-700'
        }`}>
          {user.name.charAt(0)}
        </div>
        <h3 className="font-ui font-bold text-[var(--text-primary)] truncate max-w-[100px]">{user.name}</h3>
        <p className="font-mono text-[var(--accent-primary)] font-bold text-lg">{Math.round(user.avgScore)}%</p>
        <p className="text-xs text-[var(--text-muted)] font-ui">{user.examsCount} {user.examsCount === 1 ? 'exam' : 'exams'}</p>
      </div>
      
      <div className={`w-full rounded-t-xl ${height} ${color} relative overflow-hidden transition-all duration-300 group-hover:brightness-110`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-4 left-0 right-0 text-center font-display font-bold text-4xl text-black/20">{rank}</div>
      </div>
    </motion.div>
  );
};

const Crown = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500 fill-yellow-500 drop-shadow-md">
    <polygon points="2 20 22 20 19 6 15 12 12 4 9 12 5 6 2 20" />
  </svg>
);

export default function LeaderboardPage() {
  const { data, isLoading, error } = useLeaderboard();
  const [timeLeft, setTimeLeft] = useState('');

  // Countdown to Monday 00:00 WAT
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // Calculate next Monday at 00:00 WAT
      const nextMonday = new Date();
      nextMonday.setDate(now.getDate() + ((7 - now.getDay()) % 7 + 1));
      nextMonday.setHours(0, 0, 0, 0); // Local 00:00, roughly close enough for MVP, properly should use UTC+1
      
      // Better timezone handling for WAT (UTC+1)
      const nowUtc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const nowWat = new Date(nowUtc + (3600000));
      
      const days = nextMonday.getDay() === nowWat.getDay() ? 7 : (8 - nowWat.getDay()) % 7;
      
      const targetTime = new Date(nowWat);
      targetTime.setDate(nowWat.getDate() + days);
      targetTime.setHours(0, 0, 0, 0);

      const diff = targetTime.getTime() - nowWat.getTime();
      if (diff <= 0) return 'Resetting...';

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);

      return `${d}d ${h}h ${m}m`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return <div className="p-12 text-center font-ui text-[var(--text-secondary)]">Loading Leaderboard...</div>;
  }

  if (error || !data) {
    return <div className="p-12 text-center text-red-500">Failed to load leaderboard data.</div>;
  }

  const { weekly, currentUser, previous } = data;

  const top3 = [weekly[1], weekly[0], weekly[2]]; // Ordered for Podium: 2, 1, 3
  const restOfBoard = weekly.slice(3);

  return (
    <div className="max-w-5xl mx-auto space-y-16 py-8 px-6 pb-32">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="font-display font-bold text-4xl text-[var(--text-primary)] flex items-center gap-3">
            <Trophy className="text-yellow-500" size={36} /> Weekly Leaderboard
          </h1>
          <p className="font-ui text-[var(--text-secondary)] mt-2">Compete with other students. Ranked by weekly average score.</p>
        </div>
        <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-6 py-3 rounded-full flex items-center gap-3 shadow-sm">
          <Clock size={18} className="text-[var(--accent-primary)]" />
          <span className="font-ui font-medium text-[var(--text-secondary)]">Resets in:</span>
          <span className="font-mono font-bold text-[var(--text-primary)]">{timeLeft}</span>
        </div>
      </div>

      {/* TOP 3 PODIUM */}
      {weekly.length > 0 ? (
        <div className="pt-16 pb-8 border-b border-[var(--border-subtle)]">
          <div className="max-w-2xl mx-auto flex items-end justify-center h-80 gap-2 md:gap-4">
            <PodiumSpot rank={2} user={top3[0]} height="h-32" color="bg-slate-200 dark:bg-slate-700" delay={0.2} />
            <PodiumSpot rank={1} user={top3[1]} height="h-48" color="bg-yellow-300 dark:bg-yellow-600" delay={0.4} />
            <PodiumSpot rank={3} user={top3[2]} height="h-24" color="bg-orange-200 dark:bg-orange-800" delay={0.6} />
          </div>
        </div>
      ) : (
        <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-12 text-center">
          <Medal size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
          <h3 className="font-display font-bold text-xl text-[var(--text-primary)] mb-2">A New Week Begins!</h3>
          <p className="font-ui text-[var(--text-secondary)]">Be the first to take an exam and claim the #1 spot.</p>
        </div>
      )}

      {/* FULL RANKINGS TABLE (#4 - #20) */}
      {restOfBoard.length > 0 && (
        <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left font-ui">
            <thead className="bg-[var(--bg-secondary)] text-[var(--text-muted)] text-xs uppercase tracking-wider font-bold border-b border-[var(--border-subtle)]">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4 text-right">Avg Score</th>
                <th className="px-6 py-4 text-right hidden sm:table-cell">Exams Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {restOfBoard.map((user: any) => (
                <tr key={user.userId} className={`hover:bg-[var(--bg-hover)] transition-colors ${currentUser?.userId === user.userId ? 'bg-[var(--accent-light)]/20' : ''}`}>
                  <td className="px-6 py-4 font-mono font-bold text-[var(--text-secondary)]">#{user.rank}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center font-bold text-[var(--text-primary)] text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-medium text-[var(--text-primary)]">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-[var(--text-primary)]">{Math.round(user.avgScore)}%</td>
                  <td className="px-6 py-4 text-right text-[var(--text-secondary)] hidden sm:table-cell">{user.examsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PREVIOUS CHAMPIONS */}
      {previous.length > 0 && (
        <div className="pt-8">
          <h2 className="font-ui font-bold text-2xl text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <Award className="text-[var(--accent-primary)]" /> Previous Week Champions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {previous.map((champ: any) => (
              <div key={champ.userId} className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-lg border-2 ${
                  champ.rank === 1 ? 'bg-yellow-50 border-yellow-400 text-yellow-700' : 
                  champ.rank === 2 ? 'bg-slate-50 border-slate-300 text-slate-600' : 
                  'bg-orange-50 border-orange-300 text-orange-700'
                }`}>
                  #{champ.rank}
                </div>
                <div>
                  <h4 className="font-ui font-bold text-[var(--text-primary)]">{champ.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-sm font-bold text-[var(--accent-primary)]">{Math.round(champ.avgScore)}%</span>
                    <span className="text-xs text-[var(--text-muted)]">• {champ.examsCount} exams</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CURRENT USER STICKY ROW */}
      {currentUser && (
        <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-primary)] border-t border-[var(--border-subtle)] p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 md:left-64">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center font-display font-bold text-xl shadow-md">
                {currentUser.rank !== '-' ? `#${currentUser.rank}` : '-'}
              </div>
              <div>
                <h4 className="font-ui font-bold text-[var(--text-primary)]">Your Current Rank</h4>
                <p className="text-sm font-ui text-[var(--text-secondary)]">
                  {currentUser.rank !== '-' ? `You are #${currentUser.rank} out of everyone this week.` : 'Take an exam to get placed on the leaderboard!'}
                </p>
              </div>
            </div>
            
            {currentUser.rank !== '-' && (
              <div className="text-right flex items-center gap-6">
                <div className="hidden sm:block">
                  <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold">Avg Score</div>
                  <div className="font-mono font-bold text-xl text-[var(--text-primary)]">{Math.round(currentUser.avgScore)}%</div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold">Exams</div>
                  <div className="font-mono font-bold text-xl text-[var(--text-primary)]">{currentUser.examsCount}</div>
                </div>
                <Flame className="text-orange-500 animate-pulse" size={28} />
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
