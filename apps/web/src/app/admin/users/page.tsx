"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Loader2, Search, Mail, Shield, ShieldCheck } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/api/admin/users');
        setUsers(data.data);
      } catch (err) {
        console.error('Failed to load users', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">Users</h1>
          <p className="font-ui text-[var(--text-secondary)]">Manage registered accounts and subscriptions.</p>
        </div>
      </div>

      <div className="bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--border-subtle)] flex items-center">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg py-2 pl-10 pr-4 font-ui text-sm outline-none focus:border-[var(--accent-primary)]"
          />
        </div>
      </div>

      <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-ui">
            <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] text-xs uppercase tracking-wider text-[var(--text-muted)]">
              <tr>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Subscription</th>
                <th className="p-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)] mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--text-secondary)]">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--accent-light)] text-[var(--accent-primary)] flex items-center justify-center font-bold text-sm">
                          {u.fullName?.charAt(0) || 'U'}
                        </div>
                        <span className="font-medium text-[var(--text-primary)]">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)] flex items-center gap-2">
                      <Mail size={14} /> {u.email}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded flex items-center w-fit gap-1 ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role === 'ADMIN' ? <ShieldCheck size={12} /> : <Shield size={12} />}
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full w-fit ${
                        u.subscriptionStatus === 'SUBSCRIBED' ? 'bg-green-100 text-green-700' : 
                        u.subscriptionStatus === 'FREE_TRIAL' ? 'bg-amber-100 text-amber-700' : 
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {u.subscriptionStatus}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
