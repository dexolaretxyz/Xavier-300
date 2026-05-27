import React from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex w-full">
      {/* Left Side: Brand Display (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-[var(--bg-secondary)] flex-col justify-center items-center p-12 relative border-r border-[var(--border-subtle)]">
        {/* Abstract X mark could be an SVG here */}
        <div className="text-center max-w-lg">
          <h1 className="text-[var(--text-hero)] font-display font-bold text-[var(--text-primary)] leading-none mb-6">
            Xavier 300
          </h1>
          <p className="text-[var(--text-title)] font-display text-[var(--text-secondary)] italic">
            "Practice like it's real. Pass like you prepared."
          </p>
        </div>
      </div>

      {/* Right Side: Auth Forms */}
      <div className="w-full lg:w-1/2 flex flex-col bg-[var(--bg-primary)] relative">
        <div className="absolute top-6 right-6 z-10">
          <ThemeToggle />
        </div>
        
        <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Header (Only visible on small screens) */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-4xl font-display font-bold text-[var(--text-primary)] mb-2">
                Xavier 300
              </h1>
              <p className="text-[var(--text-secondary)] font-display italic">
                "Practice like it's real. Pass like you prepared."
              </p>
            </div>
            
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
