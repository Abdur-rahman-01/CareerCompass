'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Zap, Briefcase, Award, GraduationCap, MapPin, 
  ExternalLink, ChevronRight, Search, TrendingUp, 
  Clock, Target, Sparkles, Loader2, AlertCircle, Plus 
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Opportunity {
  id: number;
  title: string;
  company: string;
  type: string;
  description: string;
  required_skills: string;
  url: string;
}

interface Engagement {
  id: number;
  student_id: number;
  opportunity_id: number;
  status: string;
  match_score: number;
  opportunity: Opportunity;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Dashboard() {
  const { student } = useAuth();
  const [matches, setMatches] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = () => {
    if (!student) return;
    setLoading(true);
    setError(null);
    axios.get(`${API_URL}/api/opportunities/match/${student.id}`)
      .then(res => {
        setMatches(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching matches", err);
        setError("Failed to load opportunities. Please try again.");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!student) return;
    fetchMatches();
  }, [student]);

  const handleLiveSearch = async () => {
    if (!student) return;
    setSearching(true);
    try {
      await axios.post(`${API_URL}/api/opportunities/search/auto/${student.id}`);
      fetchMatches();
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const studentName = student?.full_name?.split(' ')[0] || 'Future Star';
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const stats = [
    { icon: Zap, label: 'Velocity', value: `${matches.length * 12}%`, color: 'emerald' },
    { icon: Target, label: 'Readiness', value: '85%', color: 'gold' },
    { icon: Briefcase, label: 'Opportunities', value: matches.length, color: 'emerald' },
    { icon: Award, label: 'Rank', value: '#12', color: 'gold' },
  ];

  return (
    <div className="min-h-screen hero-mesh pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-24">
        {/* Header Section */}
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs text-emerald-500 font-bold uppercase tracking-[0.2em]">{getGreeting()}</p>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-semibold mb-4 leading-tight">
              Command <span className="gradient-text">Center</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl font-light">
              Welcome back, {studentName}. Your AI agent has analyzed 154 new clusters to find these high-resonance matches.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/resume" className="btn-secondary group">
              <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              Initialize Resume
            </Link>
            <button 
              onClick={handleLiveSearch}
              disabled={searching}
              className="btn-primary glow-emerald"
            >
              {searching ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} className="animate-pulse-emerald" />
              )}
              {searching ? 'Syncing...' : 'Live Pulse Scan'}
            </button>
          </div>
        </header>

        {/* Career Velocity Section (Stats) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16 stagger-children">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const isEmerald = stat.color === 'emerald';
            return (
              <div key={index} className="glass-card-static relative group overflow-hidden">
                <div className={`absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700`}>
                  <Icon size={120} />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${isEmerald ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gold-500/10 text-amber-500'}`}>
                      <Icon size={20} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isEmerald ? 'text-emerald-500/50' : 'text-amber-500/50'}`}>
                      Metric {index + 1}
                    </span>
                  </div>
                  <div className="text-3xl font-display font-semibold text-white">{stat.value}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content - Opportunities */}
          <div className="lg:col-span-8 space-y-10">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <h2 className="text-2xl font-display font-semibold flex items-center gap-4">
                Opportunity Horizon
                <span className="badge badge-emerald text-[10px]">Active Wave</span>
              </h2>
              <div className="flex items-center gap-3 text-sm text-slate-500 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                <Search size={14} />
                <span className="font-medium">{matches.length} Matches Found</span>
              </div>
            </div>
            
            <div className="space-y-6">
              {loading ? (
                <div className="glass-card-static h-96 flex flex-col items-center justify-center border-dashed border-white/10">
                  <Loader2 size={40} className="animate-spin text-emerald-500 mb-6" />
                  <p className="text-slate-400 font-medium tracking-wide">Syncing with global clusters...</p>
                </div>
              ) : error ? (
                <div className="glass-card-static border-rose-500/10 flex flex-col items-center justify-center py-20 grayscale hover:grayscale-0 transition-all">
                  <AlertCircle size={40} className="text-rose-500/40 mb-6" />
                  <p className="text-slate-400 mb-6 font-medium">{error}</p>
                  <button onClick={fetchMatches} className="btn-secondary">Re-Initialize</button>
                </div>
              ) : matches.length === 0 ? (
                <div className="glass-card-static border-dashed border-white/5 flex flex-col items-center justify-center py-24 bg-emerald-500/[0.01]">
                  <div className="w-20 h-20 rounded-3xl bg-emerald-500/5 flex items-center justify-center mb-8 border border-emerald-500/10 glow-emerald">
                    <Target size={40} className="text-emerald-500/40" />
                  </div>
                  <h3 className="text-2xl font-display font-semibold mb-3 text-white">Zone Empty</h3>
                  <p className="text-slate-500 mb-10 text-center max-w-sm leading-relaxed">
                    No active resonances detected. Upload your DNA profile (Resume) or broaden your scan area.
                  </p>
                  <button onClick={handleLiveSearch} className="btn-primary">
                    <Sparkles size={18} />
                    Begin Resonance Scan
                  </button>
                </div>
              ) : (
                <AnimatePresence>
                  {matches.map((match, index) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={match.id} 
                      className="glass-card group overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row md:items-stretch gap-8">
                        <div className="flex-1 py-1">
                          <header className="flex items-start justify-between mb-6">
                            <div className="flex gap-5">
                              <div className="w-14 h-14 rounded-2xl bg-surface-lowest flex items-center justify-center border border-white/5 group-hover:border-emerald-500/20 transition-all duration-500 shadow-inner">
                                <Briefcase className="text-slate-500 group-hover:text-emerald-400 transition-colors" size={24} />
                              </div>
                              <div>
                                <h3 className="text-xl font-display font-semibold text-white mb-2 group-hover:gradient-text transition-all duration-500">
                                  {match.opportunity.title}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                  <span className="flex items-center gap-1.5 font-medium text-slate-400">
                                    <MapPin size={14} className="text-emerald-500/50" /> {match.opportunity.company}
                                  </span>
                                  <span className="badge badge-emerald py-0.5 px-3">{match.opportunity.type}</span>
                                </div>
                              </div>
                            </div>
                          </header>

                          <p className="text-slate-400 text-sm mb-6 leading-relaxed line-clamp-2 max-w-2xl font-light">
                            {match.opportunity.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-8">
                            {match.opportunity.required_skills.split(',').slice(0, 5).map(skill => (
                              <span 
                                key={skill} 
                                className="px-3.5 py-1.5 rounded-xl bg-surface-lowest border border-white/[0.03] text-slate-400 text-[11px] font-bold uppercase tracking-wider group-hover:border-emerald-500/10 transition-colors"
                              >
                                {skill.trim()}
                              </span>
                            ))}
                            {match.opportunity.required_skills.split(',').length > 5 && (
                              <span className="px-3.5 py-1.5 rounded-xl bg-white/[0.02] text-slate-600 text-[11px] font-bold">
                                +{match.opportunity.required_skills.split(',').length - 5} MORE
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 pt-4 border-t border-white/[0.03]">
                            <Link 
                              href={`/audit?opp=${match.opportunity.id}`} 
                              className="btn-primary py-2.5 px-6 text-sm"
                            >
                              Initialize Audit 
                              <ChevronRight size={16} />
                            </Link>
                            <a 
                              href={match.opportunity.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs text-slate-500 hover:text-emerald-400 transition-all font-bold uppercase tracking-widest ml-auto"
                            >
                              Details
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        </div>

                        <div className="flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl bg-surface-lowest border border-white/[0.03] group-hover:border-emerald-500/10 transition-all duration-500 min-w-[130px]">
                          <div className="relative">
                            <svg className="w-16 h-16 transform -rotate-90">
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="transparent"
                                className="text-white/5"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="transparent"
                                strokeDasharray={176}
                                strokeDashoffset={176 - (176 * match.match_score) / 100}
                                className="text-emerald-500"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-xl font-display font-bold text-white">
                              {Math.round(match.match_score)}
                            </div>
                          </div>
                          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-500/50 mt-4">Resonance</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            {/* AI Insight Section */}
            <div className="glass-card-static relative overflow-hidden bg-gradient-to-br from-emerald-500/[0.03] to-surface-lowest glow-emerald p-8">
              <div className="absolute top-0 right-0 p-6 opacity-[0.05] text-emerald-500">
                <Sparkles size={64} className="animate-pulse" />
              </div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500/60 mb-8 flex items-center gap-3">
                <Sparkles size={14} /> AI Resonance Pulse
              </h3>
              <div className="relative z-10">
                <p className="text-base text-slate-200 font-light leading-relaxed mb-8 italic">
                  "{studentName}, your architectural pattern matches the 'Future Labs' stack with 94% precision. Focus on the 'Grit-Text' gradients in your project for maximal impact."
                </p>
                <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Advantage Detected</span>
                  <span className="text-xs text-emerald-600 font-bold ml-auto">+13%</span>
                </div>
              </div>
            </div>

            {/* Deadlines Section */}
            <div className="glass-card-static p-8">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-8 flex items-center gap-3 border-b border-white/5 pb-4">
                <Clock size={14} /> Timeline Horizon
              </h3>
              <div className="space-y-8">
                {[
                  { title: 'Google Internships', time: '48H REMAINING', color: 'bg-amber-500' },
                  { title: 'Stripe Hackathon', time: 'APRIL 20TH', color: 'bg-emerald-500' },
                  { title: 'Microsoft Explore', time: '5 DAYS LEFT', color: 'bg-indigo-500' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 group cursor-default">
                    <div className={`w-1 h-10 rounded-full ${item.color} opacity-20 group-hover:opacity-100 transition-opacity`} />
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{item.title}</div>
                      <div className="text-[10px] text-slate-500 font-bold tracking-widest mt-1 opacity-70">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Portals */}
            <div className="glass-card-static p-8 bg-surface-lowest">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold-500/60 mb-8 flex items-center gap-3">
                <Target size={14} /> Neural Portals
              </h3>
              <div className="space-y-4">
                <Link href="/resume" className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.03] hover:bg-emerald-500/[0.03] hover:border-emerald-500/20 transition-all group">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">Sync DNA Profile</span>
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-emerald-500/20 transition-all">
                    <Plus size={16} className="text-slate-500 group-hover:text-emerald-400" />
                  </div>
                </Link>
                <Link href="/profile" className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.03] hover:bg-gold-500/[0.02] hover:border-gold-500/20 transition-all group">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">Modify Core ID</span>
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-gold-500/20 transition-all">
                    <ExternalLink size={16} className="text-slate-500 group-hover:text-amber-500" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}