"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { ArrowLeft, Send, AlertCircle, CheckCircle, Clock, Loader2, User, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function TicketDetailsPage() {
  const params = useParams();
  const { user } = useAuthStore();
  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTicket();
  }, [params.ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/api/tickets/${params.ticketId}`);
      if (res.data?.success) {
        setTicket(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
      toast.error('Ticket not found');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post(`/api/tickets/${params.ticketId}/messages`, { message: replyMessage });
      if (res.data?.success) {
        setTicket({
          ...ticket,
          status: 'OPEN',
          messages: [...ticket.messages, res.data.data]
        });
        setReplyMessage('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to send reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 flex items-center gap-1.5"><AlertCircle size={14}/> Open</span>;
      case 'RESOLVED':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center gap-1.5"><CheckCircle size={14}/> Resolved</span>;
      default:
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" /></div>;
  }

  if (!ticket) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <h2 className="text-2xl font-display font-bold text-[var(--text-primary)]">Ticket Not Found</h2>
        <p className="text-[var(--text-secondary)] mt-2 mb-6">The ticket you're looking for doesn't exist or you don't have access to it.</p>
        <Link href="/support" className="px-6 py-3 bg-[var(--accent-primary)] text-white rounded-xl font-medium">Back to Support</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="shrink-0 mb-4">
        <Link 
          href="/support" 
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Back to Support
        </Link>
        <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">{ticket.subject}</h1>
            {getStatusBadge(ticket.status)}
          </div>
          <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)] border-t border-[var(--border-subtle)] pt-4">
            <span className="flex items-center gap-1.5"><Clock size={16} /> Opened {format(new Date(ticket.createdAt), 'MMM d, yyyy - h:mm a')}</span>
            <span className="flex items-center gap-1.5"><strong>ID:</strong> #{ticket.id.split('-')[0]}</span>
            <span className="flex items-center gap-1.5 bg-[var(--bg-secondary)] px-2 py-0.5 rounded-md text-[var(--text-primary)] text-xs font-medium uppercase tracking-wider">{ticket.type}</span>
          </div>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {ticket.messages.map((msg: any, idx: number) => {
            const isUser = !msg.isAdmin;
            return (
              <div key={msg.id} className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm ${isUser ? 'bg-[var(--accent-primary)]' : 'bg-gray-800 dark:bg-gray-700'}`}>
                  {isUser ? <User size={20} /> : <Shield size={20} />}
                </div>
                
                <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{isUser ? 'You' : 'Xavier Support'}</span>
                    <span className="text-xs text-[var(--text-tertiary)]">{format(new Date(msg.createdAt), 'h:mm a, MMM d')}</span>
                  </div>
                  <div className={`p-4 rounded-2xl whitespace-pre-wrap text-sm leading-relaxed ${
                    isUser 
                      ? 'bg-[var(--accent-primary)] text-white rounded-tr-sm' 
                      : 'bg-[var(--bg-secondary)] border border-[var(--border-medium)] text-[var(--text-primary)] rounded-tl-sm'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Input */}
        <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)]">
          {ticket.status === 'RESOLVED' && (
            <div className="mb-3 text-center text-sm text-[var(--text-secondary)]">
              This ticket is marked as resolved. Replying will reopen the ticket.
            </div>
          )}
          <form onSubmit={handleReply} className="flex gap-3">
            <input
              type="text"
              placeholder="Type your reply here..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              className="flex-1 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || !replyMessage.trim()}
              className="shrink-0 w-12 h-[50px] bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-1" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
