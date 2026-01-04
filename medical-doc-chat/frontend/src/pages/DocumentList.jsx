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
        console.error(err);
        setError("Could not reach the document service. Please try again once the server is up.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2"><span className="material-symbols-outlined text-indigo-500">health_and_safety</span> MediAssist</span>
          <Link to="/admin" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Admin Portal</Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-14">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-3 text-slate-800">Select a Document</h1>
          <p className="text-slate-500 text-lg">Responses stay grounded in the document you choose.</p>
        </div>

        {error && (
          <div className="mb-8 rounded-2xl border border-rose-100 bg-rose-50 text-rose-800 px-6 py-4 text-sm shadow-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-slate-400 font-medium">Loading documents...</p>
            </div>
          </div>
        ) : docs.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6"><span className="material-symbols-outlined text-4xl text-slate-400">folder_off</span></div>
              <p className="text-slate-600 text-lg font-medium">No documents available yet</p>
              <p className="text-slate-400 text-sm mt-2">Upload documents via the <Link to="/admin" className="text-indigo-600 hover:underline font-semibold">Admin Portal</Link></p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docs.map(docId => (
              <Link
                to={`/chat/${docId}`}
                key={docId}
                className="group relative bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all duration-300 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden"
              >
                <div className="h-32 bg-indigo-50/50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-3xl text-indigo-500">description</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-slate-800 line-clamp-2 mb-1">{docId.replace(/_/g, ' ')}</h3>
                  <p className="text-xs text-slate-400 mb-4">PDF Document</p>
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wide">Ready</span>
                    <span className="material-symbols-outlined text-indigo-400 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}