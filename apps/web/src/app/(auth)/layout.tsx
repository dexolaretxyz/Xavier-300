"use client";

import React from 'react';
import Link from 'next/link';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      {/* Fixed Header */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between p-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-accent-primary text-white flex items-center justify-center font-display font-bold text-xl group-hover:bg-accent-hover transition-colors">
            X
          </div>
          <span className="font-display font-bold text-text-primary text-xl tracking-tight hidden sm:block">
            Xavier 300
          </span>
        </Link>
        
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-bg-elevated border border-border-subtle text-text-secondary hover:text-text-primary shadow-sm transition-colors cursor-pointer"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex">
        {children}
      </main>
    </div>
  );
}
