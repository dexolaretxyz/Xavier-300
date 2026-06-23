"use client";

import React from 'react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center py-20">
        
        <div className="text-6xl mb-6">🎉</div>
        
        <h1 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-4">
          Free During Launch
        </h1>
        
        <p className="text-text-secondary font-ui text-lg leading-relaxed mb-8">
          Xavier 300 is completely free during our launch period.
          Create an account and get full access to all 
          certification practice exams — no payment required.
        </p>

        <div className="bg-bg-secondary rounded-2xl p-6 mb-8 border border-border-subtle">
          <p className="text-text-primary font-ui font-semibold text-lg mb-2">
            What you get for free:
          </p>
          <ul className="text-text-secondary font-ui text-left space-y-2">
            <li>✅ All 9 tech certification tracks</li>
            <li>✅ CHEW Nigerian Professional Exams</li>
            <li>✅ Unlimited practice exams</li>
            <li>✅ AI-powered recommendations</li>
            <li>✅ Weekly leaderboard</li>
            <li>✅ Score and speed tracking</li>
            <li>✅ AI theory marking</li>
          </ul>
        </div>

        <a href="/signup"
           className="inline-block w-full py-4 rounded-full bg-accent-primary text-white font-ui font-semibold text-lg hover:bg-accent-hover transition-all">
          Create Free Account
        </a>

        <p className="text-text-muted font-ui text-sm mt-4">
          Paid plans coming soon. Early users will get 
          a special discount. 🇳🇬
        </p>
      </div>
    </div>
  );
}
