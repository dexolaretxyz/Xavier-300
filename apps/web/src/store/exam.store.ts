import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

interface Question {
  id: string;
  text: string;
  options: Record<string, string>;
  questionType?: 'MCQ' | 'THEORY' | 'PRACTICAL';
  imageUrl?: string;
  imageAlt?: string;
}

interface ExamState {
  // Session data
  attemptId: string | null;
  sessionToken: string | null;
  questions: Question[];
  examDuration: number;
  
  // Progress
  currentIndex: number;
  answers: Record<string, string>; // questionId -> selectedOptionKey (MCQ/PRACTICAL)
  theoryAnswers: Record<string, string>; // questionId -> written answer text (THEORY)
  timeRemaining: number; // in seconds
  flags: Record<string, boolean>; // questionId -> isFlagged
  status: 'IDLE' | 'IN_PROGRESS' | 'PAUSED' | 'SUBMITTING' | 'COMPLETED' | 'INTEGRITY_VIOLATION';
  
  // Actions
  initializeSession: (attemptId: string, sessionToken: string, questions: Question[], duration: number) => void;
  setAnswer: (questionId: string, answer: string) => void;
  setTheoryAnswer: (questionId: string, answer: string) => void;
  toggleFlag: (questionId: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  setCurrentIndex: (index: number) => void;
  tickTimer: () => void;
  setStatus: (status: ExamState['status']) => void;
  clearSession: () => void;
  submitExam: (integrityFlag?: boolean) => Promise<string>;
  submitTheoryExam: (integrityFlag?: boolean) => Promise<string>;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      attemptId: null,
      sessionToken: null,
      questions: [],
      examDuration: 0,
      
      currentIndex: 0,
      answers: {},
      theoryAnswers: {},
      timeRemaining: 0,
      flags: {},
      status: 'IDLE',

      initializeSession: (attemptId, sessionToken, questions, duration) => {
        set({
          attemptId,
          sessionToken,
          questions,
          examDuration: duration,
          timeRemaining: duration * 60,
          currentIndex: 0,
          answers: {},
          theoryAnswers: {},
          flags: {},
          status: 'IN_PROGRESS'
        });
      },

      setAnswer: (questionId, answer) => {
        set((state) => ({
          answers: { ...state.answers, [questionId]: answer }
        }));
      },

      setTheoryAnswer: (questionId, answer) => {
        set((state) => ({
          theoryAnswers: { ...state.theoryAnswers, [questionId]: answer }
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

      setCurrentIndex: (index) => {
        set({ currentIndex: index });
      },

      tickTimer: () => {
        set((state) => {
          if (state.status !== 'IN_PROGRESS') return state;
          const newTime = Math.max(state.timeRemaining - 1, 0);
          
          // Auto-submit logic handled in the component for async side-effects,
          // but we lock the state here if time runs out.
          if (newTime === 0) {
            return { timeRemaining: 0, status: 'SUBMITTING' };
          }
          
          return { timeRemaining: newTime };
        });
      },

      setStatus: (status) => set({ status }),

      clearSession: () => {
        set({
          attemptId: null,
          sessionToken: null,
          questions: [],
          currentIndex: 0,
          answers: {},
          theoryAnswers: {},
          timeRemaining: 0,
          flags: {},
          status: 'IDLE'
        });
      },

      submitExam: async (integrityFlag = false) => {
        const state = get();
        if (!state.attemptId || !state.sessionToken) throw new Error("No active session");
        
        set({ status: 'SUBMITTING' });
        
        try {
          const timeTaken = (state.examDuration * 60) - state.timeRemaining;
          
          const response = await api.post(`/api/exams/${state.attemptId}/submit`, {
            sessionToken: state.sessionToken,
            answers: state.answers,
            timeTaken,
            integrityFlag
          });
          
          set({ status: integrityFlag ? 'INTEGRITY_VIOLATION' : 'COMPLETED' });
          return response.data.data.attemptId;
        } catch (error) {
          set({ status: 'IN_PROGRESS' }); // Revert so user can retry
          throw error;
        }
      },

      submitTheoryExam: async (integrityFlag = false) => {
        const state = get();
        if (!state.attemptId || !state.sessionToken) throw new Error("No active session");
        
        set({ status: 'SUBMITTING' });
        
        try {
          const timeTaken = (state.examDuration * 60) - state.timeRemaining;
          
          const response = await api.post(`/api/exams/${state.attemptId}/submit-theory`, {
            sessionToken: state.sessionToken,
            theoryAnswers: state.theoryAnswers,
            timeTaken,
            integrityFlag
          });
          
          set({ status: integrityFlag ? 'INTEGRITY_VIOLATION' : 'COMPLETED' });
          return response.data.data.attemptId;
        } catch (error) {
          set({ status: 'IN_PROGRESS' }); // Revert so user can retry
          throw error;
        }
      }
    }),
    {
      name: 'xavier-exam-storage', // unique name
      partialize: (state) => ({ 
        attemptId: state.attemptId,
        sessionToken: state.sessionToken,
        questions: state.questions,
        examDuration: state.examDuration,
        currentIndex: state.currentIndex,
        answers: state.answers,
        theoryAnswers: state.theoryAnswers,
        timeRemaining: state.timeRemaining,
        flags: state.flags,
        status: state.status
      }),
    }
  )
);
