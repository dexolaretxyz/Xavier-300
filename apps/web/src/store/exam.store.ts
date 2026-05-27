import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

export type ExamStatus = 'IDLE' | 'IN_PROGRESS' | 'PAUSED' | 'SUBMITTING' | 'COMPLETED' | 'ERROR';

export interface ExamQuestion {
  id: string;
  text: string;
  options: Record<string, string>;
}

interface ExamState {
  attemptId: string | null;
  sessionToken: string | null;
  questions: ExamQuestion[];
  currentIndex: number;
  answers: Record<string, string>;
  flags: Record<string, boolean>;
  timeRemaining: number; // in seconds
  status: ExamStatus;
  integrityFlags: number;
  
  // Actions
  startExam: (attemptId: string, sessionToken: string, questions: ExamQuestion[], durationMins: number) => void;
  setAnswer: (questionId: string, optionKey: string) => void;
  toggleFlag: (questionId: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  tick: () => void;
  pauseExam: () => void;
  resumeExam: () => void;
  addIntegrityViolation: () => void;
  submitExam: () => Promise<void>;
  resetExam: () => void;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      attemptId: null,
      sessionToken: null,
      questions: [],
      currentIndex: 0,
      answers: {},
      flags: {},
      timeRemaining: 0,
      status: 'IDLE',
      integrityFlags: 0,

      startExam: (attemptId, sessionToken, questions, durationMins) => {
        set({
          attemptId,
          sessionToken,
          questions,
          currentIndex: 0,
          answers: {},
          flags: {},
          timeRemaining: durationMins * 60,
          status: 'IN_PROGRESS',
          integrityFlags: 0
        });
      },

      setAnswer: (questionId, optionKey) => {
        set((state) => ({
          answers: { ...state.answers, [questionId]: optionKey }
        }));
      },

      toggleFlag: (questionId) => {
        set((state) => ({
          flags: { ...state.flags, [questionId]: !state.flags[questionId] }
        }));
      },

      nextQuestion: () => {
        set((state) => ({
          currentIndex: Math.min(state.currentIndex + 1, state.questions.length - 1)
        }));
      },

      prevQuestion: () => {
        set((state) => ({
          currentIndex: Math.max(state.currentIndex - 1, 0)
        }));
      },

      goToQuestion: (index) => {
        set((state) => ({
          currentIndex: Math.max(0, Math.min(index, state.questions.length - 1))
        }));
      },

      tick: () => {
        const { status, timeRemaining } = get();
        if (status === 'IN_PROGRESS' && timeRemaining > 0) {
          set({ timeRemaining: timeRemaining - 1 });
        } else if (status === 'IN_PROGRESS' && timeRemaining <= 0) {
          // Time up! Auto submit
          get().submitExam();
        }
      },

      pauseExam: () => {
        if (get().status === 'IN_PROGRESS') {
          set({ status: 'PAUSED' });
        }
      },

      resumeExam: () => {
        if (get().status === 'PAUSED') {
          set({ status: 'IN_PROGRESS' });
        }
      },

      addIntegrityViolation: () => {
        set((state) => ({ integrityFlags: state.integrityFlags + 1 }));
        const flags = get().integrityFlags;
        if (flags >= 2) {
          get().submitExam();
        }
      },

      submitExam: async () => {
        const { attemptId, sessionToken, answers, timeRemaining, questions, integrityFlags } = get();
        if (!attemptId || !sessionToken) return;

        set({ status: 'SUBMITTING' });

        try {
          // Total exam duration was initially stored, but we didn't save it directly in state.
          // Assuming 40 questions -> typical 30-60 mins. We can calculate timeTaken roughly 
          // or pass it. Let's just track timeRemaining against a fixed 30 mins for now, 
          // or we should store totalDuration in state.
          // For now, let's just use 1800 (30 mins) as base.
          const timeTaken = 1800 - timeRemaining; 

          await api.post(`/exams/${attemptId}/submit`, {
            sessionToken,
            answers,
            timeTaken,
            integrityFlag: integrityFlags >= 2
          });

          set({ status: 'COMPLETED' });
        } catch (error) {
          console.error('Submit failed', error);
          set({ status: 'ERROR' }); // Allow retry if it's a network error
        }
      },

      resetExam: () => {
        set({
          attemptId: null,
          sessionToken: null,
          questions: [],
          currentIndex: 0,
          answers: {},
          flags: {},
          timeRemaining: 0,
          status: 'IDLE',
          integrityFlags: 0
        });
      }
    }),
    {
      name: 'xavier-exam-storage',
      // Only persist specific fields to avoid huge local storage usage if not needed, 
      // but questions array is small enough (~40 items).
    }
  )
);
