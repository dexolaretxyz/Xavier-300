"use client";

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Check, Shield, Zap, Sparkles } from 'lucide-react';

export default function PricingPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSubscribe = async (plan: 'MONTHLY' | 'ANNUAL') => {
    try {
      setLoadingPlan(plan);
      setError('');
      
      const { data } = await api.post('/api/payments/initiate', { plan });
      
      if (data.success && data.data?.authorization_url) {
        window.location.href = data.data.authorization_url; // Redirect to Paystack
      } else {
        setError('Failed to initiate payment. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'An error occurred while connecting to the payment gateway.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="font-display font-bold text-4xl md:text-5xl text-[var(--text-primary)] mb-4">
          Unlock Your Full Potential
        </h1>
        <p className="font-ui text-lg text-[var(--text-secondary)] mb-12 max-w-2xl mx-auto">
          Get unlimited mock exams, deep AI performance analysis, and priority access to new certifications.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl mb-8 font-ui text-sm inline-block">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
          
          {/* MONTHLY PLAN */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-3xl p-8 hover:shadow-xl transition-shadow relative overflow-hidden group">
            <h3 className="font-display font-bold text-2xl text-[var(--text-primary)] mb-2">Monthly</h3>
            <div className="flex items-end gap-1 mb-6">
              <span className="font-mono font-bold text-4xl text-[var(--text-primary)]">₦5,000</span>
              <span className="text-[var(--text-muted)] mb-1 font-ui">/mo</span>
            </div>
            
            <p className="font-ui text-[var(--text-secondary)] mb-8">
              Perfect for short-term preparation.
            </p>

            <ul className="space-y-4 mb-10 font-ui text-[var(--text-primary)]">
              <li className="flex items-center gap-3"><Check className="text-green-500 flex-shrink-0" size={20}/> Unlimited Mock Exams</li>
              <li className="flex items-center gap-3"><Check className="text-green-500 flex-shrink-0" size={20}/> AI Study Recommendations</li>
              <li className="flex items-center gap-3"><Check className="text-green-500 flex-shrink-0" size={20}/> Global Leaderboard Access</li>
              <li className="flex items-center gap-3"><Check className="text-green-500 flex-shrink-0" size={20}/> Standard Support</li>
            </ul>

            <button 
              onClick={() => handleSubscribe('MONTHLY')}
              disabled={loadingPlan !== null}
              className="w-full py-4 rounded-full border-2 border-[var(--border-strong)] text-[var(--text-primary)] font-bold hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingPlan === 'MONTHLY' ? 'Connecting...' : 'Subscribe Monthly'}
            </button>
          </div>

          {/* ANNUAL PLAN */}
          <div className="bg-[var(--accent-primary)] text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden transform md:-translate-y-4">
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 font-bold text-xs px-4 py-1 rounded-bl-xl font-ui uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={14} /> Most Popular
            </div>
            
            <h3 className="font-display font-bold text-2xl mb-2">Annual Access</h3>
            <div className="flex items-end gap-1 mb-2">
              <span className="font-mono font-bold text-4xl">₦50,000</span>
              <span className="text-indigo-200 mb-1 font-ui">/yr</span>
            </div>
            <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-bold font-ui mb-6">
              Save ₦10,000 ✨
            </div>
            
            <p className="font-ui text-indigo-100 mb-8">
              For serious students committed to mastering multiple certs.
            </p>

            <ul className="space-y-4 mb-10 font-ui text-white">
              <li className="flex items-center gap-3"><Check className="text-indigo-200 flex-shrink-0" size={20}/> Everything in Monthly</li>
              <li className="flex items-center gap-3"><Check className="text-indigo-200 flex-shrink-0" size={20}/> Priority Early Access to Certs</li>
              <li className="flex items-center gap-3"><Check className="text-indigo-200 flex-shrink-0" size={20}/> Resume Review (Beta)</li>
              <li className="flex items-center gap-3"><Check className="text-indigo-200 flex-shrink-0" size={20}/> Premium 24/7 Support</li>
            </ul>

            <button 
              onClick={() => handleSubscribe('ANNUAL')}
              disabled={loadingPlan !== null}
              className="w-full py-4 rounded-full bg-white text-[var(--accent-primary)] font-bold hover:bg-gray-50 transition-colors shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loadingPlan === 'ANNUAL' ? 'Connecting...' : 'Subscribe Annually'}
            </button>
          </div>

        </div>

        <div className="mt-16 text-center font-ui text-[var(--text-muted)] text-sm flex items-center justify-center gap-2">
          <Shield size={16} /> Secure payments powered by Paystack. Cancel anytime.
        </div>
      </div>
    </div>
  );
}
