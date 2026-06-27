"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  BarChart2, 
  Brain, 
  Shield, 
  Cloud, 
  Grid3X3, 
  Infinity as InfinityIcon, 
  Code2, 
  BookOpen, 
  PieChart,
  ArrowRight,
  Send,
  ChevronRight,
  GraduationCap,
  Check
} from 'lucide-react';

export default function LandingPage() {
  const domains = [
    { 
      name: "Data Analysis", 
      count: "3 certifications", 
      icon: <BarChart2 size={22} />, 
      slug: "data-analysis",
    },
    { 
      name: "Data Science", 
      count: "2 certifications", 
      icon: <Brain size={22} />, 
      slug: "data-science",
    },
    { 
      name: "Cybersecurity", 
      count: "3 certifications", 
      icon: <Shield size={22} />, 
      slug: "cybersecurity",
    },
    { 
      name: "Microsoft Azure", 
      count: "4 certifications", 
      icon: <Cloud size={22} />, 
      slug: "azure",
    },
    { 
      name: "Microsoft Excel", 
      count: "1 certification", 
      icon: <Grid3X3 size={22} />, 
      slug: "excel",
    },
    { 
      name: "DevOps", 
      count: "2 certifications", 
      icon: <InfinityIcon size={22} />, 
      slug: "devops",
    },
    { 
      name: "Full Stack Web Dev", 
      count: "3 certifications", 
      icon: <Code2 size={22} />, 
      slug: "fullstack",
    },
    { 
      name: "Nigerian Professional Exams", 
      count: "6 certifications", 
      icon: <BookOpen size={22} />, 
      slug: "nigerian-professional-exams",
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
      
      {/* HERO SECTION — Split Layout */}
      <section className="relative py-20 lg:py-28 px-6">
        <div className="max-w-[1280px] mx-auto w-full grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          
          {/* LEFT — 60% */}
          <div className="lg:col-span-3 space-y-8">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-block font-ui text-xs font-semibold text-[var(--accent-secondary)] uppercase tracking-[0.05em]"
            >
              Exam Practice Platform
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-display font-bold text-4xl md:text-[48px] text-[var(--accent-primary)] leading-[1.25] max-w-2xl"
            >
              Welcome to Your Practice Centre for Tech Certification
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-ui text-lg text-[var(--text-muted)] max-w-lg leading-[1.6]"
            >
              Exam-ready confidence. Nigerian pricing. World-class preparation. Designed for the ambitious tech professionals of Lagos, Abuja, and beyond.
            </motion.p>
            
            {/* Social Proof */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex items-center gap-4"
            >
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-200 flex items-center justify-center font-bold text-[9px] text-indigo-700">A</div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-teal-200 flex items-center justify-center font-bold text-[9px] text-teal-700">O</div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-amber-200 flex items-center justify-center font-bold text-[9px] text-amber-700">K</div>
              </div>
              <span className="text-xs font-semibold font-ui text-[var(--text-secondary)]">+10k Nigerian Students Practicing</span>
            </motion.div>
            
            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <Link 
                href="/signup"
                className="inline-flex justify-center items-center bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white px-8 py-4 rounded-full font-ui font-semibold shadow-lg hover:shadow-xl transition-all text-center"
              >
                Start Practicing Free
              </Link>
              <Link 
                href="#domains"
                className="inline-flex justify-center items-center gap-2 bg-transparent border-2 border-[var(--accent-primary)]/20 text-[var(--accent-primary)] px-8 py-4 rounded-full font-ui font-semibold hover:bg-[var(--accent-light)] transition-all text-center"
              >
                Browse Courses
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
          
          {/* RIGHT — 40% */}
          <div className="lg:col-span-2 relative hidden lg:block">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="rounded-2xl overflow-hidden shadow-xl border border-[var(--border-subtle)]"
            >
              <img 
                className="w-full h-[400px] object-cover" 
                alt="Student studying at laptop for certification exam" 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=400&fit=crop"
              />
            </motion.div>
            
            {/* Floating Stats Badge */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-[var(--border-subtle)] flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-[var(--accent-secondary-light)] text-[var(--accent-secondary)] flex items-center justify-center">
                <Check size={16} />
              </div>
              <div>
                <span className="font-ui font-bold text-[var(--accent-primary)] text-sm block">98% Pass Rate</span>
                <div className="w-24 h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden mt-1">
                  <div className="w-[98%] h-full bg-[var(--accent-secondary)] rounded-full"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CERTIFICATION PATHS */}
      <section id="domains" className="py-24 px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16 space-y-3">
            <span className="font-ui font-semibold text-xs text-[var(--accent-secondary)] tracking-widest uppercase">Expert Learning Paths</span>
            <h2 className="font-display font-bold text-[32px] text-[var(--text-primary)]">Choose Your Certification Path</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {domains.map((domain, i) => (
              <Link href={`/courses/${domain.slug}`} key={i} className="group">
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="bg-white border border-[var(--border-subtle)] p-6 rounded-2xl transition-all duration-300 flex flex-col justify-between h-full shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]"
                >
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-full bg-[#4DB6AC]/10 text-[#4DB6AC] flex items-center justify-center transition-colors group-hover:bg-[#4DB6AC] group-hover:text-white">
                      {domain.icon}
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-1 leading-snug">
                        {domain.name}
                      </h3>
                      <p className="text-[var(--text-muted)] text-[13px] font-ui">
                        {domain.count}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
                    <span className="text-[var(--accent-primary)] text-sm font-ui font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Explore track
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[var(--accent-primary)] py-24 px-6 overflow-hidden relative text-white">
        <div className="max-w-[1280px] mx-auto relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-display font-bold text-[32px] text-white">How Xavier 300 Works</h2>
            <p className="text-gray-300 max-w-xl mx-auto font-ui text-base">
              Streamlined process from selection to mastery. Powered by AI and expert curriculum.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-white/20"></div>
            
            {steps.map((step, i) => (
              <div key={i} className="relative text-center group flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[var(--accent-secondary)] text-white flex items-center justify-center font-ui font-bold text-xl mb-6 shadow-lg relative z-10 transition-transform group-hover:scale-110">
                  {step.num}
                </div>
                <h3 className="font-ui font-semibold text-lg text-white mb-2">{step.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed max-w-[200px]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-24 px-6 bg-[var(--bg-primary)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="font-display font-bold text-4xl text-[var(--accent-primary)]">Start Practicing Today</h2>
            <p className="font-ui text-lg text-[var(--text-secondary)]">Built for Nigerian tech professionals</p>
          </div>
          
          <div className="max-w-[480px] mx-auto bg-white border border-[var(--border-subtle)] rounded-2xl p-8 shadow-[var(--shadow-card)]">
            <div className="text-center space-y-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[var(--accent-secondary-light)] text-[var(--accent-secondary)] text-xs font-ui font-semibold uppercase tracking-wider mb-4">
                  Limited Offer
                </span>
                <h3 className="font-display text-[32px] font-bold text-[var(--accent-primary)]">Completely Free</h3>
                <p className="text-[var(--text-muted)] text-base font-ui mt-2">
                  Full access during our launch period. No credit card required.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-left">
                {['All certifications', 'Unlimited exams', 'AI recommendations', 'Weekly leaderboard'].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check size={16} className="text-[var(--accent-secondary)] flex-shrink-0" />
                    <span className="font-ui text-sm text-[var(--text-primary)] font-medium">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3">
                <Link 
                  href="/signup" 
                  className="block w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white px-8 py-4 rounded-lg font-ui font-semibold shadow-lg hover:shadow-xl transition-all text-center no-underline"
                >
                  Start Practicing Free
                </Link>
                <p className="text-[var(--text-muted)] text-xs font-ui">
                  Paid plans coming soon. Early users get a special discount.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[var(--accent-primary)] text-white w-full py-20">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1 space-y-4">
            <span className="font-display font-bold text-2xl text-white">Xavier 300</span>
            <p className="text-white/60 text-sm leading-relaxed">
              Empowering the next generation of Nigerian tech leaders through world-class certification mastery.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="font-ui font-semibold text-white uppercase tracking-wider text-xs">Platform</h4>
            <ul className="space-y-4 text-sm">
              <li><Link className="text-white/70 hover:text-[var(--accent-secondary)] transition-all" href="/courses">Browse Courses</Link></li>
              <li><Link className="text-white/70 hover:text-[var(--accent-secondary)] transition-all" href="/pricing">Pricing</Link></li>
              <li><Link className="text-white/70 hover:text-[var(--accent-secondary)] transition-all" href="/support">Help Center</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="font-ui font-semibold text-white uppercase tracking-wider text-xs">Legal</h4>
            <ul className="space-y-4 text-sm">
              <li><Link className="text-white/70 hover:text-[var(--accent-secondary)] transition-all" href="/terms">Terms of Service</Link></li>
              <li><Link className="text-white/70 hover:text-[var(--accent-secondary)] transition-all" href="/privacy">Privacy Policy</Link></li>
              <li><Link className="text-white/70 hover:text-[var(--accent-secondary)] transition-all" href="/support">Contact Us</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="font-ui font-semibold text-white uppercase tracking-wider text-xs">Newsletter</h4>
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
        
        <div className="max-w-[1280px] mx-auto px-6 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-xs">&copy; 2026 Xavier 300 Tech Certification Center. All rights reserved.</p>
          <div className="flex gap-6 text-white/40 text-xs">
            Built for Nigerian tech professionals.
          </div>
        </div>
      </footer>

    </div>
  );
}
