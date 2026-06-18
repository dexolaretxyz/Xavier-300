"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCertification, useTodayAttempts } from '@/hooks/useCourses';
import { useExamStore } from '@/store/exam.store';
import { api } from '@/lib/api';
import { AlertTriangle, Clock, FileQuestion, ShieldAlert, Monitor, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ExamLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.id as string;

  const { data: cert, isLoading } = useCertification(slug);
  const { data: attemptsToday, isLoading: isLoadingAttempts } = useTodayAttempts(cert?.id || '');
  const initializeSession = useExamStore(state => state.initializeSession);
  
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  if (isLoading || isLoadingAttempts) {
    return <div className="flex-1 flex items-center justify-center p-12 font-ui text-[var(--text-secondary)]">Loading exam lobby...</div>;
  }

  if (!cert) {
    return <div className="p-12 text-center text-red-500 font-ui font-bold text-xl">Certification not found.</div>;
  }

  const currentAttemptNum = (attemptsToday || 0) + 1;
  const isLimitReached = (attemptsToday || 0) >= 3;

  const handleStart = async () => {
    if (isLimitReached) return;
    setStarting(true);
    setError('');

    try {
      // 1. Request fullscreen
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      }

      // 2. Call API to start session
      const { data } = await api.post('/api/exams/start', { certId: cert.id });
      const { attemptId, sessionToken, questions, examDuration, questionType } = data.data;

      // 3. Initialize Zustand store
      initializeSession(attemptId, sessionToken, questions, examDuration);

      // 4. Navigate to correct session type
      if (questionType === 'THEORY') {
        router.push(`/exam/${attemptId}/theory-session`);
      } else {
        // MCQ and PRACTICAL both use the standard session page
        router.push(`/exam/${attemptId}/session`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Failed to start exam. Please try again.');
      setStarting(false);
      
      // Exit fullscreen if we failed to start
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => console.log(e));
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-6">
      <Link href={`/courses/${cert.slug}`} className="inline-flex items-center text-sm font-ui font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-8">
        <ArrowLeft size={16} className="mr-2" />
        Back to Course
      </Link>

      <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block bg-[var(--accent-light)] text-[var(--accent-primary)] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
            Exam Lobby
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-[var(--text-primary)] mb-2">
            {cert.name}
          </h1>
          <p className="font-ui text-[var(--text-secondary)] mb-6">
            Attempt {currentAttemptNum} of 3 for today
          </p>

          {(cert as any)._count?.questions < cert.questionCount * 2 && (
            <div className="max-w-md mx-auto bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-900 dark:text-amber-300 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-ui mb-6 shadow-sm">
              <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <p className="text-left">
                <strong>Question pool is being expanded.</strong> You may see repeated questions until more are added.
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mb-10 pb-10 border-b border-[var(--border-subtle)]">
          <div className="flex flex-col items-center text-center gap-2 text-[var(--text-primary)]">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)]">
              <FileQuestion size={24} />
            </div>
            <div>
              <div className="font-ui font-bold text-xl">{cert.questionCount}</div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Questions</div>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-2 text-[var(--text-primary)]">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)]">
              <Clock size={24} />
            </div>
            <div>
              <div className="font-ui font-bold text-xl">{cert.examDuration}</div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Minutes</div>
            </div>
          </div>
        </div>

        <p className="text-center font-ui text-xs text-[var(--text-muted)] mb-10 -mt-6">
          📅 Questions refresh daily at midnight. Come back tomorrow for a new set of questions.
        </p>

        {/* Rules */}
        <div className="space-y-6 mb-10">
          <h3 className="font-ui font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
            <ShieldAlert size={20} className="text-[var(--accent-primary)]" />
            Anti-Cheat Rules Enforced
          </h3>
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 p-5 rounded-2xl">
            <ul className="space-y-4 font-ui text-sm text-red-900 dark:text-red-300">
              <li className="flex items-start gap-3">
                <Monitor size={18} className="mt-0.5 flex-shrink-0" />
                <p><strong>Fullscreen Required:</strong> This exam must be taken in fullscreen mode. Exiting fullscreen will result in a warning, and repeating it will auto-submit your exam.</p>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
                <p><strong>No Tab Switching:</strong> If you navigate away from this tab or minimize the window, your exam will be flagged and auto-submitted.</p>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
                <p><strong>No Copy/Paste:</strong> Keyboard shortcuts, right-clicking, and text selection are disabled during the session.</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Action */}
        <div className="text-center">
          {error && (
            <div className="mb-4 text-sm font-ui text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}
          
          <button 
            onClick={handleStart}
            disabled={isLimitReached || starting}
            className={`w-full md:w-auto px-10 py-4 rounded-full font-ui font-medium text-lg transition-all ${
              isLimitReached 
                ? 'bg-[var(--bg-elevated)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-subtle)]'
                : 'bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white shadow-md hover:shadow-lg'
            }`}
          >
            {starting ? 'Preparing Session...' : isLimitReached ? 'Daily Limit Reached' : 'Enter Fullscreen & Start'}
          </button>
          
          <p className="mt-4 font-ui text-xs text-[var(--text-muted)]">
            By starting, you agree to the exam rules. The timer will begin immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
