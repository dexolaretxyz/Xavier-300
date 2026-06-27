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

  const navLinks = [
    { name: 'Courses', href: '/courses' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Support', href: '/support' },
  ];

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full h-16 transition-all duration-300 border-b ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md border-[var(--border-subtle)] shadow-sm'
            : 'bg-white border-[var(--border-subtle)]'
        }`}
      >
        <div className="max-w-[1280px] mx-auto h-full px-6 flex items-center justify-between">
          {/* LEFT: Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-display font-bold text-[var(--accent-primary)] text-xl">
              Xavier 300
            </span>
          </Link>

          {/* CENTER: Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`font-ui text-sm font-medium transition-colors hover:text-[var(--accent-secondary)] hover:underline underline-offset-4 ${
                  pathname.startsWith(link.href)
                    ? 'text-[var(--accent-primary)]'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-4 z-50">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <div className="hidden sm:flex items-center gap-3">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 bg-[var(--accent-light)] hover:bg-[var(--accent-primary)] hover:text-white px-4 py-2 rounded-full font-ui font-medium text-sm transition-colors text-[var(--accent-primary)]"
                >
                  <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center">
                    <User size={14} />
                  </div>
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="font-ui text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white px-5 py-2.5 rounded-full font-ui font-medium text-sm transition-colors shadow-sm"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            <button
              className="md:hidden p-2 text-[var(--text-primary)]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-20 px-6 pb-6 flex flex-col md:hidden"
          >
            <div className="flex flex-col gap-4 font-ui text-xl">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="py-3 border-b border-[var(--border-subtle)] text-[var(--text-primary)] font-medium"
                >
                  {link.name}
                </Link>
              ))}

              <div className="mt-8">
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    className="block w-full text-center bg-[var(--accent-light)] border border-[var(--border-medium)] py-3 rounded-xl text-[var(--accent-primary)] font-medium"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/login"
                      className="block w-full text-center border border-[var(--border-medium)] py-3 rounded-xl text-[var(--text-primary)] font-medium"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="block w-full text-center bg-[var(--accent-primary)] text-white py-3 rounded-xl font-medium"
                    >
                      Get Started
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
