"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, CheckSquare, Target, Trophy, TrendingUp, ShieldCheck, Database, Layout, Code2, Cloud, Server, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Using static data for the landing page for immediate LCP
const DOMAINS = [
  { id: 'data-analysis', name: 'Data Analysis', certs: 3, icon: LineChart },
  { id: 'data-science', name: 'Data Science', certs: 4, icon: Database },
  { id: 'cybersecurity', name: 'Cybersecurity', certs: 4, icon: ShieldCheck },
  { id: 'cloud-computing', name: 'Cloud Computing', certs: 3, icon: Cloud },
  { id: 'software-development', name: 'Software Dev', certs: 2, icon: Code2 },
  { id: 'agile-scrum', name: 'Agile & Scrum', certs: 2, icon: Target },
  { id: 'product-management', name: 'Product Mgmt', certs: 1, icon: Layout },
  { id: 'it-service-management', name: 'ITSM', certs: 1, icon: Server },
  { id: 'business-analysis', name: 'Business Analysis', certs: 2, icon: TrendingUp },
];

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* SECTION 1: HERO */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden px-6">
        {/* Subtle noise/grain overlay could go here via CSS background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        
        <div className="max-w-[960px] mx-auto text-center relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center"
          >
            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-7xl lg:text-[80px] font-display font-bold leading-[1.05] tracking-tight text-[var(--text-primary)] mb-6"
            >
              Welcome to Your Practice Centre for <br className="hidden md:block"/> Tech Certification
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-[var(--text-secondary)] font-ui max-w-2xl mb-10"
            >
              Exam-ready confidence. Nigerian pricing. World-class preparation. Practice like it's real and pass like you prepared.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 items-center">
              <Link href="/signup">
                <Button className="rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white px-8 py-6 text-lg h-auto shadow-lg shadow-[var(--accent-primary)]/20 transition-all hover:scale-105">
                  Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" className="rounded-full border-2 border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] px-8 py-6 text-lg h-auto transition-all">
                  Browse Courses
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: DOMAIN GRID */}
      <section className="py-24 bg-[var(--bg-secondary)] px-6 border-y border-[var(--border-subtle)]">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-[var(--text-primary)] mb-4">Choose Your Certification Path</h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">Master the most in-demand skills in the tech industry with our specialized mock exams.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DOMAINS.map((domain) => (
              <Link href={`/courses/${domain.id}`} key={domain.id} className="group block">
                <div className="bg-[var(--bg-glass)] backdrop-blur-xl border border-[var(--border-subtle)] rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:border-[var(--accent-primary)]/50 relative overflow-hidden h-full">
                  
                  {/* Glass highlight effect */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="w-12 h-12 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-medium)] flex items-center justify-center mb-6 text-[var(--accent-primary)] group-hover:scale-110 transition-transform">
                    <domain.icon strokeWidth={1.5} />
                  </div>
                  
                  <h3 className="text-xl font-bold font-ui uppercase tracking-wider text-[var(--text-primary)] mb-2">
                    {domain.name}
                  </h3>
                  
                  <div className="flex items-center text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
                    <span className="font-mono text-sm">{domain.certs} Certifications</span>
                    <ArrowRight className="w-4 h-4 ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section className="py-24 px-6 relative">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-[var(--text-primary)] mb-4">Your Path to Certification</h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">A systematic approach to conquering your tech exams with confidence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Desktop connecting line */}
            <div className="hidden md:block absolute top-8 left-12 right-12 h-0.5 bg-[var(--border-medium)] z-0"></div>

            {[
              { num: '01', title: 'Choose', desc: 'Select your target certification from our curated library.' },
              { num: '02', title: 'Practice', desc: 'Take full-length mock exams under strict timed conditions.' },
              { num: '03', title: 'Get Results', desc: 'Receive instant scoring and AI-powered performance analysis.' },
              { num: '04', title: 'Improve', desc: 'Follow personalized study recommendations for weak areas.' },
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] border-2 border-[var(--accent-primary)] flex items-center justify-center text-xl font-mono font-bold text-[var(--accent-primary)] mb-6 shadow-md">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{step.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-[240px]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: PRICING */}
      <section className="py-24 bg-[var(--bg-secondary)] px-6 border-t border-[var(--border-subtle)]">
        <div className="max-w-[960px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-[var(--text-primary)] mb-4">Invest in Your Career</h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">Affordable pricing for Nigerian tech professionals. Start with a 7-day free trial.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Monthly Card */}
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-3xl p-8 lg:p-10 shadow-sm flex flex-col">
              <h3 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-2">Monthly</h3>
              <p className="text-[var(--text-secondary)] mb-6">Perfect for short-term preparation.</p>
              <div className="mb-8">
                <span className="text-5xl font-mono font-bold text-[var(--text-primary)]">₦5,000</span>
                <span className="text-[var(--text-muted)]">/month</span>
              </div>
              
              <ul className="space-y-4 mb-10 flex-1">
                {['Full access to all 22+ certifications', 'Unlimited mock exams', 'AI-powered weak area analysis', 'Weekly leaderboard access'].map((feat, i) => (
                  <li key={i} className="flex items-start text-[var(--text-secondary)]">
                    <CheckCircle2 className="w-5 h-5 text-[var(--success)] mr-3 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/signup">
                <Button variant="outline" className="w-full rounded-full border-2 border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-light)] py-6 text-base font-semibold transition-colors">
                  Start 7-Day Free Trial
                </Button>
              </Link>
            </div>

            {/* Annual Card */}
            <div className="bg-[var(--bg-elevated)] border-2 border-[var(--accent-primary)] rounded-3xl p-8 lg:p-10 shadow-lg relative flex flex-col transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--accent-primary)] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
              
              <h3 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-2">Annual</h3>
              <p className="text-[var(--accent-primary)] font-medium mb-6">Save ₦10,000 per year</p>
              <div className="mb-8">
                <span className="text-5xl font-mono font-bold text-[var(--text-primary)]">₦50,000</span>
                <span className="text-[var(--text-muted)]">/year</span>
              </div>
              
              <ul className="space-y-4 mb-10 flex-1">
                {['Everything in Monthly', '2 months free', 'Priority email support', 'Early access to new certs'].map((feat, i) => (
                  <li key={i} className="flex items-start text-[var(--text-secondary)]">
                    <CheckCircle2 className="w-5 h-5 text-[var(--accent-primary)] mr-3 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/signup">
                <Button className="w-full rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white py-6 text-base font-semibold shadow-md transition-all hover:scale-[1.02]">
                  Start 7-Day Free Trial
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 5: FOOTER */}
      <footer className="bg-[var(--bg-primary)] border-t border-[var(--border-subtle)] py-12 px-6">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[var(--text-primary)] text-[var(--text-inverse)] rounded flex items-center justify-center">
              <span className="font-display font-bold text-xs">X</span>
            </div>
            <span className="font-display font-bold text-lg text-[var(--text-primary)]">
              Xavier 300
            </span>
          </div>

          <nav className="flex gap-6 text-sm text-[var(--text-secondary)] font-medium">
            <Link href="#" className="hover:text-[var(--text-primary)]">About</Link>
            <Link href="/pricing" className="hover:text-[var(--text-primary)]">Pricing</Link>
            <Link href="#" className="hover:text-[var(--text-primary)]">Support</Link>
            <Link href="#" className="hover:text-[var(--text-primary)]">Privacy Policy</Link>
          </nav>
          
          <div className="text-sm text-[var(--text-muted)]">
            Built for Nigerian tech professionals.
          </div>
        </div>
      </footer>

    </div>
  );
}
