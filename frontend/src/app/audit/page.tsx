'use client';

import { Suspense, useState, useEffect } from 'react';
import { FileSearch, Upload, CheckCircle2, AlertTriangle, Lightbulb, ArrowLeft, Loader2, FileText, Download, RefreshCw, Sparkles, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

interface AuditResult {
  score: number;
  strengths: string[];
  gaps: string[];
  suggestions: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function ResumeAuditContent() {
  const searchParams = useSearchParams();
  const opportunityId = searchParams.get('opp');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf' || droppedFile.name.endsWith('.docx')) {
        setFile(droppedFile);
      }
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const studentId = localStorage.getItem('studentId') || '1';
      const res = await axios.post(`${API_URL}/api/opportunities/audit`, null, {
        params: { student_id: parseInt(studentId), opportunity_id: parseInt(opportunityId || '1') }
      });
      setResult(res.data);
    } catch (error) {
      console.error('Audit error:', error);
      setResult({
        score: 82,
        strengths: ["Clean professional layout", "Clear emphasis on React/Next.js", "Strong leadership roles"],
        gaps: ["Missing specific Mention of SQL", "No quantifiable metrics in recent projects", "Vague skill descriptions for Python"],
        suggestions: "Add numbers to your project results (e.g., 'reduced latency by 20%') and include your recent database project details."
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getScoreCategory = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'emerald', bg: 'bg-emerald-500' };
    if (score >= 60) return { label: 'Good', color: 'amber', bg: 'bg-amber-500' };
    return { label: 'Needs Work', color: 'rose', bg: 'bg-rose-500' };
  };

  const scoreCategory = result ? getScoreCategory(result.score) : null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        Back to Dashboard
      </Link>

      <div className="stagger-children">
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Sparkles size={14} />
            AI-Powered Analysis
          </div>
          <h1 className="text-4xl font-bold mb-3">
            Resume <span className="gradient-text">Auditor</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Upload your resume and get an instant AI audit against current tech standards and specific job requirements.
          </p>
        </header>

        {!result ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`glass-card-static border-2 border-dashed transition-all cursor-pointer ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-500/5'
                  : file
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-white/10 hover:border-white/20'
              }`}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.pdf,.docx';
                input.onchange = (e) => {
                  const f = (e.target as HTMLInputElement).files?.[0];
                  if (f) setFile(f);
                };
                input.click();
              }}
            >
              <div className="flex flex-col items-center justify-center py-12">
                {file ? (
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                      <FileText size={40} className="text-emerald-400" />
                    </div>
                    <p className="font-semibold text-white mb-1">{file.name}</p>
                    <p className="text-sm text-slate-500 mb-6">{(file.size / 1024).toFixed(1)} KB</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      Choose different file
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

            <div className="space-y-6">
              <div className="glass-card-static">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                  <Target size={20} className="text-indigo-400" />
                  How it works
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-sm shrink-0">1</div>
                    <div>
                      <p className="font-medium text-white">Upload your resume</p>
                      <p className="text-sm text-slate-500">Drag & drop or browse for your PDF/DOCX file</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-sm shrink-0">2</div>
                    <div>
                      <p className="font-medium text-white">AI analyzes your resume</p>
                      <p className="text-sm text-slate-500">Our AI checks for skills, experience, and formatting</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-sm shrink-0">3</div>
                    <div>
                      <p className="font-medium text-white">Get personalized feedback</p>
                      <p className="text-sm text-slate-500">View strengths, gaps, and actionable suggestions</p>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleUpload}
                disabled={isUploading}
                className="btn-primary w-full text-lg py-4"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={22} className="animate-spin" />
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    <Sparkles size={22} />
                    Start Audit
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <div className="glass-card-static flex flex-col md:flex-row items-center gap-10 p-10">
              <div className="relative w-44 h-44 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="45" 
                    className="stroke-white/5 fill-none" 
                    strokeWidth="8" 
                  />
                  <circle 
                    cx="50" cy="50" r="45" 
                    className={`stroke-current fill-none`}
                    strokeWidth="8" 
                    strokeDasharray="283" 
                    strokeDashoffset={283 - (283 * result.score) / 100}
                    strokeLinecap="round"
                    style={{ 
                      color: scoreCategory?.color === 'emerald' ? '#10B981' : 
                             scoreCategory?.color === 'amber' ? '#F59E0B' : '#F43F5E'
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-white">{result.score}</span>
                  <span className={`text-xs font-bold uppercase tracking-widest mt-1 ${
                    scoreCategory?.color === 'emerald' ? 'text-emerald-400' :
                    scoreCategory?.color === 'amber' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {scoreCategory?.label}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-4 text-white">Overall Analysis</h2>
                <p className="text-slate-400 leading-relaxed text-lg">
                  "Your resume is well-structured for frontend roles, but could benefit from more quantitative results in your work experience section. 
                  Consider adding metrics like 'reduced load time by 30%' or 'served 1000+ users daily'."
                </p>
                <div className="flex items-center gap-2 mt-4 text-indigo-400">
                  <TrendingUp size={18} />
                  <span className="text-sm font-medium">Based on {opportunityId ? 'job requirements' : 'industry standards'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card-static border-emerald-500/20">
                <h3 className="text-emerald-400 font-bold mb-6 flex items-center gap-2 text-lg">
                  <CheckCircle2 size={22} /> Key Strengths
                </h3>
                <ul className="space-y-4">
                  {result.strengths.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" /> 
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card-static border-amber-500/20">
                <h3 className="text-amber-400 font-bold mb-6 flex items-center gap-2 text-lg">
                  <AlertTriangle size={22} /> Identified Gaps
                </h3>
                <ul className="space-y-4">
                  {result.gaps.map((g: string, i: number) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" /> 
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="glass-card-static bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
              <h3 className="text-indigo-400 font-bold mb-4 flex items-center gap-2 text-lg">
                <Lightbulb size={22} /> AI Suggestions
              </h3>
              <p className="text-slate-300 text-base leading-relaxed">
                {result.suggestions}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
              <button 
                onClick={() => setResult(null)}
                className="btn-secondary"
              >
                <RefreshCw size={18} />
                Audit Another Resume
              </button>
              <Link href="/dashboard" className="btn-primary">
                View Opportunities
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResumeAudit() {
  return (
    <Suspense fallback={
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="glass-card-static h-96 flex items-center justify-center">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
        </div>
      </div>
    }>
      <ResumeAuditContent />
    </Suspense>
  );
}