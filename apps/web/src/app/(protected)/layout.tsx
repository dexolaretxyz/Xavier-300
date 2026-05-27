"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Trophy, User, LifeBuoy, Bell, Menu, X, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { ThemeToggle } from '@/components/theme-toggle';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Support', href: '/support', icon: LifeBuoy },
  ];

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)]">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] z-20">
        <div className="h-20 flex items-center px-6 border-b border-[var(--border-subtle)]">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[var(--text-primary)] text-[var(--text-inverse)] rounded flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="font-display font-bold text-xl leading-none">X</span>
            </div>
            <span className="font-display font-bold text-xl text-[var(--text-primary)] tracking-tight">
              Xavier 300
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-[var(--accent-glow)] text-[var(--accent-primary)] font-medium' 
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-[var(--border-subtle)]">
          <button 
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-[var(--text-secondary)] hover:bg-[var(--error-light)] hover:text-[var(--error)] transition-colors"
          >
            <LogOut size={20} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 relative min-h-screen pb-20 md:pb-0">
        
        {/* Topbar */}
        <header className="h-20 bg-[var(--bg-glass)] backdrop-blur-md border-b border-[var(--border-subtle)] sticky top-0 z-10 flex items-center justify-between px-6">
          <div className="flex items-center gap-4 md:hidden">
            <div className="w-8 h-8 bg-[var(--text-primary)] text-[var(--text-inverse)] rounded flex items-center justify-center">
              <span className="font-display font-bold text-xl leading-none">X</span>
            </div>
          </div>

          <div className="hidden md:flex flex-1"></div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--error)] rounded-full"></span>
            </button>
            <ThemeToggle />
            <div className="h-8 w-px bg-[var(--border-subtle)] mx-2 hidden md:block"></div>
            <div className="hidden md:flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--accent-light)] text-[var(--accent-primary)] font-bold font-ui flex items-center justify-center border border-[var(--accent-primary)]/20">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[var(--text-primary)] leading-tight">{user?.fullName || 'User'}</span>
                <span className="text-xs text-[var(--text-muted)]">{user?.subscriptionStatus === 'ACTIVE' ? 'Pro Member' : 'Free Trial'}</span>
              </div>
            </div>
            
            <button 
              className="md:hidden p-2 text-[var(--text-primary)] -mr-2"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full max-w-[1280px] mx-auto p-6 md:p-8 animate-in fade-in duration-300">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)] flex items-center justify-around px-2 z-20 pb-safe">
        {navItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'
              }`}
            >
              <item.icon size={20} className={isActive ? 'fill-[var(--accent-primary)]/10' : ''} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative w-4/5 max-w-sm bg-[var(--bg-secondary)] h-full shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
            <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-light)] text-[var(--accent-primary)] font-bold flex items-center justify-center">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="font-bold text-[var(--text-primary)]">{user?.fullName || 'User'}</div>
                  <div className="text-xs text-[var(--text-muted)]">{user?.email}</div>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
              {navItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-4 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] active:bg-[var(--accent-glow)]"
                >
                  <item.icon size={22} className="text-[var(--text-muted)]" />
                  <span className="font-medium text-lg">{item.name}</span>
                </Link>
              ))}
            </div>
            
            <div className="p-6 border-t border-[var(--border-subtle)]">
              <button 
                onClick={() => { setMobileMenuOpen(false); logout(); }}
                className="flex items-center gap-3 text-[var(--error)] font-medium"
              >
                <LogOut size={22} />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
