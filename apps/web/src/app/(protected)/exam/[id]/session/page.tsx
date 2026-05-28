"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useExamStore } from '@/store/exam.store';
import { useAuthStore } from '@/store/auth.store';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, ChevronLeft, ChevronRight, AlertTriangle, Send, WifiOff } from 'lucide-react';

export default function ExamSessionPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    questions, currentIndex, answers, timeRemaining, flags, status,
    setAnswer, toggleFlag, nextQuestion, prevQuestion, setCurrentIndex,
    tickTimer, submitExam, setStatus
  } = useExamStore();

  const [warnings, setWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const question = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  // 1. Timer Logic
  useEffect(() => {
    if (status === 'IN_PROGRESS' && !isOffline) {
      timerRef.current = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, isOffline, tickTimer]);

  // Auto-submit when time is up
  useEffect(() => {
    if (status === 'SUBMITTING' && timeRemaining === 0) {
      handleForceSubmit(false); // Normal timeout submit
    }
  }, [status, timeRemaining]);

  // 2. Anti-Cheat Handlers
  const handleCheatViolation = useCallback((message: string) => {
    setWarnings(prev => {
      const newWarnings = prev + 1;
      if (newWarnings >= 2) {
        handleForceSubmit(true); // Integrity violation
      } else {
        setWarningMessage(message);
        setShowWarningModal(true);
      }
      return newWarnings;
    });
  }, []);

  const handleForceSubmit = async (isViolation: boolean) => {
    setStatus('SUBMITTING');
    try {
      const attemptId = await submitExam(isViolation);
      // Ensure we exit fullscreen if forced submit
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => console.log(e));
      }
      router.push(`/exam/${attemptId}/results`);
    } catch (err) {
      console.error("Failed to auto-submit", err);
      // Fallback if network fails during forced submit
      alert("Failed to submit exam. Results are saved locally and will sync when online.");
    }
  };

  useEffect(() => {
    if (status !== 'IN_PROGRESS') return;

    // A. Fullscreen
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleCheatViolation("You exited fullscreen mode. Doing this again will automatically submit and void your exam.");
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);

    // B. Visibility (Tab switch)
    const onVisibilityChange = () => {
      if (document.hidden) {
        handleCheatViolation("You navigated away from the exam tab. Doing this again will automatically submit and void your exam.");
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // C. Right-click
    const onContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', onContextMenu);

    // D. Copy / Cut
    const onCopy = (e: ClipboardEvent) => e.preventDefault();
    document.addEventListener('copy', onCopy);
    document.addEventListener('cut', onCopy);

    // E. Keydown intercepts (DevTools, Copy, Paste)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (['c', 'v', 'a', 'p', 's'].includes(e.key.toLowerCase())) {
          e.preventDefault();
        }
      }
      if (e.key === 'F12') {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    // F. Network offline/online
    const onOffline = () => setIsOffline(true);
    const onOnline = () => setIsOffline(false);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('cut', onCopy);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, [status, handleCheatViolation]);

  // Manual Submit
  const handleManualSubmit = async () => {
    if (confirm("Are you sure you want to submit your exam? You cannot change your answers after this.")) {
      setStatus('SUBMITTING');
      try {
        const attemptId = await submitExam(false);
        if (document.fullscreenElement) document.exitFullscreen().catch(e => console.log(e));
        router.push(`/exam/${attemptId}/results`);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Format Time
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isTimeCritical = timeRemaining <= 300; // 5 mins

  if (!questions.length) {
    return <div className="p-8 text-center">No active session found.</div>;
  }

  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)] z-50 flex flex-col select-none overflow-hidden">
      
      {/* WATERMARK */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center opacity-[0.03]">
        <div className="transform -rotate-45 font-display font-bold text-9xl whitespace-nowrap text-black dark:text-white">
          {user?.id || 'XAVIER_STUDENT'} • {user?.email || 'STUDENT'}
        </div>
      </div>

      {/* OFFLINE OVERLAY */}
      <AnimatePresence>
        {isOffline && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white"
          >
            <WifiOff size={64} className="mb-4 text-red-500" />
            <h2 className="text-3xl font-bold mb-2">Connection Lost</h2>
            <p>Your exam is paused. Please reconnect to the internet to resume.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WARNING MODAL */}
      <AnimatePresence>
        {showWarningModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md p-8 text-center shadow-2xl border border-red-500/30"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">Integrity Warning</h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                {warningMessage}
              </p>
              <button 
                onClick={() => {
                  setShowWarningModal(false);
                  if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().catch(e => console.log(e));
                  }
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-full font-bold text-lg transition-colors"
              >
                I Understand, Resume Exam
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP BAR */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] text-white flex items-center justify-center font-display font-bold text-xl">X</div>
          <span className="font-ui font-semibold text-[var(--text-primary)] text-xl tracking-tight hidden sm:block">Xavier 300</span>
        </div>

        <div className="font-ui font-medium text-[var(--text-secondary)]">
          Question {currentIndex + 1} of {questions.length}
        </div>

        <div className={`font-mono font-bold text-2xl px-4 py-1 rounded-lg ${
          isTimeCritical 
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse' 
            : 'bg-[var(--bg-elevated)] text-[var(--text-primary)]'
        }`}>
          {formatTime(timeRemaining)}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-1 overflow-y-auto px-6 py-8 md:py-12">
        <div className="max-w-3xl mx-auto h-full flex flex-col">
          
          <div className="mb-8">
            <h2 className="font-ui font-medium text-2xl md:text-3xl text-[var(--text-primary)] leading-relaxed">
              {question.text}
            </h2>
          </div>

          <div className="space-y-4 mb-12">
            {Object.entries(question.options).map(([key, text]) => {
              const isSelected = answers[question.id] === key;
              return (
                <button
                  key={key}
                  onClick={() => setAnswer(question.id, key)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                    isSelected 
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-light)] shadow-sm'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-primary)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-ui font-bold text-sm ${
                    isSelected ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                  }`}>
                    {key}
                  </div>
                  <span className={`font-ui text-lg ${isSelected ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'}`}>
                    {text as React.ReactNode}
                  </span>
                </button>
              );
            })}
          </div>
          
        </div>
      </main>

      {/* BOTTOM BAR */}
      <footer className="relative z-10 bg-[var(--bg-primary)] border-t border-[var(--border-subtle)] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          
          <button 
            onClick={prevQuestion}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-ui font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={20} /> <span className="hidden sm:inline">Previous</span>
          </button>

          <button 
            onClick={() => toggleFlag(question.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-ui font-medium transition-colors ${
              flags[question.id] 
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <Bookmark size={20} className={flags[question.id] ? 'fill-current' : ''} />
            <span className="hidden sm:inline">{flags[question.id] ? 'Flagged' : 'Flag for review'}</span>
          </button>

          {isLastQuestion ? (
            <button 
              onClick={handleManualSubmit}
              disabled={status === 'SUBMITTING'}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-ui font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-md disabled:opacity-50"
            >
              <Send size={18} /> Submit Exam
            </button>
          ) : (
            <button 
              onClick={nextQuestion}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-ui font-bold text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] transition-colors shadow-md"
            >
              <span className="hidden sm:inline">Next</span> <ChevronRight size={20} />
            </button>
          )}

        </div>
        
        {/* Progress Bar (Visual) */}
        <div className="max-w-4xl mx-auto mt-4 h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--accent-primary)] transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </footer>

    </div>
  );
}
