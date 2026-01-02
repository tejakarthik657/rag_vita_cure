import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SafetyState() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get error details from navigation state, or use defaults
  const { 
    title = "Let's get back on track", 
    message = "To ensure safety and accuracy, I can only answer questions based on the active medical document. I couldn't find an answer in the current context, or no document is selected." 
  } = location.state || {};

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#101922]/80 backdrop-blur-md px-10 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary !text-3xl">medical_services</span>
          <h2 className="text-lg font-bold">MediAssist AI</h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-[800px] w-full flex flex-col items-center">
          
          <div className="flex flex-col items-center w-full bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-12">
            
            {/* Hero Icon */}
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-50"></div>
              <div className="relative flex h-48 w-48 items-center justify-center bg-blue-50 dark:bg-slate-700/50 rounded-full">
                <span className="material-symbols-outlined text-6xl text-primary/60">content_paste_search</span>
              </div>
            </div>

            {/* Text Content */}
            <div className="flex flex-col items-center gap-3 text-center max-w-[560px]">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
              <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                {message}
              </p>
            </div>

            {/* Primary Action */}
            <div className="mt-8">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 h-12 px-8 bg-primary hover:bg-blue-600 text-white font-bold rounded-lg transition-all shadow-md"
              >
                <span className="material-symbols-outlined">folder_open</span>
                <span>Browse Documents</span>
              </button>
            </div>

            {/* Suggested Actions */}
            <div className="mt-10 w-full border-t border-slate-100 dark:border-slate-700 pt-8">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-4">Suggested Actions</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={() => navigate('/')} className="flex h-10 items-center gap-2 rounded-full border border-slate-200 dark:border-slate-600 px-5 text-sm font-medium hover:bg-slate-50 transition-colors">
                  <span className="material-symbols-outlined text-sm">description</span>
                  Select different document
                </button>
                <button onClick={() => navigate(-1)} className="flex h-10 items-center gap-2 rounded-full border border-slate-200 dark:border-slate-600 px-5 text-sm font-medium hover:bg-slate-50 transition-colors">
                  <span className="material-symbols-outlined text-sm">edit_note</span>
                  Rephrase question
                </button>
              </div>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="mt-8 flex items-start justify-center gap-2 text-slate-400 text-xs text-center max-w-[500px]">
            <span className="material-symbols-outlined text-[16px] mt-0.5">info</span>
            <p>
              Disclaimer: This AI assistant is for informational purposes only and does not provide medical diagnoses. Always consult a qualified healthcare provider.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}