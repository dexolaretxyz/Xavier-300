"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useExamStore } from '@/store/exam.store';
import { CheckCircle2, XCircle, Clock, Zap, Target, ArrowRight, BrainCircuit, RefreshCcw, Medal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ExamResultsPage() {
  const { id: attemptId } = useParams() as { id: string };
  const router = useRouter();
  const { resetExam, attemptId: storeAttemptId } = useExamStore();

  const [animatedScore, setAnimatedScore] = useState(0);

  // Clear exam store if it was the same attempt we just finished
  useEffect(() => {
    if (storeAttemptId === attemptId) {
      resetExam();
    }
  }, [attemptId, storeAttemptId, resetExam]);

  // Query Results
  const { data, isLoading, error } = useQuery({
    queryKey: ['examResults', attemptId],
    queryFn: async () => {
      const res = await api.get(`/exams/${attemptId}/results`);
      return res.data.data;
    },
    // Poll every 3s if AI recommendations haven't arrived yet and we actually have weak topics
    refetchInterval: (query) => {
      const attempt = query.state.data?.attempt;
      if (!attempt) return false;
      const hasWeakTopics = attempt.weakTopics && attempt.weakTopics.length > 0;
      const hasNoAiRecs = !attempt.aiRecommendations || attempt.aiRecommendations.length === 0;
      return (hasWeakTopics && hasNoAiRecs) ? 3000 : false;
    }
  });

  // Animate score count-up
  useEffect(() => {
    if (data?.attempt?.score !== undefined) {
      const targetScore = data.attempt.score;
      let start = 0;
      const duration = 1500;
      const increment = targetScore / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= targetScore) {
          setAnimatedScore(targetScore);
          clearInterval(timer);
        } else {
          setAnimatedScore(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [data?.attempt?.score]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-[var(--text-secondary)]">Analyzing your performance...</div>;
  }

  if (error || !data) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <XCircle size={64} className="text-[var(--error)] mb-4" />
        <h2 className="text-2xl font-bold mb-2">Failed to load results</h2>
        <Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>
      </div>
    );
  }

  const { attempt, questions } = data;
  const { score, timeTaken, correctAnswers, totalQuestions, weakTopics, aiRecommendations, status, certification } = attempt;

  const scoreColor = score >= 85 ? 'text-green-500' : score >= 70 ? 'text-amber-500' : 'text-red-500';
  const strokeColor = score >= 85 ? '#22c55e' : score >= 70 ? '#f59e0b' : '#ef4444';
  
  const circumference = 2 * Math.PI * 120; // r=120
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const speed = timeTaken && timeTaken > 0 ? (totalQuestions / (timeTaken / 60)).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-20">
      {/* Top Banner indicating if it was auto-submitted or violated */}
      {status === 'INTEGRITY_VIOLATION' && (
        <div className="bg-[var(--error)] text-white p-4 text-center font-bold shadow-md">
          Exam was terminated due to an Integrity Violation.
        </div>
      )}

      {/* Header Section */}
      <div className="bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] px-6 py-10 pt-16 text-center relative overflow-hidden">
        <h1 className="text-sm font-bold tracking-widest text-[var(--text-secondary)] uppercase mb-2">
          {certification.name}
        </h1>
        <h2 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-8">
          Exam Results
        </h2>

        {/* Radial Progress Score */}
        <div className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 260 260">
            {/* Track */}
            <circle cx="130" cy="130" r="120" stroke="var(--border-subtle)" strokeWidth="12" fill="none" />
            {/* Progress */}
            <circle 
              cx="130" cy="130" r="120" 
              stroke={strokeColor} strokeWidth="12" fill="none" 
              strokeLinecap="round"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                transition: 'stroke-dashoffset 0.1s linear'
              }}
            />
          </svg>
          <div className="flex flex-col items-center justify-center">
            <span className={`text-6xl font-mono font-bold ${scoreColor}`}>
              {animatedScore}%
            </span>
            <span className="text-[var(--text-secondary)] font-medium mt-1">
              {score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Work'}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-10">
          <div className="bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-subtle)]">
            <Target className="mx-auto mb-2 text-[var(--accent-primary)]" />
            <div className="text-2xl font-bold text-[var(--text-primary)]">{correctAnswers}/{totalQuestions}</div>
            <div className="text-xs text-[var(--text-secondary)] uppercase">Correct</div>
          </div>
          <div className="bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-subtle)]">
            <Clock className="mx-auto mb-2 text-indigo-500" />
            <div className="text-2xl font-bold text-[var(--text-primary)]">{formatTime(timeTaken)}</div>
            <div className="text-xs text-[var(--text-secondary)] uppercase">Time Taken</div>
          </div>
          <div className="bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-subtle)]">
            <Zap className="mx-auto mb-2 text-amber-500" />
            <div className="text-2xl font-bold text-[var(--text-primary)]">{speed}</div>
            <div className="text-xs text-[var(--text-secondary)] uppercase">Questions / Min</div>
          </div>
          <div className="bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-subtle)]">
            <Medal className="mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold text-[var(--text-primary)]">--</div>
            <div className="text-xs text-[var(--text-secondary)] uppercase">Rank Change</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        
        {/* AI Recommendations Section */}
        {weakTopics && weakTopics.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] rounded-lg">
                <BrainCircuit size={24} />
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)]">Your Personalised Study Plan</h3>
            </div>

            <div className="space-y-4">
              {aiRecommendations && aiRecommendations.length > 0 ? (
                aiRecommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="bg-[var(--bg-elevated)] border-l-4 border-[var(--accent-primary)] p-6 rounded-r-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-[var(--text-primary)] text-lg">{rec.topic}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        rec.priority === 'High' ? 'bg-[var(--error)]/10 text-[var(--error)]' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {rec.priority} Priority
                      </span>
                    </div>
                    <p className="text-[var(--text-secondary)] mb-4">{rec.recommendation}</p>
                    <a href={`https://google.com/search?q=${encodeURIComponent(rec.recommendation)}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-[var(--accent-primary)] hover:underline flex items-center gap-1">
                      Search Resource <ArrowRight size={14} />
                    </a>
                  </div>
                ))
              ) : (
                <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 rounded-2xl text-center space-y-4 animate-pulse">
                  <RefreshCcw className="mx-auto text-[var(--accent-primary)] animate-spin" size={32} />
                  <p className="text-[var(--text-secondary)]">AI is analyzing your performance and generating a custom study plan...</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Question Review */}
        <section>
          <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Question Review</h3>
          <div className="space-y-4">
            {questions.map((q: any, idx: number) => {
              const userAnswer = attempt.answers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              
              return (
                <div key={q.id} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 transition-all hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {isCorrect ? (
                        <CheckCircle2 className="text-green-500" size={24} />
                      ) : (
                        <XCircle className="text-[var(--error)]" size={24} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold px-2 py-1 bg-[var(--bg-secondary)] rounded-md text-[var(--text-secondary)]">Question {idx + 1}</span>
                        <span className="text-xs font-bold px-2 py-1 bg-[var(--accent-primary)]/5 text-[var(--accent-primary)] rounded-md">{q.topic}</span>
                      </div>
                      <p className="text-lg text-[var(--text-primary)] mb-4 leading-relaxed">{q.text}</p>
                      
                      <div className="space-y-2 mb-4">
                        {Object.entries(q.options).map(([key, text]) => {
                          let bg = 'bg-[var(--bg-secondary)]';
                          let textClass = 'text-[var(--text-secondary)]';
                          let border = 'border-transparent';

                          if (key === q.correctAnswer) {
                            bg = 'bg-green-500/10';
                            textClass = 'text-green-700 dark:text-green-400 font-medium';
                            border = 'border-green-500/30';
                          } else if (key === userAnswer && !isCorrect) {
                            bg = 'bg-[var(--error)]/10';
                            textClass = 'text-[var(--error)] font-medium';
                            border = 'border-[var(--error)]/30';
                          }

                          return (
                            <div key={key} className={`p-3 rounded-xl border ${bg} ${border} flex gap-3`}>
                              <span className={`font-bold ${textClass}`}>{key}</span>
                              <span className={textClass}>{text as string}</span>
                            </div>
                          );
                        })}
                      </div>

                      {!isCorrect && (
                        <div className="mt-4 p-4 bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20 rounded-xl">
                          <h5 className="text-sm font-bold text-[var(--accent-primary)] mb-1">Explanation</h5>
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-[var(--border-subtle)]">
          <Link href={`/courses/${certification.slug}`} className="flex-1">
            <Button className="w-full py-6 rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white shadow-md text-lg">
              Retake Exam
            </Button>
          </Link>
          <Link href="/courses" className="flex-1">
            <Button variant="outline" className="w-full py-6 rounded-full text-lg border-2">
              Try Another
            </Button>
          </Link>
          <Link href="/leaderboard" className="flex-1">
            <Button variant="outline" className="w-full py-6 rounded-full text-lg border-2">
              Leaderboard
            </Button>
          </Link>
        </section>

      </div>
    </div>
  );
}
