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
    { name: "Nigerian Professional Exams", count: 3, icon: <ShieldCheck size={32} />, slug: "nigerian-professional-exams", description: "CHEW & Healthcare Qualifying Exams" },
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
              Start Practicing Free
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
                  {domain.description && (
                    <p className="font-ui text-sm text-[var(--text-secondary)] mb-4">
                      {domain.description}
                    </p>
                  )}
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
            Start Practicing Today
          </h2>
          <p className="font-ui text-xl text-[var(--text-secondary)] mb-16">
            Built for Nigerian tech professionals
          </p>
          
          <div className="max-w-md w-full mx-auto">
            <div className="bg-bg-secondary rounded-2xl p-10 border-2 border-accent-primary text-center">
              
              <h3 className="font-display text-4xl font-bold text-text-primary mb-3">
                Completely Free
              </h3>
              
              <p className="text-text-secondary font-ui text-base leading-relaxed mb-8">
                Full access during our launch period.
                No credit card required.
              </p>
              
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center gap-3 text-text-secondary font-ui">
                  <span className="text-green-500 text-lg">✅</span>
                  All certifications
                </li>
                <li className="flex items-center gap-3 text-text-secondary font-ui">
                  <span className="text-green-500 text-lg">✅</span>
                  Unlimited exams
                </li>
                <li className="flex items-center gap-3 text-text-secondary font-ui">
                  <span className="text-green-500 text-lg">✅</span>
                  AI recommendations
                </li>
                <li className="flex items-center gap-3 text-text-secondary font-ui">
                  <span className="text-green-500 text-lg">✅</span>
                  Weekly leaderboard
                </li>
              </ul>
              
              <a href="/signup"
                 className="block w-full py-4 rounded-full bg-accent-primary text-white font-ui font-semibold text-lg hover:bg-accent-hover transition-all text-center no-underline">
                Start Practicing Free
              </a>
              
              <p className="text-text-muted font-ui text-sm mt-4">
                Paid plans coming soon. Early users get a special discount. 🇳🇬
              </p>
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
