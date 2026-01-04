import React, { useState, useEffect } from 'react';
import { api } from '../api/api';

export default function AdminUpload() {
  const [file, setFile] = useState(null);
  const [docs, setDocs] = useState([]);
  const [status, setStatus] = useState("idle"); // idle, uploading, indexing
  const [error, setError] = useState("");
  const creds = JSON.parse(localStorage.getItem("admin_creds"));

  useEffect(() => { loadDocs(); }, []);

  const loadDocs = async () => {
    try {
      const res = await api.getDocuments();
      setDocs(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Could not load documents. Ensure the RAG service is running.");
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
      alert("Index Updated Successfully");
    } catch (err) {
      alert("Error: Unauthorized or Connection Failed");
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight text-slate-800">MediAssist <span className="text-indigo-500">Admin</span></span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-800">Document Management</h2>
          <p className="text-slate-500 text-sm">Upload a PDF and ingest immediately.</p>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 text-rose-800 px-6 py-4 text-sm">
            {error}
          </div>
        )}

        {/* Upload Box */}
        <div className="border-2 border-dashed border-indigo-100 rounded-3xl p-10 bg-white hover:bg-indigo-50/30 transition-colors">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <p className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400">upload_file</span>
                {file ? file.name : "Select a PDF"}
              </p>
              <p className="text-sm text-slate-400">Files save to the RAG source folder and ingest right after upload.</p>
            </div>
            <div className="flex gap-3">
              <label htmlFor="fileIn" className="cursor-pointer px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors">Browse</label>
              <button
                onClick={handleProcess}
                disabled={!file || status !== "idle"}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
              >
                {status === "idle" ? "Upload & Ingest" : status === "uploading" ? "Uploading..." : "Indexing..."}
              </button>
            </div>
          </div>
          <input type="file" className="hidden" id="fileIn" onChange={e => setFile(e.target.files[0])} />
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="p-6">Document</th>
                <th className="p-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(docId => (
                <tr key={docId} className="border-t border-slate-50 hover:bg-slate-50/80 transition-colors">
                  <td className="p-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500"><span className="material-symbols-outlined text-xl">description</span></div>
                    <span className="text-slate-700 font-medium">{docId}.pdf</span>
                  </td>
                  <td className="p-6">
                    <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Ready</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}