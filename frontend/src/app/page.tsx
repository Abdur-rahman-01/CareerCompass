'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Zap, Target, Search, CheckCircle2, ArrowRight, 
  Sparkles, Users, Award, TrendingUp, Star, Play, 
  ChevronRight, Loader2, Fingerprint, Layers, Cpu
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Stat {
  label: string;
  value: string;
  icon: any;
  color: string;
}

export default function Home() {
  const { student, loading: authLoading } = useAuth();
  const [isLiveSearchLoading, setIsLiveSearchLoading] = useState(false);
  const [matchCount, setMatchCount] = useState(0);

  useEffect(() => {
    if (student) {
      axios.get(`${API_URL}/api/opportunities/match/${student.id}`)
        .then(res => setMatchCount(res.data.length))
        .catch(() => {});
    }
  }, [student]);

  const handleLiveSearch = async () => {
    if (!student) return;
    setIsLiveSearchLoading(true);
    try {
      await axios.post(`${API_URL}/api/opportunities/search/auto/${student.id}`);
      const res = await axios.get(`${API_URL}/api/opportunities/match/${student.id}`);
      setMatchCount(res.data.length);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLiveSearchLoading(false);
    }
  };

  const stats: Stat[] = [
    { label: 'Agents Deployed', value: '10,000+', icon: Layers, color: 'emerald' },
    { label: 'Opportunity Clusters', value: '50,000+', icon: Target, color: 'emerald' },
    { label: 'Resonance Rate', value: '92%', icon: TrendingUp, color: 'gold' },
    { label: 'Global Partnerships', value: '500+', icon: Award, color: 'gold' },
  ];

  const features = [
    {
      icon: Search,
      title: 'Neural Scanning',
      description: 'Our agents scan 200+ global platforms 24/7, indexing opportunities against your unique DNA profile.',
      color: 'emerald',
    },
    {
      icon: Fingerprint,
      title: 'Resonance Audit',
      description: 'Instant AI audit of your resume against specific job descriptions to maximize semantic alignment.',
      color: 'gold',
    },
    {
      icon: Cpu,
      title: 'Autonomous Strategy',
      description: 'Let our agents draft tailored cover letters and cold emails that map perfectly to recruiter intents.',
      color: 'emerald',
    },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={48} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-background">
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl px-6 pt-32 pb-40 text-center flex flex-col items-center hero-mesh overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/10 blur-[150px] -z-10 rounded-full" 
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-12 glow-emerald"
        >
          <Sparkles size={14} className="animate-pulse" />
          Autonomous Career Engineering System
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-8xl font-display font-semibold tracking-tighter mb-10 leading-[1.05] text-white"
        >
          The Future of <br />
          <span className="gradient-text">Professional Resonance</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-slate-500 max-w-2xl mb-16 leading-relaxed font-light"
        >
          DevArena is a neural career agent designed for high-performing students. 
          We move beyond job boards to provide a holistic ecosystem of opportunity 
          discovery, resonance auditing, and autonomous application strategy.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-6"
        >
          {student ? (
            <>
              <Link href="/dashboard" className="btn-primary text-base px-10 py-5">
                ACCESS COMMAND CENTER <ArrowRight size={20} />
              </Link>
              <button 
                onClick={handleLiveSearch}
                disabled={isLiveSearchLoading}
                className="btn-secondary text-base px-10 py-5"
              >
                {isLiveSearchLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <Sparkles size={20} />
                    PULSE SCAN
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/register" className="btn-primary text-base px-10 py-5">
                INITIALIZE PROFILE <ArrowRight size={20} />
              </Link>
              <button className="btn-secondary text-base px-10 py-5 flex items-center gap-3">
                <Play size={18} />
                VIEW SIMULATION
              </button>
            </>
          )}
        </motion.div>

        {student && matchCount > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 flex items-center gap-3 text-emerald-400 font-bold text-xs uppercase tracking-[0.2em] animate-pulse-emerald"
          >
            <CheckCircle2 size={18} />
            <span>{matchCount} New Local Resonances Detected</span>
          </motion.div>
        )}
      </section>

      {/* Stats Section */}
      <section className="w-full py-20 border-y border-white/5 bg-surface-lowest">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index} 
                  className="text-center group"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 mb-6 group-hover:border-emerald-500/20 transition-all duration-700`}>
                    <Icon className="text-emerald-500 opacity-60 group-hover:opacity-100" size={28} />
                  </div>
                  <div className="text-4xl font-display font-semibold text-white mb-2">{stat.value}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-7xl px-6 py-32">
        <div className="text-center mb-24 space-y-4">
          <h2 className="text-4xl md:text-5xl font-display font-semibold text-white">System <span className="gradient-text">Architectures</span></h2>
          <p className="text-slate-500 max-w-xl mx-auto font-light leading-relaxed">Every layer of the platform is designed to provide maximum professional advantage through neural-matching technology.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isGold = feature.color === 'gold';
            return (
              <div key={index} className="glass-card group p-10 border-white/5 hover:border-emerald-500/20">
                <div className={`w-14 h-14 rounded-2xl ${isGold ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'} flex items-center justify-center mb-8 border group-hover:scale-110 transition-transform duration-700 glow-emerald`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-2xl font-display font-semibold mb-4 text-white group-hover:gradient-text transition-all duration-500">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed font-light">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full max-w-7xl px-6 py-32 mb-20">
        <div className="glass-card-static overflow-hidden relative group p-20 bg-gradient-to-br from-emerald-500/[0.02] to-transparent border-white/5">
          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="text-center relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-gold-500/5 border border-gold-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-10">
              <Star size={14} className="fill-current" />
              Trusted by 10,000+ Career Pioneers
            </div>
            <h2 className="text-5xl md:text-6xl font-display font-semibold mb-8 leading-tight max-w-3xl text-white">Engineering the Next Generation of Success</h2>
            <p className="text-slate-400 mb-14 max-w-2xl mx-auto font-light leading-relaxed text-lg italic">
              "DevArena represents the intersection of semantic AI and career growth. It doesn't just find jobs; it architectures your professional identity."
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/auth/register" className="btn-primary text-base px-12 py-5">
                EXECUTE SETUP <ChevronRight size={20} />
              </Link>
              <button className="btn-secondary text-base px-12 py-5">
                CORE MANIFESTO
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="w-full py-20 px-6 border-t border-white/5 text-center bg-surface-lowest">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
            <Zap size={20} className="text-[#064e3b] fill-current" />
          </div>
          <span className="text-2xl font-display font-semibold text-white tracking-tighter">Dev<span className="gradient-text">Arena</span></span>
        </div>
        <p className="text-slate-500 text-sm mb-6 font-medium tracking-wide">Neural-powered career agent for student pioneers</p>
        <div className="flex flex-col gap-2">
          <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.4em]">© 2026 DevArena - Cluster v1.4.2</p>
          <p className="text-[10px] text-slate-800 font-bold uppercase tracking-[0.4em]">Architected by Team DevBandits</p>
        </div>
      </footer>
    </div>
  );
}