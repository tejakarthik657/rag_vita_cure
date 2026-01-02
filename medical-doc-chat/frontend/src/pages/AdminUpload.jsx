import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function AdminUpload() {
  const [file, setFile] = useState(null);
  const [docs, setDocs] = useState([]);
  const [status, setStatus] = useState("idle"); // idle, uploading, indexing
  const creds = JSON.parse(localStorage.getItem("admin_creds"));

  useEffect(() => { loadDocs(); }, []);

  const loadDocs = async () => {
    const res = await api.getDocuments();
    setDocs(res.data);
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
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark font-display">
      <main className="flex-1 max-w-[1200px] mx-auto p-8 flex flex-col gap-6">
        <h2 className="text-4xl font-black tracking-tight">Document Management</h2>
        
        {/* Upload Box */}
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 flex flex-col items-center bg-white dark:bg-surface-dark">
          <span className="material-symbols-outlined text-primary text-[48px] mb-4">cloud_upload</span>
          <p className="font-bold text-lg">{file ? file.name : "Select Medical PDF"}</p>
          <input type="file" className="hidden" id="fileIn" onChange={e => setFile(e.target.files[0])} />
          <div className="mt-6 flex gap-4">
            <label htmlFor="fileIn" className="cursor-pointer bg-slate-100 dark:bg-slate-700 px-6 py-2 rounded-lg font-bold">Browse</label>
            <button 
              onClick={handleProcess}
              disabled={!file || status !== "idle"}
              className="bg-primary text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50"
            >
              {status === "idle" ? "Start Processing" : status === "uploading" ? "Uploading..." : "Indexing FAISS..."}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 text-sm">
              <tr>
                <th className="p-4">Document Name</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(docId => (
                <tr key={docId} className="border-t border-slate-100 dark:border-slate-700">
                  <td className="p-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                    {docId}.pdf
                  </td>
                  <td className="p-4">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Ready</span>
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