"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  BarChart4, 
  ScatterChart, 
  ShieldCheck, 
  Cloud, 
  TableProperties, 
  Infinity as InfinityIcon, 
  Code2, 
  GanttChartSquare, 
  PieChart 
} from 'lucide-react';

export default function LandingPage() {
  const domains = [
    { name: "Data Analysis", count: 12, icon: <BarChart4 size={32} />, slug: "data-analysis" },
    { name: "Data Science", count: 8, icon: <ScatterChart size={32} />, slug: "data-science" },
    { name: "Cybersecurity", count: 15, icon: <ShieldCheck size={32} />, slug: "cybersecurity" },
    { name: "Microsoft Azure", count: 20, icon: <Cloud size={32} />, slug: "azure" },
    { name: "Microsoft Excel", count: 5, icon: <TableProperties size={32} />, slug: "excel" },
    { name: "DevOps", count: 10, icon: <InfinityIcon size={32} />, slug: "devops" },
    { name: "Full Stack Web Dev", count: 14, icon: <Code2 size={32} />, slug: "fullstack" },
    { name: "Project Management", count: 7, icon: <GanttChartSquare size={32} />, slug: "project-management" },
    { name: "Microsoft Power BI", count: 6, icon: <PieChart size={32} />, slug: "power-bi" },
  ];

  const steps = [
    { num: 1, title: "Choose", desc: "Pick your certification track" },
    { num: 2, title: "Practice", desc: "Take timed 30-minute mock exams" },
    { num: 3, title: "Results", desc: "See your score and weak areas" },
    { num: 4, title: "Improve", desc: "Follow AI study recommendations" },
  ];

  return (
    <div className="w-full">
      {/* SECTION 1 - HERO */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center pt-24 px-6 overflow-hidden bg-[var(--bg-primary)]">
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
          style={{
            backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
            backgroundSize: '4px 4px'
          }}
        />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
            className="font-display font-bold text-5xl md:text-[80px] leading-tight text-[var(--text-primary)] tracking-tight mb-6"
          >
            Welcome to Your Practice Centre<br />for Tech Certification
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-ui text-xl md:text-[20px] text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto"
          >
            Exam-ready confidence. Nigerian pricing. World-class preparation.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/signup"
              className="w-full sm:w-auto bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white px-8 py-4 rounded-full font-ui font-medium text-lg transition-colors shadow-sm"
            >
              Start Free Trial
            </Link>
            <Link 
              href="#domains"
              className="w-full sm:w-auto bg-transparent border border-[var(--text-primary)] text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] px-8 py-4 rounded-full font-ui font-medium text-lg transition-colors"
            >
              Browse Courses
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2 - COURSE DOMAINS GRID */}
      <section id="domains" className="w-full py-24 px-6 bg-[var(--bg-secondary)] relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-center text-[var(--text-primary)] mb-16">
            Choose Your Certification Path
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((domain, i) => (
              <Link href={`/courses/${domain.slug}`} key={i}>
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-[var(--bg-primary)]/70 backdrop-blur-xl border border-[var(--border-subtle)] p-8 rounded-[20px] transition-all duration-300 hover:shadow-[var(--shadow-lg)] hover:border-[var(--accent-light)] group h-full flex flex-col"
                >
                  <div className="w-14 h-14 bg-[var(--accent-light)] rounded-xl flex items-center justify-center text-[var(--accent-primary)] mb-6 group-hover:scale-110 transition-transform">
                    {domain.icon}
                  </div>
                  <h3 className="font-ui font-semibold text-lg text-[var(--text-primary)] uppercase tracking-wide mb-2">
                    {domain.name}
                  </h3>
                  <p className="font-ui text-sm text-[var(--text-muted)] mt-auto">
                    {domain.count} Certifications
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 - HOW IT WORKS */}
      <section className="w-full py-24 px-6 bg-[var(--bg-primary)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-center text-[var(--text-primary)] mb-16">
            How Xavier 300 Works
          </h2>
          
          <div className="flex flex-col md:flex-row gap-8 justify-between relative">
            <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-[2px] bg-[var(--border-medium)] -z-10" />
            
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center flex-1">
                <div className="w-12 h-12 bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center font-display font-bold text-xl mb-6 shadow-md ring-4 ring-[var(--bg-primary)]">
                  {step.num}
                </div>
                <h3 className="font-ui font-bold text-xl text-[var(--text-primary)] mb-2">{step.title}</h3>
                <p className="font-ui text-[var(--text-secondary)]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 - PRICING */}
      <section className="w-full py-24 px-6 bg-[var(--bg-secondary)] relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-[var(--text-primary)] mb-4">
            Simple, Affordable Pricing
          </h2>
          <p className="font-ui text-xl text-[var(--text-secondary)] mb-16">
            Built for Nigerian tech professionals
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Free Trial */}
            <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[24px] p-8 flex flex-col shadow-sm">
              <h3 className="font-ui font-semibold text-xl text-[var(--text-primary)] mb-2">Free Trial</h3>
              <div className="font-display font-bold text-4xl text-[var(--text-primary)] mb-6">1 Week Free</div>
              <ul className="space-y-4 mb-8 font-ui text-[var(--text-secondary)] flex-1">
                <li className="flex items-center gap-3"><span className="text-[var(--accent-primary)]">✓</span> All 9 domains</li>
                <li className="flex items-center gap-3"><span className="text-[var(--accent-primary)]">✓</span> 3 attempts per day</li>
                <li className="flex items-center gap-3"><span className="text-[var(--accent-primary)]">✓</span> AI recommendations</li>
              </ul>
              <Link href="/signup" className="block text-center w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white py-3 rounded-full font-ui font-medium transition-colors">
                Start Free Trial
              </Link>
            </div>

            {/* Monthly */}
            <div className="bg-[var(--bg-primary)] border-2 border-[var(--accent-primary)] rounded-[24px] p-8 flex flex-col shadow-md relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--accent-primary)] text-white px-4 py-1 rounded-full text-xs font-ui font-bold uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="font-ui font-semibold text-xl text-[var(--text-primary)] mb-2">Monthly</h3>
              <div className="font-display font-bold text-4xl text-[var(--text-primary)] mb-6">₦5,000<span className="text-xl text-[var(--text-muted)] font-normal"> / mo</span></div>
              <ul className="space-y-4 mb-8 font-ui text-[var(--text-secondary)] flex-1">
                <li className="flex items-center gap-3"><span className="text-[var(--accent-primary)]">✓</span> All 9 domains</li>
                <li className="flex items-center gap-3"><span className="text-[var(--accent-primary)]">✓</span> Unlimited attempts</li>
                <li className="flex items-center gap-3"><span className="text-[var(--accent-primary)]">✓</span> AI recommendations</li>
                <li className="flex items-center gap-3"><span className="text-[var(--accent-primary)]">✓</span> Global Leaderboard</li>
              </ul>
              <Link href="/signup" className="block text-center w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white py-3 rounded-full font-ui font-medium transition-colors">
                Get Started
              </Link>
            </div>

            {/* Annual */}
            <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[24px] p-8 flex flex-col shadow-sm relative">
              <div className="absolute top-4 right-4 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-ui font-bold">
                Save ₦10,000
              </div>
              <h3 className="font-ui font-semibold text-xl text-[var(--text-primary)] mb-2">Annual</h3>
              <div className="font-display font-bold text-4xl text-[var(--text-primary)] mb-6">₦50,000<span className="text-xl text-[var(--text-muted)] font-normal"> / yr</span></div>
              <ul className="space-y-4 mb-8 font-ui text-[var(--text-secondary)] flex-1">
                <li className="flex items-center gap-3"><span className="text-[var(--accent-primary)]">✓</span> All features included</li>
                <li className="flex items-center gap-3"><span className="text-[var(--accent-primary)]">✓</span> Priority support</li>
                <li className="flex items-center gap-3"><span className="text-[var(--accent-primary)]">✓</span> 2 months free</li>
              </ul>
              <Link href="/signup" className="block text-center w-full bg-[var(--accent-light)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white py-3 rounded-full font-ui font-medium transition-colors">
                Best Value
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 - FOOTER */}
      <footer className="w-full bg-[var(--bg-primary)] border-t border-[var(--border-subtle)] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] text-white flex items-center justify-center font-display font-bold text-xl">
              X
            </div>
            <span className="font-ui font-semibold text-[var(--text-primary)] text-xl tracking-tight">
              Xavier 300
            </span>
          </div>
          
          <div className="flex gap-6 font-ui text-[var(--text-secondary)] text-sm">
            <Link href="#pricing" className="hover:text-[var(--accent-primary)] transition-colors">Pricing</Link>
            <Link href="/support" className="hover:text-[var(--accent-primary)] transition-colors">Support</Link>
            <Link href="/privacy" className="hover:text-[var(--accent-primary)] transition-colors">Privacy Policy</Link>
          </div>
          
          <p className="font-ui text-[var(--text-muted)] text-sm text-center md:text-right">
            © 2025 Xavier 300.<br className="md:hidden" /> Built for Nigerian tech professionals.
          </p>
        </div>
      </footer>
    </div>
  );
}
