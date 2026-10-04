import { useState } from 'react';
import { FileDropzone } from './components/FileDropzone';
import { PdfViewer } from './components/PdfViewer';
import {
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Lightbulb,
  FileCheck2,
  ListFilter
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer
} from 'recharts';

interface Suggestion {
  type: string;
  title: string;
  detail: string;
}

interface AnalysisResult {
  filename: string;
  analysis: {
    overall_score: number;
    radar_data: { subject: string; score: number }[];
    action_verbs: string[];
    quantifiable_metrics_count: number;
    matched_skills: string[];
    missing_skills: string[];
    suggestions: Suggestion[];
    word_count: number;
  };
  preview_text: string;
}

export default function App() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'suggestions'>('overview');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleStartAnalysis = async () => {
    if (!resumeFile) return;

    setIsLoading(true);
    setApiError(null);

    const formData = new FormData();
    formData.append('file', resumeFile);
    formData.append('job_description', jobDescription);

    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to analyze document');
      }

      const data: AnalysisResult = await response.json();
      setAnalysisResult(data);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setResumeFile(null);
    setJobDescription('');
    setAnalysisResult(null);
    setApiError(null);
    setActiveTab('overview');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              AI
            </div>
            <span className="font-semibold text-lg tracking-tight">DocuMatch ATS</span>
          </div>

          {analysisResult && (
            <button
              onClick={resetForm}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Upload New Resume
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col">
        {!analysisResult ? (
          /* Intake Form */
          <div className="max-w-3xl mx-auto w-full py-8 space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
                Diagnose & Align Your Resume
              </h1>
              <p className="mt-2 text-slate-600 text-sm sm:text-base">
                Instant ATS parsing, keyword gap detection, and impact evaluation.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
              <section>
                <h2 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">1</span>
                  Upload Resume (.PDF)
                </h2>
                <FileDropzone onFileSelect={(file) => setResumeFile(file)} />
              </section>

              <section>
                <h2 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">2</span>
                  Target Job Description <span className="text-slate-400 font-normal text-xs">(Recommended)</span>
                </h2>
                <textarea
                  rows={4}
                  placeholder="Paste the target JD here to evaluate skill coverage and keyword match..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </section>

              {apiError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
                  {apiError}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleStartAnalysis}
                  disabled={!resumeFile || isLoading}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition shadow-sm ${
                    resumeFile && !isLoading
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Parsing & Evaluating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Analyze Document
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Split-Screen Review Mode */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-6.5rem)]">
            {/* Left Column: PDF Viewer */}
            <div className="lg:col-span-6 h-[550px] lg:h-full">
              {resumeFile && <PdfViewer file={resumeFile} />}
            </div>

            {/* Right Column: Analysis Dashboard */}
            <div className="lg:col-span-6 flex flex-col h-[550px] lg:h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Tab Navigation Header */}
              <div className="flex border-b border-slate-200 bg-slate-50/70 px-4 pt-3 gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'overview'
                      ? 'border-indigo-600 text-indigo-700 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  Audit Overview
                </button>
                <button
                  onClick={() => setActiveTab('skills')}
                  className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'skills'
                      ? 'border-indigo-600 text-indigo-700 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  Skill Gap Matrix
                </button>
                <button
                  onClick={() => setActiveTab('suggestions')}
                  className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'suggestions'
                      ? 'border-indigo-600 text-indigo-700 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  Fixes ({analysisResult.analysis.suggestions.length})
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overall Fit</span>
                        <div className="text-3xl font-extrabold text-indigo-600 mt-1">
                          {analysisResult.analysis.overall_score}%
                        </div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Action Verbs</span>
                        <div className="text-3xl font-extrabold text-emerald-600 mt-1">
                          {analysisResult.analysis.action_verbs.length}
                        </div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Metrics Found</span>
                        <div className="text-3xl font-extrabold text-amber-600 mt-1">
                          {analysisResult.analysis.quantifiable_metrics_count}
                        </div>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl p-4">
                      <span className="text-xs font-semibold text-slate-700 block mb-2">Category Balance</span>
                      <div className="w-full h-52">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={analysisResult.analysis.radar_data}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                            <Radar name="Score" dataKey="score" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.35} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-slate-700 block mb-2">Detected Executive Verbs</span>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.analysis.action_verbs.map((verb) => (
                          <span key={verb} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                            {verb}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'skills' && (
                  <div className="space-y-5">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Matched Skills ({analysisResult.analysis.matched_skills.length})
                      </span>
                      {analysisResult.analysis.matched_skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.analysis.matched_skills.map((skill) => (
                            <span key={skill} className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No skills matched directly from the pool.</p>
                      )}
                    </div>

                    <div>
                      <span className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Missing Target Skills ({analysisResult.analysis.missing_skills.length})
                      </span>
                      {analysisResult.analysis.missing_skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.analysis.missing_skills.map((skill) => (
                            <span key={skill} className="px-3 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-full text-xs font-semibold">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No missing skills detected against the job description.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'suggestions' && (
                  <div className="space-y-3">
                    {analysisResult.analysis.suggestions.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex gap-3">
                        <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-amber-900">{item.title}</h4>
                          <p className="text-xs text-amber-800 mt-1 leading-relaxed">{item.detail}</p>
                        </div>
                      </div>
                    ))}
                    {analysisResult.analysis.suggestions.length === 0 && (
                      <div className="text-center py-8 text-slate-500 text-xs">
                        Excellent document! No critical flags triggered.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}