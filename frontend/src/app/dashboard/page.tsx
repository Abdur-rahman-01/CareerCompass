'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Zap, Briefcase, Award, GraduationCap, MapPin, ExternalLink, ChevronRight, Search, TrendingUp, Clock, Target, Sparkles, Loader2, AlertCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

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

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const stats = [
    { icon: Zap, label: 'New Matches', value: matches.length, color: 'indigo' },
    { icon: Briefcase, label: 'Applications', value: '5', color: 'emerald' },
    { icon: Award, label: 'Profile Strength', value: '85%', color: 'purple' },
    { icon: GraduationCap, label: 'Avg Match', value: '4.0', color: 'amber' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 font-medium mb-1">{getGreeting()}</p>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="gradient-text">{studentName}</span>
          </h1>
          <p className="text-slate-400">Here are the best opportunities matched specifically for your profile today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/resume" className="btn-secondary text-sm py-2.5">
            <Plus size={18} />
            Add Resume
          </Link>
          <button 
            onClick={handleLiveSearch}
            disabled={searching}
            className="btn-primary text-sm py-2.5"
          >
            {searching ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {searching ? 'Scanning...' : 'Live Search'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 stagger-children">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="glass-card-static flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center border border-${stat.color}-500/20`}>
                <Icon className={`text-${stat.color}-400`} size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-3">
              Tailored Opportunities 
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </h2>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Search size={16} />
              <span>{matches.length} results</span>
            </div>
          </div>
          
          {loading ? (
            <div className="glass-card-static h-64 flex flex-col items-center justify-center">
              <Loader2 size={32} className="animate-spin text-indigo-500 mb-4" />
              <p className="text-slate-500">Agent is scanning for opportunities...</p>
            </div>
          ) : error ? (
            <div className="glass-card-static border-rose-500/20 flex flex-col items-center justify-center py-12">
              <AlertCircle size={32} className="text-rose-400 mb-4" />
              <p className="text-slate-400 mb-4">{error}</p>
              <button onClick={fetchMatches} className="btn-secondary text-sm">
                Try Again
              </button>
            </div>
          ) : matches.length === 0 ? (
            <div className="glass-card-static border-dashed border-white/20 flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
                <Target size={32} className="text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">No opportunities found</h3>
              <p className="text-slate-500 mb-6 text-center max-w-md">
                Start by adding your resume or running a live search to discover opportunities that match your profile.
              </p>
              <button onClick={handleLiveSearch} className="btn-primary">
                <Sparkles size={18} />
                Start Live Search
              </button>
            </div>
          ) : (
            matches.map((match, index) => (
              <div 
                key={match.id} 
                className="glass-card group cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-white/10 group-hover:border-indigo-500/30 transition-colors">
                          <Briefcase className="text-slate-400 group-hover:text-indigo-400 transition-colors" size={22} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">{match.opportunity.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-slate-500">
                            <span className="flex items-center gap-1 font-medium">
                              <MapPin size={14} /> {match.opportunity.company}
                            </span>
                            <span className="capitalize badge badge-indigo">{match.opportunity.type}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-400 text-sm mb-5 line-clamp-2">
                      {match.opportunity.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-5">
                      {match.opportunity.required_skills.split(',').slice(0, 6).map(skill => (
                        <span 
                          key={skill} 
                          className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-slate-400 text-xs font-medium group-hover:border-white/10 transition-colors"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                      {match.opportunity.required_skills.split(',').length > 6 && (
                        <span className="px-3 py-1 rounded-full bg-white/5 text-slate-500 text-xs">
                          +{match.opportunity.required_skills.split(',').length - 6} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Link 
                        href={`/audit?opp=${match.opportunity.id}`} 
                        className="btn-primary text-sm py-2"
                      >
                        Audit Resume 
                        <ChevronRight size={16} />
                      </Link>
                      <a 
                        href={match.opportunity.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors font-medium ml-auto"
                      >
                        View Original 
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </div>

                  <div className={`flex flex-col items-center justify-center p-4 rounded-xl border ${getMatchScoreColor(match.match_score)} min-w-[90px]`}>
                    <span className="text-3xl font-bold">{Math.round(match.match_score)}%</span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 mt-1">Match</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card-static">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
              <Clock size={16} /> Upcoming Deadlines
            </h3>
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="w-2 h-12 rounded-full bg-amber-500/50" />
                <div>
                  <div className="text-sm font-bold text-white">Google Internships</div>
                  <div className="text-xs text-slate-500">Applications Close in 2 days</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-2 h-12 rounded-full bg-emerald-500/50" />
                <div>
                  <div className="text-sm font-bold text-white">Stripe Hackathon</div>
                  <div className="text-xs text-slate-500">Register by April 20th</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-2 h-12 rounded-full bg-purple-500/50" />
                <div>
                  <div className="text-sm font-bold text-white">Microsoft Explore</div>
                  <div className="text-xs text-slate-500">Deadline in 5 days</div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card-static relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Sparkles size={80} className="fill-current text-indigo-500" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <Sparkles size={16} /> AI Insight
            </h3>
            <div className="relative z-10">
              <p className="text-sm text-slate-300 font-medium leading-relaxed mb-4">
                "{studentName}, your research interests align perfectly with the AI position at Future Labs. Consider updating your profile with the latest PyTorch project for a 98% match."
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <TrendingUp size={14} />
                <span>+13% match potential</span>
              </div>
            </div>
          </div>

          <div className="glass-card-static bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/20">
            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2">
              <Target size={16} /> Quick Actions
            </h3>
            <div className="space-y-3">
              <Link href="/resume" className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
                <span className="text-sm text-slate-300">Upload Resume</span>
                <Plus size={16} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </Link>
              <Link href="/profile" className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
                <span className="text-sm text-slate-300">Edit Profile</span>
                <ExternalLink size={16} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}