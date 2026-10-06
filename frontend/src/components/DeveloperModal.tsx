import React from 'react';
import { X,  Globe, ExternalLink, Terminal } from 'lucide-react';

interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperModal: React.FC<DeveloperModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Banner Accent */}
        <div className="h-24 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 relative p-4 flex justify-end">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-950/40 hover:bg-slate-950/70 text-white flex items-center justify-center transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar Icon */}
          <div className="-mt-12 mb-3 inline-block">
            <div className="w-20 h-20 rounded-2xl bg-slate-900 p-1 border-2 border-indigo-500 shadow-xl">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-2xl">
                MH
              </div>
            </div>
          </div>

          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Mohammad Huzaifa</h3>
              <p className="text-xs font-medium text-indigo-400">Full-Stack & AI Systems Developer</p>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Available for Opportunities
            </span>
          </div>

          {/* Bio */}
          <p className="text-xs text-slate-300 mt-3 leading-relaxed">
            Passionate software engineer specializing in building modern reactive web applications, scalable backend APIs, and practical AI/NLP solutions. Creator of <strong>DocuMatch Pro</strong>, an end-to-end ATS resume optimizer built with React, FastAPI, and LLM structured parsing.
          </p>

          {/* Tech Stack Chips */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Core Tech Stack
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['React', 'TypeScript', 'Tailwind CSS', 'Python', 'FastAPI', 'PyMuPDF', 'Groq / LLMs', 'PostgreSQL'].map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-medium text-slate-300 border border-slate-700/60"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Links / Social Buttons */}
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <a
              href="https://mhuzaifa04.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              Visit Portfolio
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <a
              href="https://linkedin.com/in/mhuzaifa04"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition shadow-sm cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              LinkedIn Profile
              <ExternalLink className="w-3 h-3 text-indigo-200" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};