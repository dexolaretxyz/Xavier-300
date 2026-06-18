"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useExamResults } from '@/hooks/useExam';
import { useExamStore } from '@/store/exam.store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, AlertTriangle, ArrowRight, Trophy, Star, PenLine,
  CheckCircle2, XCircle, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

export default function TheoryResultsPage() {
  const params = useParams();
  const attemptId = params.id as string;
  const router = useRouter();

  const { data, isLoading, error } = useExamResults(attemptId);
  const clearSession = useExamStore(state => state.clearSession);

  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  useEffect(() => {
    clearSession();
  }, [clearSession]);


  if (isLoading) {
    return (
      <div className="p-12 text-center font-ui">
        <div className="animate-spin w-12 h-12 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-[var(--text-secondary)]">Loading your results...</p>
      </div>
    );
  }

  if (error || !data) {
    return <div className="p-12 text-center text-red-500">Failed to load results.</div>;
  }

  const { attempt, questions } = data;
  const theoryScores = (attempt.theoryScores as Record<string, any>) || {};
  const theoryAnswers = (attempt.theoryAnswers as Record<string, string>) || 
                        (attempt.answers as Record<string, string>) || {};
  const isMarked = Object.keys(theoryScores).length > 0;
  const timeTakenMinutes = Math.floor((attempt.timeTaken || 0) / 60);
  const timeTakenSeconds = (attempt.timeTaken || 0) % 60;

  // Calculate total from theory scores if available
  const totalScore = isMarked
    ? Object.values(theoryScores).reduce((sum: number, s: any) => sum + (s.score || 0), 0)
    : 0;
  const maxPossible = isMarked
    ? Object.values(theoryScores).reduce((sum: number, s: any) => sum + (s.maxScore || 10), 0)
    : (questions.length * 10);
  const percentage = isMarked ? Math.round((totalScore / maxPossible) * 100) : (attempt.score || 0);

  const isExcellent = percentage >= 85;
  const isGood = percentage >= 60 && percentage < 85;
  const badgeColor = isExcellent ? 'text-green-500' : isGood ? 'text-amber-500' : 'text-red-500';
  const badgeBg = isExcellent ? 'bg-green-100 dark:bg-green-900/30' : isGood ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-red-100 dark:bg-red-900/30';
  const badgeText = isExcellent ? 'Excellent Work' : isGood ? 'Good Effort' : 'Needs Improvement';

  // Radial chart
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-12 px-6">

      {/* Integrity Violation Warning */}
      {attempt.integrityFlag && (
        <div className="bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-900 p-6 rounded-2xl flex items-start gap-4">
          <AlertTriangle size={24} className="text-red-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-ui font-bold text-red-800 dark:text-red-400 text-lg">Integrity Violation</h3>
            <p className="text-red-700 dark:text-red-300 mt-1 font-ui">Your exam was automatically submitted due to a violation of the anti-cheat rules.</p>
          </div>
        </div>
      )}

      {/* AI MARKING PENDING BANNER */}
      <AnimatePresence>
        {!isMarked && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900/50 p-5 rounded-2xl flex items-center gap-4"
          >
            <RefreshCw size={24} className="text-purple-600 animate-spin flex-shrink-0" />
            <div>
              <h3 className="font-ui font-bold text-purple-800 dark:text-purple-300 text-base">AI Marking in Progress</h3>
              <p className="text-purple-700 dark:text-purple-400 text-sm mt-0.5">
                Your answers are being evaluated by AI. This page will automatically update in a few seconds...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SCORE CARD */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/3 z-0" />

        <div className="relative z-10 flex-1 text-center md:text-left w-full">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-ui text-sm font-bold uppercase tracking-wider mb-6 ${badgeBg} ${badgeColor}`}>
            <PenLine size={14} /> Theory Exam
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-[var(--text-primary)] tracking-tight mb-2">
            {attempt.certification?.name || 'Theory Results'}
          </h1>
          <p className="font-ui text-lg text-[var(--text-secondary)] mb-8">
            Attempt {attempt.attemptNumber} · {new Date(attempt.completedAt || attempt.startedAt).toLocaleDateString('en-NG', { dateStyle: 'long' })}
          </p>

          <div className="flex flex-wrap gap-8">
            <div>
              <div className="text-[var(--text-muted)] font-ui text-xs font-bold uppercase tracking-wider mb-1">Total Score</div>
              <div className="font-mono text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Star size={18} className="text-amber-500" />
                {isMarked ? `${totalScore}/${maxPossible}` : 'Pending...'}
              </div>
            </div>
            <div>
              <div className="text-[var(--text-muted)] font-ui text-xs font-bold uppercase tracking-wider mb-1">Time Taken</div>
              <div className="font-mono text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Clock size={18} className="text-blue-500" />
                {timeTakenMinutes}m {timeTakenSeconds}s
              </div>
            </div>
            <div>
              <div className="text-[var(--text-muted)] font-ui text-xs font-bold uppercase tracking-wider mb-1">Questions</div>
              <div className="font-mono text-2xl font-bold text-[var(--text-primary)]">
                {questions.length}
              </div>
            </div>
          </div>
        </div>

        {/* Radial Score */}
        <div className="relative z-10 flex-shrink-0 flex items-center justify-center">
          <svg width="200" height="200" className="transform -rotate-90">
            <circle cx="100" cy="100" r={radius} stroke="currentColor" strokeWidth="16" fill="transparent" className="text-[var(--bg-elevated)]" />
            <motion.circle
              cx="100" cy="100" r={radius}
              stroke="currentColor" strokeWidth="16" fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: isMarked ? strokeDashoffset : circumference }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={badgeColor}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isMarked ? (
              <>
                <span className="font-mono font-bold text-5xl text-[var(--text-primary)]">{percentage}%</span>
                <span className={`text-sm font-ui font-bold mt-1 ${badgeColor}`}>{badgeText}</span>
              </>
            ) : (
              <span className="font-ui text-sm text-[var(--text-muted)] text-center px-4">Marking in progress...</span>
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-start gap-4">
        <Link href="/dashboard" className="w-full sm:w-auto px-8 py-3 rounded-full font-ui font-medium text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-colors text-center">
          Return to Dashboard
        </Link>
        <Link href="/leaderboard" className="w-full sm:w-auto px-8 py-3 rounded-full font-ui font-medium text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] transition-colors text-center shadow-md flex items-center justify-center gap-2">
          <Trophy size={18} /> View Leaderboard
        </Link>
      </div>

      {/* QUESTION REVIEW */}
      <div className="space-y-6">
        <h2 className="font-ui font-bold text-2xl text-[var(--text-primary)]">Answer Review</h2>
        <div className="space-y-4">
          {questions.map((q: any, i: number) => {
            const studentAnswer = theoryAnswers[q.id] || '';
            const qScore = theoryScores[q.id];
            const isExpanded = expandedQuestion === q.id;
            const passed = qScore && qScore.score >= 7;

            return (
              <div key={q.id} className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
                {/* Header */}
                <div
                  onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                  className="p-6 flex items-center justify-between cursor-pointer hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 pr-4">
                    <div className="flex-shrink-0">
                      {!isMarked ? (
                        <RefreshCw size={24} className="text-purple-400 animate-spin" />
                      ) : passed ? (
                        <CheckCircle2 size={24} className="text-green-500" />
                      ) : (
                        <XCircle size={24} className="text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs text-[var(--text-muted)] mb-1">Question {i + 1}</div>
                      <h3 className="font-ui font-medium text-[var(--text-primary)] line-clamp-2">{q.text}</h3>
                    </div>
                    {isMarked && qScore && (
                      <div className={`flex-shrink-0 text-right ml-4 ${passed ? 'text-green-600' : 'text-red-600'}`}>
                        <div className="font-mono font-bold text-2xl">{qScore.score}/{qScore.maxScore}</div>
                        <div className="text-xs font-ui uppercase tracking-wider">{passed ? 'Pass' : 'Fail'}</div>
                      </div>
                    )}
                  </div>
                  <div className="text-[var(--accent-primary)] font-medium text-sm whitespace-nowrap ml-4">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-6">

                        {/* Student Answer */}
                        <div>
                          <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Your Answer</div>
                          <div className="bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--border-subtle)] font-ui text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                            {studentAnswer || <span className="italic text-[var(--text-muted)]">No answer provided</span>}
                          </div>
                        </div>

                        {/* AI Feedback */}
                        {isMarked && qScore ? (
                          <div className="space-y-4">
                            {/* Feedback */}
                            <div className="bg-[var(--bg-primary)] p-5 rounded-xl border-l-4 border-l-[var(--accent-primary)] border border-[var(--border-subtle)]">
                              <div className="text-xs font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-2 flex items-center gap-2">
                                <PenLine size={14} /> AI Examiner Feedback
                              </div>
                              <p className="font-ui text-[var(--text-secondary)] text-sm leading-relaxed">
                                {qScore.feedback}
                              </p>
                            </div>

                            {/* Points covered / missed */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {qScore.pointsCovered?.length > 0 && (
                                <div>
                                  <div className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Points Covered
                                  </div>
                                  <ul className="space-y-1.5">
                                    {qScore.pointsCovered.map((p: string, j: number) => (
                                      <li key={j} className="flex items-start gap-2 text-sm text-green-800 dark:text-green-300 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                                        <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" /> {p}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {qScore.pointsMissed?.length > 0 && (
                                <div>
                                  <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <XCircle size={12} /> Points Missed
                                  </div>
                                  <ul className="space-y-1.5">
                                    {qScore.pointsMissed.map((p: string, j: number) => (
                                      <li key={j} className="flex items-start gap-2 text-sm text-red-800 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                                        <XCircle size={14} className="flex-shrink-0 mt-0.5" /> {p}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            {/* Model answer */}
                            {q.explanation && (
                              <div className="bg-[var(--bg-primary)] p-5 rounded-xl border border-[var(--border-subtle)]">
                                <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Model Answer Reference</div>
                                <p className="font-ui text-[var(--text-secondary)] text-sm leading-relaxed">{q.explanation}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 text-sm font-ui">
                            <RefreshCw size={16} className="animate-spin" />
                            AI is still marking this answer...
                          </div>
                        )}

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
