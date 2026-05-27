"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useExamStore } from '@/store/exam.store';
import { AlertTriangle, Clock, ShieldCheck, ListChecks, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExamLobbyPage() {
  const { id: certId } = useParams() as { id: string };
  const router = useRouter();
  const startExam = useExamStore(state => state.startExam);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setIsStarting(true);
    setError(null);

    try {
      // 1. Request fullscreen
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen().catch(() => {
          console.warn("Fullscreen request denied or not supported by browser");
          // Proceed anyway for this MVP, in prod we might enforce it
        });
      }

      // 2. Call API to start exam
      const { data } = await api.post('/exams/start', { certId });
      
      // 3. Initialize Zustand store
      startExam(
        data.data.attemptId, 
        data.data.sessionToken, 
        data.data.questions, 
        data.data.examDuration || 30
      );

      // 4. Navigate to session
      router.push(`/exam/${data.data.attemptId}/session`);

    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to start exam. You may have reached your daily limit.');
      setIsStarting(false);
      // Ensure we exit fullscreen if API failed
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => console.log(e));
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10">
      <div className="max-w-2xl w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-3xl p-8 shadow-sm">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-2">
            Exam Lobby
          </h1>
          <p className="text-[var(--text-secondary)]">Please read the rules carefully before proceeding.</p>
        </div>

        <div className="space-y-6 mb-8">
          
          {/* Rule 1 */}
          <div className="flex items-start gap-4">
            <div className="p-2 bg-[var(--bg-secondary)] rounded-lg text-[var(--text-primary)]">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="font-bold text-[var(--text-primary)]">Strictly Timed</h3>
              <p className="text-sm text-[var(--text-secondary)]">You will have exactly 30 minutes to complete 40 questions. The exam will auto-submit when time expires.</p>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="flex items-start gap-4">
            <div className="p-2 bg-[var(--bg-secondary)] rounded-lg text-[var(--text-primary)]">
              <ListChecks size={20} />
            </div>
            <div>
              <h3 className="font-bold text-[var(--text-primary)]">No Pausing</h3>
              <p className="text-sm text-[var(--text-secondary)]">Once started, the timer cannot be paused. Ensure you have a stable internet connection.</p>
            </div>
          </div>

          {/* Rule 3 - Anti-cheat */}
          <div className="flex items-start gap-4">
            <div className="p-2 bg-[var(--error)]/10 rounded-lg text-[var(--error)]">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-[var(--error)]">Anti-Cheat Enforcement Active</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                This exam must be taken in Fullscreen mode. Exiting fullscreen, switching tabs, right-clicking, or attempting to copy text will trigger an Integrity Violation and automatically submit your exam.
              </p>
            </div>
          </div>

        </div>

        {error && (
          <div className="mb-6 p-4 bg-[var(--error)]/10 text-[var(--error)] text-sm rounded-xl font-medium border border-[var(--error)]/20 text-center">
            {error}
          </div>
        )}

        <Button 
          onClick={handleStart} 
          disabled={isStarting}
          className="w-full py-6 text-lg rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white font-bold shadow-lg flex items-center justify-center gap-2"
        >
          <Maximize size={20} />
          {isStarting ? 'Preparing Session...' : 'Enter Fullscreen & Start Exam'}
        </Button>
        
        <div className="mt-4 text-center">
          <Button variant="ghost" onClick={() => router.back()} disabled={isStarting}>
            Cancel and Return
          </Button>
        </div>

      </div>
    </div>
  );
}
