"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Users, CreditCard, Activity, HelpCircle, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/api/admin/stats');
        setStats(data.data);
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  // Mock data for charts since backend only returns aggregated totals for now
  const mockLineData = [
    { name: 'Mon', users: 120 }, { name: 'Tue', users: 132 }, { name: 'Wed', users: 101 },
    { name: 'Thu', users: 142 }, { name: 'Fri', users: 190 }, { name: 'Sat', users: 230 }, { name: 'Sun', users: 210 }
  ];

  const mockBarData = [
    { name: 'Data Analysis', exams: 400 },
    { name: 'Cybersecurity', exams: 300 },
    { name: 'Cloud Computing', exams: 200 },
    { name: 'Software Eng', exams: 278 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">Platform Overview</h1>
        <p className="font-ui text-[var(--text-secondary)]">Monitor your platform's health and revenue.</p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
          <div className="flex items-center gap-3 text-[var(--text-secondary)] mb-4">
            <Users size={20} className="text-blue-500" />
            <span className="font-ui text-sm font-medium">Total Users</span>
          </div>
          <div className="font-display font-bold text-4xl text-[var(--text-primary)]">{stats?.totalUsers || 0}</div>
        </div>
        
        <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
          <div className="flex items-center gap-3 text-[var(--text-secondary)] mb-4">
            <CreditCard size={20} className="text-green-500" />
            <span className="font-ui text-sm font-medium">Active Subscribers</span>
          </div>
          <div className="font-display font-bold text-4xl text-[var(--text-primary)]">{stats?.activeSubscribers || 0}</div>
        </div>

        <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
          <div className="flex items-center gap-3 text-[var(--text-secondary)] mb-4">
            <Activity size={20} className="text-purple-500" />
            <span className="font-ui text-sm font-medium">Revenue (MTD)</span>
          </div>
          <div className="font-display font-bold text-4xl text-[var(--text-primary)]">
            ₦{(stats?.revenueMTD || 0).toLocaleString()}
          </div>
        </div>

        <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
          <div className="flex items-center gap-3 text-[var(--text-secondary)] mb-4">
            <HelpCircle size={20} className="text-orange-500" />
            <span className="font-ui text-sm font-medium">Pending Questions</span>
          </div>
          <div className="font-display font-bold text-4xl text-[var(--text-primary)]">{stats?.pendingQuestions || 0}</div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Line Chart */}
        <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
          <h2 className="font-ui font-bold text-lg text-[var(--text-primary)] mb-6">Daily Active Users</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockLineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)', fontFamily: 'var(--font-ui)' }}
                />
                <Line type="monotone" dataKey="users" stroke="var(--accent-primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
          <h2 className="font-ui font-bold text-lg text-[var(--text-primary)] mb-6">Exams by Domain</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockBarData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'var(--bg-hover)' }}
                  contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}
                />
                <Bar dataKey="exams" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
