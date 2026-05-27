"use client";

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useDashboardStats } from '@/hooks/use-dashboard';
import { Trophy, Target, TrendingUp, AlertTriangle, ArrowRight, Activity, Clock, Award, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: stats, isLoading, isError } = useDashboardStats();

  const firstName = user?.fullName?.split(' ')[0] || 'Student';
  const daysLeftInTrial = 7; // Mock for now, would come from user object or subscription data

  return (
    <div className="space-y-8 pb-10">
      
      {/* Welcome & Banner */}
      <div className="flex flex-col gap-6">
        {user?.subscriptionStatus !== 'ACTIVE' && (
          <div className="bg-[var(--accent-glow)] border border-[var(--accent-primary)]/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)]">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="font-bold text-[var(--text-primary)]">Free Trial Active</h4>
                <p className="text-sm text-[var(--text-secondary)]">You have {daysLeftInTrial} days left in your free trial.</p>
              </div>
            </div>
            <Link href="/pricing">
              <Button className="rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white w-full sm:w-auto">
                Upgrade Now
              </Button>
            </Link>
          </div>
        )}

        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)] tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Ready to continue your certification journey? Let's get to work.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-[var(--bg-elevated)] rounded-3xl border border-[var(--border-subtle)]"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Exams This Week" value={stats?.examsTakenThisWeek?.toString() || '0'} icon={Activity} />
          <StatCard title="Average Score" value={`${stats?.averageScore || 0}%`} icon={Target} color="var(--success)" />
          <StatCard title="Current Streak" value={`${stats?.currentStreak || 0} days`} icon={TrendingUp} color="var(--warning)" />
          <StatCard title="Weekly Rank" value={stats?.rank ? `#${stats.rank}` : '-'} icon={Trophy} color="var(--accent-primary)" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Wider) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Continue Practicing */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold text-[var(--text-primary)]">Continue Practicing</h2>
              <Link href="/courses" className="text-sm font-medium text-[var(--accent-primary)] hover:underline flex items-center">
                Browse all <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
            
            {stats?.recentCertifications?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.recentCertifications.map((cert) => (
                  <Link href={`/courses/${cert.slug}`} key={cert.id}>
                    <div className="bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-2xl p-5 hover:border-[var(--accent-primary)]/50 transition-colors group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-medium)] flex items-center justify-center text-[var(--text-primary)]">
                          <Award size={20} />
                        </div>
                        <span className="text-xs font-bold px-2 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-md uppercase tracking-wider">
                          {cert.difficulty}
                        </span>
                      </div>
                      <h3 className="font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent-primary)] transition-colors line-clamp-2">
                        {cert.name}
                      </h3>
                      <p className="text-sm text-[var(--text-muted)]">Practice Exam</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] border-dashed rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
                <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] mb-4">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">No active courses</h3>
                <p className="text-[var(--text-secondary)] max-w-sm mb-6 text-sm">You haven't started any certification practice exams yet. Choose a path to begin.</p>
                <Link href="/courses">
                  <Button className="rounded-full bg-[var(--text-primary)] hover:bg-[var(--text-secondary)] text-[var(--text-inverse)]">
                    Explore Courses
                  </Button>
                </Link>
              </div>
            )}
          </section>

          {/* AI Weak Areas */}
          <section>
            <h2 className="text-xl font-display font-bold text-[var(--text-primary)] mb-4 flex items-center">
              <AlertTriangle className="mr-2 text-[var(--warning)]" size={20} />
              AI-Identified Weak Areas
            </h2>
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-3xl p-6">
              {stats?.weakAreas?.length ? (
                <ul className="space-y-4">
                  {stats.weakAreas.map((area: any, idx: number) => (
                    <li key={idx} className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-subtle)]">
                      <div>
                        <div className="font-medium text-[var(--text-primary)]">{area.topic}</div>
                        <div className="text-xs text-[var(--text-muted)]">{area.certName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-[var(--error)]">{area.accuracy}% Accuracy</div>
                        <Link href={`/courses/${area.certSlug}`} className="text-xs text-[var(--accent-primary)] hover:underline">Practice</Link>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6">
                  <div className="inline-block p-3 rounded-full bg-[var(--success)]/10 text-[var(--success)] mb-3">
                    <Target size={24} />
                  </div>
                  <h3 className="font-bold text-[var(--text-primary)]">You're doing great!</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Take more exams to get personalized AI feedback on your weak areas.</p>
                </div>
              )}
            </div>
          </section>
          
        </div>

        {/* Right Column (Narrow) */}
        <div className="space-y-8">
          
          {/* Leaderboard Preview */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold text-[var(--text-primary)] flex items-center">
                <Trophy className="mr-2 text-[var(--accent-primary)]" size={20} />
                Top Performers
              </h2>
            </div>
            
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-3xl p-6 relative overflow-hidden">
              {/* Coming soon overlay for step 07 since leaderboard is step 10 */}
              <div className="absolute inset-0 bg-[var(--bg-elevated)]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6">
                <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center mb-3">
                  <Trophy size={24} />
                </div>
                <h3 className="font-bold text-[var(--text-primary)] mb-1">Weekly Leaderboard</h3>
                <p className="text-xs text-[var(--text-secondary)] mb-4">Compete with other Nigerian tech pros. Resets every Monday.</p>
                <div className="px-3 py-1 bg-[var(--bg-secondary)] border border-[var(--border-medium)] rounded text-xs font-mono font-medium text-[var(--text-secondary)]">
                  Unlock in Step 10
                </div>
              </div>

              {/* Blurred background mock data */}
              <ul className="space-y-4 opacity-30 select-none">
                {[1, 2, 3, 4, 5].map((i) => (
                  <li key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 text-center font-mono font-bold text-[var(--text-muted)]">{i}</div>
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)]"></div>
                      <div className="w-24 h-4 rounded bg-[var(--bg-secondary)]"></div>
                    </div>
                    <div className="w-12 h-4 rounded bg-[var(--bg-secondary)]"></div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

// Helper Component
function StatCard({ title, value, icon: Icon, color = "var(--text-primary)" }: any) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-3xl p-5 md:p-6 flex flex-col justify-between hover:border-[var(--border-medium)] transition-colors">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-[var(--text-secondary)]">{title}</h3>
        <div className="p-2 rounded-xl bg-[var(--bg-secondary)]">
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <div className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)]">
        {value}
      </div>
    </div>
  );
}
