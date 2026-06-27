"use client";

import React from 'react';

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-bg-primary">
      <div className="text-center max-w-5xl mx-auto w-full mb-12">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-4">
          Start Practicing Today
        </h1>
        <p className="font-ui text-xl text-text-secondary">
          Built for Nigerian tech professionals
        </p>
      </div>

      <div className="max-w-md w-full mx-auto">
        <div className="bg-bg-secondary rounded-2xl p-10 border-2 border-accent-primary text-center">
          
          <h3 className="font-display text-4xl font-bold text-text-primary mb-3">
            Completely Free
          </h3>
          
          <p className="text-text-secondary font-ui text-base leading-relaxed mb-8">
            Full access during our launch period.
            No credit card required.
          </p>
          
          <ul className="text-left space-y-3 mb-8">
            <li className="flex items-center gap-3 text-text-secondary font-ui">
              <span className="text-green-500 text-lg">✅</span>
              All certifications
            </li>
            <li className="flex items-center gap-3 text-text-secondary font-ui">
              <span className="text-green-500 text-lg">✅</span>
              Unlimited exams
            </li>
            <li className="flex items-center gap-3 text-text-secondary font-ui">
              <span className="text-green-500 text-lg">✅</span>
              AI recommendations
            </li>
            <li className="flex items-center gap-3 text-text-secondary font-ui">
              <span className="text-green-500 text-lg">✅</span>
              Weekly leaderboard
            </li>
          </ul>
          
          <a href="/signup"
             className="block w-full py-4 rounded-full bg-accent-primary text-white font-ui font-semibold text-lg hover:bg-accent-hover transition-all text-center no-underline">
            Start Practicing Free
          </a>
          
          <p className="text-text-muted font-ui text-sm mt-4">
            Paid plans coming soon. Early users get a special discount. 🇳🇬
          </p>
        </div>
      </div>
    </div>
  );
}
