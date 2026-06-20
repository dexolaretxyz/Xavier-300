"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');
  const shouldAutoResend = searchParams.get('resend') === 'true';
  const setAuth = useAuthStore(state => state.setUser);
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleResend = async (force: boolean = false) => {
    if (!email) return;
    if (!force && countdown > 0) return;
    
    setResending(true);
    setError('');
    try {
      await api.post('/api/auth/resend-otp', { email });
      toast.success('Verification email sent! Check your inbox.');
      setCountdown(60);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to resend code.');
      toast.error('Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  useEffect(() => {
    if (shouldAutoResend && email) {
      handleResend(true);
    }
  }, [shouldAutoResend, email]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (fullCode: string) => {
    if (fullCode.length !== 6 || !email) return;
    
    setIsVerifying(true);
    setError('');
    
    try {
      const response = await api.post('/api/auth/verify-email', { email, otp: fullCode });
      const { tokens, user } = response.data.data;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('xavier_access_token', tokens.accessToken);
        localStorage.setItem('xavier_refresh_token', tokens.refreshToken);
        document.cookie = `xavier_access_token=${tokens.accessToken}; path=/; max-age=900`;
      }
      
      setAuth(user);
      toast.success('Email verified successfully! Welcome to Xavier 300.');
      router.push('/dashboard');
    } catch (err: any) {
      const nextAttempts = wrongAttempts + 1;
      setWrongAttempts(nextAttempts);

      if (nextAttempts >= 3) {
        setResending(true);
        try {
          await api.post('/api/auth/resend-otp', { email });
          setError("Too many incorrect attempts. We've sent a new code.");
          toast.warning("New verification code sent due to incorrect attempts.");
          setCountdown(60);
          setWrongAttempts(0);
        } catch (resendErr: any) {
          setError(resendErr.response?.data?.error?.message || 'Too many incorrect attempts. Failed to resend code.');
        } finally {
          setResending(false);
          setIsVerifying(false);
          setCode(['', '', '', '', '', '']);
        }
      } else {
        const remaining = 3 - nextAttempts;
        setError(`Incorrect code. Please try again. (${remaining} attempts remaining)`);
        setIsVerifying(false);
      }
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.substring(value.length - 1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newCode.join('');
    if (fullCode.length === 6) {
      handleVerify(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6).replace(/[^0-9]/g, '');
    
    if (pastedData) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length; i++) {
        newCode[i] = pastedData[i];
      }
      setCode(newCode);
      
      const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
      inputRefs.current[focusIndex]?.focus();
      
      if (pastedData.length === 6) {
        handleVerify(pastedData);
      }
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6 bg-[var(--bg-primary)]">
      <div className="w-full max-w-md bg-[var(--bg-elevated)] p-10 rounded-[32px] shadow-[var(--shadow-lg)] text-center border border-[var(--border-subtle)]">
        
        <div className="w-20 h-20 bg-[var(--accent-light)] rounded-full flex items-center justify-center mx-auto mb-8">
          <Mail size={40} className="text-[var(--accent-primary)]" />
        </div>
        
        <h1 className="font-ui font-bold text-3xl text-[var(--text-primary)] mb-3">
          Check your email
        </h1>
        <div className="font-ui text-[var(--text-secondary)] text-[16px] mb-8 space-y-2">
          <p>We sent a 6-digit verification code to <span className="font-medium text-[var(--text-primary)]">{email}</span></p>
          <p className="text-sm text-[var(--text-muted)]">Can't find it? Check your spam folder.</p>
          <p className="text-xs text-[var(--text-muted)] italic">The code expires in 15 minutes.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--error-light)] text-[var(--error)] text-sm border border-[var(--error)]/20 text-left">
            {error}
          </div>
        )}

        <div className="flex justify-between mb-8 gap-2">
          {code.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => { inputRefs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              disabled={isVerifying}
              className="w-[56px] h-[64px] text-center font-mono text-2xl font-bold bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-xl focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-glow)] transition-all disabled:opacity-50"
            />
          ))}
        </div>

        {isVerifying && (
          <div className="flex items-center justify-center text-[var(--accent-primary)] mb-6 font-ui">
            <Loader2 className="animate-spin mr-2" size={20} />
            Verifying code...
          </div>
        )}

        <button 
          onClick={() => handleResend(false)}
          disabled={countdown > 0 || resending}
          className="font-ui text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50 transition-colors font-medium"
        >
          {resending ? 'Resending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
        </button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
