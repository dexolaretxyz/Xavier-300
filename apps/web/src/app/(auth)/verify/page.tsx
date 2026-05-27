"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [activeOTPIndex, setActiveOTPIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push('/signup');
    }
    inputRef.current?.focus();
  }, [email, router]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleChange = ({ target }: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = target;
    const newOTP: string[] = [...otp];
    newOTP[index] = value.substring(value.length - 1); // allow only 1 char
    setOtp(newOTP);

    if (value && index < 5) {
      setActiveOTPIndex(index + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOTP: string[] = [...otp];
      newOTP[index] = "";
      setOtp(newOTP);
      if (index > 0) setActiveOTPIndex(index - 1);
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeOTPIndex]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const otpString = otp.join("");
    if (otpString.length < 6) {
      setApiError("Please enter all 6 digits");
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      const response = await api.post('/auth/verify-email', { email, otp: otpString });
      const { tokens, user } = response.data.data;
      setAuth(user, tokens.accessToken, tokens.refreshToken);
      router.push('/dashboard');
    } catch (error: any) {
      setApiError(error.response?.data?.error?.message || 'Invalid or expired OTP');
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setApiError('');
    try {
      await api.post('/auth/resend-otp', { email });
      setTimeLeft(60);
      setCanResend(false);
    } catch (error: any) {
      setApiError(error.response?.data?.error?.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-500 text-center">
      <div className="mb-8">
        <h2 className="text-[var(--text-display)] font-display font-bold text-[var(--text-primary)] leading-tight">
          Verify your email
        </h2>
        <p className="text-[var(--text-secondary)] mt-2">
          We've sent a 6-digit code to <strong>{email}</strong>
        </p>
      </div>

      {apiError && (
        <div className="p-3 mb-6 rounded-md bg-[var(--error-light)] text-[var(--error)] text-sm border border-[var(--error)]/20 text-left">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-center items-center space-x-2 sm:space-x-4">
          {otp.map((_, index) => (
            <React.Fragment key={index}>
              <input
                ref={index === activeOTPIndex ? inputRef : null}
                type="number"
                className="w-10 h-12 sm:w-12 sm:h-14 bg-transparent border-2 border-[var(--border-medium)] rounded-xl outline-none text-center font-mono text-xl sm:text-2xl font-semibold text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:bg-[var(--accent-glow)] transition-colors spin-button-none"
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                value={otp[index]}
              />
            </React.Fragment>
          ))}
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          .spin-button-none::-webkit-inner-spin-button, 
          .spin-button-none::-webkit-outer-spin-button { 
            -webkit-appearance: none; 
            margin: 0; 
          }
        `}} />

        <Button 
          type="submit" 
          disabled={isSubmitting || otp.join("").length < 6}
          className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-full py-6 font-ui text-base transition-colors"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          Verify Email
        </Button>
      </form>

      <div className="mt-8 text-sm text-[var(--text-secondary)]">
        {canResend ? (
          <button 
            type="button" 
            onClick={handleResend}
            disabled={isResending}
            className="text-[var(--accent-primary)] font-semibold hover:underline flex items-center justify-center mx-auto"
          >
            {isResending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Resend Code
          </button>
        ) : (
          <p>Resend code in {timeLeft}s</p>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="w-full flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" /></div>}>
      <VerifyContent />
    </Suspense>
  );
}
