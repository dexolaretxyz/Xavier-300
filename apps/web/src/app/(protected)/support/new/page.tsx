"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NewTicketPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'OTHER',
    description: ''
  });

  const categories = [
    { value: 'PAYMENT', label: 'Billing & Payments' },
    { value: 'ACCESS', label: 'Course Access Issues' },
    { value: 'EXAM_BUG', label: 'Report a Bug' },
    { value: 'ACCOUNT', label: 'Account Management' },
    { value: 'OTHER', label: 'Other Inquiries' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/api/tickets', formData);
      if (res.data?.success) {
        toast.success('Support ticket created successfully!');
        router.push(`/support/${res.data.data.id}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link 
        href="/support" 
        className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-2"
      >
        <ArrowLeft size={16} /> Back to Support
      </Link>
      
      <div>
        <h1 className="text-3xl font-display font-bold text-[var(--text-primary)]">Submit a Ticket</h1>
        <p className="text-[var(--text-secondary)] mt-1">We're here to help. Fill out the form below and we'll get back to you shortly.</p>
      </div>

      <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Issue Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-medium)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                required
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Subject</label>
              <input
                type="text"
                placeholder="Brief summary of the issue"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-medium)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                maxLength={100}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Description
              </label>
              <textarea
                placeholder="Please describe your issue in detail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-medium)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] min-h-[160px] resize-y"
                maxLength={1000}
                required
              />
              <div className="flex justify-end mt-1.5">
                <span className={`text-xs ${formData.description.length > 900 ? 'text-red-500' : 'text-[var(--text-tertiary)]'}`}>
                  {formData.description.length} / 1000
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-end gap-3">
            <Link 
              href="/support"
              className="px-6 py-3 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white font-medium rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
