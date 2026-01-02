import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle, Info } from 'lucide-react';

export default function DocumentChat() {
  const { docId } = useParams();
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAsk = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    setError(null);
    const userMsg = { role: 'user', text: question };
    setChat([...chat, userMsg]);

    try {
      const res = await fetch("http://localhost:4000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: docId, question })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setChat(prev => [...prev, { role: 'ai', text: data.answer }]);
      setQuestion("");
    } catch (err) {
      setError("We couldn't connect to the medical knowledge base. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: '#64748b', marginBottom: '1rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Back to Documents
      </Link>

      <div className="chat-window">
        <div className="chat-header">
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{docId.replace('_', ' ').toUpperCase()}</h2>
          <span style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 500 }}>
            ● Grounded Analysis Active
          </span>
        </div>

        <div className="message-area">
          {chat.length === 0 && !error && (
            <div style={{ textAlign: 'center', marginTop: '4rem', color: '#94a3b8' }}>
              <Info size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Ask a question specific to this document.<br/>The AI will only answer based on the provided text.</p>
            </div>
          )}

          {error && (
            <div style={{ background: '#fff1f2', padding: '1rem', borderRadius: '8px', color: '#be123c', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <AlertCircle size={20} />
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          )}

          {chat.map((msg, i) => (
            <div key={i} className={`message ${msg.role === 'ai' ? 'ai-message' : 'user-message'}`}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', color: '#94a3b8' }}>
                {msg.role === 'ai' ? 'Medical Assistant' : 'Your Question'}
              </div>
              {msg.text}
            </div>
          ))}
          {loading && <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Analyzing document...</p>}
        </div>

        <div className="disclaimer-bar">
          This assistant does not provide medical diagnosis. Consult a medical professional.
        </div>

        <div className="input-area">
          <input 
            value={question} 
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about this document..."
            onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
          />
          <button onClick={handleAsk} disabled={loading}>
            {loading ? "..." : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}