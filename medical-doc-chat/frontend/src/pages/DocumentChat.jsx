import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';

export default function DocumentChat() {
  const { docId } = useParams();
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hello. I am ready to answer questions regarding "${docId.replace(/_/g, ' ')}".` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.chat(docId, input);
      setMessages(prev => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Error: Could not reach knowledge base." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark font-body">
      <header className="bg-white dark:bg-surface-dark p-6 border-b flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to="/" className="material-symbols-outlined text-slate-400 hover:text-primary">arrow_back</Link>
          <h1 className="text-xl font-bold capitalize">{docId.replace(/_/g, ' ')}</h1>
        </div>
        <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase">Scoped Chat Active</span>
      </header>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl p-4 rounded-xl shadow-sm ${m.role === 'user' ? 'bg-primary text-white' : 'bg-white dark:bg-surface-dark'}`}>
              <p className="text-sm">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && <div className="text-slate-400 animate-pulse text-sm">Assistant is searching document...</div>}
      </div>

      <div className="p-4 bg-white dark:bg-surface-dark border-t">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex gap-2">
            <input 
              className="flex-1 bg-slate-50 dark:bg-background-dark border-none rounded-xl p-4 text-white"
              placeholder="Ask a question about this document..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} className="bg-primary px-6 rounded-xl text-white">
               <span className="material-symbols-outlined">send</span>
            </button>
          </div>
          <div className="bg-amber-50 p-2 rounded text-center flex justify-center gap-2 items-center">
            <span className="material-symbols-outlined text-amber-600 text-sm">warning</span>
            <p className="text-[10px] text-amber-800 font-bold uppercase">No Medical Diagnosis Provided • Verified Context Only</p>
          </div>
        </div>
      </div>
    </div>
  );
}