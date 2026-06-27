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
  PieChart,
  ArrowRight,
  Send,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

export default function LandingPage() {
  const domains = [
    { 
      name: "Data Analysis", 
      count: 12, 
      icon: <BarChart4 size={24} />, 
      slug: "data-analysis",
      desc: "SQL, Power BI, Tableau & Excel mastery"
    },
    { 
      name: "Data Science", 
      count: 8, 
      icon: <ScatterChart size={24} />, 
      slug: "data-science",
      desc: "Machine Learning, Python & statistical modeling"
    },
    { 
      name: "Cybersecurity", 
      count: 15, 
      icon: <ShieldCheck size={24} />, 
      slug: "cybersecurity",
      desc: "Network security, ethical hacking & compliance"
    },
    { 
      name: "Microsoft Azure", 
      count: 20, 
      icon: <Cloud size={24} />, 
      slug: "azure",
      desc: "Cloud architecture, services & deployment"
    },
    { 
      name: "Microsoft Excel", 
      count: 5, 
      icon: <TableProperties size={24} />, 
      slug: "excel",
      desc: "Formulas, functions & spreadsheet logic"
    },
    { 
      name: "DevOps", 
      count: 10, 
      icon: <InfinityIcon size={24} />, 
      slug: "devops",
      desc: "CI/CD, Docker, Kubernetes & cloud infra"
    },
    { 
      name: "Full Stack Web Dev", 
      count: 14, 
      icon: <Code2 size={24} />, 
      slug: "fullstack",
      desc: "React, Next.js, Node.js & databases"
    },
    { 
      name: "Project Management", 
      count: 7, 
      icon: <GanttChartSquare size={24} />, 
      slug: "project-management",
      desc: "PMP, Agile, Scrum frameworks & operations"
    },
    { 
      name: "Microsoft Power BI", 
      count: 6, 
      icon: <PieChart size={24} />, 
      slug: "power-bi",
      desc: "DAX calculations, modeling & custom dashboards"
    },
    { 
      name: "Nigerian Professional Exams", 
      count: 3, 
      icon: <GraduationCap size={24} />, 
      slug: "nigerian-professional-exams", 
      desc: "CHEW & Healthcare National Qualifying Exams",
      isLocal: true
    },
  ];

  const steps = [
    { num: 1, title: "Choose", desc: "Pick your certification track" },
    { num: 2, title: "Practice", desc: "Take timed 30-minute mock exams" },
    { num: 3, title: "Results", desc: "See your score and weak areas" },
    { num: 4, title: "Improve", desc: "Follow AI study recommendations" },
  ];

  return (
    <div className="w-full bg-[var(--bg-primary)] overflow-x-hidden">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden py-20 px-6 mt-10">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--accent-secondary)] blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[var(--accent-primary)] blur-[100px]"></div>
        </div>
        
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-[var(--accent-primary)] leading-tight max-w-xl"
            >
              Welcome to Your Practice Centre for Tech Certification
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-ui text-lg text-[var(--text-secondary)] max-w-lg leading-relaxed"
            >
              Exam-ready confidence. Nigerian pricing. World-class preparation. Designed for ambitious tech professionals in Lagos, Abuja, and beyond.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Link 
                href="/signup"
                className="inline-flex justify-center bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white px-8 py-4 rounded-xl font-ui font-bold shadow-xl shadow-[var(--accent-primary)]/20 hover:scale-[1.02] active:opacity-90 transition-all text-center"
              >
                Start Practicing Free
              </Link>
              <Link 
                href="#domains"
                className="bg-white border-2 border-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-8 py-4 rounded-xl font-ui font-bold hover:bg-[var(--bg-primary)] transition-all flex items-center justify-center gap-2"
              >
                Browse Courses
                <ArrowRight size={20} />
              </Link>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center gap-4 text-[var(--text-secondary)]"
            >
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300 flex items-center justify-center font-bold text-[9px]">A</div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-300 flex items-center justify-center font-bold text-[9px] text-white">B</div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-teal-300 flex items-center justify-center font-bold text-[9px]">O</div>
              </div>
              <span className="text-xs font-semibold font-ui">+10k Nigerian Students Practicing</span>
            </motion.div>
          </div>
          
          <div className="relative hidden lg:block">
            <div className="aspect-square bg-white/50 rounded-3xl p-4 shadow-2xl backdrop-blur-sm border border-white/20">
              <div className="w-full h-full rounded-2xl overflow-hidden grayscale-[20%] hover:grayscale-0 transition-all duration-700 shadow-inner bg-[var(--bg-primary)]">
                <img 
                  className="w-full h-full object-cover" 
                  alt="Focused Nigerian software engineer practicing on a laptop" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBR_lc-nDF-8VEc98gSpR1yZV3nAmecgJTSGUJaGjyWE2c16Ec8AqMHlSoJJTseOe38FiSfmykQLqD0MFvEq8LkTQhbIQ0QI1pnDgbgo76Y9Ik32bcDwdBCJHPfjAP6uFBcfndAmnqs6f1X2ZOkP9KE73c1M3Q4Kl3cJSyHbz6d6bNEnCnaYu_wduejUQGEAMG1sde5OY4ThhQJ90earuTB7NhkLjYPzFDteMIDWCNCc23x26QLltg8Khxzbc5n3tymL5fQB2OB7w"
                />
              </div>
              
              {/* Floating Stats Card */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-[var(--border-subtle)]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-4 h-4 rounded-full bg-[var(--accent-secondary)] flex items-center justify-center text-[10px] text-white">✓</span>
                  <span className="font-bold text-[var(--accent-primary)]">98% Pass Rate</span>
                </div>
                <div className="w-32 h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                  <div className="w-[98%] h-full bg-[var(--accent-secondary)]"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CERTIFICATION PATHS */}
      <section id="domains" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <span className="text-[var(--accent-secondary)] font-ui font-semibold text-sm tracking-widest uppercase">Expert Learning Paths</span>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-[var(--accent-primary)]">Choose Your Certification Path</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {domains.map((domain, i) => (
            <Link href={`/courses/${domain.slug}`} key={i} className="group">
              <motion.div 
                whileHover={{ y: -6, boxShadow: "0 20px 40px -15px rgba(26, 35, 126, 0.08)" }}
                className={`relative bg-white border border-[var(--border-subtle)] p-8 rounded-2xl transition-all duration-300 flex flex-col justify-between h-full overflow-hidden ${
                  domain.isLocal ? 'border-[var(--accent-primary)]/20 bg-indigo-50/5' : ''
                }`}
              >
                {domain.isLocal && (
                  <div className="absolute top-0 right-0 p-2 bg-[var(--accent-primary)] text-white text-[9px] uppercase font-bold tracking-wider transform rotate-45 translate-x-5 -translate-y-0.5 w-24 text-center">
                    LOCAL
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-secondary-light)] text-[var(--accent-secondary)] flex items-center justify-center transition-colors group-hover:bg-[var(--accent-secondary)] group-hover:text-white">
                    {domain.icon}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-[var(--accent-primary)] mb-1 leading-snug">
                      {domain.name}
                    </h3>
                    <p className="text-[var(--text-secondary)] text-sm mb-4 leading-normal">
                      {domain.desc}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-muted)] group-hover:text-[var(--accent-secondary)] transition-colors">
                    {domain.count} {domain.count === 1 ? 'Certification' : 'Certifications'}
                  </span>
                  <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[var(--accent-primary)] py-24 px-6 overflow-hidden relative text-white">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-display font-bold text-3xl md:text-5xl text-white">How Xavier 300 Works</h2>
            <p className="text-white/60 max-w-xl mx-auto font-ui text-base">Streamlined process from selection to mastery. Powered by AI and expert curriculum.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center group flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl mb-6 shadow-lg relative z-10 transition-transform group-hover:scale-110 ${
                  i === 0 ? 'bg-[var(--accent-secondary)] text-white shadow-[var(--accent-secondary)]/20' : 
                  i === 3 ? 'bg-[var(--accent-secondary-light)] text-[var(--accent-secondary)]' :
                  'bg-white text-[var(--accent-primary)]'
                }`}>
                  {step.num}
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-2">{step.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed max-w-[200px]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Texture Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none z-0" 
          style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/cubes.png')` }}
        />
      </section>

      {/* PRICING */}
      <section className="py-24 px-6 bg-[var(--bg-primary)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-4xl md:text-5xl text-[var(--accent-primary)] mb-4">Start Practicing Today</h2>
            <p className="font-ui text-lg text-[var(--text-secondary)]">Built for Nigerian tech professionals</p>
          </div>
          
          <div className="bg-white border-2 border-[var(--accent-secondary-light)] rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--accent-secondary-light)]/30 blur-[100px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
              <div>
                <div className="inline-block px-4 py-1 rounded-full bg-[var(--accent-secondary-light)] text-[var(--accent-secondary)] text-xs font-bold uppercase mb-4">Limited Offer</div>
                <h3 className="font-display text-4xl font-bold text-[var(--accent-primary)] mb-2">Completely Free</h3>
                <p className="text-[var(--text-secondary)] text-base">Full access during our launch period. No credit card required.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left max-w-lg mx-auto bg-[var(--bg-primary)]/40 p-6 rounded-2xl border border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  <span className="text-[var(--accent-secondary)] font-bold text-sm">✓</span>
                  <span className="font-semibold text-[var(--accent-primary)] text-sm">All certifications</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--accent-secondary)] font-bold text-sm">✓</span>
                  <span className="font-semibold text-[var(--accent-primary)] text-sm">Unlimited exams</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--accent-secondary)] font-bold text-sm">✓</span>
                  <span className="font-semibold text-[var(--accent-primary)] text-sm">AI recommendations</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--accent-secondary)] font-bold text-sm">✓</span>
                  <span className="font-semibold text-[var(--accent-primary)] text-sm">Weekly leaderboard</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <Link 
                  href="/signup" 
                  className="block w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white px-8 py-5 rounded-xl font-ui font-bold shadow-xl shadow-[var(--accent-primary)]/20 hover:scale-[1.01] transition-all text-center no-underline"
                >
                  Start Practicing Free
                </Link>
                <p className="text-[var(--text-muted)] text-xs">
                  Paid plans coming soon. Early users get a special discount.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[var(--accent-primary)] text-white w-full py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1 space-y-4">
            <span className="font-display font-bold text-2xl text-white">Xavier 300</span>
            <p className="text-white/60 text-sm leading-relaxed">Empowering the next generation of Nigerian tech leaders through world-class certification mastery.</p>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Platform</h4>
            <ul className="space-y-4 text-sm">
              <li><Link className="text-white/80 hover:text-[var(--accent-secondary)] hover:underline transition-all" href="/courses">Browse Courses</Link></li>
              <li><Link className="text-white/80 hover:text-[var(--accent-secondary)] hover:underline transition-all" href="/pricing">Pricing</Link></li>
              <li><Link className="text-white/80 hover:text-[var(--accent-secondary)] hover:underline transition-all" href="/support">Help Center</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Legal</h4>
            <ul className="space-y-4 text-sm">
              <li><Link className="text-white/80 hover:text-[var(--accent-secondary)] hover:underline transition-all" href="/terms">Terms of Service</Link></li>
              <li><Link className="text-white/80 hover:text-[var(--accent-secondary)] hover:underline transition-all" href="/privacy">Privacy Policy</Link></li>
              <li><Link className="text-white/80 hover:text-[var(--accent-secondary)] hover:underline transition-all" href="/support">Contact Us</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Newsletter</h4>
            <p className="text-white/60 text-xs">Stay updated with the latest exam tracks.</p>
            <div className="flex">
              <input 
                className="bg-white/10 border-0 rounded-l-lg px-4 py-2 w-full focus:ring-2 focus:ring-[var(--accent-secondary)] text-white placeholder-white/40 text-sm focus:outline-none" 
                placeholder="Email address" 
                type="email"
              />
              <button className="bg-[var(--accent-secondary)] text-white px-4 rounded-r-lg hover:bg-[var(--accent-secondary-hover)] transition-colors">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-6 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-xs">© 2026 Xavier 300 Tech Certification Center. All rights reserved.</p>
          <div className="flex gap-6 text-white/40 text-xs">
            Built for Nigerian tech professionals.
          </div>
        </div>
      </footer>

    </div>
  );
}
