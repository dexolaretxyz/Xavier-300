"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { User, Mail, CreditCard, Calendar, Star, Shield, Bell, Loader2, Lock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { requestPushPermission, subscribeToPush, unsubscribeFromPush } from '@/lib/push';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // Settings State
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState('09:00');
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  // Profile Edit State
  const [profileData, setProfileData] = useState({
    fullName: '',
    phone: '',
    state: '',
    occupation: '',
    yearsExperience: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password State
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Deletion State
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/api/users/me');
        if (data?.data) {
          setNotificationsEnabled(data.data.notificationsEnabled ?? true);
          setNotificationTime(data.data.notificationTime || '09:00');
          setProfileData({
            fullName: data.data.fullName || '',
            phone: data.data.phone || '',
            state: data.data.state || '',
            occupation: data.data.occupation || '',
            yearsExperience: data.data.yearsExperience?.toString() || ''
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSavePreferences = async () => {
    setIsSavingPrefs(true);
    try {
      if (notificationsEnabled) {
        const granted = await requestPushPermission();
        if (granted) {
          await subscribeToPush();
        } else {
          toast.error('Notification permission denied. We will send you emails instead.');
        }
      } else {
        await unsubscribeFromPush();
      }

      await api.patch('/api/users/me', { notificationsEnabled, notificationTime });
      toast.success('Preferences saved successfully!');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await api.patch('/api/users/me', {
        ...profileData,
        yearsExperience: profileData.yearsExperience ? Number(profileData.yearsExperience) : undefined
      });
      toast.success('Profile updated successfully!');
      window.location.reload(); // Refresh auth store
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword) return;
    
    setIsChangingPassword(true);
    try {
      await api.post('/api/users/change-password', passwords);
      toast.success('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (!confirm('Are you sure you want to request account deletion? This action will open a support ticket on your behalf.')) return;
    
    setIsDeleting(true);
    try {
      const res = await api.post('/api/tickets', {
        subject: 'Account Deletion Request',
        category: 'ACCOUNT',
        description: 'I would like to request the deletion of my account and all associated personal data.'
      });
      if (res.data?.success) {
        toast.success('Account deletion request submitted');
        router.push(`/support/${res.data.data.id}`);
      }
    } catch (error) {
      toast.error('Failed to submit deletion request');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user || isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[var(--accent-primary)]" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">My Profile</h1>
        <p className="font-ui text-[var(--text-secondary)]">Manage your account settings, subscription, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Overview & Stats */}
        <div className="col-span-1 md:col-span-4 space-y-8">
          
          <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
            <div className="w-24 h-24 rounded-full bg-[var(--accent-light)] text-[var(--accent-primary)] flex items-center justify-center font-display font-bold text-4xl mb-4">
              {user.fullName?.charAt(0) || 'U'}
            </div>
            <h2 className="font-display font-bold text-xl text-[var(--text-primary)] mb-1">{user.fullName}</h2>
            <p className="font-ui text-[var(--text-secondary)] flex items-center gap-2 mb-4">
              <Mail size={14} /> {user.email}
            </p>
            <div className="w-full h-px bg-[var(--border-subtle)] my-4"></div>
            <div className="w-full flex items-center justify-between font-ui text-sm mb-2">
              <span className="text-[var(--text-secondary)]">Role</span>
              <span className={`px-2 py-0.5 rounded font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {user.role}
              </span>
            </div>
          </div>

          <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <CreditCard className="text-[var(--accent-primary)]" size={20} /> Subscription
            </h3>
            
            <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-subtle)] flex flex-col gap-3">
              <div>
                <p className="font-ui text-sm text-[var(--text-secondary)]">Current Plan</p>
                <p className="font-display font-bold text-xl text-[var(--accent-primary)]">
                  {user.subscriptionStatus === 'SUBSCRIBED' || user.subscriptionStatus === 'ACTIVE' ? 'Pro Access (Free Launch Tier)' : 
                   user.subscriptionStatus === 'FREE_TRIAL' ? 'Free Trial' : 'Inactive'}
                </p>
              </div>
              {/* PAYMENT_DISABLED: Re-enable when launching paid tier
              {user.subscriptionStatus !== 'ACTIVE' && user.subscriptionStatus !== 'SUBSCRIBED' && (
                <Link href="/pricing" className="bg-[var(--accent-primary)] text-center text-white px-4 py-2 rounded-lg font-ui font-bold text-sm hover:opacity-90 transition-opacity">
                  Upgrade to Pro
                </Link>
              )}
              */}
            </div>
          </div>

          <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <Star className="text-yellow-500" size={20} /> Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-subtle)] text-center">
                 <p className="font-ui text-xs text-[var(--text-secondary)] uppercase tracking-wider">Exams Taken</p>
                 <p className="font-display font-bold text-2xl text-[var(--text-primary)] mt-1">0</p>
               </div>
               <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-subtle)] text-center">
                 <p className="font-ui text-xs text-[var(--text-secondary)] uppercase tracking-wider">Avg Score</p>
                 <p className="font-display font-bold text-2xl text-[var(--text-primary)] mt-1">0%</p>
               </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Settings Forms */}
        <div className="col-span-1 md:col-span-8 space-y-8">
          
          {/* Edit Profile Form */}
          <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm">
            <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
              <User className="text-[var(--accent-primary)]" size={20} /> Personal Details
            </h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-medium)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-medium)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">State / Region</label>
                  <input
                    type="text"
                    value={profileData.state}
                    onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-medium)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Occupation</label>
                  <input
                    type="text"
                    value={profileData.occupation}
                    onChange={(e) => setProfileData({...profileData, occupation: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-medium)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={profileData.yearsExperience}
                    onChange={(e) => setProfileData({...profileData, yearsExperience: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-medium)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="bg-[var(--accent-primary)] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isSavingProfile && <Loader2 size={16} className="animate-spin" />}
                  Save Profile
                </button>
              </div>
            </form>
          </div>

          {/* Notifications */}
          <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm">
            <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
              <Bell className="text-[var(--accent-primary)]" size={20} /> Notification Preferences
            </h3>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="font-ui font-medium text-[var(--text-primary)]">Daily Practice Reminders</p>
                <p className="font-ui text-sm text-[var(--text-secondary)] mt-1">Receive a notification if you haven't practiced today.</p>
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={notificationsEnabled} onChange={(e) => setNotificationsEnabled(e.target.checked)} />
                    <div className={`block w-12 h-6 rounded-full transition-colors ${notificationsEnabled ? 'bg-[var(--accent-primary)]' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${notificationsEnabled ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                </label>

                {notificationsEnabled && (
                  <input 
                    type="time" 
                    value={notificationTime}
                    onChange={(e) => setNotificationTime(e.target.value)}
                    className="border border-[var(--border-medium)] bg-[var(--bg-secondary)] rounded-lg px-3 py-1.5 font-ui text-sm focus:outline-none focus:border-[var(--accent-primary)] text-[var(--text-primary)]"
                  />
                )}

                <button 
                  onClick={handleSavePreferences}
                  disabled={isSavingPrefs}
                  className="bg-[var(--text-primary)] text-[var(--bg-primary)] px-4 py-1.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingPrefs && <Loader2 size={14} className="animate-spin" />}
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Security & Danger Zone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Change Password */}
            <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm">
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <Shield className="text-gray-500" size={20} /> Security
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <input
                    type="password"
                    placeholder="Current Password"
                    required
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-medium)] rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 text-[var(--text-primary)] text-sm"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="New Password"
                    required
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-medium)] rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 text-[var(--text-primary)] text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white py-2.5 rounded-xl font-medium transition-colors disabled:opacity-70 flex justify-center items-center gap-2 text-sm"
                >
                  {isChangingPassword && <Loader2 size={16} className="animate-spin" />}
                  Change Password
                </button>
              </form>
            </div>

            {/* Account Deletion */}
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-lg mb-2 flex items-center gap-2 text-red-600 dark:text-red-500">
                  <AlertTriangle size={20} /> Danger Zone
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400 opacity-80 mb-4 leading-relaxed">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={handleAccountDeletion}
                disabled={isDeleting}
                className="w-full bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/50 dark:hover:bg-red-900 dark:text-red-300 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-70 flex justify-center items-center gap-2 text-sm"
              >
                {isDeleting && <Loader2 size={16} className="animate-spin" />}
                Request Account Deletion
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
