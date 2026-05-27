"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'py-3 bg-[var(--bg-glass)] backdrop-blur-md border-b border-[var(--border-subtle)]' 
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 group z-50">
          <div className="relative w-8 h-8 flex items-center justify-center bg-[var(--text-primary)] text-[var(--text-inverse)] rounded-md transform group-hover:scale-105 transition-transform">
            <span className="font-display font-bold text-xl leading-none">X</span>
          </div>
          <span className="font-display font-bold text-xl text-[var(--text-primary)] tracking-tight">
            Xavier 300
          </span>
        </Link>

        {/* Center: Desktop Nav (Floating Pills) */}
        <nav className="hidden md:flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-1.5 rounded-full shadow-sm">
          <Link href="/courses" className="px-5 py-2 rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors">
            Browse Courses
          </Link>
          <Link href="/pricing" className="px-5 py-2 rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors">
            Pricing
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center gap-4 z-50">
          <ThemeToggle />
          
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button className="rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white px-6">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                Log in
              </Link>
              <Link href="/signup">
                <Button className="rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white px-6">
                  Start Free Trial
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-3 z-50">
          <ThemeToggle />
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-[var(--text-primary)] p-2 -mr-2"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-[var(--bg-primary)] z-40 flex flex-col pt-24 px-6 md:hidden animate-in fade-in slide-in-from-top-4">
          <nav className="flex flex-col gap-6 text-2xl font-display font-medium">
            <Link href="/courses" onClick={() => setMobileMenuOpen(false)}>Browse Courses</Link>
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
            {isAuthenticated ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>Sign Up (Free Trial)</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
