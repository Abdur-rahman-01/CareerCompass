'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, X, Sparkles, ArrowRight, Loader2, AlertCircle, Briefcase, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

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
      setError(err.response?.data?.detail || 'Failed to parse resume. Please try again.');
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
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 60) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 page-container">
      <div className="stagger-children">
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Sparkles size={14} />
            AI-Powered Analysis
          </div>
          <h1 className="text-4xl font-bold mb-3">
            Add Your <span className="gradient-text">Resume</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Upload your resume and our AI will match you with the best opportunities based on your skills and experience.
          </p>
        </header>

        {!result ? (
          <div className="space-y-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`glass-card-static border-2 border-dashed transition-all cursor-pointer ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-500/5'
                  : 'border-white/10 hover:border-white/20'
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
              
              <div className="flex flex-col items-center justify-center py-16">
                {file ? (
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                      <FileText size={32} className="text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{file.name}</p>
                      <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
                      <Upload size={36} className="text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">Drop your resume here</h3>
                    <p className="text-slate-500 mb-6">PDF or DOCX files up to 10MB</p>
                    <button className="btn-primary">
                      Browse Files
                    </button>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <AlertCircle size={20} />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {file && (
              <div className="flex justify-center">
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="btn-primary text-lg px-10 py-4"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={22} className="animate-spin" />
                      Analyzing Resume...
                    </>
                  ) : (
                    <>
                      Analyze & Match
                      <ArrowRight size={22} />
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="glass-card-static text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                  <Target className="text-emerald-400" size={24} />
                </div>
                <h3 className="font-bold text-white mb-2">Smart Matching</h3>
                <p className="text-sm text-slate-500">AI matches your resume to opportunities that fit your skills</p>
              </div>
              <div className="glass-card-static text-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                  <Sparkles className="text-indigo-400" size={24} />
                </div>
                <h3 className="font-bold text-white mb-2">Skill Extraction</h3>
                <p className="text-sm text-slate-500">Automatically extracts skills, experience, and education</p>
              </div>
              <div className="glass-card-static text-center">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
                  <TrendingUp className="text-purple-400" size={24} />
                </div>
                <h3 className="font-bold text-white mb-2">Gap Analysis</h3>
                <p className="text-sm text-slate-500">See what skills you need to land your dream role</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {result.parsed && (
              <div className="glass-card-static border-emerald-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 className="text-emerald-400" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Resume Parsed Successfully!</h3>
                    <p className="text-sm text-slate-500">We've analyzed your resume and found the best matches</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Detected Name</p>
                    <p className="font-semibold text-white">{result.name || 'Not detected'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</p>
                    <p className="font-semibold text-white">{result.email || 'Not detected'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Skills Found</p>
                    <p className="font-semibold text-white">{result.skills?.length || 0} skills</p>
                  </div>
                </div>

                {result.skills && result.skills.length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Extracted Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {result.skills.map((skill, i) => (
                        <span key={i} className="badge badge-indigo">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Briefcase size={24} className="text-indigo-400" />
                Matching Opportunities
                <span className="badge badge-indigo">{result.matches.length}</span>
              </h2>

              <div className="space-y-4">
                {result.matches.map((match, index) => (
                  <div key={match.opportunity.id} className="glass-card card-hover-lift">
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-white mb-1">{match.opportunity.title}</h3>
                            <p className="text-slate-400 text-sm">{match.opportunity.company}</p>
                          </div>
                          <span className="badge badge-indigo capitalize">{match.opportunity.type}</span>
                        </div>
                        
                        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                          {match.opportunity.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {match.opportunity.required_skills.split(',').map(skill => (
                            <span key={skill} className="px-2 py-1 rounded-md bg-white/5 text-xs text-slate-400">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-4">
                          {match.missingSkills.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Skills to Learn</p>
                              <div className="flex flex-wrap gap-1">
                                {match.missingSkills.slice(0, 3).map(skill => (
                                  <span key={skill} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={`flex flex-col items-center justify-center p-4 rounded-xl border ${getScoreBg(match.matchScore)}`}>
                        <span className={`text-3xl font-bold ${getScoreColor(match.matchScore)}`}>
                          {Math.round(match.matchScore)}%
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-500 mt-1">Match</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/5">
                      <Link
                        href={`/audit?opp=${match.opportunity.id}`}
                        className="btn-primary text-sm py-2"
                      >
                        Audit Resume
                      </Link>
                      <a
                        href={match.opportunity.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-sm py-2"
                      >
                        View Opportunity
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <button
                onClick={() => {
                  setResult(null);
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-slate-400 hover:text-white transition-colors font-medium"
              >
                Upload Another Resume
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}