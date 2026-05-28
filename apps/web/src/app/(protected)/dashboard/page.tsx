"use client";

import React from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useDashboardStats } from '@/hooks/useDashboard';
import { motion } from 'framer-motion';
import { FileText, Target, Trophy, Flame, ChevronRight, AlertCircle, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: stats, isLoading } = useDashboardStats();

  const firstName = user?.fullName?.split(' ')[0] || 'User';
  
  // Real subscription logic
  let isTrial = false;
  let trialDaysLeft = 0;
  
  if (user?.subscriptionStatus === 'FREE_TRIAL' && user?.trialStartedAt) {
    const start = new Date(user.trialStartedAt);
    const now = new Date();
    const passed = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    trialDaysLeft = Math.max(0, 7 - passed);
    isTrial = trialDaysLeft > 0;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* SUBSCRIPTION BANNER */}
      {isTrial && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-amber-800 dark:text-amber-400">
            <AlertCircle size={20} />
            <span className="font-ui font-medium">{Math.ceil(trialDaysLeft)} days remaining in your free trial</span>
          </div>
          <Link href="/pricing" className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-full font-ui text-sm font-medium transition-colors whitespace-nowrap">
            Upgrade Now
          </Link>
        </div>
      )}

      {/* HEADER */}
      <div>
        <h1 className="font-display font-bold text-4xl text-[var(--text-primary)] tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="font-ui text-[var(--text-secondary)] mt-2">
          Ready to continue your preparation?
        </p>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Exams This Week", value: stats?.examsTakenThisWeek ?? '-', icon: <FileText size={20} /> },
          { label: "Average Score", value: stats ? `${stats.averageScore}%` : '-', icon: <Target size={20} /> },
          { label: "Current Streak", value: stats ? `${stats.currentStreak} days` : '-', icon: <Flame size={20} className="text-orange-500" /> },
          { label: "Current Rank", value: stats?.rank ? `#${stats.rank}` : 'Unranked', icon: <Trophy size={20} className="text-yellow-500" /> },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] p-5 rounded-2xl flex flex-col shadow-sm"
          >
            <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-3">
              {stat.icon}
              <span className="font-ui text-xs font-medium uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="font-display font-bold text-3xl text-[var(--text-primary)]">
              {isLoading ? <div className="h-8 w-16 bg-[var(--bg-elevated)] animate-pulse rounded" /> : stat.value}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* MAIN COL */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* CONTINUE PRACTICING */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-ui font-bold text-xl text-[var(--text-primary)]">Continue Practicing</h2>
              <Link href="/courses" className="text-[var(--accent-primary)] font-ui text-sm font-medium flex items-center hover:underline">
                View all <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isLoading ? (
                [1,2].map(i => <div key={i} className="h-32 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl animate-pulse" />)
              ) : stats?.recentCertifications?.length ? (
                stats.recentCertifications.map((cert: any, i: number) => (
                  <Link href={`/courses/${cert.slug}`} key={i}>
                    <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] p-5 rounded-2xl hover:border-[var(--accent-light)] hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-[var(--accent-light)] text-[var(--accent-primary)] rounded-lg flex items-center justify-center">
                          <PlayCircle size={20} />
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          cert.difficulty === 'ADVANCED' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {cert.difficulty}
                        </span>
                      </div>
                      <h3 className="font-ui font-semibold text-[var(--text-primary)]">{cert.name}</h3>
                      <p className="font-ui text-sm text-[var(--text-muted)] mt-1">{cert.questionCount} questions</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-2 bg-[var(--bg-primary)] border border-[var(--border-subtle)] border-dashed p-8 rounded-2xl text-center">
                  <p className="font-ui text-[var(--text-secondary)] mb-4">You haven't started any certifications yet.</p>
                  <Link href="/courses" className="bg-[var(--text-primary)] text-[var(--bg-primary)] px-6 py-2 rounded-full font-ui text-sm font-medium inline-block">
                    Browse Courses
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* WEAK AREAS */}
          <section>
            <h2 className="font-ui font-bold text-xl text-[var(--text-primary)] mb-4">Focus Areas</h2>
            <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6">
              {isLoading ? (
                <div className="h-20 animate-pulse bg-[var(--bg-elevated)] rounded-xl" />
              ) : stats?.weakAreas?.length ? (
                <ul className="space-y-4">
                  {stats.weakAreas.map((area: any, i: number) => (
                    <li key={i} className="flex items-center justify-between border-b border-[var(--border-subtle)] last:border-0 pb-4 last:pb-0">
                      <div>
                        <div className="font-ui font-medium text-[var(--text-primary)]">{area.topic}</div>
                        <div className="font-ui text-sm text-[var(--text-muted)]">{area.certName}</div>
                      </div>
                      <div className="text-red-500 font-mono font-medium text-sm">
                        {area.score}%
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6 text-[var(--text-secondary)] font-ui">
                  <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target size={24} />
                  </div>
                  <p>Take some exams to get AI-powered focus areas.</p>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* RIGHT COL - LEADERBOARD PREVIEW */}
        <div className="h-full flex flex-col">
          <section className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-ui font-bold text-lg text-[var(--text-primary)]">Leaderboard</h2>
              <Link href="/leaderboard" className="text-[var(--accent-primary)] hover:underline text-sm font-medium">Full list</Link>
            </div>
            
            <div className="space-y-4">
              {/* Fake Leaderboard for demo, we build real in Step 10 */}
              {[
                { name: "Chuks E.", score: 98, rank: 1 },
                { name: "Folake A.", score: 94, rank: 2 },
                { name: "Ibrahim S.", score: 91, rank: 3 },
                { name: "You", score: stats?.averageScore || 0, rank: stats?.rank || 142, isUser: true },
              ].map((lb, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${lb.isUser ? 'bg-[var(--accent-light)] border border-[var(--accent-primary)]/20' : 'bg-[var(--bg-secondary)]'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 text-center font-mono font-bold text-sm ${lb.rank <= 3 ? 'text-yellow-600' : 'text-[var(--text-muted)]'}`}>
                      {lb.rank}
                    </div>
                    <div className={`font-ui font-medium text-sm ${lb.isUser ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`}>
                      {lb.name}
                    </div>
                  </div>
                  <div className="font-mono font-medium text-sm text-[var(--text-secondary)]">
                    {lb.score}%
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
