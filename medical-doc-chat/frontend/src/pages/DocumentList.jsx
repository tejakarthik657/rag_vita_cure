import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function DocumentList() {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    api.getDocuments().then(res => setDocs(res.data));
  }, []);

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      <main className="max-w-7xl mx-auto px-8 py-10">
        <h2 className="text-4xl font-bold mb-3">Select a Medical Document</h2>
        <p className="text-slate-500 mb-10 text-lg">AI responses will be <span className="text-primary font-medium">strictly grounded</span> in your selection.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {docs.map(docId => (
            <Link 
              to={`/chat/${docId}`} 
              key={docId}
              className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary overflow-hidden transition-all group"
            >
              <div className="h-32 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-slate-400">description</span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg group-hover:text-primary capitalize">{docId.replace(/_/g, ' ')}</h3>
                <div className="mt-4 flex justify-between items-center border-t pt-4">
                   <span className="text-xs text-green-600 font-bold">Verified Source</span>
                   <span className="material-symbols-outlined text-primary">arrow_forward</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}