'use client';

import { useState, useEffect } from 'react';
import { User, GraduationCap, Code2, Globe, Save, Check, Mail, Github, Linkedin, MapPin, Award, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

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
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Code2 },
    { id: 'links', label: 'Links', icon: Globe },
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

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="stagger-children">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              My <span className="gradient-text">Profile</span>
            </h1>
            <p className="text-slate-400">Keep your information up to date to get the best matches.</p>
          </div>
          <div className="flex items-center gap-4">
            {saved && (
              <span className="flex items-center gap-2 text-emerald-400 text-sm font-medium animate-fade-in">
                <Check size={18} /> Profile Updated
              </span>
            )}
            <button 
              type="submit"
              form="profile-form"
              disabled={isSaving}
              className="btn-primary"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="glass-card-static mb-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg shadow-indigo-500/30">
                  {formData.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h3 className="text-lg font-bold text-white">{formData.full_name || 'Your Name'}</h3>
                <p className="text-slate-500 text-sm">{formData.branch || 'Your Branch'}</p>
                <div className="flex items-center gap-2 mt-3 text-sm text-slate-400">
                  <Award size={14} className="text-indigo-400" />
                  <span>Year {formData.year} • CGPA {formData.cgpa || '0.0'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3">
            <form id="profile-form" onSubmit={handleSave} className="space-y-6">
              {activeTab === 'personal' && (
                <div className="glass-card-static space-y-6 animate-fade-in">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <User size={16} /> Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">Full Name</label>
                      <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="text" 
                          name="full_name" 
                          value={formData.full_name} 
                          onChange={handleChange} 
                          className="input-field pl-12"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label">Email Address</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="email" 
                          name="email" 
                          value={formData.email} 
                          onChange={handleChange} 
                          className="input-field pl-12"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">Year of Study</label>
                      <select 
                        name="year" 
                        value={formData.year} 
                        onChange={handleChange} 
                        className="input-field"
                      >
                        {years.map((y) => (
                          <option key={y.value} value={y.value}>{y.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Current CGPA</label>
                      <div className="relative">
                        <Award size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="text" 
                          name="cgpa" 
                          value={formData.cgpa} 
                          onChange={handleChange} 
                          className="input-field pl-12"
                          placeholder="8.5"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'academic' && (
                <div className="glass-card-static space-y-6 animate-fade-in">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <GraduationCap size={16} /> Academic Information
                  </h3>
                  
                  <div>
                    <label className="label">Branch / Major</label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        type="text" 
                        name="branch" 
                        value={formData.branch} 
                        onChange={handleChange} 
                        className="input-field pl-12"
                        placeholder="Computer Science, Electronics, etc."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Career Goals</label>
                    <textarea 
                      rows={5}
                      name="goals" 
                      value={formData.goals} 
                      onChange={handleChange} 
                      className="input-field resize-none"
                      placeholder="Describe your career goals and what you're looking for..."
                    />
                    <p className="text-xs text-slate-500 mt-2">This helps us match you with the right opportunities</p>
                  </div>
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="glass-card-static space-y-6 animate-fade-in">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Code2 size={16} /> Skills & Expertise
                  </h3>
                  
                  <div>
                    <label className="label">Your Skills</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {skillsList.map((skill) => (
                        <span 
                          key={skill} 
                          className="badge badge-indigo flex items-center gap-1"
                        >
                          {skill}
                          <button 
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-1 hover:text-rose-400 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <input 
                      type="text" 
                      name="skills-input"
                      placeholder="Type a skill and press Enter"
                      className="input-field"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <p className="text-xs text-slate-500 mt-2">Press Enter to add each skill</p>
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                    <h4 className="text-sm font-bold text-indigo-400 mb-2">Suggested Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {['React', 'Python', 'Node.js', 'Machine Learning', 'SQL', 'AWS', 'Docker', 'Git'].map(skill => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => addSkill(skill)}
                          disabled={skillsList.includes(skill)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            skillsList.includes(skill)
                              ? 'bg-indigo-500/20 text-indigo-400 cursor-default'
                              : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
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
                <div className="glass-card-static space-y-6 animate-fade-in">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Globe size={16} /> Professional Links
                  </h3>
                  
                  <div>
                    <label className="label">GitHub Profile</label>
                    <div className="relative">
                      <Github size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        type="text" 
                        name="github_url" 
                        value={formData.github_url} 
                        onChange={handleChange} 
                        className="input-field pl-12"
                        placeholder="github.com/username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">LinkedIn Profile</label>
                    <div className="relative">
                      <Linkedin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        type="text" 
                        name="linkedin_url" 
                        value={formData.linkedin_url} 
                        onChange={handleChange} 
                        className="input-field pl-12"
                        placeholder="linkedin.com/in/username"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <h4 className="text-sm font-bold text-amber-400 mb-2">Why add links?</h4>
                    <p className="text-sm text-slate-400">
                      Adding your GitHub and LinkedIn helps recruiters verify your experience and learn more about your projects.
                    </p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}