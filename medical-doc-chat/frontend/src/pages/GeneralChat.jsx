import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/api';

export default function GeneralChat() {
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Welcome to General Intelligence. I am now disconnected from specific medical records and ready for free-form inquiry. How can I assist you today?',
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
    const currentInput = input;
    setInput('');

    try {
      const res = await api.generalChat(currentInput);
      setMessages((prev) => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: '⚠️ Service Interruption: The general intelligence node is currently unreachable. Please try again in a moment.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#FBFDFF] font-sans selection:bg-slate-100">
      {/* Premium Header */}
      <header className="bg-white/70 backdrop-blur-2xl px-8 py-5 border-b border-slate-200/50 flex justify-between items-center z-20 shadow-sm">
        <div className="flex items-center gap-5">
          <Link to="/" className="group flex items-center justify-center w-11 h-11 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300 shadow-sm">
            <span className="text-xl">←</span>
          </Link>
          <div>
            <p className="text-xl font-black text-slate-800 leading-tight">General Chat</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-400"></span>
          </span>
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Connected</span>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-10 space-y-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-4 animate-in fade-in slide-in-from-bottom-6 duration-500 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center shadow-lg flex-shrink-0 font-bold ${m.role === 'user' ? 'bg-slate-900 text-white shadow-slate-200' : 'bg-slate-100 text-slate-500 shadow-slate-100'}`}>
                {m.role === 'user' ? 'U' : 'A'}
              </div>

              {/* Bubbles */}
              <div className={`relative max-w-[75%] p-6 rounded-[2.5rem] ${
                m.role === 'user'
                  ? 'bg-slate-900 text-slate-50 rounded-tr-none'
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm'
              }`}>
                <p className="text-[16px] leading-relaxed font-medium">{m.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-[1.25rem] bg-slate-100 text-slate-400 flex items-center justify-center font-bold">
                ...
              </div>
              <div className="bg-white p-6 rounded-[2.5rem] rounded-tl-none border border-slate-100 shadow-sm">
                <p className="text-slate-500">Thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Console */}
      <div className="p-8 bg-gradient-to-t from-[#FBFDFF] via-[#FBFDFF] to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            <div className="relative flex items-center bg-white border border-slate-100 p-3 rounded-[2.5rem] shadow-lg focus-within:border-slate-300 transition-all">
              <textarea
                rows={1}
                className="flex-1 bg-transparent border-none rounded-2xl p-4 text-slate-800 placeholder-slate-400 focus:outline-none resize-none text-lg"
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
                className="h-14 w-14 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 disabled:opacity-30 transition-all active:scale-90"
              >
                ↓
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-3 text-slate-400">
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Chat v1.0</p>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          </div>
        </div>
      </div>
    </div>
  );
}