"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useExamResults } from '@/hooks/useExam';
import { useExamStore } from '@/store/exam.store';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Zap, Target, BookOpen, AlertTriangle, ArrowRight, Trophy, Flag, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ExamResultsPage() {
  const params = useParams();
  const attemptId = params.id as string;
  const router = useRouter();
  
  const { data, isLoading, error } = useExamResults(attemptId);
  const clearSession = useExamStore(state => state.clearSession);

  // Clear active session from Zustand once results page is hit
  useEffect(() => {
    clearSession();
  }, [clearSession]);

  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  // Flag/Appeal state
  const [flagOpenId, setFlagOpenId] = useState<string | null>(null);
  const [flagText, setFlagText] = useState('');
  const [flagLoading, setFlagLoading] = useState(false);
  const [flagSuccess, setFlagSuccess] = useState<Record<string, boolean>>({});

  if (isLoading) {
    return <div className="p-12 text-center font-ui text-[var(--text-secondary)]">Crunching your results...</div>;
  }

  if (error || !data) {
    return <div className="p-12 text-center text-red-500">Failed to load results.</div>;
  }

  const { attempt, questions } = data;
  const score = attempt.score;
  const timeTakenMinutes = Math.floor(attempt.timeTaken / 60);
  const timeTakenSeconds = attempt.timeTaken % 60;
  const speed = (attempt.timeTaken / attempt.totalQuestions).toFixed(1); // Seconds per question
  
  const isExcellent = score >= 85;
  const isGood = score >= 70 && score < 85;
  const badgeColor = isExcellent ? 'text-green-500' : isGood ? 'text-amber-500' : 'text-red-500';
  const badgeBg = isExcellent ? 'bg-green-100 dark:bg-green-900/30' : isGood ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-red-100 dark:bg-red-900/30';

  const hasWeakTopics = attempt.weakTopics && attempt.weakTopics.length > 0;
  const aiGenerating = hasWeakTopics && (!attempt.aiRecommendations || attempt.aiRecommendations.length === 0);

  // Circle Math
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="max-w-4xl mx-auto space-y-16 py-12 px-6">
      
      {/* Integrity Violation Warning */}
      {attempt.integrityFlag && (
        <div className="bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-900 p-6 rounded-2xl flex items-start gap-4">
          <AlertTriangle size={24} className="text-red-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-ui font-bold text-red-800 dark:text-red-400 text-lg">Integrity Violation</h3>
            <p className="text-red-700 dark:text-red-300 mt-1 font-ui">Your exam was automatically submitted due to a violation of the anti-cheat rules (e.g. leaving fullscreen or switching tabs). Your score may not accurately reflect your ability.</p>
          </div>
        </div>
      )}

      {/* HEADER & SCORE CARD */}
      <div className="space-y-6">
        <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-light)] rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/3 z-0" />
          
          <div className="relative z-10 flex-1 text-center md:text-left w-full">
            <div className={`inline-flex items-center px-4 py-1.5 rounded-full font-ui text-sm font-bold uppercase tracking-wider mb-6 ${badgeBg} ${badgeColor} whitespace-nowrap`}>
              {isExcellent ? 'Excellent Performance' : isGood ? 'Good Effort' : 'Needs Work'}
            </div>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-[var(--text-primary)] tracking-tight mb-2">
              {attempt.certification.name}
            </h1>
            <p className="font-ui text-lg text-[var(--text-secondary)] mb-8">
              Attempt {attempt.attemptNumber} completed on {new Date(attempt.completedAt).toLocaleDateString()}
            </p>
            
            <div className="flex flex-wrap gap-8">
              <div>
                <div className="text-[var(--text-muted)] font-ui text-xs font-bold uppercase tracking-wider mb-1 whitespace-nowrap">Correct</div>
                <div className="font-mono text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2 whitespace-nowrap">
                  <Target size={18} className="text-[var(--accent-primary)]" /> {attempt.correctAnswers}/{attempt.totalQuestions}
                </div>
              </div>
              <div>
                <div className="text-[var(--text-muted)] font-ui text-xs font-bold uppercase tracking-wider mb-1 whitespace-nowrap">Time Taken</div>
                <div className="font-mono text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2 whitespace-nowrap">
                  <Clock size={18} className="text-amber-500" /> {timeTakenMinutes}m {timeTakenSeconds}s
                </div>
              </div>
              <div>
                <div className="text-[var(--text-muted)] font-ui text-xs font-bold uppercase tracking-wider mb-1 whitespace-nowrap">Speed</div>
                <div className="font-mono text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2 whitespace-nowrap">
                  <Zap size={18} className="text-blue-500" /> {speed}s / q
                </div>
              </div>
            </div>
          </div>

          {/* RADIAL SCORE */}
          <div className="relative z-10 flex-shrink-0 flex items-center justify-center">
            <svg width="200" height="200" className="transform -rotate-90">
              <circle cx="100" cy="100" r={radius} stroke="currentColor" strokeWidth="16" fill="transparent" className="text-[var(--bg-elevated)]" />
              <motion.circle 
                cx="100" cy="100" r={radius} 
                stroke="currentColor" strokeWidth="16" fill="transparent" 
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={badgeColor}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono font-bold text-5xl text-[var(--text-primary)]">{Math.round(score)}%</span>
            </div>
          </div>
        </div>

        {/* CTA ACTIONS MOVED HERE */}
        <div className="flex flex-col sm:flex-row items-center justify-start gap-4">
          <Link href="/dashboard" className="w-full sm:w-auto px-8 py-3 rounded-full font-ui font-medium text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-colors text-center">
            Return to Dashboard
          </Link>
          <Link href="/leaderboard" className="w-full sm:w-auto px-8 py-3 rounded-full font-ui font-medium text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] transition-colors text-center shadow-md flex items-center justify-center gap-2">
            <Trophy size={18} /> View Leaderboard
          </Link>
        </div>
      </div>

      {/* AI RECOMMENDATIONS */}
      {hasWeakTopics && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[var(--accent-light)] flex items-center justify-center text-[var(--accent-primary)]">
              <BookOpen size={20} />
            </div>
            <h2 className="font-ui font-bold text-2xl text-[var(--text-primary)]">Your Personalised Study Plan</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiGenerating ? (
              // Skeletons
              [1, 2, 3, 4].map(i => (
                <div key={i} className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] p-6 rounded-2xl animate-pulse">
                  <div className="h-4 bg-[var(--bg-elevated)] rounded w-1/2 mb-4" />
                  <div className="h-16 bg-[var(--bg-elevated)] rounded mb-4" />
                  <div className="h-3 bg-[var(--bg-elevated)] rounded w-1/3" />
                </div>
              ))
            ) : (
              attempt.aiRecommendations?.map((rec: any, i: number) => (
                <div key={i} className="bg-[var(--bg-primary)] border-l-4 border-l-[var(--accent-primary)] border-y border-r border-[var(--border-subtle)] p-6 rounded-r-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="font-ui font-bold text-[var(--text-primary)]">{rec.topic}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase whitespace-nowrap flex-shrink-0 ${
                      rec.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {rec.priority} Priority
                    </span>
                  </div>
                  <p className="font-ui text-[var(--text-secondary)] text-sm mb-4 leading-relaxed">
                    {rec.recommendation}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* QUESTION REVIEW */}
      <div className="space-y-6">
        <h2 className="font-ui font-bold text-2xl text-[var(--text-primary)]">Question Review</h2>
        <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-3xl overflow-hidden shadow-sm">
          {questions.map((q: any, i: number) => {
            const userAnswer = (attempt.answers as Record<string, string>)[q.id];
            const isCorrect = userAnswer === q.correctAnswer;
            const isExpanded = expandedQuestion === q.id;

            return (
              <div key={q.id} className="border-b border-[var(--border-subtle)] last:border-0">
                <div 
                  onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                  className="p-6 flex items-center justify-between cursor-pointer hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 pr-6">
                    <div className="flex-shrink-0 mt-0.5">
                      {isCorrect ? <CheckCircle2 size={24} className="text-green-500" /> : <XCircle size={24} className="text-red-500" />}
                    </div>
                    <div>
                      <div className="font-mono text-sm text-[var(--text-muted)] mb-1">Question {i + 1}</div>
                      <h3 className="font-ui font-medium text-[var(--text-primary)] line-clamp-2">{q.text}</h3>
                    </div>
                  </div>
                  <div className="text-[var(--accent-primary)] font-medium text-sm whitespace-nowrap">
                    {isExpanded ? 'Hide' : 'Review'}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-[var(--bg-secondary)]"
                    >
                      <div className="p-6 pt-2 border-t border-[var(--border-subtle)]">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                          <div>
                            <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 whitespace-nowrap">Your Answer</div>
                            <div className={`p-4 rounded-xl border ${isCorrect ? 'bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-300' : 'bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-300'}`}>
                              <div className="font-bold mb-1">Option {userAnswer}</div>
                              <div className="text-sm">{userAnswer ? q.options[userAnswer] : 'No answer provided'}</div>
                            </div>
                          </div>
                          
                          {!isCorrect && (
                            <div>
                              <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 whitespace-nowrap">Correct Answer</div>
                              <div className="p-4 rounded-xl border bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-300">
                                <div className="font-bold mb-1">Option {q.correctAnswer}</div>
                                <div className="text-sm">{q.options[q.correctAnswer]}</div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Flag Question - only for wrong answers */}
                        {!isCorrect && (
                          <div className="mb-6">
                            {flagSuccess[q.id] ? (
                              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-ui text-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-xl p-4">
                                <CheckCircle2 size={16} />
                                ✓ Flag submitted — our team will review this question.
                              </div>
                            ) : flagOpenId === q.id ? (
                              <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-3">
                                <p className="font-ui text-sm text-[var(--text-secondary)]">
                                  I selected <span className="font-bold text-[var(--text-primary)]">{userAnswer}</span> but was marked wrong
                                </p>
                                <textarea
                                  value={flagText}
                                  onChange={(e) => setFlagText(e.target.value)}
                                  placeholder="Explain why you think your answer is correct..."
                                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg p-3 font-ui text-sm outline-none focus:border-[var(--accent-primary)] resize-none min-h-[80px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                                />
                                <div className="flex items-center gap-3">
                                  <button
                                    disabled={flagLoading || !flagText.trim()}
                                    onClick={async () => {
                                      try {
                                        setFlagLoading(true);
                                        await api.post('/api/tickets', {
                                          subject: 'Question Answer Dispute',
                                          description: `Student flagged question as incorrectly marked.\n\nQuestion: ${q.text.slice(0, 100)}\nStudent selected: ${userAnswer} (${q.options[userAnswer] || 'No answer'})\nMarked correct: ${q.correctAnswer} (${q.options[q.correctAnswer]})\n\nStudent explanation: ${flagText}`,
                                          category: 'EXAM_BUG'
                                        });
                                        setFlagSuccess(prev => ({ ...prev, [q.id]: true }));
                                        setFlagOpenId(null);
                                        setFlagText('');
                                      } catch (err) {
                                        console.error('Failed to submit flag', err);
                                        alert('Failed to submit flag. Please try again.');
                                      } finally {
                                        setFlagLoading(false);
                                      }
                                    }}
                                    className="px-4 py-2 rounded-lg font-ui font-medium text-sm bg-[var(--accent-primary)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
                                  >
                                    {flagLoading && <Loader2 size={14} className="animate-spin" />}
                                    Submit Flag
                                  </button>
                                  <button
                                    onClick={() => { setFlagOpenId(null); setFlagText(''); }}
                                    className="font-ui text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setFlagOpenId(q.id)}
                                className="font-ui text-sm text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors flex items-center gap-1.5"
                              >
                                <Flag size={14} /> Flag this question →
                              </button>
                            )}
                          </div>
                        )}


                        {q.explanation && (
                          <div className="bg-[var(--bg-primary)] p-5 rounded-xl border border-[var(--border-subtle)]">
                            <div className="text-xs font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-2 flex items-center gap-2 whitespace-nowrap">
                              <BookOpen size={14} /> Explanation
                            </div>
                            <div className="font-ui text-[var(--text-secondary)] text-sm leading-relaxed">
                              {q.explanation}
                            </div>
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
