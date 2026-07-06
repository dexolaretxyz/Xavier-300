"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromParams = searchParams.get('email');
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  
  const [authError, setAuthError] = useState<{ type: string; message: string; email: string } | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: emailFromParams || '',
      password: ''
    }
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  async function handleResendVerification(email: string) {
    setResendLoading(true);
    try {
      await api.post('/api/auth/resend-verification', { email });
      toast.success('Verification link sent! Check your inbox.');
      setResendCooldown(60);
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast.error('Failed to send verification link. Please try again.');
    } finally {
      setResendLoading(false);
    }
  }

  const onSubmit = async (data: LoginForm) => {
    setApiError('');
    setAuthError(null);
    try {
      await login(data);
      router.push('/dashboard');
    } catch (error: any) {
      const errCode = error.response?.data?.error?.code;
      const errMsg = error.response?.data?.error?.message || 'An error occurred during login. Please try again.';
      if (errCode === 'UNVERIFIED_EMAIL') {
        setAuthError({
          type: 'unverified',
          message: 'Your email is not verified yet.',
          email: data.email
        });
      } else {
        setApiError(errMsg);
      }
    }
  };

  return (
    <div className="w-full flex min-h-screen bg-bg-primary">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 bg-accent-primary flex-col justify-center items-center relative overflow-hidden">
        <div className="relative z-10 text-center px-12">
          <h1 className="font-display font-bold text-7xl text-white mb-6">
            Xavier 300
          </h1>
          <p className="font-ui text-lg text-white/70 max-w-md mx-auto">
            Practice like it's real. Pass like you prepared.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 bg-bg-primary flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[440px] bg-bg-secondary border border-border-subtle rounded-2xl p-8 shadow-sm">
          <div className="mb-[32px]">
            <h2 className="font-display font-bold text-[28px] text-accent-primary leading-tight">
              Welcome back
            </h2>
            <p className="font-ui text-text-muted mt-2 text-lg">
              Sign in to continue your practice
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {emailFromParams && !authError && !apiError && (
              <p className="text-sm text-accent-primary font-ui mb-4 text-left">
                👋 Welcome! Please log in with your existing account.
              </p>
            )}

            {apiError && (
              <div className="p-4 rounded-xl bg-error-light text-error text-sm border border-error/20 text-left">
                {apiError}
              </div>
            )}

            {authError?.type === 'unverified' && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 mt-4 text-left">
                <p className="text-amber-800 dark:text-amber-400 font-ui text-sm font-medium mb-1">
                  ⚠️ Email Not Verified
                </p>
                <p className="text-amber-700 dark:text-amber-300 font-ui text-sm mb-3">
                  You signed up but haven't verified your email yet.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleResendVerification(authError.email)}
                    disabled={resendLoading || resendCooldown > 0}
                    className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 text-sm font-ui font-medium text-left underline disabled:no-underline disabled:opacity-60 transition-all cursor-pointer"
                  >
                    {resendLoading 
                      ? 'Sending...' 
                      : resendCooldown > 0 
                      ? `Resend link in ${resendCooldown}s`
                      : "Didn't receive the email? Resend verification link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(
                      `/verify?email=${encodeURIComponent(authError.email)}`
                    )}
                    className="w-full mt-2 text-center px-4 py-2 rounded-full border border-amber-300 dark:border-amber-800 
                               text-amber-700 dark:text-amber-300 text-sm font-ui font-medium 
                               hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all cursor-pointer"
                  >
                    Go to Verification Page
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2 text-left">
              <label htmlFor="email" className="block font-ui text-text-primary font-medium">Email</label>
              <input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                {...register('email')}
                className={`w-full rounded-lg border ${errors.email ? 'border-error' : 'border-border-medium'} bg-bg-elevated px-4 py-[14px] font-ui text-[16px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-shadow`}
              />
              {errors.email && <p className="text-error text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block font-ui text-text-primary font-medium">Password</label>
              </div>
              <div className="relative">
                <input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full rounded-lg border ${errors.password ? 'border-error' : 'border-border-medium'} bg-bg-elevated px-4 py-[14px] pr-12 font-ui text-[16px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-shadow`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  {showPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-error text-sm mt-1">{errors.password.message}</p>}
              
              <div className="text-right pt-1">
                <Link href="/forgot-password" className="text-sm font-ui text-text-secondary hover:text-accent-primary transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-accent-primary hover:bg-accent-hover text-white rounded-lg py-[14px] font-ui font-medium text-[16px] transition-all mt-[32px] flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing you in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-border-medium"></div>
              <span className="flex-shrink-0 mx-4 text-text-muted font-ui text-sm">or</span>
              <div className="flex-grow border-t border-border-medium"></div>
            </div>

            <div className="text-center space-y-2">
              <p className="font-ui text-text-secondary">
                Don't have an account?{' '}
                <Link href="/signup" className="text-accent-primary font-medium hover:underline">
                  Sign up
                </Link>
              </p>
              <div className="pt-2">
                <Link href="/account-help" className="text-sm font-ui text-accent-primary hover:underline font-medium">
                  Having trouble? Get help →
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
