"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Plus, Ticket, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function SupportDashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/api/tickets');
      if (res.data?.success) {
        setTickets(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 flex items-center gap-1"><AlertCircle size={12}/> Open</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle size={12}/> Resolved</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--text-primary)]">Support Center</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage your support tickets and contact our team.</p>
        </div>
        <Link 
          href="/support/new" 
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-xl font-medium transition-colors"
        >
          <Plus size={20} />
          New Ticket
        </Link>
      </div>

      <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
        {tickets.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-4 text-[var(--text-tertiary)]">
              <Ticket size={32} />
            </div>
            <h3 className="text-xl font-ui font-semibold text-[var(--text-primary)]">No support tickets</h3>
            <p className="text-[var(--text-secondary)] mt-2 mb-6 max-w-sm">You haven't opened any support tickets yet. Need help? Create one now.</p>
            <Link 
              href="/support/new" 
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-secondary)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl font-medium transition-colors"
            >
              Contact Support
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {tickets.map((ticket) => (
              <Link 
                key={ticket.id} 
                href={`/support/${ticket.id}`}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[var(--bg-hover)] transition-colors block"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    {getStatusBadge(ticket.status)}
                    <span className="text-xs font-medium text-[var(--text-tertiary)] px-2 py-0.5 rounded-md bg-[var(--bg-secondary)]">
                      {ticket.type}
                    </span>
                  </div>
                  <h4 className="text-lg font-ui font-semibold text-[var(--text-primary)] truncate">
                    {ticket.subject}
                  </h4>
                  <div className="flex items-center gap-4 mt-2 text-sm text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1.5"><Clock size={14} /> Updated {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}</span>
                    <span className="flex items-center gap-1.5"><Ticket size={14} /> #{ticket.id.split('-')[0]}</span>
                    <span className="flex items-center gap-1.5 text-[var(--accent-primary)] font-medium">
                      {ticket._count.messages} messages
                    </span>
                  </div>
                </div>
                <div className="shrink-0 hidden md:block">
                  <div className="text-[var(--accent-primary)] font-medium bg-[var(--accent-light)] px-4 py-2 rounded-lg">
                    View Thread
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
