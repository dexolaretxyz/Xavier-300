"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useDomains } from '@/hooks/use-dashboard';
import { LineChart, Database, ShieldCheck, Cloud, Code2, Target, Layout, Server, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Helper map for icons (since they can't be passed from API easily)
const DOMAIN_ICONS: Record<string, any> = {
  'data-analysis': LineChart,
  'data-science': Database,
  'cybersecurity': ShieldCheck,
  'cloud-computing': Cloud,
  'software-development': Code2,
  'agile-scrum': Target,
  'product-management': Layout,
  'it-service-management': Server,
  'business-analysis': TrendingUp,
};

export default function CoursesPage() {
  const { data: domains, isLoading } = useDomains();
  const [filter, setFilter] = useState('All');

  const filters = ['All', 'Priority', 'In Progress', 'Not Started'];

  // Mock progress data for now since backend doesn't return it yet
  const getMockProgress = (id: string) => {
    if (id === 'data-analysis') return 60;
    if (id === 'cloud-computing') return 25;
    return 0;
  };

  const filteredDomains = domains?.filter(domain => {
    if (filter === 'All') return true;
    if (filter === 'Priority') return ['data-analysis', 'data-science', 'cybersecurity'].includes(domain.slug);
    const prog = getMockProgress(domain.slug);
    if (filter === 'In Progress') return prog > 0 && prog < 100;
    if (filter === 'Not Started') return prog === 0;
    return true;
  });

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)] tracking-tight">
          Certification Paths
        </h1>
        <p className="text-[var(--text-secondary)] mt-2 max-w-2xl">
          Choose a domain to start practicing. Our mock exams are designed to match the difficulty and format of the real certifications.
        </p>
      </div>

      {/* Filters */}
      <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === f
                ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] shadow-md'
                : 'bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-48 bg-[var(--bg-elevated)] rounded-3xl border border-[var(--border-subtle)]"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDomains?.map(domain => {
            const Icon = DOMAIN_ICONS[domain.slug] || Target;
            const progress = getMockProgress(domain.slug);
            const certCount = domain.certifications?.length || 0;

            return (
              <Link href={`/courses/${domain.slug}`} key={domain.id} className="group block h-full">
                <div className="bg-[var(--bg-glass)] backdrop-blur-md border border-[var(--border-subtle)] rounded-3xl p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[var(--accent-primary)]/50 flex flex-col h-full relative overflow-hidden">
                  
                  <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
                    <Icon size={120} />
                  </div>

                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-medium)] flex items-center justify-center text-[var(--accent-primary)] group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-colors">
                      <Icon size={24} strokeWidth={2} />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold font-ui text-[var(--text-primary)] mb-2 relative z-10">
                    {domain.name}
                  </h3>
                  
                  <div className="text-sm font-mono text-[var(--text-muted)] mb-6 flex-1 relative z-10">
                    {certCount} Certification{certCount !== 1 ? 's' : ''} available
                  </div>

                  {/* Progress Bar */}
                  <div className="relative z-10 mt-auto">
                    <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                      <span>Progress</span>
                      <span className={progress > 0 ? 'text-[var(--accent-primary)]' : ''}>{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[var(--accent-primary)] transition-all duration-1000 ease-out" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                </div>
              </Link>
            )
          })}
        </div>
      )}

    </div>
  );
}
