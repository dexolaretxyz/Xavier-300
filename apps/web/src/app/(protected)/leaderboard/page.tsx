"use client";

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Trophy, Medal, Award, Star, History, ArrowUpRight } from 'lucide-react';
import { differenceInHours, differenceInDays, nextMonday } from 'date-fns';

export default function LeaderboardPage() {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      let nextReset = nextMonday(now);
      nextReset.setHours(0, 0, 0, 0);

      const days = differenceInDays(nextReset, now);
      const hours = differenceInHours(nextReset, now) % 24;

      if (days === 0 && hours === 0) {
        setCountdown('Resets soon');
      } else {
        setCountdown(`${days}d ${hours}h`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000 * 60 * 60); // Update every hour
    return () => clearInterval(interval);
  }, []);

  const { data: weeklyData, isLoading: isLoadingWeekly } = useQuery({
    queryKey: ['leaderboard', 'weekly'],
    queryFn: async () => {
      const res = await api.get('/leaderboard/weekly');
      return res.data.data;
    }
  });

  const { data: previousData, isLoading: isLoadingPrevious } = useQuery({
    queryKey: ['leaderboard', 'previous'],
    queryFn: async () => {
      const res = await api.get('/leaderboard/previous');
      return res.data.data;
    }
  });

  if (isLoadingWeekly || isLoadingPrevious) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-[var(--text-secondary)]">
        Loading Leaderboard...
      </div>
    );
  }

  const leaderboard = weeklyData?.leaderboard || [];
  const currentUser = weeklyData?.currentUser;
  const champions = previousData?.champions || [];

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3, 20);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-20">
      
      {/* Header */}
      <div className="bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] px-6 py-10 text-center">
        <h1 className="text-4xl font-display font-bold text-[var(--text-primary)] mb-4">
          Weekly Leaderboard
        </h1>
        <div className="inline-flex items-center gap-2 bg-[var(--bg-secondary)] px-4 py-2 rounded-full border border-[var(--border-subtle)]">
          <History size={16} className="text-[var(--text-secondary)]" />
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            Resets in <strong className="text-[var(--text-primary)]">{countdown}</strong>
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        
        {/* Podium (Top 3) */}
        {top3.length > 0 ? (
          <section>
            <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 min-h-[300px]">
              {/* Silver (Rank 2) */}
              {top3[1] && (
                <div className="flex flex-col items-center w-full md:w-1/3 order-2 md:order-1">
                  <div className="mb-4 text-center">
                    <Medal size={40} className="text-gray-400 mx-auto mb-2" />
                    <h3 className="font-bold text-lg text-[var(--text-primary)]">{top3[1].name}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{top3[1].avgScore.toFixed(1)}% Avg</p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-t-2xl border-t border-x border-[var(--border-subtle)] h-32 flex items-center justify-center">
                    <span className="text-4xl font-black text-gray-400 opacity-50">2</span>
                  </div>
                </div>
              )}

              {/* Gold (Rank 1) */}
              {top3[0] && (
                <div className="flex flex-col items-center w-full md:w-1/3 order-1 md:order-2 z-10 -mt-8 md:mt-0">
                  <div className="mb-4 text-center relative">
                    <Trophy size={56} className="text-yellow-400 mx-auto mb-2 drop-shadow-md" />
                    <h3 className="font-bold text-xl text-[var(--text-primary)]">{top3[0].name}</h3>
                    <p className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{top3[0].avgScore.toFixed(1)}% Avg</p>
                  </div>
                  <div className="w-full bg-yellow-100 dark:bg-yellow-900/30 rounded-t-2xl border-t-2 border-x-2 border-yellow-400/50 h-40 flex items-center justify-center shadow-lg">
                    <span className="text-5xl font-black text-yellow-500 opacity-50">1</span>
                  </div>
                </div>
              )}

              {/* Bronze (Rank 3) */}
              {top3[2] && (
                <div className="flex flex-col items-center w-full md:w-1/3 order-3 md:order-3">
                  <div className="mb-4 text-center">
                    <Award size={40} className="text-amber-600 mx-auto mb-2" />
                    <h3 className="font-bold text-lg text-[var(--text-primary)]">{top3[2].name}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{top3[2].avgScore.toFixed(1)}% Avg</p>
                  </div>
                  <div className="w-full bg-orange-100 dark:bg-orange-900/20 rounded-t-2xl border-t border-x border-orange-300/30 h-24 flex items-center justify-center">
                    <span className="text-4xl font-black text-amber-700 opacity-50">3</span>
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-[var(--border-subtle)] rounded-2xl">
            <Star className="mx-auto text-[var(--text-secondary)] mb-4" size={32} />
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No scores yet this week</h3>
            <p className="text-[var(--text-secondary)]">Take an exam to claim the #1 spot!</p>
          </div>
        )}

        {/* Current User Row */}
        {currentUser && (
          <section>
            <div className="bg-[var(--accent-primary)]/10 border-2 border-[var(--accent-primary)]/30 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center font-black">
                  #{currentUser.rank}
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)]">You ({currentUser.name})</h4>
                  <p className="text-sm text-[var(--text-secondary)]">{currentUser.examsCount} Exams Taken</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-[var(--accent-primary)]">{currentUser.avgScore.toFixed(1)}%</div>
                <div className="text-xs font-bold uppercase text-[var(--text-secondary)]">Avg Score</div>
              </div>
            </div>
          </section>
        )}

        {/* Ranked List (#4 - #20) */}
        {rest.length > 0 && (
          <section>
            <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] text-[var(--text-secondary)] text-sm uppercase tracking-wider">
                      <th className="py-4 px-6 font-bold">Rank</th>
                      <th className="py-4 px-6 font-bold">Candidate</th>
                      <th className="py-4 px-6 font-bold">Exams</th>
                      <th className="py-4 px-6 font-bold text-right">Avg Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {rest.map((user: any) => (
                      <tr 
                        key={user.userId} 
                        className={`transition-colors hover:bg-[var(--bg-secondary)] ${user.userId === currentUser?.userId ? 'bg-[var(--accent-primary)]/5' : ''}`}
                      >
                        <td className="py-4 px-6 font-mono font-bold text-[var(--text-secondary)]">#{user.rank}</td>
                        <td className="py-4 px-6 font-medium text-[var(--text-primary)]">{user.name}</td>
                        <td className="py-4 px-6 text-[var(--text-secondary)]">{user.examsCount}</td>
                        <td className="py-4 px-6 font-bold text-right text-[var(--text-primary)]">{user.avgScore.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Previous Week Champions */}
        {champions.length > 0 && (
          <section className="pt-8 border-t border-[var(--border-subtle)]">
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <History className="text-[var(--text-secondary)]" />
              Previous Week Champions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {champions.map((champ: any) => (
                <div key={champ.rank} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl flex items-center gap-4 hover:border-[var(--accent-primary)]/30 transition-colors">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl
                    ${champ.rank === 1 ? 'bg-yellow-100 text-yellow-600' : 
                      champ.rank === 2 ? 'bg-gray-200 text-gray-500' : 
                      'bg-orange-100 text-orange-600'}`}>
                    {champ.rank}
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--text-primary)]">{champ.name}</h4>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">{champ.avgScore.toFixed(1)}% Avg</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
