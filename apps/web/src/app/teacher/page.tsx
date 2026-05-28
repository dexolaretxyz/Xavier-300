"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Loader2, CheckCircle2, Clock, XCircle, FileQuestion, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function TeacherOverviewPage() {
  const { user } = useAuthStore();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyQuestions = async () => {
      try {
        const { data } = await api.get('/api/questions/my');
        setQuestions(data.data || []);
      } catch (err) {
        console.error('Failed to load questions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyQuestions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  const approved = questions.filter(q => q.status === 'APPROVED').length;
  const pending = questions.filter(q => q.status === 'PENDING_REVIEW').length;
  const rejected = questions.filter(q => q.status === 'REJECTED').length;
  const total = questions.length;
  
  const approvalRate = total > 0 ? Math.round((approved / (approved + rejected)) * 100) || 0 : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">Welcome, {user?.fullName}</h1>
        <p className="font-ui text-[var(--text-secondary)]">Manage your submitted questions and track your contributions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Submissions */}
        <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg">
              <FileQuestion size={24} />
            </div>
            <span className="text-sm font-bold text-[var(--text-muted)]">TOTAL</span>
          </div>
          <p className="font-display font-bold text-3xl text-[var(--text-primary)]">{total}</p>
          <p className="font-ui text-sm text-[var(--text-secondary)] mt-1">Questions Submitted</p>
        </div>

        {/* Approved */}
        <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-lg">
              <CheckCircle2 size={24} />
            </div>
            <span className="text-sm font-bold text-[var(--text-muted)]">APPROVED</span>
          </div>
          <p className="font-display font-bold text-3xl text-[var(--text-primary)]">{approved}</p>
          <p className="font-ui text-sm text-[var(--text-secondary)] mt-1">{approvalRate}% Approval Rate</p>
        </div>

        {/* Pending */}
        <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-lg">
              <Clock size={24} />
            </div>
            <span className="text-sm font-bold text-[var(--text-muted)]">PENDING</span>
          </div>
          <p className="font-display font-bold text-3xl text-[var(--text-primary)]">{pending}</p>
          <p className="font-ui text-sm text-[var(--text-secondary)] mt-1">Awaiting Review</p>
        </div>

        {/* Rejected */}
        <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg">
              <XCircle size={24} />
            </div>
            <span className="text-sm font-bold text-[var(--text-muted)]">REJECTED</span>
          </div>
          <p className="font-display font-bold text-3xl text-[var(--text-primary)]">{rejected}</p>
          <p className="font-ui text-sm text-[var(--text-secondary)] mt-1">Needs Revision</p>
        </div>
      </div>

      {/* Quick Action */}
      <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-display font-bold text-xl text-emerald-900 dark:text-emerald-100">Draft a new question</h3>
          <p className="font-ui text-emerald-700 dark:text-emerald-300/80 mt-2 max-w-xl">
            Help expand the Xavier 300 question bank. Ensure your questions follow the certification syllabus and include clear explanations.
          </p>
        </div>
        <Link 
          href="/teacher/questions/new" 
          className="whitespace-nowrap px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-ui font-bold rounded-full transition-colors flex items-center gap-2"
        >
          Create Question <ArrowRight size={18} />
        </Link>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">Recent Activity</h2>
          <Link href="/teacher/questions" className="text-sm font-bold text-emerald-600 hover:underline">
            View All
          </Link>
        </div>
        
        <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
          {questions.length === 0 ? (
             <div className="p-8 text-center text-[var(--text-secondary)]">
               You haven't submitted any questions yet.
             </div>
          ) : (
            <table className="w-full text-left font-ui">
              <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] text-xs uppercase tracking-wider text-[var(--text-muted)]">
                <tr>
                  <th className="p-4 font-medium">Certification</th>
                  <th className="p-4 font-medium">Topic</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {questions.slice(0, 5).map((q) => (
                  <tr key={q.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                    <td className="p-4 font-medium text-[var(--text-primary)]">{q.certification?.name}</td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">{q.topic}</td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded w-fit ${
                        q.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        q.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)] text-right">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
