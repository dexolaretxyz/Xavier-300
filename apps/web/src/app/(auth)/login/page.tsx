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

  async function handleResendOTP(email: string) {
    setResendLoading(true);
    try {
      await api.post('/api/auth/resend-otp', { email });
      toast.success('Verification email sent! Check your inbox.');
      setResendCooldown(60);
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast.error('Failed to send email. Please try again.');
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
    <div className="w-full flex min-h-screen">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 bg-[var(--bg-secondary)] flex-col justify-center items-center relative overflow-hidden">
        {/* Subtle noise texture */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
            backgroundSize: '4px 4px'
          }}
        />
        
        <div className="relative z-10 text-center px-12">
          <h1 className="font-display font-bold text-7xl text-[var(--text-primary)] mb-6">
            Xavier 300
          </h1>
          <p className="font-ui text-lg text-[var(--text-secondary)] max-w-md mx-auto">
            Practice like it's real. Pass like you prepared.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 bg-[var(--bg-primary)] flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-[32px]">
            <h2 className="font-ui font-semibold text-[32px] text-[var(--text-primary)] leading-tight">
              Welcome back
            </h2>
            <p className="font-ui text-[var(--text-muted)] mt-2 text-lg">
              Sign in to continue your practice
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {emailFromParams && !authError && !apiError && (
              <p className="text-sm text-[var(--accent-primary)] font-ui mb-4 text-left">
                👋 Welcome! Please log in with your existing account.
              </p>
            )}

            {apiError && (
              <div className="p-4 rounded-xl bg-[var(--error-light)] text-[var(--error)] text-sm border border-[var(--error)]/20 text-left">
                {apiError}
              </div>
            )}

            {authError?.type === 'unverified' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4 text-left">
                <p className="text-amber-800 font-ui text-sm font-medium mb-1">
                  ⚠️ Email Not Verified
                </p>
                <p className="text-amber-700 font-ui text-sm mb-3">
                  You signed up but haven't verified your email yet.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleResendOTP(authError.email)}
                    disabled={resendLoading || resendCooldown > 0}
                    className="text-amber-600 hover:text-amber-800 text-sm font-ui font-medium text-left underline disabled:no-underline disabled:opacity-60 transition-all"
                  >
                    {resendLoading 
                      ? 'Sending...' 
                      : resendCooldown > 0 
                      ? `Resend in ${resendCooldown}s`
                      : "Didn't receive the email? Click here to resend"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(
                      `/verify?email=${encodeURIComponent(authError.email)}`
                    )}
                    className="w-full mt-2 text-center px-4 py-2 rounded-full border border-amber-300 
                               text-amber-700 text-sm font-ui font-medium 
                               hover:bg-amber-50 transition-all"
                  >
                    Enter Code Manually
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2 text-left">
              <label htmlFor="email" className="block font-ui text-[var(--text-primary)] font-medium">Email</label>
              <input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                {...register('email')}
                className={`w-full rounded-xl border ${errors.email ? 'border-[var(--error)]' : 'border-[var(--border-medium)]'} bg-[var(--bg-elevated)] px-4 py-[14px] font-ui text-[16px] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-shadow`}
              />
              {errors.email && <p className="text-[var(--error)] text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block font-ui text-[var(--text-primary)] font-medium">Password</label>
              </div>
              <div className="relative">
                <input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full rounded-xl border ${errors.password ? 'border-[var(--error)]' : 'border-[var(--border-medium)]'} bg-[var(--bg-elevated)] px-4 py-[14px] pr-12 font-ui text-[16px] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-shadow`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-[var(--error)] text-sm mt-1">{errors.password.message}</p>}
              
              <div className="text-right pt-1">
                <Link href="/forgot-password" className="text-sm font-ui text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-[100px] py-[14px] font-ui font-medium text-[16px] transition-all mt-[32px] flex items-center justify-center gap-2 disabled:opacity-70"
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
              <div className="flex-grow border-t border-[var(--border-medium)]"></div>
              <span className="flex-shrink-0 mx-4 text-[var(--text-muted)] font-ui text-sm">or</span>
              <div className="flex-grow border-t border-[var(--border-medium)]"></div>
            </div>

            <div className="text-center space-y-2">
              <p className="font-ui text-[var(--text-secondary)]">
                Don't have an account?{' '}
                <Link href="/signup" className="text-[var(--accent-primary)] font-medium hover:underline">
                  Sign up
                </Link>
              </p>
              <div className="pt-2">
                <Link href="/account-help" className="text-sm font-ui text-[var(--accent-primary)] hover:underline font-medium">
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
