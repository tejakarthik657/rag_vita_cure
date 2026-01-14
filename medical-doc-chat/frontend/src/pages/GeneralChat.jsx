import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/api';

export default function GeneralChat() {
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Hi! This is general chat. Ask me anything—this is not tied to a specific document.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setMessages((prev) => [...prev, { role: 'user', text: input }]);

    try {
      const res = await api.generalChat(input);
      setMessages((prev) => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: 'The general chat service is unavailable right now. Please try again in a moment.',
        },
      ]);
    } finally {
      setLoading(false);
      setInput('');
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
            <h1 className="text-lg font-bold text-slate-800">General Chat</h1>
            <p className="text-xs text-slate-500">Free-form conversation (not document-grounded)</p>
          </div>
        </div>
        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full uppercase flex items-center gap-2 tracking-wide">
          <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
          Live
        </span>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                m.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {m.role === 'user' ? 'person' : 'spark'}
              </span>
            </div>
            <div
              className={`max-w-2xl p-5 rounded-3xl shadow-sm ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-sm">spark</span>
            </div>
            <div className="bg-white p-4 rounded-3xl rounded-bl-none border border-slate-100 shadow-sm">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-6 bg-white/80 backdrop-blur-md border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 mb-3">
            <textarea
              rows={1}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all resize-none"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:bg-slate-300 px-6 rounded-2xl text-white font-semibold transition-all shadow-lg shadow-amber-200 hover:shadow-amber-300 disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
            <span className="material-symbols-outlined text-sm">info</span>
            <p>General chat is not document-grounded • Not medical advice</p>
          </div>
        </div>
      </div>
    </div>
  );
}
