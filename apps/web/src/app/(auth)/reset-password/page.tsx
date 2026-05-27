"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const resetSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetForm = z.infer<typeof resetSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema)
  });

  useEffect(() => {
    if (!token) {
      setApiError('Invalid or missing password reset token.');
    }
  }, [token]);

  const onSubmit = async (data: ResetForm) => {
    if (!token) return;
    
    setApiError('');
    try {
      await api.post('/auth/reset-password', { token, newPassword: data.password });
      setIsSuccess(true);
    } catch (error: any) {
      setApiError(error.response?.data?.error?.message || 'Failed to reset password. The link might have expired.');
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full text-center animate-in fade-in duration-500">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-16 h-16 text-[var(--success)]" />
        </div>
        <h2 className="text-[var(--text-display)] font-display font-bold text-[var(--text-primary)] mb-4">
          Password Reset Complete
        </h2>
        <p className="text-[var(--text-secondary)] mb-8">
          Your password has been successfully updated. You can now log in with your new password.
        </p>
        <Link href="/login">
          <Button className="bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-full px-8">
            Go to Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-[var(--text-display)] font-display font-bold text-[var(--text-primary)] leading-tight">
          Reset Password
        </h2>
        <p className="text-[var(--text-secondary)] mt-2">
          Create a new password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {apiError && (
          <div className="p-3 rounded-md bg-[var(--error-light)] text-[var(--error)] text-sm border border-[var(--error)]/20">
            {apiError}
          </div>
        )}

        <div className="space-y-2 relative">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? 'text' : 'password'} 
              {...register('password')}
              className={errors.password ? "border-[var(--error)] pr-10" : "pr-10"}
              disabled={!token}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              disabled={!token}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-[var(--error)] text-sm">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input 
            id="confirmPassword" 
            type={showPassword ? 'text' : 'password'} 
            {...register('confirmPassword')}
            className={errors.confirmPassword ? "border-[var(--error)]" : ""}
            disabled={!token}
          />
          {errors.confirmPassword && <p className="text-[var(--error)] text-sm">{errors.confirmPassword.message}</p>}
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting || !token}
          className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-full py-6 mt-4 font-ui text-base transition-colors"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          Update Password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="w-full flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
