"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Loader2, Search, MessageSquare, Clock } from 'lucide-react';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data } = await api.get('/api/admin/tickets');
        setTickets(data.data || []);
      } catch (err) {
        console.error('Failed to load tickets', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">Support Tickets</h1>
          <p className="font-ui text-[var(--text-secondary)]">Manage user feedback and support requests.</p>
        </div>
      </div>

      <div className="bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--border-subtle)] flex items-center">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Search tickets..." 
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg py-2 pl-10 pr-4 font-ui text-sm outline-none focus:border-[var(--accent-primary)]"
          />
        </div>
      </div>

      <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-ui">
            <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] text-xs uppercase tracking-wider text-[var(--text-muted)]">
              <tr>
                <th className="p-4 font-medium">Subject</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)] mx-auto" />
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 flex flex-col items-center justify-center text-center text-[var(--text-secondary)]">
                    <MessageSquare size={40} className="mb-4 text-[var(--text-muted)]" />
                    <p>No support tickets at the moment.</p>
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                    <td className="p-4 font-medium text-[var(--text-primary)]">
                      {t.subject || 'No Subject'}
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-700 uppercase">
                        {t.status || 'OPEN'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)] flex items-center gap-1">
                      <Clock size={14} /> {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-sm font-bold text-[var(--accent-primary)] hover:underline">
                        View
                      </button>
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
