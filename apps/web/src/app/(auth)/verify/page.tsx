'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { toast } from 'sonner'

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { setUser } = useAuthStore()
  
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  
  const [status, setStatus] = useState<
    'pending' | 'verifying' | 'success' | 'error' | 'resending'
  >('pending')
  
  const [errorMessage, setErrorMessage] = useState('')
  const [resendEmail, setResendEmail] = useState(email || '')
  const [resendCooldown, setResendCooldown] = useState(0)

  // If token is in URL, auto-verify immediately
  useEffect(() => {
    if (token && email) {
      verifyToken()
    }
  }, [token, email])

  async function verifyToken() {
    setStatus('verifying')
    try {
      const response = await api.get(
        `/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email!)}`
      )
      
      if (response.data.success) {
        // Set both localStorage and cookie
        localStorage.setItem('xavier_access_token', response.data.data.accessToken)
        localStorage.setItem('xavier_refresh_token', response.data.data.refreshToken)

        document.cookie = [
          `xavier_access_token=${response.data.data.accessToken}`,
          'path=/',
          'max-age=86400',
          'SameSite=Lax',
        ].join('; ')

        setUser(response.data.data.user)

        // Wait for cookie to be written before redirect
        await new Promise(resolve => setTimeout(resolve, 200))

        setStatus('success')
        toast.success('Email verified successfully!')
        
        setTimeout(() => router.push('/dashboard'), 2000)
      }
    } catch (err: any) {
      setStatus('error')
      setErrorMessage(
        err?.response?.data?.error?.message || 
        'Verification failed. Please try again.'
      )
      toast.error('Verification failed.')
    }
  }

  async function handleResend() {
    if (!resendEmail) return
    setStatus('resending')
    try {
      await api.post('/api/auth/resend-verification', { 
        email: resendEmail 
      })
      setStatus('pending')
      toast.success('Verification email sent! Check your inbox.')
      // Start cooldown
      setResendCooldown(60)
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) { clearInterval(interval); return 0 }
          return prev - 1
        })
      }, 1000)
    } catch (err: any) {
      setStatus('error')
      setErrorMessage(err?.response?.data?.error?.message || 'Failed to resend link. Please try again.')
      toast.error('Failed to resend verification link.')
    }
  }

  // VERIFYING STATE
  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
        <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="font-display font-bold text-[28px] text-accent-primary mb-2">
            Verifying...
          </h2>
          <p className="text-text-muted font-ui text-sm">
            Please wait while we verify your email.
          </p>
        </div>
      </div>
    )
  }

  // SUCCESS STATE
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
        <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="font-display font-bold text-[28px] text-accent-primary mb-2">
            Email Verified!
          </h2>
          <p className="text-text-muted font-ui mb-6 text-sm">
            Welcome to Xavier 300! Redirecting you to your dashboard...
          </p>
          <div className="w-full h-2 bg-bg-primary rounded-full overflow-hidden">
            <div className="h-full bg-accent-primary rounded-full animate-pulse" style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    )
  }

  // ERROR STATE
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
        <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="text-6xl mb-6">❌</div>
          <h2 className="font-display font-bold text-[28px] text-accent-primary mb-2">
            Link Invalid
          </h2>
          <p className="text-text-muted font-ui mb-6 text-sm">
            {errorMessage}
          </p>
          <div className="space-y-3">
            <input
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg border border-border-medium bg-bg-elevated text-text-primary font-ui focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-shadow"
            />
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="w-full py-4 rounded-lg bg-accent-primary text-white font-ui font-semibold text-base hover:bg-accent-hover disabled:opacity-60 transition-all cursor-pointer"
            >
              Send New Verification Link
            </button>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-4 rounded-lg border border-border-medium text-text-secondary font-ui font-medium hover:bg-bg-primary transition-all cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  // DEFAULT STATE — waiting for user to check email
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
        
        {/* Icon */}
        <div className="w-16 h-16 bg-bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl text-accent-primary">📧</span>
        </div>
        
        <h2 className="font-display font-bold text-[28px] text-accent-primary mb-3 leading-tight">
          Check Your Email
        </h2>
        
        <p className="text-text-muted font-ui text-base leading-relaxed mb-2">
          We sent a verification link to
        </p>
        <p className="text-accent-primary font-ui font-semibold text-lg mb-6">
          {email || 'your email address'}
        </p>

        {/* Instructions box */}
        <div className="bg-bg-primary rounded-xl p-5 mb-6 text-left space-y-3 border border-border-subtle">
          <div className="flex items-start gap-3">
            <span className="text-lg">1️⃣</span>
            <p className="text-text-secondary font-ui text-sm">
              Open your email inbox
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">2️⃣</span>
            <p className="text-text-secondary font-ui text-sm">
              Find the email from <strong>Xavier 300</strong>
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">3️⃣</span>
            <p className="text-text-secondary font-ui text-sm">
              Click the <strong>"Verify My Email"</strong> button
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">4️⃣</span>
            <p className="text-text-secondary font-ui text-sm">
              You will be automatically logged in
            </p>
          </div>
        </div>

        <p className="text-text-muted font-ui text-sm mb-2">
          Can't find the email? Check your spam folder.
        </p>

        {/* Resend button */}
        <button
          onClick={handleResend}
          disabled={status === 'resending' || resendCooldown > 0}
          className="w-full py-4 rounded-lg border border-border-medium text-text-secondary font-ui font-medium mt-4 hover:bg-bg-primary disabled:opacity-60 transition-all cursor-pointer"
        >
          {status === 'resending' 
            ? 'Sending...' 
            : resendCooldown > 0 
            ? `Resend in ${resendCooldown}s`
            : '📨 Resend Verification Email'}
        </button>

        <button
          onClick={() => router.push('/login')}
          className="w-full py-3 rounded-lg text-text-muted font-ui text-sm mt-2 hover:text-text-primary transition-all cursor-pointer"
        >
          Back to Login
        </button>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
