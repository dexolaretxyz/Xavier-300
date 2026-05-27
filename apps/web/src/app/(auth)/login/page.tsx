"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    setApiError('');
    try {
      await login(data);
      router.push('/dashboard');
    } catch (error: any) {
      setApiError(error.response?.data?.error?.message || 'An error occurred during login. Please try again.');
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
                className={`w-full rounded-xl border ${errors.email ? 'border-[var(--error)]' : 'border-[var(--border-medium)]'} bg-[var(--bg-elevated)] px-4 py-[14px] font-ui text-[16px] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-shadow`}
              />
              {errors.email && <p className="text-[var(--error)] text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
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
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
              className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-[100px] py-[14px] font-ui font-medium text-[16px] transition-colors mt-[32px] flex items-center justify-center"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Sign In
            </button>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-[var(--border-medium)]"></div>
              <span className="flex-shrink-0 mx-4 text-[var(--text-muted)] font-ui text-sm">or</span>
              <div className="flex-grow border-t border-[var(--border-medium)]"></div>
            </div>

            <div className="text-center">
              <p className="font-ui text-[var(--text-secondary)]">
                Don't have an account?{' '}
                <Link href="/signup" className="text-[var(--accent-primary)] font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
