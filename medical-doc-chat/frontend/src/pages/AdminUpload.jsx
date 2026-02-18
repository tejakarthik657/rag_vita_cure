import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';

export default function AdminUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [docs, setDocs] = useState([]);
  const [status, setStatus] = useState("idle"); 
  const [error, setError] = useState("");
  const creds = JSON.parse(localStorage.getItem("admin_creds"));

  useEffect(() => { loadDocs(); }, []);

  const loadDocs = async () => {
    try {
      const res = await api.getDocuments();
      setDocs(res.data);
      setError("");
    } catch (err) {
      setError("Document sync failed. Check RAG service connection.");
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    try {
      setStatus("uploading");
      await api.uploadFile(file, creds);
      setStatus("indexing");
      await api.reingest(creds);
      setStatus("idle");
      setFile(null);
      loadDocs();
    } catch (err) {
      alert("System Authentication Failed");
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] text-slate-900 font-sans selection:bg-teal-100">
      {/* Premium Header */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-200">
              <span className="material-symbols-outlined text-2xl">clinical_notes</span>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800">
              Medi<span className="text-teal-600">Gate</span> <span className="text-slate-400 font-light ml-1 text-base">Terminal</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:block text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Authorized Personnel</p>
                <p className="text-sm font-medium text-slate-700">{creds?.username || "Admin"}</p>
             </div>
             <button onClick={() => {localStorage.clear(); navigate('/');}} className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-colors text-slate-400">
                <span className="material-symbols-outlined">logout</span>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Title Section */}
        <div className="mb-10">
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Knowledge Base</h2>
          <p className="text-slate-500 mt-2 text-lg">Manage medical documents for the RAG intelligence layer.</p>
        </div>

        {error && (
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/50 p-5 text-rose-700 animate-in fade-in slide-in-from-top-4">
            <span className="material-symbols-outlined">report</span>
            <span className="font-semibold text-sm">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LEFT: Upload Console */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Ingestion Console</h3>
                
                <label 
                  htmlFor="fileIn"
                  className={`relative group flex flex-col items-center justify-center border-2 border-dashed rounded-[2rem] p-8 transition-all cursor-pointer ${
                    file ? 'border-teal-400 bg-teal-50/30' : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50/50'
                  }`}
                >
                  <input type="file" className="hidden" id="fileIn" accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.bmp" onChange={e => setFile(e.target.files[0])} />
                  
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                    file ? 'bg-teal-500 text-white shadow-xl shadow-teal-200' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <span className="material-symbols-outlined text-3xl">
                      {file ? 'check_circle' : 'upload_file'}
                    </span>
                  </div>
                  
                  <p className="text-center font-bold text-slate-700 px-2 break-all">
                    {file ? file.name : "Drop Files or Images"}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">PDF, JPG, PNG, WebP, GIF • Max 25MB</p>
                </label>

                <div className="mt-8 space-y-4">
                  {/* Status Indicator */}
                  {status !== "idle" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase">
                        <span className="text-teal-600">{status}...</span>
                        <span className="text-slate-400">{status === 'uploading' ? '45%' : '80%'}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full bg-teal-500 transition-all duration-1000 ${status === 'uploading' ? 'w-1/2' : 'w-[90%]'}`} />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleProcess}
                    disabled={!file || status !== "idle"}
                    className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold hover:bg-teal-600 disabled:opacity-20 disabled:grayscale transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                  >
                    {status === "idle" ? (
                      <>Commit to Index <span className="material-symbols-outlined text-sm">database_upload</span></>
                    ) : (
                      <span className="animate-pulse">{status.toUpperCase()}...</span>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-teal-600 rounded-3xl p-6 text-white shadow-xl shadow-teal-200">
                <p className="text-xs font-bold uppercase opacity-60 mb-2 tracking-widest">RAG Engine Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-300 animate-ping" />
                  <span className="font-bold">System Synchronized</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Document Library */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Available Documents</h3>
                <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black text-slate-500 border border-slate-200 uppercase">{docs.length} Items</span>
              </div>

              <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
                {docs.length === 0 ? (
                  <div className="p-20 text-center">
                    <span className="material-symbols-outlined text-6xl text-slate-100 mb-4">inventory_2</span>
                    <p className="text-slate-400 font-medium">No documents indexed yet.</p>
                  </div>
                ) : (
                  docs.map((docId, index) => (
                    <div key={docId} className="group p-6 flex items-center justify-between hover:bg-slate-50 transition-all">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-500 transition-colors">
                          <span className="material-symbols-outlined text-2xl"></span>
                        </div>
                        <div>
                          <p className="text-slate-800 font-bold group-hover:text-teal-700 transition-colors">{docId}.pdf</p>
                          <p className="text-xs text-slate-400 font-medium tracking-tight">UID: {docId.substring(0, 8)} • Added recently</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                          <span className="w-1 h-1 rounded-full bg-emerald-500" /> Ready
                        </span>
                        <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all">
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}