"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Loader2, Search, FileQuestion, Filter } from 'lucide-react';
import Link from 'next/link';

export default function TeacherQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data } = await api.get('/api/questions/my');
        setQuestions(data.data || []);
      } catch (err) {
        console.error('Failed to load questions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">My Submissions</h1>
          <p className="font-ui text-[var(--text-secondary)]">View and track the status of all your submitted questions.</p>
        </div>
        <Link 
          href="/teacher/questions/new" 
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-ui font-bold rounded-full transition-colors flex items-center gap-2"
        >
          Add Question
        </Link>
      </div>

      <div className="bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--border-subtle)] flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 relative w-full">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Search questions by topic..." 
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg py-2 pl-10 pr-4 font-ui text-sm outline-none focus:border-[var(--accent-primary)]"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-ui font-medium text-sm transition-colors w-full md:w-auto">
          <Filter size={16} /> Filter Status
        </button>
      </div>

      <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-ui">
            <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] text-xs uppercase tracking-wider text-[var(--text-muted)]">
              <tr>
                <th className="p-4 font-medium">Certification</th>
                <th className="p-4 font-medium">Topic</th>
                <th className="p-4 font-medium w-1/3">Question Preview</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)] mx-auto" />
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 flex flex-col items-center justify-center text-center text-[var(--text-secondary)]">
                    <FileQuestion size={40} className="mb-4 text-[var(--text-muted)]" />
                    <p className="font-medium text-[var(--text-primary)] mb-1">No questions found</p>
                    <p className="text-sm">You haven't submitted any questions yet.</p>
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                    <td className="p-4 font-medium text-[var(--text-primary)]">{q.certification?.name}</td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">{q.topic}</td>
                    <td className="p-4 text-sm text-[var(--text-secondary)] truncate max-w-xs">
                      {q.text.substring(0, 50)}...
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full w-fit flex flex-col gap-1 items-start ${
                        q.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        q.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        <span>{q.status}</span>
                      </span>
                      {q.status === 'REJECTED' && q.rejectionNote && (
                        <p className="text-xs text-red-600 mt-2 max-w-xs italic">Note: {q.rejectionNote}</p>
                      )}
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)] text-right">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
