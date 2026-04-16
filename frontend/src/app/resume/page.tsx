'use client';

import { useState, useRef } from 'react';
import { 
  Upload, FileText, CheckCircle2, X, Sparkles, 
  ArrowRight, Loader2, AlertCircle, Briefcase, 
  Target, TrendingUp, Fingerprint, Layers, ChevronRight 
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

interface MatchResult {
  opportunity: {
    id: number;
    title: string;
    company: string;
    type: string;
    description: string;
    required_skills: string;
    url: string;
  };
  matchScore: number;
  resumeSkills: string[];
  missingSkills: string[];
}

interface ResumeParseResult {
  parsed: boolean;
  name?: string;
  email?: string;
  skills?: string[];
  experience?: string[];
  education?: string[];
  matches: MatchResult[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AddResume() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ResumeParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please upload a PDF or DOCX file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a PDF or DOCX file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    const studentId = localStorage.getItem('studentId') || '1';

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('student_id', studentId);

      const res = await axios.post(`${API_URL}/api/resume/parse`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(res.data);
    } catch (err: any) {
      console.error('Upload error:', err);
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      
      if (status === 429) {
        setError('AI Capacity Reached. Please wait ~60s and try again. Our neural networks are currently under heavy load.');
      } else if (status === 503) {
        setError(detail || 'AI Service is temporarily unavailable. Please try again later.');
      } else {
        setError(detail || 'Failed to parse resume. Please ensure the file is not corrupted.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-gold-500';
    return 'text-rose-400';
  };

  return (
    <div className="min-h-screen hero-mesh pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-24">
        <div className="stagger-children">
          <header className="mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 glow-emerald">
              <Fingerprint size={14} className="animate-pulse" />
              Genetic Data Intake
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-semibold mb-6 leading-tight text-white">
              Inject Your <span className="gradient-text">Professional DNA</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl font-light leading-relaxed">
              Upload your career dossier and let our neural agents index your experience against global opportunity clusters.
            </p>
          </header>

          {!result ? (
            <div className="space-y-12">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`glass-card-static min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed transition-all cursor-pointer group relative overflow-hidden ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-500/10 glow-emerald'
                    : 'border-white/5 hover:border-emerald-500/20 hover:bg-white/[0.01]'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-emerald-500 group-hover:scale-110 group-hover:opacity-[0.05] transition-all duration-1000">
                  <Layers size={160} />
                </div>

                <div className="flex flex-col items-center justify-center relative z-10 p-12 text-center">
                  {file ? (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-8">
                      <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 glow-emerald">
                        <FileText size={40} className="text-emerald-500" />
                      </div>
                      <div className="text-left">
                        <p className="text-xl font-display font-semibold text-white mb-1">{file.name}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB RAW DATA</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile();
                        }}
                        className="ml-4 p-3 rounded-xl hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 transition-all border border-transparent hover:border-rose-500/20"
                      >
                        <X size={24} />
                      </button>
                    </motion.div>
                  ) : (
                    <>
                      <div className="w-24 h-24 rounded-3xl bg-white/[0.02] flex items-center justify-center mb-10 border border-white/5 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/5 transition-all duration-700">
                        <Upload size={40} className="text-slate-600 group-hover:text-emerald-500 transition-colors" />
                      </div>
                      <h3 className="text-3xl font-display font-semibold mb-3 text-white">Deposit Dossier</h3>
                      <p className="text-slate-500 text-base max-w-sm mx-auto leading-relaxed font-light">
                        Drag and drop your DNA profile (PDF/DOCX) or click to browse our secure clusters.
                      </p>
                    </>
                  )}
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 p-5 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-400">
                  <AlertCircle size={24} />
                  <p className="text-sm font-bold uppercase tracking-widest">{error}</p>
                </motion.div>
              )}

              {file && (
                <div className="flex justify-center">
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="btn-primary text-base px-12 py-5 animate-pulse-emerald"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={24} className="animate-spin" />
                        SEQUENCING GENOME...
                      </>
                    ) : (
                      <>
                        INITIALIZE MAPPING
                        <ArrowRight size={24} />
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                {[
                  { icon: Target, title: 'Neural Matching', desc: 'Cross-referencing your experience with latent opportunity nodes.', color: 'emerald' },
                  { icon: Sparkles, title: 'Skill Synthesis', desc: 'Autonomous extraction of technical and soft-skill layers.', color: 'gold' },
                  { icon: TrendingUp, title: 'Gap Mapping', desc: 'Predicting the optimal path to maximum resonance.', color: 'emerald' },
                ].map((item, i) => (
                  <div key={i} className="glass-card-static p-8 text-center group border-white/5 hover:border-white/10">
                    <div className={`w-14 h-14 rounded-2xl bg-${item.color === 'gold' ? 'amber' : 'emerald'}-500/10 flex items-center justify-center mx-auto mb-6 border border-${item.color === 'gold' ? 'amber' : 'emerald'}-500/20 group-hover:scale-110 transition-transform`}>
                      <item.icon className={`text-${item.color === 'gold' ? 'amber' : 'emerald'}-500`} size={28} />
                    </div>
                    <h3 className="text-lg font-display font-bold text-white mb-3 uppercase tracking-tighter">{item.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-light">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-12 animate-fade-in">
              {result.parsed && (
                <div className="glass-card-static p-10 border-emerald-500/20 bg-emerald-500/[0.01]">
                  <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 glow-emerald">
                        <CheckCircle2 className="text-emerald-500" size={24} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-display font-semibold text-white">Dossier Categorized</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Neural agents have successfully indexed your markers</p>
                      </div>
                    </div>
                    <div className="badge badge-emerald">Verified Signature</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3">Identity Marker</p>
                      <p className="text-lg font-display font-bold text-white">{result.name || 'ANONYMOUS'}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3">Core Node</p>
                      <p className="text-sm font-light text-slate-300 truncate">{result.email || 'NOD_SECURE'}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3">Skill Density</p>
                      <p className="text-lg font-display font-bold text-emerald-500">{result.skills?.length || 0} Synapses</p>
                    </div>
                  </div>

                  {result.skills && result.skills.length > 0 && (
                    <div className="mt-10">
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-4">Extracted Expertise Layers</p>
                      <div className="flex flex-wrap gap-3">
                        {result.skills.map((skill, i) => (
                          <span key={i} className="bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <header className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-display font-semibold text-white flex items-center gap-4">
                    <Briefcase size={32} className="text-emerald-500/40" />
                    Target Resonances
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Clusters Found:</span>
                    <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg text-xs font-bold font-display">{result.matches.length}</span>
                  </div>
                </header>

                <div className="grid grid-cols-1 gap-6">
                  {result.matches.map((match, index) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: index * 0.1 }}
                      key={match.opportunity.id} 
                      className="glass-card group overflow-hidden border-white/5 hover:border-emerald-500/20"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-10">
                        <div className="flex-1 space-y-6">
                          <header className="flex items-start justify-between">
                            <div>
                              <h3 className="text-2xl font-display font-bold text-white group-hover:gradient-text transition-all duration-500">{match.opportunity.title}</h3>
                              <p className="text-slate-500 text-sm font-medium uppercase tracking-widest mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                {match.opportunity.company}
                              </p>
                            </div>
                            <div className="badge badge-emerald py-1 px-4 text-[10px] tracking-widest">{match.opportunity.type}</div>
                          </header>
                          
                          <p className="text-slate-400 text-base font-light leading-relaxed line-clamp-2 italic">
                            {match.opportunity.description}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {match.opportunity.required_skills.split(',').map(skill => (
                              <span key={skill} className="px-3 py-1 rounded-lg bg-white/[0.03] text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-300">
                                {skill.trim()}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="shrink-0 flex flex-col items-center gap-4 p-8 bg-white/[0.01] border-l border-white/5 min-w-[200px]">
                          <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse-emerald" />
                            <div className={`relative w-24 h-24 rounded-3xl bg-surface-lowest border border-white/5 flex flex-col items-center justify-center ${getScoreColor(match.matchScore)}`}>
                              <span className="text-4xl font-display font-bold">{Math.round(match.matchScore)}%</span>
                              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Resonance</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-3 w-full">
                            <Link
                              href={`/audit?opp=${match.opportunity.id}`}
                              className="w-full text-center py-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-[0.2em] border border-emerald-500/20 hover:bg-emerald-500/20 transition-all group/btn"
                            >
                              INITIATE AUDIT
                            </Link>
                            <a
                              href={match.opportunity.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full text-center py-2.5 rounded-xl bg-white/5 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] border border-white/5 hover:bg-white/10 hover:text-white transition-all"
                            >
                              VIEW SOURCE
                            </a>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center pt-12">
                <button
                  onClick={() => {
                    setResult(null);
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="group flex items-center gap-3 text-slate-500 hover:text-emerald-400 transition-all font-bold uppercase tracking-[0.3em] text-[10px]"
                >
                  <X size={14} className="group-hover:rotate-90 transition-transform" />
                  Clear Data Stream
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}