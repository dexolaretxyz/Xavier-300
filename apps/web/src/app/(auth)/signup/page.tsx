"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  state: z.string().min(2, 'Please select your state'),
  occupation: z.string().min(2, 'Occupation is required'),
  yearsExperience: z.number().min(0, 'Please select years of experience'),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      yearsExperience: -1,
      state: ''
    }
  });

  const passwordValue = watch('password', '');
  
  // Calculate password strength (0 to 100)
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 7) score += 25;
    if (pass.length > 10) score += 25;
    if (/[A-Z]/.test(pass)) score += 15;
    if (/[a-z]/.test(pass)) score += 15;
    if (/[0-9]/.test(pass)) score += 10;
    if (/[^A-Za-z0-9]/.test(pass)) score += 10;
    return Math.min(100, score);
  };

  const strength = calculateStrength(passwordValue);

  const onSubmit = async (data: SignupForm) => {
    setApiError('');
    try {
      await api.post('/auth/signup', data);
      // On success, pass email via query param to verify page
      router.push(`/verify?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      // Handle Zod array errors or standard message
      const errData = error.response?.data?.error?.message;
      if (Array.isArray(errData)) {
        setApiError(errData[0].message);
      } else {
        setApiError(errData || 'An error occurred during signup. Please try again.');
      }
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto">
      <div className="mb-6">
        <h2 className="text-[var(--text-display)] font-display font-bold text-[var(--text-primary)] leading-tight">
          Create Account
        </h2>
        <p className="text-[var(--text-secondary)] mt-1 text-sm">
          Join the elite 300. Prepare to pass your certifications.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError && (
          <div className="p-3 rounded-md bg-[var(--error-light)] text-[var(--error)] text-sm border border-[var(--error)]/20">
            {apiError}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full Name</Label>
          <Input 
            id="fullName" 
            placeholder="Adaeze Okafor" 
            {...register('fullName')}
            className={errors.fullName ? "border-[var(--error)]" : ""}
          />
          {errors.fullName && <p className="text-[var(--error)] text-xs">{errors.fullName.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              {...register('email')}
              className={errors.email ? "border-[var(--error)]" : ""}
            />
            {errors.email && <p className="text-[var(--error)] text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone" 
              type="tel" 
              placeholder="08012345678" 
              {...register('phone')}
              className={errors.phone ? "border-[var(--error)]" : ""}
            />
            {errors.phone && <p className="text-[var(--error)] text-xs">{errors.phone.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5 relative">
          <Label htmlFor="password">Password</Label>
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
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {/* Password Strength Indicator */}
          {passwordValue.length > 0 && (
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex-1 h-1.5 bg-[var(--border-subtle)] rounded-full overflow-hidden flex">
                <div 
                  className={`h-full transition-all duration-300 ${strength < 40 ? 'bg-[var(--error)]' : strength < 80 ? 'bg-[var(--warning)]' : 'bg-[var(--success)]'}`}
                  style={{ width: `${strength}%` }}
                />
              </div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] w-12 text-right">
                {strength < 40 ? 'Weak' : strength < 80 ? 'Good' : 'Strong'}
              </span>
            </div>
          )}
          {errors.password && <p className="text-[var(--error)] text-xs">{errors.password.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="state">State</Label>
            <select 
              id="state"
              {...register('state')}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.state ? "border-[var(--error)]" : ""}`}
            >
              <option value="" disabled>Select State</option>
              {NIGERIAN_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && <p className="text-[var(--error)] text-xs">{errors.state.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="yearsExperience">Experience</Label>
            <select 
              id="yearsExperience"
              {...register('yearsExperience', { valueAsNumber: true })}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.yearsExperience ? "border-[var(--error)]" : ""}`}
            >
              <option value={-1} disabled>Select Years</option>
              <option value={0}>0-1 years</option>
              <option value={2}>1-3 years</option>
              <option value={4}>3-5 years</option>
              <option value={7}>5-10 years</option>
              <option value={10}>10+ years</option>
            </select>
            {errors.yearsExperience && <p className="text-[var(--error)] text-xs">{errors.yearsExperience.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="occupation">Occupation</Label>
          <Input 
            id="occupation" 
            placeholder="e.g. Data Analyst, Student" 
            {...register('occupation')}
            className={errors.occupation ? "border-[var(--error)]" : ""}
          />
          {errors.occupation && <p className="text-[var(--error)] text-xs">{errors.occupation.message}</p>}
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-full py-6 mt-6 font-ui text-base transition-colors"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          Create Account
        </Button>

        <div className="text-center mt-4">
          <p className="text-[var(--text-secondary)] text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--accent-primary)] font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
