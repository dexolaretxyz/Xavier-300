"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

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

  return (
    <div className="w-full flex min-h-screen items-center justify-center p-6 bg-bg-primary">
      <div className="w-full max-w-[440px] bg-bg-secondary p-8 rounded-2xl shadow-sm border border-border-subtle text-left">
        {isSuccess ? (
          <div className="text-center py-6">
            <div className="flex justify-center mb-6">
              <CheckCircle2 className="w-16 h-16 text-success" />
            </div>
            <h2 className="font-display font-bold text-2xl text-accent-primary mb-4">
              Password Reset Complete
            </h2>
            <p className="text-text-secondary mb-8">
              Your password has been successfully updated. You can now log in with your new password.
            </p>
            <Link href="/login">
              <button className="w-full bg-accent-primary hover:bg-accent-hover text-white rounded-lg py-3.5 font-ui font-semibold text-base transition-colors cursor-pointer">
                Go to Login
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="font-display font-bold text-[28px] text-accent-primary leading-tight">
                Reset Password
              </h2>
              <p className="text-text-muted mt-2 text-[15px]">
                Create a new password for your account.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {apiError && (
                <div className="p-3 rounded-md bg-error-light text-error text-sm border border-error/20">
                  {apiError}
                </div>
              )}

              <div className="space-y-2 relative">
                <label className="block font-ui text-text-primary font-medium" htmlFor="password">New Password</label>
                <div className="relative">
                  <input 
                    id="password" 
                    type={showPassword ? 'text' : 'password'} 
                    {...register('password')}
                    className={`w-full rounded-lg border ${errors.password ? 'border-error' : 'border-border-medium'} bg-bg-elevated px-4 py-[14px] pr-10 font-ui text-[16px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-shadow`}
                    disabled={!token}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
                    disabled={!token}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-error text-sm">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="block font-ui text-text-primary font-medium" htmlFor="confirmPassword">Confirm Password</label>
                <input 
                  id="confirmPassword" 
                  type={showPassword ? 'text' : 'password'} 
                  {...register('confirmPassword')}
                  className={`w-full rounded-lg border ${errors.confirmPassword ? 'border-error' : 'border-border-medium'} bg-bg-elevated px-4 py-[14px] font-ui text-[16px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-shadow`}
                  disabled={!token}
                />
                {errors.confirmPassword && <p className="text-error text-sm">{errors.confirmPassword.message}</p>}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || !token}
                className="w-full bg-accent-primary hover:bg-accent-hover text-white rounded-lg py-[14px] mt-4 font-ui font-semibold text-base transition-colors flex items-center justify-center cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Update Password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="w-full flex justify-center py-8 bg-bg-primary min-h-screen items-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
