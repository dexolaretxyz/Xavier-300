"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Menu, X, User } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { AnimatePresence, motion } from 'framer-motion';

export function Navbar() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme as 'light' | 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <>
      <nav 
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl transition-all duration-300 rounded-[100px] px-6 py-4 flex items-center justify-between
          ${scrolled ? 'bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] shadow-sm' : 'bg-transparent'}`}
      >
        {/* LEFT: Logo */}
        <Link href="/" className="flex items-center gap-2 group z-50">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] text-white flex items-center justify-center font-display font-bold text-xl group-hover:bg-[var(--accent-hover)] transition-colors">
            X
          </div>
          <span className="font-ui font-semibold text-[var(--text-primary)] text-xl tracking-tight hidden sm:block">
            Xavier 300
          </span>
        </Link>

        {/* CENTER: Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-1 rounded-full shadow-sm">
          <button className="px-4 py-2 rounded-full font-ui text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
            Menu
          </button>
          <Link href="/courses" className="px-4 py-2 rounded-full font-ui text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
            Browse Courses
          </Link>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-3 z-50">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-sm transition-colors"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <div className="hidden sm:block">
            {isAuthenticated ? (
              <Link href="/dashboard" className="flex items-center gap-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] px-4 py-2 rounded-full font-ui font-medium text-sm transition-colors text-[var(--text-primary)]">
                <div className="w-6 h-6 rounded-full bg-[var(--accent-light)] text-[var(--accent-primary)] flex items-center justify-center">
                  <User size={14} />
                </div>
                Dashboard
              </Link>
            ) : (
              <Link href="/signup" className="bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white px-5 py-2.5 rounded-full font-ui font-medium text-sm transition-colors shadow-sm">
                Start Free Trial
              </Link>
            )}
          </div>

          <button 
            className="md:hidden p-2 text-[var(--text-primary)]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[var(--bg-primary)] pt-28 px-6 pb-6 flex flex-col md:hidden"
          >
            <div className="flex flex-col gap-4 font-ui text-xl">
              <Link href="/courses" className="py-3 border-b border-[var(--border-subtle)] text-[var(--text-primary)] font-medium">Browse Courses</Link>
              <Link href="/pricing" className="py-3 border-b border-[var(--border-subtle)] text-[var(--text-primary)] font-medium">Pricing</Link>
              
              <div className="mt-8">
                {isAuthenticated ? (
                  <Link href="/dashboard" className="block w-full text-center bg-[var(--bg-elevated)] border border-[var(--border-medium)] py-3 rounded-xl text-[var(--text-primary)] font-medium">
                    Go to Dashboard
                  </Link>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link href="/login" className="block w-full text-center border border-[var(--border-medium)] py-3 rounded-xl text-[var(--text-primary)] font-medium">
                      Sign In
                    </Link>
                    <Link href="/signup" className="block w-full text-center bg-[var(--accent-primary)] text-white py-3 rounded-xl font-medium">
                      Start Free Trial
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
