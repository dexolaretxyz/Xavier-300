"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

export default function TeacherAddQuestionPage() {
  const router = useRouter();
  const [certifications, setCertifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    certificationId: '',
    topic: '',
    difficulty: 'MEDIUM',
    text: '',
    options: { A: '', B: '', C: '', D: '' },
    correctAnswer: 'A',
    explanation: ''
  });

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const { data } = await api.get('/api/domains'); 
        const allCerts = data.data.flatMap((d: any) => d.certifications);
        setCertifications(allCerts);
      } catch (err) {
        console.error('Failed to load certs', err);
      }
    };
    fetchCerts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/api/questions', form);
      toast.success('Question submitted successfully! It is now pending review.');
      router.push('/teacher/questions');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/teacher" className="p-2 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">Add New Question</h1>
          <p className="font-ui text-[var(--text-secondary)]">Draft a high-quality mock exam question.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Info */}
        <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="font-display font-bold text-lg border-b border-[var(--border-subtle)] pb-2 mb-4">Step 1: Categorisation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-ui font-medium text-sm text-[var(--text-primary)]">Certification</label>
              <select 
                required
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg p-3 font-ui outline-none focus:border-emerald-500"
                value={form.certificationId}
                onChange={(e) => setForm({ ...form, certificationId: e.target.value })}
              >
                <option value="" disabled>Select a certification...</option>
                {certifications.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-ui font-medium text-sm text-[var(--text-primary)]">Topic Tag</label>
              <input 
                type="text" 
                required
                placeholder="e.g. AWS S3, React Hooks"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg p-3 font-ui outline-none focus:border-emerald-500"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="font-ui font-medium text-sm text-[var(--text-primary)]">Difficulty</label>
              <div className="flex flex-wrap gap-4">
                {['EASY', 'MEDIUM', 'HARD'].map((diff) => (
                  <label key={diff} className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                    form.difficulty === diff 
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' 
                      : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                  }`}>
                    <input 
                      type="radio" 
                      name="difficulty" 
                      value={diff} 
                      className="hidden"
                      checked={form.difficulty === diff}
                      onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    />
                    <span className="font-ui font-bold text-sm">{diff}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Question Text */}
        <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-display font-bold text-lg border-b border-[var(--border-subtle)] pb-2">Step 2: Question Prompt</h2>
          <textarea 
            required
            placeholder="Write your question here... (Make it clear and unambiguous)"
            className="w-full h-32 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg p-4 font-ui outline-none focus:border-emerald-500 resize-none"
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
          />
        </div>

        {/* Options */}
        <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 mb-4">
            <h2 className="font-display font-bold text-lg">Step 3: Options & Answer</h2>
            <span className="text-sm font-ui text-[var(--text-muted)]">Select the radio button for the correct answer</span>
          </div>

          <div className="space-y-4">
            {['A', 'B', 'C', 'D'].map((letter) => (
              <div key={letter} className={`flex items-start gap-4 p-4 border rounded-xl transition-colors ${
                form.correctAnswer === letter 
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' 
                  : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)]'
              }`}>
                <input 
                  type="radio" 
                  name="correctAnswer" 
                  value={letter}
                  className="mt-3 w-5 h-5 accent-emerald-600"
                  checked={form.correctAnswer === letter}
                  onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-display font-bold w-6 h-6 rounded-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex items-center justify-center text-sm shadow-sm">{letter}</span>
                    <span className="font-ui font-bold text-sm text-[var(--text-secondary)]">Option {letter}</span>
                  </div>
                  <textarea 
                    required
                    placeholder={`Enter option ${letter}...`}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg p-3 font-ui outline-none focus:border-emerald-500 resize-none h-20"
                    value={form.options[letter as keyof typeof form.options]}
                    onChange={(e) => setForm({ 
                      ...form, 
                      options: { ...form.options, [letter]: e.target.value } 
                    })}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-display font-bold text-lg border-b border-[var(--border-subtle)] pb-2">Step 4: Explanation</h2>
          <p className="font-ui text-sm text-[var(--text-secondary)]">Provide a detailed explanation for why the chosen answer is correct. This is shown to students when reviewing their results.</p>
          <textarea 
            required
            placeholder="Explain the underlying concept..."
            className="w-full h-32 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg p-4 font-ui outline-none focus:border-emerald-500 resize-none"
            value={form.explanation}
            onChange={(e) => setForm({ ...form, explanation: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-[var(--border-subtle)]">
          <button 
            type="submit" 
            disabled={loading}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-ui font-bold rounded-full transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={18} />}
            Submit for Review
          </button>
        </div>

      </form>
    </div>
  );
}
