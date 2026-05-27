"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string }>({
    resolver: zodResolver(forgotSchema)
  });

  const onSubmit = async (data: { email: string }) => {
    setApiError('');
    try {
      await api.post('/auth/forgot-password', data);
      setIsSuccess(true);
    } catch (error: any) {
      setApiError(error.response?.data?.error?.message || 'An error occurred. Please try again.');
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full text-center animate-in fade-in duration-500">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-16 h-16 text-[var(--success)]" />
        </div>
        <h2 className="text-[var(--text-display)] font-display font-bold text-[var(--text-primary)] mb-4">
          Check your email
        </h2>
        <p className="text-[var(--text-secondary)] mb-8">
          We've sent a password reset link to your email address. It will expire in 1 hour.
        </p>
        <Link href="/login">
          <Button className="bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-full px-8">
            Return to Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      <Link href="/login" className="inline-flex items-center text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to login
      </Link>
      
      <div className="mb-8">
        <h2 className="text-[var(--text-display)] font-display font-bold text-[var(--text-primary)] leading-tight">
          Forgot Password?
        </h2>
        <p className="text-[var(--text-secondary)] mt-2">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {apiError && (
          <div className="p-3 rounded-md bg-[var(--error-light)] text-[var(--error)] text-sm border border-[var(--error)]/20">
            {apiError}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="you@example.com" 
            {...register('email')}
            className={errors.email ? "border-[var(--error)]" : ""}
          />
          {errors.email && <p className="text-[var(--error)] text-sm">{errors.email.message}</p>}
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-full py-6 font-ui text-base transition-colors"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          Send Reset Link
        </Button>
      </form>
    </div>
  );
}
