'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Zap, Target, Search, CheckCircle2, ArrowRight, Sparkles, Users, Award, TrendingUp, Star, Play, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

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
    { label: 'Students Served', value: '10,000+', icon: Users, color: 'indigo' },
    { label: 'Opportunities Found', value: '50,000+', icon: Target, color: 'emerald' },
    { label: 'Success Rate', value: '92%', icon: TrendingUp, color: 'purple' },
    { label: 'Companies Partnered', value: '500+', icon: Award, color: 'amber' },
  ];

  const features = [
    {
      icon: Search,
      title: 'Smart Matching',
      description: 'Our agent scans opportunity platforms 24/7 and ranks them against your skills, CGPA, and goals.',
      color: 'indigo',
    },
    {
      icon: CheckCircle2,
      title: 'Resume Audit',
      description: 'Upload your resume and get an instant AI audit against specific job descriptions to maximize your chances.',
      color: 'emerald',
    },
    {
      icon: Target,
      title: 'AI Application',
      description: 'Automatically draft tailored cover letters and cold emails that highlight exactly what the recruiter is looking for.',
      color: 'purple',
    },
  ];

  const steps = [
    { number: '01', title: 'Create Your Profile', description: 'Tell us about your skills, goals, and what you\'re looking for.' },
    { number: '02', title: 'Upload Your Resume', description: 'Our AI analyzes your resume and extracts key skills and experience.' },
    { number: '03', title: 'Get Matched', description: 'Receive personalized opportunity recommendations tailored to your profile.' },
    { number: '04', title: 'Apply with Confidence', description: 'Use AI-generated cover letters and get audit feedback on your applications.' },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <section className="relative w-full max-w-7xl px-6 pt-24 pb-32 text-center flex flex-col items-center hero-gradient">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-600/10 blur-[150px] -z-10 rounded-full" />
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold mb-8 animate-fade-in">
          <Sparkles size={16} className="fill-current" />
          Powered by Advanced AI Matching
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight animate-slide-up">
          Your Personal <span className="gradient-text">AI Agent</span> <br />
          for Career Growth
        </h1>
        
        <p className="text-lg text-slate-400 max-w-2xl mb-12 leading-relaxed animate-slide-up" style={{ animationDelay: '100ms' }}>
          DevArena scans thousands of internships, hackathons, and research openings. 
          We match them to your unique student profile, audit your resume, and draft 
          your application—all in one place.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          {student ? (
            <>
              <Link href="/dashboard" className="btn-primary text-lg px-8 py-4">
                Go to Dashboard <ArrowRight size={20} />
              </Link>
              <button 
                onClick={handleLiveSearch}
                disabled={isLiveSearchLoading}
                className="btn-secondary text-lg px-8 py-4"
              >
                {isLiveSearchLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <Sparkles size={20} />
                    Live Search
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="btn-primary text-lg px-8 py-4">
                Get Started Free <ArrowRight size={20} />
              </Link>
              <button className="btn-secondary text-lg px-8 py-4 flex items-center gap-2">
                <Play size={18} />
                Watch Demo
              </button>
            </>
          )}
        </div>

        {student && matchCount > 0 && (
          <div className="mt-8 flex items-center gap-2 text-emerald-400 font-medium animate-fade-in">
            <CheckCircle2 size={18} />
            <span>You have {matchCount} new opportunities waiting!</span>
          </div>
        )}
      </section>

      <section className="w-full py-16 border-y border-white/5 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index} 
                  className="text-center animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 mb-4`}>
                    <Icon className={`text-${stat.color}-400`} size={24} />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="w-full max-w-7xl px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Students <span className="gradient-text">Choose DevArena</span></h2>
          <p className="text-slate-400 max-w-xl mx-auto">Everything you need to accelerate your career journey in one intelligent platform.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="glass-card card-hover-lift group">
                <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-500/10 flex items-center justify-center mb-6 border border-${feature.color}-500/20 group-hover:scale-110 transition-transform`}>
                  <Icon className={`text-${feature.color}-500`} size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-indigo-300 transition-colors">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="w-full max-w-7xl px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It <span className="gradient-text">Works</span></h2>
          <p className="text-slate-400 max-w-xl mx-auto">Get started in minutes with our simple four-step process.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="glass-card-static text-center p-6 relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 left-full w-full h-px bg-white/10 -translate-y-1/2" style={{ width: 'calc(100% - 2rem)' }} />
              )}
              <div className="text-5xl font-bold text-white/10 mb-4">{step.number}</div>
              <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link href="/dashboard" className="btn-primary text-lg">
            Start Your Journey <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <section className="w-full max-w-7xl px-6 py-24">
        <div className="glass-card-static overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="p-12 md:p-16 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-6">
              <Star size={14} className="fill-current" />
              Rated 4.9/5 by Students
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Built for the Next Generation of Developers</h2>
            <p className="text-slate-400 mb-10 max-w-xl mx-auto">
              Join thousands of students who have fast-tracked their careers with DevArena. 
              Get your personal career dashboard today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard" className="btn-primary text-lg px-8">
                Get Started <ChevronRight size={20} />
              </Link>
              <button className="btn-secondary text-lg px-8">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="w-full py-12 px-6 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Zap size={16} className="text-white fill-current" />
          </div>
          <span className="text-lg font-bold text-white">DevArena</span>
        </div>
        <p className="text-slate-500 text-sm mb-4">AI-powered career agent for students</p>
        <p className="text-slate-600 text-xs">© 2026 DevArena - Developed by Team DevBandits</p>
      </footer>
    </div>
  );
}