import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/api';

export default function DocumentList() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api.getDocuments()
      .then(res => {
        setDocs(res.data);
        setError("");
      })
      .catch(err => {
        setError("Network sync error. Please verify the medical RAG service is active.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FBFDFF] text-slate-900 selection:bg-teal-100">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-50/50 rounded-full blur-[120px] -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px] -ml-20 -mb-20" />
      </div>

      <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-100">
              <span className="material-symbols-outlined text-2xl"></span>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800">
              Medi<span className="text-teal-600">Assist</span>
            </span>
          </div>
          <Link 
            to="/admin" 
            className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all duration-300 shadow-sm"
          >
            Admin Portal
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-16">
        {/* Welcome Hero */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 leading-tight">
              Medical <span className="text-teal-500 underline decoration-teal-100 underline-offset-8">Knowledge</span> Base
            </h1>
            <p className="text-slate-500 text-xl font-medium leading-relaxed">
              Select a clinical document to begin an AI-powered contextual consultation.
            </p>
          </div>
          <Link
            to="/general-chat"
            className="group relative flex items-center gap-3 bg-white border-2 border-slate-100 p-2 pr-6 rounded-[2rem] hover:border-teal-200 transition-all hover:shadow-2xl hover:shadow-teal-100"
          >
            <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white group-hover:bg-teal-500 transition-colors">
              <span className="material-symbols-outlined">forum</span>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Universal Mode</p>
              <p className="text-sm font-bold text-slate-800 tracking-tight">General Conversation</p>
            </div>
          </Link>
        </div>

        {error && (
          <div className="mb-12 flex items-center gap-4 rounded-3xl border border-rose-100 bg-rose-50/50 p-6 text-rose-800 animate-in slide-in-from-top-4 duration-500">
            <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined">sensor_occupied</span>
            </div>
            <p className="font-bold text-lg">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-[2.5rem] bg-white border border-slate-100 animate-pulse flex flex-col p-8 space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl" />
                <div className="h-6 bg-slate-50 rounded-lg w-3/4" />
                <div className="h-4 bg-slate-50 rounded-lg w-1/2" />
              </div>
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div className="py-24 flex flex-col items-center text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-teal-100 blur-3xl opacity-30 rounded-full animate-pulse" />
              <div className="relative w-32 h-32 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center border border-slate-50">
                <span className="material-symbols-outlined text-[60px] text-slate-200">draft_orders</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">No Intelligence Indexed</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2 mb-8 font-medium">Please visit the portal to upload clinical documentation for processing.</p>
            <Link to="/admin" className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-teal-600 transition-all shadow-xl shadow-slate-200">
              Initialize Repository
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {docs.map((docId, index) => (
              <Link
                to={`/chat/${docId}`}
                key={docId}
                className="group relative h-72 flex flex-col justify-between bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_80px_rgba(13,148,136,0.1)] transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50/50 rounded-bl-[4rem] group-hover:bg-teal-500 transition-colors duration-500 flex items-center justify-center pl-8 pb-8">
                   <span className="material-symbols-outlined text-teal-200 group-hover:text-white/40 text-4xl transition-colors">analytics</span>
                </div>

                <div>
                  <h3 className="font-black text-xl text-slate-800 leading-tight group-hover:text-teal-900 transition-colors capitalize">
                    {docId.replace(/_/g, ' ')}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-teal-500" /> Medical PDF
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <span className="text-sm font-bold text-teal-600 flex items-center gap-1">
                    Begin Analysis
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}