"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    setApiError('');
    try {
      const response = await api.post('/auth/login', data);
      const { tokens, user } = response.data.data;
      setAuth(user, tokens.accessToken, tokens.refreshToken);
      router.push('/dashboard');
    } catch (error: any) {
      setApiError(error.response?.data?.error?.message || 'An error occurred during login. Please try again.');
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-[var(--text-display)] font-display font-bold text-[var(--text-primary)] leading-tight">
          Welcome back
        </h2>
        <p className="text-[var(--text-secondary)] mt-2">
          Enter your details to access your dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

        <div className="space-y-2 relative">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-sm text-[var(--accent-primary)] hover:underline font-medium">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? 'text' : 'password'} 
              {...register('password')}
              className={errors.password ? "border-[var(--error)] pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-[var(--error)] text-sm">{errors.password.message}</p>}
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-full py-6 mt-4 font-ui text-base transition-colors"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          Sign In
        </Button>

        <div className="text-center mt-6">
          <p className="text-[var(--text-secondary)]">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[var(--accent-primary)] font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
