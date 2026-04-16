'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileSearch, UserCircle, Zap, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { student, isLoading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/resume', label: 'Add Resume', icon: FileSearch },
    { href: '/audit', label: 'Resume Audit', icon: FileSearch },
    { href: '/profile', label: 'Profile', icon: UserCircle },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 group-hover:rotate-3 transition-all">
            <Zap size={20} className="text-white fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Dev<span className="text-indigo-400">Arena</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.href)
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={17} />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center">
              <Loader2 size={18} className="animate-spin text-slate-500" />
            </div>
          ) : student ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-white">{student.full_name}</span>
                <span className="text-xs text-slate-500">{student.branch}</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {student.full_name?.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                title="Logout"
              >
                {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
              </button>
            </div>
          ) : (
            <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-sm font-semibold text-white hover:from-indigo-500 hover:to-indigo-400 transition-all hover:shadow-lg hover:shadow-indigo-500/25">
              Get Started
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}