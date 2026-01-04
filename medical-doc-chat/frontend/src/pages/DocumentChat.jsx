import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/api';

export default function DocumentChat() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hello. I am ready to answer questions regarding "${docId.replace(/_/g, ' ')}".` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    
    try {
      const res = await api.chat(docId, input);
      setMessages(prev => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', text: "System Timeout: The LLM is taking too long to respond. Please check the terminal." }]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-xl">
            <span className="material-symbols-outlined text-slate-600">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-lg font-bold capitalize text-slate-800">{docId.replace(/_/g, ' ')}</h1>
            <p className="text-xs text-slate-500">Document-scoped conversation</p>
          </div>
        </div>
        <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full uppercase flex items-center gap-2 tracking-wide">
          <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
          Active
        </span>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl p-5 rounded-3xl shadow-sm ${
              m.role === 'user' 
                ? 'bg-indigo-500 text-white rounded-br-none' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
            }`}>
              <p className="text-sm leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-3xl rounded-bl-none border border-slate-100 shadow-sm">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-6 bg-white/80 backdrop-blur-md border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 mb-3">
            <input 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all"
              placeholder="Ask a question about this document..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={loading}
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 px-6 rounded-2xl text-white font-semibold transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            <p>AI responses based on document context only • Not medical advice</p>
          </div>
        </div>
      </div>
    </div>
  );
}
