"use client";

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, HelpCircle, Users, MessageSquare, BarChart, LogOut, Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  const navItems = [
    { name: 'Overview', href: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Question Bank', href: '/admin/questions', icon: <HelpCircle size={20} /> },
    { name: 'Users', href: '/admin/users', icon: <Users size={20} /> },
    { name: 'Tickets', href: '/admin/tickets', icon: <MessageSquare size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[var(--bg-primary)] border-r border-[var(--border-subtle)] flex flex-col h-screen sticky top-0">
        <div className="p-6">
          <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">
            Xavier <span className="text-[var(--accent-primary)]">Admin</span>
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl font-ui text-sm font-medium transition-colors ${
                  isActive 
                  ? 'bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/20' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                }`}>
                  {item.icon}
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border-subtle)]">
          <button 
            onClick={() => { logout(); router.push('/login'); }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-ui text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            Exit Admin
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
