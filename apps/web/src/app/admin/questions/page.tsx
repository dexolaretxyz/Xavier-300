"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Check, X, Search, Filter, Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // AI Modal State
  const [certifications, setCertifications] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [genForm, setGenForm] = useState({
    certificationId: '',
    topic: '',
    count: 5,
    difficulty: 'MEDIUM'
  });

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/admin/questions');
      setQuestions(data.data);
    } catch (err) {
      console.error('Failed to load questions', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCerts = async () => {
    try {
      const { data } = await api.get('/api/domains'); 
      const allCerts = data.data.flatMap((d: any) => d.certifications);
      setCertifications(allCerts);
      if (allCerts.length > 0) setGenForm(prev => ({ ...prev, certificationId: allCerts[0].id }));
    } catch (err) {
      console.error('Failed to load certs', err);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchCerts();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      setActionLoadingId(id);
      await api.patch(`/api/admin/questions/${id}`, { status });
      setQuestions(prev => prev.map(q => q.id === id ? { ...q, status } : q));
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update question status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenLoading(true);
      await api.post('/api/admin/questions/generate', genForm);
      setIsModalOpen(false);
      fetchQuestions(); // Refresh list to show newly generated pending questions
      alert('Questions generated successfully! They are in PENDING_REVIEW state.');
    } catch (err: any) {
      console.error('AI Generation failed', err);
      alert(err.response?.data?.error?.message || 'Failed to generate questions');
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">Question Bank</h1>
          <p className="font-ui text-[var(--text-secondary)]">Manage and curate examination questions.</p>
        </div>
        
        <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
          <Dialog.Trigger asChild>
            <button className="bg-[var(--accent-primary)] text-white px-5 py-2.5 rounded-full font-ui font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2">
              <Sparkles size={16} />
              Generate with AI
            </button>
          </Dialog.Trigger>
          
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--bg-primary)] p-6 rounded-2xl shadow-xl z-50 border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title className="font-display font-bold text-xl flex items-center gap-2">
                  <BrainCircuit className="text-[var(--accent-primary)]" /> Generate Content
                </Dialog.Title>
                <Dialog.Close className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <X size={20} />
                </Dialog.Close>
              </div>

              <form onSubmit={handleGenerateAI} className="space-y-4">
                <div>
                  <label className="block font-ui text-sm font-medium mb-1">Certification</label>
                  <select 
                    value={genForm.certificationId} 
                    onChange={e => setGenForm({...genForm, certificationId: e.target.value})}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg p-2.5 font-ui text-sm focus:border-[var(--accent-primary)] outline-none"
                    required
                  >
                    {certifications.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-ui text-sm font-medium mb-1">Specific Topic</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Identity and Access Management" 
                    value={genForm.topic}
                    onChange={e => setGenForm({...genForm, topic: e.target.value})}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg p-2.5 font-ui text-sm focus:border-[var(--accent-primary)] outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-ui text-sm font-medium mb-1">Count</label>
                    <input 
                      type="number" 
                      min="1" max="20" 
                      value={genForm.count}
                      onChange={e => setGenForm({...genForm, count: parseInt(e.target.value)})}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg p-2.5 font-ui text-sm focus:border-[var(--accent-primary)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-ui text-sm font-medium mb-1">Difficulty</label>
                    <select 
                      value={genForm.difficulty}
                      onChange={e => setGenForm({...genForm, difficulty: e.target.value})}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg p-2.5 font-ui text-sm focus:border-[var(--accent-primary)] outline-none"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-[var(--border-subtle)]">
                  <button 
                    type="submit" 
                    disabled={genLoading}
                    className="w-full bg-[var(--accent-primary)] text-white py-3 rounded-lg font-bold font-ui hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                  >
                    {genLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    {genLoading ? 'Generating...' : 'Prompt Claude AI'}
                  </button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* FILTER BAR */}
      <div className="bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--border-subtle)] flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Search questions or topics..." 
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg py-2 pl-10 pr-4 font-ui text-sm outline-none focus:border-[var(--accent-primary)]"
          />
        </div>
        <div className="flex items-center gap-2 font-ui text-sm text-[var(--text-secondary)]">
          <Filter size={16} />
          <span>Status:</span>
          <select className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded p-1.5 outline-none">
            <option value="ALL">All</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="APPROVED">Approved</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-ui">
            <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] text-xs uppercase tracking-wider text-[var(--text-muted)]">
              <tr>
                <th className="p-4 font-medium">Question</th>
                <th className="p-4 font-medium">Certification</th>
                <th className="p-4 font-medium">Source & Topic</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
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
                  <td colSpan={5} className="p-8 text-center text-[var(--text-secondary)]">
                    No questions found in the bank.
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors group">
                    <td className="p-4">
                      <div className="line-clamp-2 text-sm text-[var(--text-primary)] max-w-sm">
                        {q.text}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-[var(--text-secondary)] font-medium">
                        {q.certification?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit ${
                          q.source === 'AI' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {q.source}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">{q.topic}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center w-fit gap-1 ${
                        q.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                        q.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          q.status === 'APPROVED' ? 'bg-green-500' : 
                          q.status === 'REJECTED' ? 'bg-red-500' : 
                          'bg-yellow-500'
                        }`} />
                        {q.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {q.status === 'PENDING_REVIEW' && (
                          <>
                            <button 
                              disabled={actionLoadingId === q.id}
                              onClick={() => handleUpdateStatus(q.id, 'APPROVED')}
                              className="w-8 h-8 rounded bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              {actionLoadingId === q.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            </button>
                            <button 
                              disabled={actionLoadingId === q.id}
                              onClick={() => handleUpdateStatus(q.id, 'REJECTED')}
                              className="w-8 h-8 rounded bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              {actionLoadingId === q.id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                            </button>
                          </>
                        )}
                        <button className="text-xs font-medium text-[var(--accent-primary)] hover:underline ml-2">
                          View
                        </button>
                      </div>
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
