"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema)
  });

  const onSubmit = async (data: ForgotForm) => {
    setApiError('');
    try {
      await api.post('/api/auth/forgot-password', data);
      setIsSuccess(true);
    } catch (error: any) {
      setApiError(error.response?.data?.error?.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="w-full flex min-h-screen items-center justify-center p-6 bg-[var(--bg-primary)]">
      <div className="w-full max-w-[440px] bg-white p-8 rounded-2xl shadow-[var(--shadow-card)] border border-[var(--border-subtle)] text-left">
        
        <Link href="/login" className="inline-flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-8 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Back to login
        </Link>

        {isSuccess ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-[var(--success-light)] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} className="text-[var(--success)]" />
            </div>
            <h2 className="font-display font-bold text-2xl text-[var(--accent-primary)] mb-3">
              Reset link sent!
            </h2>
            <p className="font-ui text-[var(--text-secondary)] mb-6">
              Check your email. We've sent you a secure link to reset your password.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="font-display font-bold text-[28px] text-[var(--accent-primary)] leading-tight mb-2">
                Forgot password?
              </h2>
              <p className="font-ui text-[var(--text-muted)] text-[15px]">
                No worries, we'll send you reset instructions.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {apiError && (
                <div className="p-4 rounded-xl bg-[var(--error-light)] text-[var(--error)] text-sm border border-[var(--error)]/20">
                  {apiError}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="block font-ui text-[var(--text-primary)] font-medium">Email</label>
                <input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  {...register('email')}
                  className={`w-full rounded-lg border ${errors.email ? 'border-[var(--error)]' : 'border-[var(--border-medium)]'} bg-[var(--bg-elevated)] px-4 py-[14px] font-ui text-[16px] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-shadow`}
                />
                {errors.email && <p className="text-[var(--error)] text-sm mt-1">{errors.email.message}</p>}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-lg py-[14px] font-ui font-semibold text-[16px] transition-colors flex items-center justify-center cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Send Reset Link
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
