'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileSearch, UserCircle, Zap, LogOut, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const { student, loading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/resume', label: 'DNA Upload', icon: FileSearch },
    { href: '/audit', label: 'Audit', icon: Sparkles },
    { href: '/profile', label: 'Identity', icon: UserCircle },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 neural-glass border-b border-white/5 bg-[#06080c]/80 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 group-hover:rotate-3 transition-all relative z-10">
              <Zap size={22} className="text-[#064e3b] fill-current" />
            </div>
          </div>
          <span className="text-2xl font-display font-semibold tracking-tighter text-white">
            Dev<span className="gradient-text">Arena</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-2 bg-white/[0.03] p-1.5 rounded-2xl border border-white/5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  active
                    ? 'text-emerald-400'
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {active && (
                  <motion.div 
                    layoutId="nav-glow"
                    className="absolute inset-0 bg-emerald-500/10 rounded-xl border border-emerald-500/20 glow-emerald"
                  />
                )}
                <Icon size={14} className="relative z-10" />
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-6">
          {loading ? (
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-slate-500" />
            </div>
          ) : student ? (
            <div className="flex items-center gap-4 pl-4 border-l border-white/5">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-white uppercase tracking-tight">{student.full_name}</span>
                <span className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-[0.1em]">{student.branch || 'Neural Member'}</span>
              </div>
              <Link href="/profile" className="relative group">
                <div className="absolute inset-0 bg-emerald-500/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-10 h-10 rounded-xl bg-surface-highest border border-white/10 flex items-center justify-center text-white font-display font-bold text-sm group-hover:border-emerald-500/30 transition-all relative z-10">
                  {student.full_name?.charAt(0).toUpperCase()}
                </div>
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="p-2.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                title="Logout"
              >
                {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="btn-primary py-2.5 px-6 text-xs uppercase tracking-[0.2em]">
              Initialize Access
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}