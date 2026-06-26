"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Loader2, Search, Mail, Shield, ShieldCheck, Key, X, Check } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleVerifyManually = async (userId: string) => {
    try {
      setVerifying(true);
      await api.patch(`/api/admin/users/${userId}/verify-manually`);
      toast.success('User verified successfully.');
      await fetchUsers();
      setSelectedUser(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error?.message || 'Failed to verify user manually.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendVerification = async (email: string) => {
    try {
      setResending(true);
      await api.post('/api/auth/resend-verification', { email });
      toast.success('Verification link resent successfully.');
      
      // Reload users to get updated token & expiry
      const { data } = await api.get('/api/admin/users');
      setUsers(data.data);
      
      // Find and update current selected user in modal state
      const updatedUser = data.data.find((u: any) => u.email === email);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error?.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)] mx-auto" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--text-secondary)]">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--accent-light)] text-[var(--accent-primary)] flex items-center justify-center font-bold text-sm">
                          {u.fullName?.charAt(0) || 'U'}
                        </div>
                        <span className="font-medium text-[var(--text-primary)]">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                      <div className="flex items-center gap-2">
                        <Mail size={14} /> {u.email}
                      </div>
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
                    <td className="p-4 text-right">
                      {!u.emailVerified ? (
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[var(--accent-light)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white transition-colors"
                        >
                          Get OTP
                        </button>
                      ) : (
                        <span className="text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-full">
                          Verified
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Verification / OTP Modal */}
      <Dialog.Root open={!!selectedUser} onOpenChange={(open) => { if (!open) setSelectedUser(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--bg-primary)] p-6 rounded-2xl shadow-xl z-50 border border-[var(--border-subtle)]">
            {selectedUser && (
              <>
                <div className="flex items-start justify-between mb-4">
                  <Dialog.Title className="font-display font-bold text-xl text-[var(--text-primary)] flex items-center gap-2">
                    <Key className="text-[var(--accent-primary)]" size={20} /> User Verification
                  </Dialog.Title>
                  <Dialog.Close className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                    <X size={20} />
                  </Dialog.Close>
                </div>

                <div className="space-y-4 font-ui text-sm mb-6">
                  <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Name:</span>
                      <span className="font-medium text-[var(--text-primary)]">{selectedUser.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Email:</span>
                      <span className="font-medium text-[var(--text-primary)]">{selectedUser.email}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-xl text-center space-y-2">
                    <span className="text-xs text-orange-600 font-bold uppercase tracking-wider">Active Verification Token</span>
                    <div className="text-sm font-mono break-all text-[var(--accent-primary)] font-medium">
                      {selectedUser.verificationToken || 'N/A'}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {selectedUser.tokenExpiresAt ? (
                        <>Expires: {new Date(selectedUser.tokenExpiresAt).toLocaleString()}</>
                      ) : (
                        <>No active expiry set</>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleVerifyManually(selectedUser.id)}
                    disabled={verifying}
                    className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {verifying ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    Mark as Verified
                  </button>

                  <button
                    onClick={() => handleResendVerification(selectedUser.email)}
                    disabled={resending}
                    className="w-full py-2.5 px-4 bg-[var(--bg-secondary)] hover:bg-[var(--bg-secondary)]/80 border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {resending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                    Resend Verification Email
                  </button>

                  <Dialog.Close asChild>
                    <button className="w-full py-2 px-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs transition-colors mt-1">
                      Cancel
                    </button>
                  </Dialog.Close>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
