"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Library, Trophy, User, HelpCircle, Bell, Sun, Moon, Menu, X, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(savedTheme as 'light' | 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Courses', href: '/courses', icon: <Library size={20} /> },
    { name: 'Leaderboard', href: '/leaderboard', icon: <Trophy size={20} /> },
    { name: 'Profile', href: '/profile', icon: <User size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col md:flex-row">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 flex-col bg-[var(--bg-primary)] border-r border-[var(--border-subtle)] fixed h-full z-10">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] text-white flex items-center justify-center font-display font-bold text-xl">X</div>
            <span className="font-ui font-semibold text-[var(--text-primary)] text-xl tracking-tight">Xavier 300</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-ui font-medium transition-colors ${
                  isActive 
                    ? 'bg-[var(--accent-light)] text-[var(--accent-primary)]' 
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border-subtle)]">
          <Link
            href="/support"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-ui font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            <HelpCircle size={20} />
            Support
          </Link>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-4 py-3 mt-2 rounded-xl font-ui font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut size={20} />
            Log out
          </button>
        </div>
      </aside>

      {/* MOBILE TOPBAR */}
      <header className="md:hidden flex items-center justify-between p-4 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] sticky top-0 z-20">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] text-white flex items-center justify-center font-display font-bold text-xl">X</div>
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="text-[var(--text-secondary)]">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button className="text-[var(--text-secondary)]">
            <Bell size={20} />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* DESKTOP TOPBAR */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] sticky top-0 z-10">
          <div className="font-ui text-[var(--text-secondary)] text-sm">
            {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          
          <div className="flex items-center gap-6">
            <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button onClick={toggleTheme} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div className="h-6 w-px bg-[var(--border-medium)]"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--accent-light)] text-[var(--accent-primary)] flex items-center justify-center font-ui font-bold text-sm">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <span className="font-ui font-medium text-[var(--text-primary)] text-sm">{user?.fullName?.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM TAB BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-primary)] border-t border-[var(--border-subtle)] px-6 py-3 flex justify-between z-20 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 ${isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`}
            >
              {item.icon}
              <span className="text-[10px] font-ui font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
