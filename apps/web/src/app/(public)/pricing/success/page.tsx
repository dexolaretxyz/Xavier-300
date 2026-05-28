"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

export default function PricingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      setMessage('No payment reference found. Please contact support if you were charged.');
      return;
    }

    const verifyPayment = async () => {
      try {
        const { data } = await api.post('/api/payments/verify', { reference });
        if (data.success) {
          setStatus('success');
          setMessage('Payment successful! Your account has been upgraded.');
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        } else {
          setStatus('failed');
          setMessage('Payment verification failed.');
        }
      } catch (err: any) {
        setStatus('failed');
        setMessage(err.response?.data?.error?.message || 'An error occurred while verifying the payment.');
      }
    };

    verifyPayment();
  }, [reference, router]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-3xl p-12 max-w-md w-full text-center shadow-lg">
        
        {status === 'verifying' && (
          <>
            <Loader2 className="w-16 h-16 text-[var(--accent-primary)] animate-spin mx-auto mb-6" />
            <h2 className="font-display font-bold text-2xl text-[var(--text-primary)] mb-2">Verifying Payment</h2>
            <p className="font-ui text-[var(--text-secondary)]">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="font-display font-bold text-3xl text-[var(--text-primary)] mb-2">Thank You!</h2>
            <p className="font-ui text-[var(--text-secondary)] mb-6">{message}</p>
            <p className="font-ui text-sm text-[var(--text-muted)] animate-pulse">Redirecting to dashboard...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="font-display font-bold text-2xl text-[var(--text-primary)] mb-2">Payment Failed</h2>
            <p className="font-ui text-[var(--text-secondary)] mb-8">{message}</p>
            <button 
              onClick={() => router.push('/pricing')}
              className="px-6 py-3 bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-full font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              Return to Pricing
            </button>
          </>
        )}

      </div>
    </div>
  );
}
