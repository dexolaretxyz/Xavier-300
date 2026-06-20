"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(10, 'Phone number must be valid'),
  state: z.string().min(2, 'State is required'),
  occupation: z.string().min(2, 'Occupation is required'),
  yearsExperience: z.coerce.number().min(0)
});

type SignupForm = z.infer<typeof signupSchema>;

const STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema) as any
  });

  const passwordValue = watch('password', '');
  
  // Simple password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-[var(--border-medium)]' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.match(/[A-Z]/) && pass.match(/[0-9]/)) score++;
    if (pass.match(/[^A-Za-z0-9]/)) score++;
    
    if (score === 1) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score, label: 'Strong', color: 'bg-green-500' };
    return { score: 0, label: '', color: 'bg-[var(--border-medium)]' };
  };

  const strength = getPasswordStrength(passwordValue);

  const [unverifiedRedirect, setUnverifiedRedirect] = useState(false);

  const onSubmit = async (data: SignupForm) => {
    setApiError('');
    setUnverifiedRedirect(false);
    try {
      await api.post('/api/auth/signup', data);
      router.push(`/verify?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      const errCode = error.response?.data?.error?.code;
      const errMsg = error.response?.data?.error?.message || 'An error occurred during signup. Please try again.';
      if (errCode === 'EMAIL_UNVERIFIED') {
        // Account exists but is unverified — backend already sent a fresh OTP
        setApiError(errMsg);
        setUnverifiedRedirect(true);
        setTimeout(() => {
          router.push(`/verify?email=${encodeURIComponent(data.email)}`);
        }, 2500);
      } else {
        setApiError(errMsg);
      }
    }
  };

  return (
    <div className="w-full flex min-h-screen">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 bg-[var(--bg-secondary)] flex-col justify-center items-center relative overflow-hidden fixed h-screen">
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

      {/* RIGHT PANEL - Scrollable */}
      <div className="w-full lg:w-1/2 lg:ml-auto bg-[var(--bg-primary)] flex items-center justify-center p-6 sm:p-12 min-h-screen">
        <div className="w-full max-w-[420px] py-12">
          <div className="mb-[32px]">
            <h2 className="font-ui font-semibold text-[32px] text-[var(--text-primary)] leading-tight">
              Create an account
            </h2>
            <p className="font-ui text-[var(--text-muted)] mt-2 text-lg">
              Start your journey with Xavier 300
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {apiError && (
              <div className={`p-4 rounded-xl text-sm border ${unverifiedRedirect ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-[var(--error-light)] text-[var(--error)] border-[var(--error)]/20'}`}>
                <p>{typeof apiError === 'string' ? apiError : JSON.stringify(apiError)}</p>
                {unverifiedRedirect && (
                  <div className="mt-3 pt-3 border-t border-amber-200 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    <span className="font-medium">Redirecting to verification page...</span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="fullName" className="block font-ui text-[var(--text-primary)] font-medium">Full Name</label>
              <input 
                id="fullName" 
                type="text" 
                placeholder="John Doe" 
                {...register('fullName')}
                className={`w-full rounded-xl border ${errors.fullName ? 'border-[var(--error)]' : 'border-[var(--border-medium)]'} bg-[var(--bg-elevated)] px-4 py-[14px] font-ui text-[16px] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]`}
              />
              {errors.fullName && <p className="text-[var(--error)] text-sm mt-1">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block font-ui text-[var(--text-primary)] font-medium">Email</label>
              <input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                {...register('email')}
                className={`w-full rounded-xl border ${errors.email ? 'border-[var(--error)]' : 'border-[var(--border-medium)]'} bg-[var(--bg-elevated)] px-4 py-[14px] font-ui text-[16px] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]`}
              />
              {errors.email && <p className="text-[var(--error)] text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block font-ui text-[var(--text-primary)] font-medium">Password</label>
              <div className="relative">
                <input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full rounded-xl border ${errors.password ? 'border-[var(--error)]' : 'border-[var(--border-medium)]'} bg-[var(--bg-elevated)] px-4 py-[14px] pr-12 font-ui text-[16px] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              <div className="flex gap-1 mt-2">
                {[1, 2, 3].map((segment) => (
                  <div 
                    key={segment} 
                    className={`h-1.5 w-1/3 rounded-full ${strength.score >= segment ? strength.color : 'bg-[var(--border-medium)]'}`}
                  />
                ))}
              </div>
              {strength.label && (
                <p className={`text-xs font-medium mt-1 ${strength.score === 1 ? 'text-red-500' : strength.score === 2 ? 'text-amber-500' : 'text-green-500'}`}>
                  {strength.label}
                </p>
              )}
              {errors.password && <p className="text-[var(--error)] text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block font-ui text-[var(--text-primary)] font-medium">Phone Number</label>
              <input 
                id="phone" 
                type="tel" 
                placeholder="080XXXXXXXX" 
                {...register('phone')}
                className={`w-full rounded-xl border ${errors.phone ? 'border-[var(--error)]' : 'border-[var(--border-medium)]'} bg-[var(--bg-elevated)] px-4 py-[14px] font-ui text-[16px] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]`}
              />
              {errors.phone && <p className="text-[var(--error)] text-sm mt-1">{errors.phone.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="state" className="block font-ui text-[var(--text-primary)] font-medium">State</label>
                <select 
                  id="state" 
                  {...register('state')}
                  className={`w-full rounded-xl border ${errors.state ? 'border-[var(--error)]' : 'border-[var(--border-medium)]'} bg-[var(--bg-elevated)] px-4 py-[14px] font-ui text-[16px] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] appearance-none`}
                >
                  <option value="">Select state...</option>
                  {STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.state && <p className="text-[var(--error)] text-sm mt-1">{errors.state.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="yearsExperience" className="block font-ui text-[var(--text-primary)] font-medium">Experience</label>
                <select 
                  id="yearsExperience" 
                  {...register('yearsExperience')}
                  className={`w-full rounded-xl border ${errors.yearsExperience ? 'border-[var(--error)]' : 'border-[var(--border-medium)]'} bg-[var(--bg-elevated)] px-4 py-[14px] font-ui text-[16px] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] appearance-none`}
                >
                  <option value="">Select...</option>
                  <option value="0">0-1 years</option>
                  <option value="1">1-3 years</option>
                  <option value="3">3-5 years</option>
                  <option value="5">5-10 years</option>
                  <option value="10">10+ years</option>
                </select>
                {errors.yearsExperience && <p className="text-[var(--error)] text-sm mt-1">{errors.yearsExperience.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="occupation" className="block font-ui text-[var(--text-primary)] font-medium">Occupation</label>
              <input 
                id="occupation" 
                type="text" 
                placeholder="e.g. Software Engineer" 
                {...register('occupation')}
                className={`w-full rounded-xl border ${errors.occupation ? 'border-[var(--error)]' : 'border-[var(--border-medium)]'} bg-[var(--bg-elevated)] px-4 py-[14px] font-ui text-[16px] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]`}
              />
              {errors.occupation && <p className="text-[var(--error)] text-sm mt-1">{errors.occupation.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-[100px] py-[14px] font-ui font-medium text-[16px] transition-colors mt-[32px] flex items-center justify-center"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Create Account
            </button>

            <div className="text-center pt-4">
              <p className="font-ui text-[var(--text-secondary)]">
                Already have an account?{' '}
                <Link href="/login" className="text-[var(--accent-primary)] font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
