"use client";

import React from 'react';
import { useDomain } from '@/hooks/useCourses';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, FileQuestion, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export default function DomainPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const { data: domain, isLoading } = useDomain(slug);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
        <div className="h-40 bg-bg-primary rounded-3xl border border-border-subtle" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 bg-bg-primary rounded-2xl border border-border-subtle" />
          ))}
        </div>
      </div>
    );
  }

  if (!domain) {
    return <div className="p-8 text-center text-red-500 font-ui">Domain not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* BREADCRUMB */}
      <Link href="/courses" className="inline-flex items-center text-sm font-ui font-medium text-text-secondary hover:text-text-primary transition-colors">
        <ArrowLeft size={16} className="mr-2" />
        Back to Domains
      </Link>

      {/* HEADER */}
      <div className="bg-bg-primary border border-border-subtle rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-light rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 z-0" />
        
        <div className="relative z-10">
          <h1 className="font-display font-bold text-4xl md:text-5xl text-text-primary tracking-tight mb-4">
            {domain.name}
          </h1>
          <p className="font-ui text-lg text-text-secondary max-w-2xl mb-2">
            {domain.description}
          </p>
          <div className="font-ui text-sm font-medium text-accent-primary bg-accent-light px-3 py-1 rounded-full inline-block">
            {domain.certifications?.length || 0} Certifications Available
          </div>
        </div>
      </div>

      {/* CERTIFICATIONS LIST */}
      <div>
        <h2 className="font-ui font-bold text-2xl text-text-primary mb-6">Certifications</h2>
        
        {domain.certifications?.length === 0 ? (
          <div className="text-center py-12 bg-bg-primary border border-border-subtle border-dashed rounded-3xl text-text-secondary font-ui">
            No certifications added to this domain yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {domain.certifications?.map((cert: any, i: number) => {
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={cert.id} 
                  className="bg-bg-primary border border-border-subtle p-6 rounded-3xl flex flex-col hover:border-border-medium transition-colors shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      cert.difficulty === 'HARD' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                      : cert.difficulty === 'MEDIUM' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {cert.difficulty}
                    </span>
                    <span className="text-xs font-ui text-text-muted bg-bg-elevated px-2 py-1 rounded-md">
                      Best Score: -
                    </span>
                  </div>
                  
                  <h3 className="font-ui font-bold text-xl text-text-primary mb-4">{cert.name}</h3>
                  
                  <div className="flex items-center gap-6 mb-8 text-text-secondary font-ui text-sm">
                    <div className="flex items-center gap-2">
                      <FileQuestion size={18} />
                      <span>{cert.questions?.length || cert.questionCount || 0} Questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={18} />
                      <span>{cert.examDuration || 30} Mins</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-border-subtle flex items-center justify-between">
                    <span className="text-sm font-ui text-text-muted">
                      3 attempts left today
                    </span>
                    <button 
                      onClick={() => router.push(`/exam/${cert.slug}/lobby`)}
                      className="flex items-center gap-2 bg-accent-primary hover:bg-accent-hover text-white px-5 py-2.5 rounded-full font-ui text-sm font-medium transition-colors shadow-sm cursor-pointer"
                    >
                      <PlayCircle size={18} />
                      Start Exam
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
