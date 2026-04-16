'use client';

import { useState, useEffect } from 'react';
import { 
  User, GraduationCap, Code2, Globe, Save, 
  Check, Mail, MapPin, Award, Loader2, 
  ChevronRight, Fingerprint, Layers, Cpu, Radio
} from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ProfileEdit() {
  const router = useRouter();
  const { student, updateProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    full_name: student?.full_name || '',
    email: student?.email || '',
    year: student?.year || 3,
    branch: student?.branch || '',
    cgpa: student?.cgpa || '',
    skills: student?.skills || '',
    goals: student?.goals || '',
    github_url: student?.github_url || '',
    linkedin_url: student?.linkedin_url || '',
  });

  useEffect(() => {
    if (student) {
      setFormData({
        full_name: student.full_name || '',
        email: student.email || '',
        year: student.year || 3,
        branch: student.branch || '',
        cgpa: student.cgpa?.toString() || '',
        skills: student.skills || '',
        goals: student.goals || '',
        github_url: student.github_url || '',
        linkedin_url: student.linkedin_url || '',
      });
    }
  }, [student]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        ...formData,
        year: parseInt(formData.year as unknown as string),
        cgpa: parseFloat(formData.cgpa as unknown as string),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const years = [
    { value: 1, label: '1st Year' },
    { value: 2, label: '2nd Year' },
    { value: 3, label: '3rd Year' },
    { value: 4, label: '4th Year' },
  ];

  const tabs = [
    { id: 'personal', label: 'Identity', icon: User, desc: 'Core DNA markers' },
    { id: 'academic', label: 'Academic', icon: GraduationCap, desc: 'Educational synapse' },
    { id: 'skills', label: 'Technical', icon: Code2, desc: 'Expertise layers' },
    { id: 'links', label: 'Portals', icon: Globe, desc: 'External footprints' },
  ];

  const skillsList = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [];

  const addSkill = (skill: string) => {
    if (skill && !skillsList.includes(skill)) {
      const newSkills = [...skillsList, skill].join(', ');
      setFormData(prev => ({ ...prev, skills: newSkills }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = skillsList.filter(s => s !== skillToRemove).join(', ');
    setFormData(prev => ({ ...prev, skills: newSkills }));
  };

  const currentInitials = formData.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'ID';

  return (
    <div className="min-h-screen hero-mesh pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-24">
        <div className="stagger-children">
          <header className="mb-16 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Fingerprint size={16} className="text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500">Neural Signature Management</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-display font-semibold mb-2 leading-tight">
                The Career <span className="gradient-text">DNA</span>
              </h1>
              <p className="text-slate-500 text-lg font-light">Sync your markers to optimize matching resonance.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <AnimatePresence>
                {saved && (
                  <motion.span 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/10"
                  >
                    <Check size={16} /> Sync Successful
                  </motion.span>
                )}
              </AnimatePresence>
              
              <button 
                type="submit"
                form="profile-form"
                disabled={isSaving}
                className="btn-primary glow-emerald px-8"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    SYNCING...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    SAVE PROFILE
                  </>
                )}
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-4 space-y-8">
              <div className="glass-card-static p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-emerald-500 group-hover:scale-110 group-hover:opacity-[0.08] transition-all duration-700">
                  <Fingerprint size={120} />
                </div>
                
                <div className="flex flex-col items-center text-center relative z-10">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse-emerald" />
                    <div className="relative w-28 h-28 rounded-3xl bg-surface-lowest flex items-center justify-center text-white text-4xl font-display font-bold border border-white/5 shadow-inner">
                      {currentInitials}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-display font-semibold text-white mb-2">{formData.full_name || 'Designation Pending'}</h3>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-500/60 mb-6">
                    <Radio size={14} className="animate-pulse" />
                    {formData.branch || 'Neural Cluster Unknown'}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 w-full pt-6 border-t border-white/5">
                    <div className="text-left">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Standard</div>
                      <div className="text-sm font-display font-bold text-white uppercase">{formData.year}th Level</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Resonance</div>
                      <div className="text-sm font-display font-bold text-emerald-500">CGPA {formData.cgpa || '0.0'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-5 w-full p-5 rounded-2xl text-left transition-all duration-500 border ${
                        activeTab === tab.id
                          ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20 glow-emerald'
                          : 'text-slate-500 border-transparent hover:bg-white/[0.02] hover:text-slate-300'
                      }`}
                    >
                      <div className={`p-3 rounded-xl transition-all ${
                        activeTab === tab.id ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-slate-600'
                      }`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <div className={`text-sm font-display font-bold uppercase tracking-widest ${
                          activeTab === tab.id ? 'text-white' : ''
                        }`}>{tab.label}</div>
                        <div className="text-[10px] font-bold opacity-60 mt-1 uppercase tracking-wider">{tab.desc}</div>
                      </div>
                      <ChevronRight size={16} className={`ml-auto transition-transform ${
                        activeTab === tab.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                      }`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Form Content */}
            <div className="lg:col-span-8">
              <form id="profile-form" onSubmit={handleSave} className="space-y-8 animate-fade-in">
                {activeTab === 'personal' && (
                  <div className="glass-card-static p-12 space-y-12">
                    <header className="flex items-center justify-between border-b border-white/5 pb-8">
                      <h3 className="text-2xl font-display font-semibold flex items-center gap-4">
                        <User size={24} className="text-emerald-500/50" />
                        Identity Interface
                      </h3>
                      <div className="badge badge-emerald">Core Module</div>
                    </header>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Full Signature</label>
                        <div className="group">
                          <input 
                            type="text" 
                            name="full_name" 
                            value={formData.full_name} 
                            onChange={handleChange} 
                            className="w-full bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-emerald-500 text-lg transition-all font-light"
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Communication Node (Email)</label>
                        <input 
                          type="email" 
                          name="email" 
                          value={formData.email} 
                          onChange={handleChange} 
                          className="w-full bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-emerald-500 text-lg transition-all font-light"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Maturity Level (Year)</label>
                        <select 
                          name="year" 
                          value={formData.year} 
                          onChange={handleChange} 
                          className="w-full bg-surface-lowest border border-white/5 rounded-xl px-4 py-4 focus:outline-none focus:border-emerald-500 text-base appearance-none transition-all cursor-pointer font-medium"
                        >
                          {years.map((y) => (
                            <option key={y.value} value={y.value}>{y.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Resonance Score (CGPA)</label>
                        <input 
                          type="text" 
                          name="cgpa" 
                          value={formData.cgpa} 
                          onChange={handleChange} 
                          className="w-full bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-emerald-500 text-lg transition-all font-light"
                          placeholder="8.5"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'academic' && (
                  <div className="glass-card-static p-12 space-y-12">
                    <header className="flex items-center justify-between border-b border-white/5 pb-8">
                      <h3 className="text-2xl font-display font-semibold flex items-center gap-4">
                        <GraduationCap size={24} className="text-emerald-500/50" />
                        Academic Synapse
                      </h3>
                      <div className="badge badge-gold">Knowledge Layer</div>
                    </header>
                    
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Neural Cluster (Branch/Major)</label>
                      <input 
                        type="text" 
                        name="branch" 
                        value={formData.branch} 
                        onChange={handleChange} 
                        className="w-full bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-emerald-500 text-lg transition-all font-light"
                        placeholder="Computer Science, Electronics, etc."
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Strategic Intent (Career Goals)</label>
                      <textarea 
                        rows={6}
                        name="goals" 
                        value={formData.goals} 
                        onChange={handleChange} 
                        className="w-full bg-surface-lowest border border-white/5 rounded-2xl p-6 focus:outline-none focus:border-emerald-500 text-base transition-all resize-none font-light leading-relaxed"
                        placeholder="Describe your career goals and what you're looking for..."
                      />
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500/40">
                        <Cpu size={12} />
                        Recursive AI analysis enabled for these inputs
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'skills' && (
                  <div className="glass-card-static p-12 space-y-12">
                    <header className="flex items-center justify-between border-b border-white/5 pb-8">
                      <h3 className="text-2xl font-display font-semibold flex items-center gap-4">
                        <Code2 size={24} className="text-emerald-500/50" />
                        Skill Matrix
                      </h3>
                      <div className="badge badge-emerald">Hard Expertise</div>
                    </header>
                    
                    <div className="space-y-8">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Active Skill Points</label>
                      <div className="flex flex-wrap gap-3">
                        {skillsList.map((skill) => (
                          <motion.span 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            key={skill} 
                            className="bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 group"
                          >
                            {skill}
                            <button 
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="text-slate-600 hover:text-rose-500 transition-colors"
                            >
                              ×
                            </button>
                          </motion.span>
                        ))}
                        <input 
                          type="text" 
                          name="skills-input"
                          placeholder="Inject New Skill Layer..."
                          className="bg-white/5 border border-dashed border-white/10 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-emerald-500/30 w-48 transition-all"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSkill((e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="p-8 rounded-2xl bg-surface-lowest border border-white/5">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500/60 mb-6">Quantum Suggestions</h4>
                      <div className="flex flex-wrap gap-3">
                        {['React', 'PostgreSQL', 'Framer Motion', 'Tailwind', 'FastAPI', 'AWS Lambda'].map(skill => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => addSkill(skill)}
                            disabled={skillsList.includes(skill)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                              skillsList.includes(skill)
                                ? 'bg-emerald-500/20 text-emerald-500 cursor-default opacity-50'
                                : 'bg-white/5 text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-400 border border-transparent hover:border-emerald-500/20'
                            }`}
                          >
                            + {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'links' && (
                  <div className="glass-card-static p-12 space-y-12">
                    <header className="flex items-center justify-between border-b border-white/5 pb-8">
                      <h3 className="text-2xl font-display font-semibold flex items-center gap-4">
                        <Globe size={24} className="text-emerald-500/50" />
                        External Portals
                      </h3>
                      <div className="badge badge-indigo">Global Reach</div>
                    </header>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">GitHub Cluster</label>
                        <div className="relative group">
                          <FaGithub size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-white transition-colors" />
                          <input 
                            type="text" 
                            name="github_url" 
                            value={formData.github_url} 
                            onChange={handleChange} 
                            className="w-full bg-transparent border-b border-white/10 pl-8 py-3 focus:outline-none focus:border-emerald-500 text-base transition-all font-light"
                            placeholder="github.com/username"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">LinkedIn Synapse</label>
                        <div className="relative group">
                          <FaLinkedin size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-white transition-colors" />
                          <input 
                            type="text" 
                            name="linkedin_url" 
                            value={formData.linkedin_url} 
                            onChange={handleChange} 
                            className="w-full bg-transparent border-b border-white/10 pl-8 py-3 focus:outline-none focus:border-emerald-500 text-base transition-all font-light"
                            placeholder="linkedin.com/in/username"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-8 rounded-2xl bg-amber-500/[0.02] border border-amber-500/10 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                        <Layers size={80} className="text-amber-500" />
                      </div>
                      <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3">Verification Advantage</h4>
                      <p className="text-sm text-slate-500 leading-relaxed font-light">
                        Connecting your professional portals increases your resonance authenticity score by up to 22%. Recruiter clusters prioritize verified DNA signatures.
                      </p>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}