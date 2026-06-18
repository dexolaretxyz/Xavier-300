"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useExamStore } from '@/store/exam.store';
import { useAuthStore } from '@/store/auth.store';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, ChevronLeft, ChevronRight, AlertTriangle, Send, WifiOff, PenLine, CheckCircle2 } from 'lucide-react';

export default function TheorySessionPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    questions, currentIndex, theoryAnswers, timeRemaining, flags, status,
    setTheoryAnswer, toggleFlag, nextQuestion, prevQuestion, setCurrentIndex,
    tickTimer, submitTheoryExam, setStatus
  } = useExamStore();

  const [warnings, setWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const question = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const currentAnswer = question ? (theoryAnswers[question.id] || '') : '';
  const answeredCount = questions.filter(q => (theoryAnswers[q.id] || '').trim().length > 0).length;

  // Sync char count when question changes
  useEffect(() => {
    setCharCount(currentAnswer.length);
    // Restore textarea value
    if (textareaRef.current) {
      textareaRef.current.value = currentAnswer;
    }
  }, [currentIndex]);

  // Timer
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

  // Auto-submit on timeout
  useEffect(() => {
    if (status === 'SUBMITTING' && timeRemaining === 0) {
      handleForceSubmit(false);
    }
  }, [status, timeRemaining]);

  const handleCheatViolation = useCallback((message: string) => {
    setWarnings(prev => {
      const newWarnings = prev + 1;
      if (newWarnings >= 2) {
        handleForceSubmit(true);
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
      const attemptId = await submitTheoryExam(isViolation);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => console.log(e));
      }
      router.push(`/exam/${attemptId}/theory-results`);
    } catch (err) {
      console.error("Failed to auto-submit theory exam", err);
      alert("Failed to submit exam. Your answers are saved locally.");
    }
  };

  // Anti-cheat
  useEffect(() => {
    if (status !== 'IN_PROGRESS') return;

    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleCheatViolation("You exited fullscreen mode. Doing this again will automatically submit and void your exam.");
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);

    const onVisibilityChange = () => {
      if (document.hidden) {
        handleCheatViolation("You navigated away from the exam tab. Doing this again will automatically submit your exam.");
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const onContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', onContextMenu);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') e.preventDefault();
      // Allow Ctrl+A in textarea, but block other clipboard ops
      const activeTag = (document.activeElement as HTMLElement)?.tagName;
      if (activeTag !== 'TEXTAREA' && (e.ctrlKey || e.metaKey)) {
        if (['c', 'v', 'p', 's'].includes(e.key.toLowerCase())) {
          e.preventDefault();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);

    const onOffline = () => setIsOffline(true);
    const onOnline = () => setIsOffline(false);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, [status, handleCheatViolation]);

  const handleManualSubmit = async () => {
    const unanswered = questions.filter(q => !(theoryAnswers[q.id] || '').trim()).length;
    const confirmMsg = unanswered > 0
      ? `You have ${unanswered} unanswered question(s). Are you sure you want to submit?`
      : "Are you sure you want to submit your exam? You cannot change your answers after this.";
    
    if (confirm(confirmMsg)) {
      setStatus('SUBMITTING');
      try {
        const attemptId = await submitTheoryExam(false);
        if (document.fullscreenElement) document.exitFullscreen().catch(e => console.log(e));
        router.push(`/exam/${attemptId}/theory-results`);
      } catch (err) {
        console.error(err);
        setStatus('IN_PROGRESS');
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isTimeCritical = timeRemaining <= 300;

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
            <p>Your answers are saved locally. Reconnect to resume.</p>
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
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] text-white flex items-center justify-center font-display font-bold text-xl">X</div>
          <span className="font-ui font-semibold text-[var(--text-primary)] text-xl tracking-tight hidden sm:block">Xavier 300</span>
          <span className="ml-2 text-xs font-bold px-2 py-1 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 uppercase tracking-wider">
            Theory Exam
          </span>
        </div>

        <div className="font-ui font-medium text-[var(--text-secondary)]">
          Q{currentIndex + 1} of {questions.length} &nbsp;·&nbsp; {answeredCount}/{questions.length} answered
        </div>

        <div className="flex items-center gap-4">
          <span className="font-ui text-xs text-[var(--text-muted)] hidden md:inline-block">
            Today's Session — {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <div className={`font-mono font-bold text-2xl px-4 py-1 rounded-lg ${
            isTimeCritical
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse'
              : 'bg-[var(--bg-elevated)] text-[var(--text-primary)]'
          }`}>
            {formatTime(timeRemaining)}
          </div>
        </div>
      </header>

      {/* QUESTION NAVIGATOR — mini pills */}
      <div className="relative z-10 px-6 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex gap-1.5 overflow-x-auto">
        {questions.map((q, i) => {
          const isAnswered = (theoryAnswers[q.id] || '').trim().length > 0;
          const isFlagged = flags[q.id];
          const isCurrent = i === currentIndex;
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(i)}
              className={`flex-shrink-0 w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                isCurrent
                  ? 'bg-[var(--accent-primary)] text-white'
                  : isAnswered
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : isFlagged
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Question */}
          <div className="bg-[var(--bg-elevated)] rounded-2xl p-6 border border-[var(--border-subtle)]">
            <div className="flex items-start gap-3 mb-1">
              <PenLine size={20} className="text-[var(--accent-primary)] flex-shrink-0 mt-1" />
              <span className="text-xs font-bold text-[var(--accent-primary)] uppercase tracking-wider">Question {currentIndex + 1}</span>
            </div>
            <h2 className="font-ui font-medium text-xl md:text-2xl text-[var(--text-primary)] leading-relaxed">
              {question.text}
            </h2>
          </div>

          {/* Answer Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="theory-answer" className="text-sm font-ui font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Your Answer
              </label>
              <div className="flex items-center gap-2">
                {(theoryAnswers[question.id] || '').trim().length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                    <CheckCircle2 size={14} /> Saved
                  </span>
                )}
                <span className={`text-xs font-mono ${charCount < 50 ? 'text-[var(--text-muted)]' : charCount < 150 ? 'text-amber-500' : 'text-green-500'}`}>
                  {charCount} chars
                </span>
              </div>
            </div>
            <textarea
              id="theory-answer"
              ref={textareaRef}
              defaultValue={currentAnswer}
              onChange={(e) => {
                setTheoryAnswer(question.id, e.target.value);
                setCharCount(e.target.value.length);
              }}
              placeholder="Write your detailed answer here. Be specific, use correct terminology, and cover all key points..."
              rows={10}
              className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-ui text-base leading-relaxed resize-none focus:outline-none focus:border-[var(--accent-primary)] transition-colors placeholder:text-[var(--text-muted)]"
            />
            <p className="text-xs text-[var(--text-muted)] font-ui">
              💡 Aim for at least 100 words. Cover all key clinical points for maximum marks.
            </p>
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
            <span className="hidden sm:inline">{flags[question.id] ? 'Flagged' : 'Flag'}</span>
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleManualSubmit}
              disabled={status === 'SUBMITTING'}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-ui font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-md disabled:opacity-50"
            >
              <Send size={18} /> {status === 'SUBMITTING' ? 'Submitting...' : 'Submit for Marking'}
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

        {/* Progress bar */}
        <div className="max-w-4xl mx-auto mt-4 h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all duration-300"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
        <div className="max-w-4xl mx-auto mt-1 text-xs text-center text-[var(--text-muted)] font-ui">
          {answeredCount} of {questions.length} questions answered
        </div>
      </footer>

    </div>
  );
}
