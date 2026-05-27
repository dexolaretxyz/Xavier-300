"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useExamStore } from '@/store/exam.store';
import { useAuthStore } from '@/store/auth.store';
import { Flag, ChevronLeft, ChevronRight, AlertOctagon, CheckCircle2, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExamSessionPage() {
  const { id: routeAttemptId } = useParams() as { id: string };
  const router = useRouter();
  
  const { user } = useAuthStore();
  const {
    attemptId,
    questions,
    currentIndex,
    answers,
    flags,
    timeRemaining,
    status,
    integrityFlags,
    setAnswer,
    toggleFlag,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    tick,
    addIntegrityViolation,
    submitExam
  } = useExamStore();

  const [showViolationModal, setShowViolationModal] = useState(false);
  const [violationMessage, setViolationMessage] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and validate session
  useEffect(() => {
    // If the route ID doesn't match the active exam in store, kick them out
    if (!attemptId || attemptId !== routeAttemptId || status !== 'IN_PROGRESS') {
      router.replace('/dashboard');
    }
  }, [attemptId, routeAttemptId, status, router]);

  // Anti-cheat Event Listeners
  useEffect(() => {
    if (status !== 'IN_PROGRESS') return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleViolation("You exited fullscreen mode.");
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleViolation("You switched tabs or minimized the window.");
      }
    };

    const preventDefaultAction = (e: Event) => e.preventDefault();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common DevTools/Copy-Paste shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (['c', 'v', 'a', 'p', 's'].includes(e.key.toLowerCase())) {
          e.preventDefault();
        }
      }
      if (e.key === 'F12') e.preventDefault();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', preventDefaultAction);
    document.addEventListener('copy', preventDefaultAction);
    document.addEventListener('cut', preventDefaultAction);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', preventDefaultAction);
      document.removeEventListener('copy', preventDefaultAction);
      document.removeEventListener('cut', preventDefaultAction);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [status]);

  const handleViolation = useCallback((message: string) => {
    addIntegrityViolation();
    const currentFlags = useExamStore.getState().integrityFlags;
    
    if (currentFlags >= 2) {
      // Auto submit logic is triggered inside addIntegrityViolation, but we show fatal error
      setViolationMessage(`${message} This is your second violation. The exam has been auto-submitted.`);
      setShowViolationModal(true);
    } else {
      setViolationMessage(`${message} This is a warning. One more violation will result in automatic submission.`);
      setShowViolationModal(true);
      // Try to force back to fullscreen
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }, [addIntegrityViolation]);

  // Timer logic
  useEffect(() => {
    if (status === 'IN_PROGRESS') {
      tickRef.current = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [status, tick]);

  // Navigate away if completed
  useEffect(() => {
    if (status === 'COMPLETED') {
      router.replace(`/exam/${attemptId}/results`);
    }
  }, [status, attemptId, router]);

  if (!questions || questions.length === 0 || status !== 'IN_PROGRESS') {
    return <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">Loading...</div>;
  }

  const currentQ = questions[currentIndex];
  const selectedAnswer = answers[currentQ.id];
  const isFlagged = flags[currentQ.id];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isTimeCritical = timeRemaining < 300; // Under 5 minutes
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col relative select-none">
      
      {/* Watermark */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center opacity-[0.03] rotate-[-45deg] select-none overflow-hidden">
        <span className="text-6xl font-bold whitespace-nowrap">
          {user?.id} {user?.email} {user?.id}
        </span>
      </div>

      {/* Top Bar */}
      <header className="relative z-10 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-black dark:bg-white rounded flex items-center justify-center">
            <span className="text-white dark:text-black font-bold font-display text-lg leading-none">X</span>
          </div>
          <span className="font-bold text-[var(--text-primary)] hidden md:block">Xavier 300</span>
        </div>

        <div className="text-[var(--text-secondary)] font-medium">
          Question {currentIndex + 1} of {questions.length}
        </div>

        <div className={`font-mono text-xl font-bold px-4 py-2 rounded-lg transition-colors ${
          isTimeCritical ? 'bg-[var(--error)]/10 text-[var(--error)] animate-pulse' : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
        }`}>
          {formatTime(timeRemaining)}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-[var(--bg-secondary)] w-full">
        <div 
          className="h-full bg-[var(--accent-primary)] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col max-w-4xl w-full mx-auto p-6 md:p-10">
        
        {/* Question Area */}
        <div className="mb-10 flex-1">
          <h2 className="text-2xl md:text-3xl text-[var(--text-primary)] leading-relaxed mb-8">
            {currentQ.text}
          </h2>

          <div className="space-y-4">
            {Object.entries(currentQ.options).map(([key, text]) => (
              <button
                key={key}
                onClick={() => setAnswer(currentQ.id, key)}
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-start gap-4 ${
                  selectedAnswer === key
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-hover)] bg-[var(--bg-elevated)]'
                }`}
              >
                <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                  selectedAnswer === key 
                    ? 'bg-[var(--accent-primary)] text-white' 
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                }`}>
                  {key}
                </div>
                <div className="text-[var(--text-primary)] text-lg leading-tight mt-1">
                  {text as string}
                </div>
              </button>
            ))}
          </div>
        </div>

      </main>

      {/* Bottom Bar */}
      <footer className="relative z-10 bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)] p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={prevQuestion} 
              disabled={currentIndex === 0}
              className="rounded-full px-6"
            >
              <ChevronLeft size={20} className="mr-2" /> Previous
            </Button>
            
            <Button 
              variant={isFlagged ? "default" : "outline"}
              onClick={() => toggleFlag(currentQ.id)}
              className={`rounded-full px-6 ${isFlagged ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500' : ''}`}
            >
              <Flag size={20} className="mr-2" /> {isFlagged ? 'Flagged' : 'Flag for review'}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="hidden md:flex"
            >
              <ListChecks size={20} className="mr-2" /> Overview
            </Button>

            {currentIndex === questions.length - 1 ? (
              <Button 
                onClick={submitExam}
                className="rounded-full px-8 bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg"
              >
                Submit Exam <CheckCircle2 size={20} className="ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={nextQuestion}
                className="rounded-full px-8 bg-[var(--text-primary)] text-[var(--bg-primary)] hover:bg-[var(--text-secondary)]"
              >
                Next <ChevronRight size={20} className="ml-2" />
              </Button>
            )}
          </div>
        </div>
      </footer>

      {/* Violation Modal */}
      {showViolationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-elevated)] max-w-md w-full rounded-3xl p-8 shadow-2xl border border-[var(--error)]/20 text-center">
            <div className="w-16 h-16 bg-[var(--error)]/10 text-[var(--error)] rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertOctagon size={32} />
            </div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Integrity Violation</h3>
            <p className="text-[var(--text-secondary)] mb-8">{violationMessage}</p>
            
            {integrityFlags >= 2 ? (
              <Button 
                className="w-full bg-[var(--text-primary)] text-[var(--bg-primary)]" 
                onClick={() => router.replace(`/exam/${attemptId}/results`)}
              >
                View Results
              </Button>
            ) : (
              <Button 
                className="w-full bg-[var(--accent-primary)] text-white" 
                onClick={() => setShowViolationModal(false)}
              >
                I Understand, Return to Exam
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Overview Drawer (simplified for this step, could be an actual sheet) */}
      {isDrawerOpen && (
        <div className="fixed right-0 top-[73px] bottom-[73px] w-80 bg-[var(--bg-elevated)] border-l border-[var(--border-subtle)] shadow-2xl z-20 overflow-y-auto p-6">
          <h3 className="font-bold text-[var(--text-primary)] mb-6 text-lg">Question Overview</h3>
          <div className="grid grid-cols-5 gap-3">
            {questions.map((q, idx) => {
              const isAns = !!answers[q.id];
              const isFlg = !!flags[q.id];
              const isCur = idx === currentIndex;
              
              let bgColor = 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]';
              if (isCur) bgColor = 'ring-2 ring-[var(--accent-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-bold';
              else if (isFlg) bgColor = 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/50';
              else if (isAns) bgColor = 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30';

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    goToQuestion(idx);
                    setIsDrawerOpen(false);
                  }}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm transition-all ${bgColor}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-8 space-y-3 text-sm text-[var(--text-secondary)]">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[var(--bg-secondary)]"></div> Unanswered</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30"></div> Answered</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/50"></div> Flagged</div>
          </div>
        </div>
      )}

    </div>
  );
}
