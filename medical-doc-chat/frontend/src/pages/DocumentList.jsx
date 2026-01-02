import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ChevronRight } from 'lucide-react';

const documents = [
  { id: "doc-1", title: "Hypertension Treatment Guidelines", desc: "Evidence-based recommendations for adult hypertension management." },
  { id: "doc-2", title: "Heart Health and Diabetes Care", desc: "Cardiovascular wellness, exercise standards, and diabetes management." }
];

export default function DocumentList() {
  return (
    <div className="app-container">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>Select a Medical Document</h1>
        <p style={{ color: '#64748b' }}>Choose a reference below to start a grounded AI consultation.</p>
      </header>

      <div className="doc-grid">
        {documents.map(doc => (
          <Link to={`/chat/${doc.id}`} key={doc.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="doc-card">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                  <FileText size={20} color="#0284c7" />
                  <h3 style={{ margin: 0 }}>{doc.title}</h3>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>{doc.desc}</p>
              </div>
              <ChevronRight size={20} color="#cbd5e1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}