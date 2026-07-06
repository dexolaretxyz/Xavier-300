"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

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
  
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-border-medium' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.match(/[A-Z]/) && pass.match(/[0-9]/)) score++;
    if (pass.match(/[^A-Za-z0-9]/)) score++;
    
    if (score === 1) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score, label: 'Strong', color: 'bg-green-500' };
    return { score: 0, label: '', color: 'bg-border-medium' };
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
      
      if (errCode === 'EMAIL_EXISTS') {
        toast.error('Account already exists. Redirecting to login...');
        setApiError('An account with this email already exists. Redirecting to login...');
        setTimeout(() => {
          router.push(`/login?email=${encodeURIComponent(data.email)}`);
        }, 2000);
      } else if (errCode === 'EMAIL_UNVERIFIED_EXISTS') {
        toast.warning('Account exists but not verified.');
        setApiError('An account with this email exists but is not verified. Redirecting to verification...');
        setUnverifiedRedirect(true);
        setTimeout(() => {
          router.push(`/verify?email=${encodeURIComponent(data.email)}&resend=true`);
        }, 2000);
      } else {
        setApiError(errMsg);
      }
    }
  };

  return (
    <div className="w-full flex min-h-screen bg-bg-primary">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 bg-accent-primary flex-col justify-center items-center relative overflow-hidden fixed h-screen">
        <div className="relative z-10 text-center px-12">
          <h1 className="font-display font-bold text-7xl text-white mb-6">
            Xavier 300
          </h1>
          <p className="font-ui text-lg text-white/70 max-w-md mx-auto">
            Practice like it's real. Pass like you prepared.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL - Scrollable */}
      <div className="w-full lg:w-1/2 lg:ml-auto bg-bg-primary flex items-center justify-center p-6 sm:p-12 min-h-screen">
        <div className="w-full max-w-[440px] bg-bg-secondary border border-border-subtle rounded-2xl p-8 shadow-sm my-12">
          <div className="mb-[32px]">
            <h2 className="font-display font-bold text-[28px] text-accent-primary leading-tight">
              Create an account
            </h2>
            <p className="font-ui text-text-muted mt-2 text-lg">
              Start your journey with Xavier 300
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {apiError && (
              <div className={`p-4 rounded-xl text-sm border ${unverifiedRedirect ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-error-light text-error border-error/20'}`}>
                <p>{typeof apiError === 'string' ? apiError : JSON.stringify(apiError)}</p>
                {unverifiedRedirect && (
                  <div className="mt-3 pt-3 border-t border-amber-200 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    <span className="font-medium">Redirecting to verification page...</span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2 text-left">
              <label htmlFor="fullName" className="block font-ui text-text-primary font-medium">Full Name</label>
              <input 
                id="fullName" 
                type="text" 
                placeholder="John Doe" 
                {...register('fullName')}
                className={`w-full rounded-lg border ${errors.fullName ? 'border-error' : 'border-border-medium'} bg-bg-elevated px-4 py-[14px] font-ui text-[16px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-shadow`}
              />
              {errors.fullName && <p className="text-error text-sm mt-1">{errors.fullName.message}</p>}
            </div>

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
              <label htmlFor="password" className="block font-ui text-text-primary font-medium">Password</label>
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
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              <div className="flex gap-1 mt-2">
                {[1, 2, 3].map((segment) => (
                  <div 
                    key={segment} 
                    className={`h-1.5 w-1/3 rounded-full ${strength.score >= segment ? strength.color : 'bg-border-medium'}`}
                  />
                ))}
              </div>
              {strength.label && (
                <p className={`text-xs font-medium mt-1 ${strength.score === 1 ? 'text-red-500' : strength.score === 2 ? 'text-amber-500' : 'text-green-500'}`}>
                  {strength.label}
                </p>
              )}
              {errors.password && <p className="text-error text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div className="space-y-2 text-left">
              <label htmlFor="phone" className="block font-ui text-text-primary font-medium">Phone Number</label>
              <input 
                id="phone" 
                type="tel" 
                placeholder="080XXXXXXXX" 
                {...register('phone')}
                className={`w-full rounded-lg border ${errors.phone ? 'border-error' : 'border-border-medium'} bg-bg-elevated px-4 py-[14px] font-ui text-[16px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-shadow`}
              />
              {errors.phone && <p className="text-error text-sm mt-1">{errors.phone.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <label htmlFor="state" className="block font-ui text-text-primary font-medium">State</label>
                <select 
                  id="state" 
                  {...register('state')}
                  className={`w-full rounded-lg border ${errors.state ? 'border-error' : 'border-border-medium'} bg-bg-elevated px-4 py-[14px] font-ui text-[16px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-shadow appearance-none`}
                >
                  <option value="">Select state...</option>
                  {STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.state && <p className="text-error text-sm mt-1">{errors.state.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="yearsExperience" className="block font-ui text-text-primary font-medium">Experience</label>
                <select 
                  id="yearsExperience" 
                  {...register('yearsExperience')}
                  className={`w-full rounded-lg border ${errors.yearsExperience ? 'border-error' : 'border-border-medium'} bg-bg-elevated px-4 py-[14px] font-ui text-[16px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-shadow appearance-none`}
                >
                  <option value="">Select...</option>
                  <option value="0">0-1 years</option>
                  <option value="1">1-3 years</option>
                  <option value="3">3-5 years</option>
                  <option value="5">5-10 years</option>
                  <option value="10">10+ years</option>
                </select>
                {errors.yearsExperience && <p className="text-error text-sm mt-1">{errors.yearsExperience.message}</p>}
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label htmlFor="occupation" className="block font-ui text-text-primary font-medium">Occupation</label>
              <input 
                id="occupation" 
                type="text" 
                placeholder="e.g. Software Engineer" 
                {...register('occupation')}
                className={`w-full rounded-lg border ${errors.occupation ? 'border-error' : 'border-border-medium'} bg-bg-elevated px-4 py-[14px] font-ui text-[16px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-shadow`}
              />
              {errors.occupation && <p className="text-error text-sm mt-1">{errors.occupation.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-accent-primary hover:bg-accent-hover text-white rounded-lg py-[14px] font-ui font-medium text-[16px] transition-colors mt-[32px] flex items-center justify-center cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Create Account
            </button>

            <div className="text-center pt-4 space-y-2">
              <p className="font-ui text-text-secondary">
                Already have an account?{' '}
                <Link href="/login" className="text-accent-primary font-medium hover:underline">
                  Sign in
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
