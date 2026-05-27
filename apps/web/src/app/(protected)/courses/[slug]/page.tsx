"use client";

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useDomain, useTodayAttempts } from '@/hooks/use-dashboard';
import { LineChart, Database, ShieldCheck, Cloud, Code2, Target, Layout, Server, TrendingUp, ArrowLeft, Clock, Award, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Helper map for icons
const DOMAIN_ICONS: Record<string, any> = {
  'data-analysis': LineChart,
  'data-science': Database,
  'cybersecurity': ShieldCheck,
  'cloud-computing': Cloud,
  'software-development': Code2,
  'agile-scrum': Target,
  'product-management': Layout,
  'it-service-management': Server,
  'business-analysis': TrendingUp,
};

export default function DomainCoursesPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const { data: domain, isLoading, isError } = useDomain(slug);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-32 bg-[var(--bg-elevated)] rounded-3xl border border-[var(--border-subtle)]"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => <div key={i} className="h-48 bg-[var(--bg-elevated)] rounded-3xl"></div>)}
        </div>
      </div>
    );
  }

  if (isError || !domain) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Domain Not Found</h2>
        <p className="text-[var(--text-secondary)] mb-6">The certification path you are looking for does not exist.</p>
        <Button onClick={() => router.push('/courses')}>Back to Courses</Button>
      </div>
    );
  }

  const Icon = DOMAIN_ICONS[domain.slug] || Target;

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link href="/courses" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-2 -ml-2 rounded-full hover:bg-[var(--bg-secondary)]">
          <ArrowLeft size={20} />
        </Link>
        <div className="text-sm font-medium text-[var(--text-secondary)]">Certification Paths</div>
      </div>

      <div className="bg-[var(--bg-glass)] backdrop-blur-md border border-[var(--border-subtle)] rounded-3xl p-8 relative overflow-hidden flex items-center justify-between">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transform translate-x-4 -translate-y-4">
          <Icon size={160} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center">
              <Icon size={24} strokeWidth={2} />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)]">
              {domain.name}
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            Select a specific certification practice exam below. 
            All exams are strictly timed to simulate real conditions.
          </p>
        </div>
      </div>

      {/* Certifications List */}
      <div>
        <h2 className="text-xl font-display font-bold text-[var(--text-primary)] mb-6">Available Exams</h2>
        
        {domain.certifications && domain.certifications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domain.certifications.map((cert) => (
              <CertificationCard key={cert.id} cert={cert} />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 border border-[var(--border-subtle)] border-dashed rounded-3xl bg-[var(--bg-elevated)]">
            <p className="text-[var(--text-secondary)]">No certifications available in this domain yet.</p>
          </div>
        )}
      </div>

    </div>
  );
}

function CertificationCard({ cert }: { cert: any }) {
  const { data: attemptsToday = 0, isLoading } = useTodayAttempts(cert.id);
  const maxAttempts = 3;
  const isLimitReached = attemptsToday >= maxAttempts;
  const questionCount = cert._count?.questions || 40;

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-3xl p-6 flex flex-col h-full hover:border-[var(--border-medium)] transition-colors">
      
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] flex items-center justify-center">
          <Award size={20} />
        </div>
        <span className="text-xs font-bold px-2 py-1 bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-md uppercase tracking-wider">
          {cert.difficulty}
        </span>
      </div>

      <h3 className="text-xl font-bold font-ui text-[var(--text-primary)] mb-3 line-clamp-2 min-h-[56px]">
        {cert.name}
      </h3>
      
      <div className="flex flex-col gap-2 mb-8 mt-auto">
        <div className="flex items-center text-sm text-[var(--text-secondary)]">
          <FileQuestion size={16} className="mr-2 text-[var(--text-muted)]" />
          {questionCount} Questions Pool
        </div>
        <div className="flex items-center text-sm text-[var(--text-secondary)]">
          <Clock size={16} className="mr-2 text-[var(--text-muted)]" />
          40 Questions per Exam
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex items-center justify-between mb-3 text-xs font-medium">
          <span className="text-[var(--text-secondary)]">Today's Attempts</span>
          <span className={isLimitReached ? "text-[var(--error)]" : "text-[var(--text-primary)]"}>
            {!isLoading ? `${attemptsToday} / ${maxAttempts}` : '...'}
          </span>
        </div>

        {isLimitReached ? (
          <div className="relative group">
            <Button disabled className="w-full rounded-full bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed">
              Limit Reached
            </Button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[var(--text-primary)] text-[var(--text-inverse)] text-xs text-center rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-10">
              You've reached the daily limit of 3 attempts for this exam. Try again tomorrow.
            </div>
          </div>
        ) : (
          <Link href={`/exam/${cert.id}/lobby`} className="block">
            <Button className="w-full rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white shadow-md">
              Start Practice Exam
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
