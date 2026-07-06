"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Key, UserPlus, LifeBuoy, Loader2, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function AccountHelpPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'options' | 'resend' | 'ticket'>('options');
  
  // Resend OTP Form States
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  // Ticket Form States
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketLoading, setTicketLoading] = useState(false);

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    
    setResendLoading(true);
    try {
      await api.post('/api/auth/resend-verification', { email: resendEmail });
      toast.success('Verification link sent! Check your inbox.');
      router.push(`/verify?email=${encodeURIComponent(resendEmail)}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to resend verification link. Make sure email exists.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketEmail || !ticketDescription) return;

    setTicketLoading(true);
    try {
      await api.post('/api/tickets', {
        subject: 'Account Access Recovery Request',
        description: `User requested manual recovery support.\n\nContact email: ${ticketEmail}\n\nUser explanation:\n${ticketDescription}`,
        category: 'ACCESS'
      });
      toast.success('Support ticket created! We will email you shortly.');
      setActiveTab('options');
      setTicketEmail('');
      setTicketDescription('');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit support ticket.');
    } finally {
      setTicketLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6 bg-bg-primary">
      <div className="w-full max-w-lg bg-bg-secondary p-8 sm:p-10 rounded-2xl shadow-sm border border-border-subtle text-left">
        
        {activeTab !== 'options' && (
          <button
            onClick={() => setActiveTab('options')}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to options
          </button>
        )}

        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-[28px] text-accent-primary">
            Account Recovery
          </h1>
          <p className="font-ui text-text-muted mt-2 text-[15px]">
            Having trouble accessing your account? Select an option below.
          </p>
        </div>

        {activeTab === 'options' && (
          <div className="space-y-4">
            {/* OPTION 1 */}
            <button
              onClick={() => setActiveTab('resend')}
              className="w-full flex items-start gap-4 p-5 rounded-xl border border-border-subtle bg-bg-primary/30 hover:border-accent-primary hover:bg-bg-primary text-left transition-all group cursor-pointer"
            >
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-amber-600 dark:text-amber-400">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-ui font-semibold text-lg text-text-primary group-hover:text-accent-primary transition-colors">
                  I can't verify my email
                </h3>
                <p className="font-ui text-sm text-text-muted mt-1">
                  Resend the verification link to your email.
                </p>
              </div>
            </button>

            {/* OPTION 2 */}
            <Link
              href="/forgot-password"
              className="w-full flex items-start gap-4 p-5 rounded-xl border border-border-subtle bg-bg-primary/30 hover:border-accent-primary hover:bg-bg-primary text-left transition-all group"
            >
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-blue-600 dark:text-blue-400">
                <Key size={24} />
              </div>
              <div>
                <h3 className="font-ui font-semibold text-lg text-text-primary group-hover:text-accent-primary transition-colors">
                  I forgot my password
                </h3>
                <p className="font-ui text-sm text-text-muted mt-1">
                  Reset your password through your email address.
                </p>
              </div>
            </Link>

            {/* OPTION 3 */}
            <Link
              href="/signup"
              className="w-full flex items-start gap-4 p-5 rounded-xl border border-border-subtle bg-bg-primary/30 hover:border-accent-primary hover:bg-bg-primary text-left transition-all group"
            >
              <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-xl text-green-600 dark:text-green-400">
                <UserPlus size={24} />
              </div>
              <div>
                <h3 className="font-ui font-semibold text-lg text-text-primary group-hover:text-accent-primary transition-colors">
                  My email doesn't exist
                </h3>
                <p className="font-ui text-sm text-text-muted mt-1">
                  Create a new account if you haven't signed up yet.
                </p>
              </div>
            </Link>

            {/* OPTION 4 */}
            <button
              onClick={() => setActiveTab('ticket')}
              className="w-full flex items-start gap-4 p-5 rounded-xl border border-border-subtle bg-bg-primary/30 hover:border-accent-primary hover:bg-bg-primary text-left transition-all group cursor-pointer"
            >
              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl text-purple-600 dark:text-purple-400">
                <LifeBuoy size={24} />
              </div>
              <div>
                <h3 className="font-ui font-semibold text-lg text-text-primary group-hover:text-accent-primary transition-colors">
                  None of these work
                </h3>
                <p className="font-ui text-sm text-text-muted mt-1">
                  Open a support ticket and our team will verify you manually.
                </p>
              </div>
            </button>
          </div>
        )}

        {activeTab === 'resend' && (
          <form onSubmit={handleResendVerification} className="space-y-5 text-left">
            <div className="space-y-2">
              <label htmlFor="resendEmail" className="block font-ui text-text-primary font-medium">Email Address</label>
              <input
                id="resendEmail"
                type="email"
                required
                placeholder="you@example.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="w-full rounded-lg border border-border-medium bg-bg-elevated px-4 py-[14px] font-ui text-[16px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-shadow"
              />
            </div>
            <button
              type="submit"
              disabled={resendLoading}
              className="w-full bg-accent-primary hover:bg-accent-hover text-white rounded-lg py-[14px] font-ui font-semibold text-[16px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {resendLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              Send Verification Email
            </button>
          </form>
        )}

        {activeTab === 'ticket' && (
          <form onSubmit={handleCreateTicket} className="space-y-5 text-left">
            <div className="space-y-2">
              <label htmlFor="ticketEmail" className="block font-ui text-text-primary font-medium">Contact Email Address</label>
              <input
                id="ticketEmail"
                type="email"
                required
                placeholder="you@example.com"
                value={ticketEmail}
                onChange={(e) => setTicketEmail(e.target.value)}
                className="w-full rounded-lg border border-border-medium bg-bg-elevated px-4 py-[14px] font-ui text-[16px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-shadow"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="ticketDescription" className="block font-ui text-text-primary font-medium">Explain your issue</label>
              <textarea
                id="ticketDescription"
                required
                rows={4}
                placeholder="Include details like your registered email/phone and what happens when you try to sign in..."
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                className="w-full rounded-lg border border-border-medium bg-bg-elevated px-4 py-[14px] font-ui text-[16px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-shadow"
              />
            </div>

            <button
              type="submit"
              disabled={ticketLoading}
              className="w-full bg-accent-primary hover:bg-accent-hover text-white rounded-lg py-[14px] font-ui font-semibold text-[16px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {ticketLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              Submit Support Ticket
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link href="/login" className="text-sm font-ui text-text-secondary hover:text-accent-primary hover:underline">
            Return to Login
          </Link>
        </div>

      </div>
    </div>
  );
}
