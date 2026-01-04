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
    <div className="bg-slate-50 text-slate-800 min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-indigo-500 !text-3xl">medical_services</span>
          <h2 className="text-lg font-bold text-slate-800">MediAssist AI</h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-[800px] w-full flex flex-col items-center">
          
          <div className="flex flex-col items-center w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-12">
            
            {/* Hero Icon */}
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-indigo-100/50 blur-3xl rounded-full opacity-50"></div>
              <div className="relative flex h-40 w-40 items-center justify-center bg-indigo-50 rounded-full">
                <span className="material-symbols-outlined text-6xl text-indigo-400">content_paste_search</span>
              </div>
            </div>

            {/* Text Content */}
            <div className="flex flex-col items-center gap-3 text-center max-w-[560px]">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">{title}</h1>
              <p className="text-slate-500 text-base leading-relaxed">
                {message}
              </p>
            </div>

            {/* Primary Action */}
            <div className="mt-8">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300"
              >
                <span className="material-symbols-outlined">folder_open</span>
                <span>Browse Documents</span>
              </button>
            </div>

            {/* Suggested Actions */}
            <div className="mt-10 w-full border-t border-slate-100 pt-8">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-4">Suggested Actions</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={() => navigate('/')} className="flex h-10 items-center gap-2 rounded-full border border-slate-200 px-5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-indigo-200 transition-colors">
                  <span className="material-symbols-outlined text-sm">description</span>
                  Select different document
                </button>
                <button onClick={() => navigate(-1)} className="flex h-10 items-center gap-2 rounded-full border border-slate-200 px-5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-indigo-200 transition-colors">
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