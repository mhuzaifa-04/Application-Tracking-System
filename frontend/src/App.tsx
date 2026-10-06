import { useState, useRef } from 'react';
import { FileDropzone } from './components/FileDropzone';
import { PdfViewer } from './components/PdfViewer';
import { ScoreGauge } from './components/ScoreGauge';
import { DeveloperModal } from './components/DeveloperModal';
import {
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
  RefreshCw,
  LayoutDashboard,
  FileBadge2,
  Download,
  Briefcase,
  GraduationCap,
  Wand2,
  Mail,
  Phone,
  Globe,
  Lightbulb,
  Layers,
  ChevronRight,
  ShieldCheck,
  User,
  Zap
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer
} from 'recharts';
import jsPDF from 'jspdf';

interface WorkExperience {
  company: string;
  role: string;
  duration: string;
  achievements: string[];
}

interface EducationItem {
  institution: string;
  degree: string;
  year: string;
}

interface BulletRewrite {
  original: string;
  rewritten: string;
  reason: string;
}

interface AnalysisData {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  summary: string;
  work_experience: WorkExperience[];
  education: EducationItem[];
  hard_skills: string[];
  soft_skills: string[];
  bullet_rewrites: BulletRewrite[];
  ats_score: number;
  feedback_notes: string[];
}

interface AnalysisResult {
  filename: string;
  radar_data: { subject: string; score: number }[];
  data: AnalysisData;
}

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const DEMO_RESULT: AnalysisResult = {
  filename: "Demo_Software_Engineer_Resume.pdf",
  radar_data: [
    { subject: "Skills Match", score: 85 },
    { subject: "Impact Verbs", score: 90 },
    { subject: "Experience Depth", score: 80 },
    { subject: "ATS Formatting", score: 88 }
  ],
  data: {
    name: "Alex Vance",
    email: "alex.vance@example.dev",
    phone: "+1 (555) 234-5678",
    linkedin: "linkedin.com/in/alexvance-dev",
    summary: "Senior Full Stack Engineer with 4+ years architecting scalable web applications across React, TypeScript, and distributed Python APIs.",
    work_experience: [
      {
        company: "Stripe-backed Fintech",
        role: "Senior Full Stack Developer",
        duration: "2023 - Present",
        achievements: [
          "Architected real-time payment reconciliation engine reducing settlement delays by 42%.",
          "Scaled ingestion pipelines to handle 15,000+ daily concurrent ledger mutations."
        ]
      },
      {
        company: "HyperCloud Systems",
        role: "Software Engineer",
        duration: "2021 - 2023",
        achievements: [
          "Developed core design system components used by 30+ cross-functional front-end engineers.",
          "Refactored relational SQL queries cutting p99 search latency from 450ms to 92ms."
        ]
      }
    ],
    education: [
      {
        institution: "Institute of Technology",
        degree: "B.Tech in Artificial Intelligence & Data Science",
        year: "2021"
      }
    ],
    hard_skills: ["React", "TypeScript", "Python", "FastAPI", "PostgreSQL", "Docker", "Tailwind CSS", "Redis"],
    soft_skills: ["System Design", "Agile Leadership", "Cross-functional Collaboration", "Code Reviews"],
    bullet_rewrites: [
      {
        original: "Responsible for improving page performance and writing API endpoints in Python.",
        rewritten: "Engineered 12+ high-throughput FastAPI endpoints, slashing client-side load time by 34% for 50k+ active users.",
        reason: "Replaces the passive phrase 'Responsible for' with measurable performance metrics (34% reduction, 50k users)."
      },
      {
        original: "Worked on the database to make it run faster and helped junior developers.",
        rewritten: "Optimized complex PostgreSQL indexing and query execution plans, reducing server CPU utilization by 28% while mentoring 3 junior engineers.",
        reason: "Uses executive action verb 'Optimized' and clearly quantifies both technical and mentorship impact."
      }
    ],
    ats_score: 88,
    feedback_notes: [
      "Target Job Alignment: High density of modern TypeScript, React, and Python keywords.",
      "Bullet Impact: 80%+ of bullet points utilize quantifiable metrics and business impact statements.",
      "Consider explicitly highlighting automated unit/integration testing tools (e.g. Vitest, Pytest)."
    ]
  }
};

export default function App() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'rewrites' | 'skills' | 'timeline'>('overview');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDevModalOpen, setIsDevModalOpen] = useState<boolean>(false);

  const reportRef = useRef<HTMLDivElement>(null);

 const handleStartAnalysis = async () => {
    if (!resumeFile) return;

    setIsLoading(true);
    setApiError(null);

    const formData = new FormData();
    formData.append('file', resumeFile);
    formData.append('job_description', jobDescription);

    // Read the production URL from Vite env, fallback to localhost for development
    const backendBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    try {
      const response = await fetch(`${backendBaseUrl}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to analyze document');
      }

      const result: AnalysisResult = await response.json();
      setAnalysisResult(result);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadDemo = () => {
    setAnalysisResult(DEMO_RESULT);
    setJobDescription("Looking for a Senior Full Stack Engineer proficient in React, TypeScript, Python, and scalable distributed databases.");
  };

  const handleExportPdf = () => {
    if (!analysisResult) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const candidateName = analysisResult.data.name || 'Candidate';
    const atsScore = analysisResult.data.ats_score;

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 38, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('DocuMatch ATS Audit Report', 14, 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated on ${new Date().toLocaleDateString()} | File: ${analysisResult.filename}`, 14, 24);

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(candidateName, 14, 32);

    const contactParts = [
      analysisResult.data.email,
      analysisResult.data.phone,
      analysisResult.data.linkedin,
    ].filter(Boolean);

    if (contactParts.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(203, 213, 225);
      doc.text(contactParts.join('  •  '), 70, 32);
    }

    let y = 48;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, 182, 28, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text('OVERALL ATS COMPATIBILITY SCORE', 20, y + 10);

    doc.setFontSize(22);
    if (atsScore >= 80) doc.setTextColor(16, 185, 129);
    else if (atsScore >= 65) doc.setTextColor(245, 158, 11);
    else doc.setTextColor(239, 68, 68);
    doc.text(`${atsScore}%`, 20, y + 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    const scoreSummary =
      atsScore >= 80
        ? 'Strong alignment with tech screening benchmarks and key action phrasing.'
        : atsScore >= 65
        ? 'Moderate keyword alignment. Address flagged gaps and action verbs to increase interview callbacks.'
        : 'Critical technical skills and impact-oriented achievements need restructuring.';
    doc.text(doc.splitTextToSize(scoreSummary, 120), 65, y + 14);

    y = 84;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Category Balance Metrics', 14, y);

    y += 6;
    const radarData = analysisResult.radar_data;
    const boxWidth = 42;
    radarData.forEach((item, index) => {
      const boxX = 14 + index * 46;
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(boxX, y, boxWidth, 18, 2, 2, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(item.subject, boxX + 4, y + 6);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(79, 70, 229);
      doc.text(`${item.score}%`, boxX + 4, y + 14);
    });

    y += 28;
    if (analysisResult.data.feedback_notes.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Recruiter Recommendations', 14, y);

      y += 6;
      analysisResult.data.feedback_notes.forEach((note) => {
        doc.setFillColor(254, 243, 199);
        doc.circle(18, y + 1.5, 1.5, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        const wrapped = doc.splitTextToSize(note, 170);
        doc.text(wrapped, 23, y + 3);
        y += wrapped.length * 4.5 + 3;
      });
    }

    y += 4;
    if (analysisResult.data.hard_skills.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Detected Hard Skills', 14, y);

      y += 6;
      const skillsStr = analysisResult.data.hard_skills.join('  •  ');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(79, 70, 229);
      const wrappedSkills = doc.splitTextToSize(skillsStr, 182);
      doc.text(wrappedSkills, 14, y);
      y += wrappedSkills.length * 4.5 + 4;
    }

    if (analysisResult.data.bullet_rewrites.length > 0) {
      doc.addPage();
      
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 20, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text('High-Impact AI Bullet Rewrites (Google X-Y-Z Framework)', 14, 13);

      let page2Y = 30;

      analysisResult.data.bullet_rewrites.forEach((item) => {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        
        const origText = doc.splitTextToSize(`Original: "${item.original}"`, 172);
        const rewText = doc.splitTextToSize(`Upgraded: "${item.rewritten}"`, 172);
        const whyText = doc.splitTextToSize(`Recruiter rationale: ${item.reason}`, 172);
        const cardHeight = (origText.length + rewText.length + whyText.length) * 4.5 + 20;

        if (page2Y + cardHeight > 275) {
          doc.addPage();
          page2Y = 20;
        }

        doc.roundedRect(14, page2Y, 182, cardHeight, 2, 2, 'FD');

        let textY = page2Y + 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(225, 29, 72);
        doc.text(origText, 18, textY);
        textY += origText.length * 4.5 + 2;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(5, 150, 105);
        doc.text(rewText, 18, textY);
        textY += rewText.length * 4.5 + 2;

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(whyText, 18, textY);

        page2Y += cardHeight + 6;
      });
    }

    const cleanFilename = (candidateName || 'Candidate').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`${cleanFilename}_ATS_Audit_Report.pdf`);
  };

  const resetForm = () => {
    setResumeFile(null);
    setJobDescription('');
    setAnalysisResult(null);
    setApiError(null);
    setActiveTab('overview');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Navigation */}
      <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-extrabold shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">DocuMatch Pro</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                  AI v2.0
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Intelligent ATS Screening & Keyword Alignment</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsDevModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>About Developer</span>
            </button>

            {analysisResult ? (
              <>
                <button
                  onClick={handleExportPdf}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export PDF Report
                </button>
                <button
                  onClick={resetForm}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition border border-slate-800 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  New Audit
                </button>
              </>
            ) : (
              <button
                onClick={handleLoadDemo}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                ⚡ Try Demo Resume
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col">
        {!analysisResult ? (
          <div className="max-w-3xl mx-auto w-full py-10 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Grade & Transform Your Resume
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
                Upload your resume to extract candidate telemetry, evaluate keyword readiness, and generate high-impact bullet rewrites.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur">
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                    Upload Resume (.PDF)
                  </h2>
                </div>
                <FileDropzone onFileSelect={(file) => setResumeFile(file)} />
              </section>

              <section>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                    Target Job Description
                  </h2>
                  <span className="text-[11px] text-slate-500 font-medium">Optional for exact role scoring</span>
                </div>
                <textarea
                  rows={4}
                  placeholder="Paste requirements, stack, and responsibilities to check keyword alignment..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full rounded-xl bg-slate-900/80 border border-slate-800 p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
                />
              </section>

              {apiError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
                  {apiError}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleStartAnalysis}
                  disabled={!resumeFile || isLoading}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition shadow-lg ${
                    resumeFile && !isLoading
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/20 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 border border-slate-800 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      Analyzing with AI Engine...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Run Full AI Audit
                      <ArrowRight className="w-4 h-4 ml-0.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Split Screen Dashboard */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-6.5rem)]">
            {/* Left: Original PDF */}
            <div className="lg:col-span-5 h-[550px] lg:h-full">
              {resumeFile ? (
                <PdfViewer file={resumeFile} />
              ) : (
                <div className="h-full rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Interactive Demo Mode</h3>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Displaying AI-parsed telemetry for a senior engineering profile.
                  </p>
                </div>
              )}
            </div>

            {/* Right: AI Analysis Dashboard */}
            <div className="lg:col-span-7 flex flex-col h-[550px] lg:h-full bg-slate-950/80 border border-slate-800/90 rounded-2xl shadow-xl overflow-hidden backdrop-blur">
              {/* Modern Segmented Navigation Tabs */}
              <div className="flex items-center gap-1.5 p-2 bg-slate-900/60 border-b border-slate-800/80 shrink-0 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'overview'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('rewrites')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'rewrites'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  AI Rewrites
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-200">
                    {analysisResult.data.bullet_rewrites.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('skills')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'skills'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <FileBadge2 className="w-3.5 h-3.5" />
                  Skills
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                    {analysisResult.data.hard_skills.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'timeline'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Profile
                </button>
              </div>

              {/* Scrollable Audit Area */}
              <div ref={reportRef} className="p-5 flex-1 overflow-y-auto space-y-5 text-slate-200">
                {/* Executive Profile Card */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Profile
                    </span>
                    <h2 className="text-lg font-bold text-white tracking-tight">{analysisResult.data.name || 'Candidate'}</h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5">
                      {analysisResult.data.email && (
                        <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-500" /> {analysisResult.data.email}</span>
                      )}
                      {analysisResult.data.phone && (
                        <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-500" /> {analysisResult.data.phone}</span>
                      )}
                      {analysisResult.data.linkedin && (
                        <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-slate-500" /> {analysisResult.data.linkedin}</span>
                      )}
                    </div>
                  </div>

                  <ScoreGauge score={analysisResult.data.ats_score} />
                </div>

                {/* Tab: Overview */}
                {activeTab === 'overview' && (
                  <div className="space-y-5">
                    {/* Radar Chart */}
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Category Balance Audit</span>
                        <span className="text-[11px] text-slate-500">Benchmark: Tech Roles</span>
                      </div>
                      <div className="w-full h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={analysisResult.radar_data}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} />
                            <Radar name="Score" dataKey="score" stroke="#818cf8" fill="#6366f1" fillOpacity={0.35} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Recruiter Recommendations */}
                    {analysisResult.data.feedback_notes.length > 0 && (
                      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2.5">
                        <div className="flex items-center gap-1.5 text-amber-400">
                          <Lightbulb className="w-4 h-4" />
                          <h4 className="text-xs font-bold uppercase tracking-wider">Recruiter Recommendations</h4>
                        </div>
                        <div className="space-y-2">
                          {analysisResult.data.feedback_notes.map((note, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                              <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{note}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: AI Bullet Rewrites */}
                {activeTab === 'rewrites' && (
                  <div className="space-y-3.5">
                    <p className="text-xs text-slate-400">
                      Weak action lines upgraded to Google's X-Y-Z formula (<span className="text-indigo-400 italic">"Accomplished [X] measured by [Y] by doing [Z]"</span>).
                    </p>
                    {analysisResult.data.bullet_rewrites.map((rewrite, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            Original Line
                          </span>
                          <p className="text-xs text-slate-400 line-through decoration-rose-500/50 pt-1">
                            {rewrite.original}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            High-Impact AI Rewrite
                          </span>
                          <p className="text-xs font-medium text-emerald-200 pt-1 leading-relaxed">
                            {rewrite.rewritten}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                          <strong className="text-slate-300">Why it matters:</strong> {rewrite.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab: Skills */}
                {activeTab === 'skills' && (
                  <div className="space-y-5">
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        Extracted Hard & Technical Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.data.hard_skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {analysisResult.data.soft_skills.length > 0 && (
                      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-3">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Soft & Leadership Competencies
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.data.soft_skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2.5 py-1 bg-slate-800/80 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Profile Timeline */}
                {activeTab === 'timeline' && (
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> Experience Timeline
                      </h4>
                      {analysisResult.data.work_experience.map((exp, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="text-xs font-bold text-white">{exp.role}</h5>
                              <span className="text-xs text-indigo-400">{exp.company}</span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                              {exp.duration}
                            </span>
                          </div>
                          {exp.achievements.length > 0 && (
                            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pt-1">
                              {exp.achievements.map((ach, aIdx) => (
                                <li key={aIdx} className="leading-relaxed">{ach}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> Education
                      </h4>
                      {analysisResult.data.education.map((edu, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-semibold text-white block">{edu.degree}</span>
                            <span className="text-slate-400">{edu.institution}</span>
                          </div>
                          <span className="text-slate-500 font-mono text-[11px]">{edu.year}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sleek Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/60 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 DocuMatch Pro. Built with React, FastAPI & Groq LLMs.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDevModalOpen(true)}
              className="text-slate-400 hover:text-indigo-400 transition cursor-pointer font-medium"
            >
              Created by Mohammad Huzaifa
            </button>
            <span>•</span>
            <a
              href="https://github.com/mhuzaifa-04"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>

      {/* Developer Profile Modal */}
      <DeveloperModal
        isOpen={isDevModalOpen}
        onClose={() => setIsDevModalOpen(false)}
      />
    </div>
  );
}