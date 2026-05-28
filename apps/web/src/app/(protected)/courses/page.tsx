"use client";

import React, { useState } from 'react';
import { useDomains } from '@/hooks/useCourses';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  BarChart4, ScatterChart, ShieldCheck, Cloud, 
  TableProperties, Infinity as InfinityIcon, Code2, 
  GanttChartSquare, PieChart, ChevronRight 
} from 'lucide-react';

// Maps domain names to icons
const getIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('analysis')) return <BarChart4 size={24} />;
  if (n.includes('science')) return <ScatterChart size={24} />;
  if (n.includes('cyber')) return <ShieldCheck size={24} />;
  if (n.includes('azure')) return <Cloud size={24} />;
  if (n.includes('excel')) return <TableProperties size={24} />;
  if (n.includes('devops')) return <InfinityIcon size={24} />;
  if (n.includes('web')) return <Code2 size={24} />;
  if (n.includes('project')) return <GanttChartSquare size={24} />;
  if (n.includes('power bi')) return <PieChart size={24} />;
  return <BarChart4 size={24} />;
};

export default function CoursesPage() {
  const { data: domains, isLoading } = useDomains();
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'Priority', 'In Progress', 'Not Started'];

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="h-10 w-48 bg-[var(--bg-elevated)] rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-48 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[20px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Filter domains based on tabs (Mock filtering since we don't track global progress yet)
  let filteredDomains = domains || [];
  if (activeTab === 'Priority') {
    filteredDomains = filteredDomains.filter((d: any) => d.priority > 5);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-display font-bold text-4xl text-[var(--text-primary)] tracking-tight">
          Browse Courses
        </h1>
        <p className="font-ui text-[var(--text-secondary)] mt-2">
          Select a domain to view available certifications.
        </p>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-ui text-sm font-medium transition-colors ${
              activeTab === tab 
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' 
                : 'bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-medium)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* DOMAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDomains.map((domain: any, i: number) => {
          const totalCerts = domain.certifications?.length || 0;
          // Fake progress for UI demo
          const progress = i % 3 === 0 ? 33 : i % 4 === 0 ? 100 : 0; 
          
          return (
            <Link href={`/courses/${domain.slug}`} key={domain.id}>
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] p-6 rounded-[20px] transition-all duration-300 hover:shadow-[var(--shadow-lg)] hover:border-[var(--accent-light)] group h-full flex flex-col relative overflow-hidden"
              >
                {/* Progress bar background indicator */}
                {progress > 0 && (
                  <div 
                    className="absolute bottom-0 left-0 h-1 bg-[var(--accent-primary)] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                )}
                
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-[var(--accent-light)] rounded-xl flex items-center justify-center text-[var(--accent-primary)] group-hover:scale-110 transition-transform">
                    {getIcon(domain.name)}
                  </div>
                  {progress === 100 && (
                    <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                      Mastered
                    </span>
                  )}
                </div>
                
                <h3 className="font-ui font-semibold text-xl text-[var(--text-primary)] tracking-tight mb-2">
                  {domain.name}
                </h3>
                
                <p className="font-ui text-sm text-[var(--text-secondary)] line-clamp-2 mb-6 flex-1">
                  {domain.description}
                </p>

                <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-4 mt-auto">
                  <span className="font-ui text-sm font-medium text-[var(--text-muted)]">
                    {totalCerts} Certifications
                  </span>
                  <div className="text-[var(--accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-sm font-medium">
                    View <ChevronRight size={16} className="ml-1" />
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
