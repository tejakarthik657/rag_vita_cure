import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/api';

export default function DocumentChat() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Consultation active. I have analyzed "${docId.replace(/_/g, ' ')}" and I am ready to assist you with specific details from the text.` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    const currentInput = input;
    setInput(""); // Clear input early for better UX
    
    try {
      const res = await api.chat(docId, currentInput);
      setMessages(prev => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "⚠️ Diagnostic Timeout: The analysis engine is taking longer than expected. Please verify service connectivity." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#F4F7F9] font-sans selection:bg-teal-100">
      {/* High-End Header */}
      <header className="bg-white/70 backdrop-blur-2xl px-8 py-4 border-b border-slate-200/50 flex justify-between items-center z-20 shadow-sm">
        <div className="flex items-center gap-5">
          <Link to="/" className="group flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-100 text-slate-500 hover:bg-teal-500 hover:text-white transition-all duration-300">
            <span className="text-xl">←</span>
          </Link>
          <div className="h-10 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600 text-sm">description</span>
              <h1 className="text-sm font-black uppercase tracking-widest text-slate-400">Contextual Analysis</h1>
            </div>
            <p className="text-lg font-bold capitalize text-slate-800 leading-tight">
              {docId.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-3 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl">
          <div className="relative flex h-3 w-3">
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <span className="text-xs font-black text-emerald-700 uppercase tracking-tighter">AI Node Active</span>
        </div>
      </header>

      {/* Chat Space */}
      <div className="flex-1 overflow-y-auto px-6 py-10 space-y-8 scrollbar-thin scrollbar-thumb-slate-200">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Message Bubbles */}
              <div className={`relative max-w-[80%] p-5 rounded-[2rem] transition-all ${
                m.role === 'user' 
                  ? 'bg-slate-800 text-slate-50 rounded-tr-none shadow-xl shadow-slate-200' 
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm'
              }`}>
                <p className="text-[15px] leading-[1.6] font-medium whitespace-pre-wrap">{m.text}</p>
                <span className={`absolute bottom-[-20px] text-[10px] font-bold uppercase tracking-widest ${m.role === 'user' ? 'right-2 text-slate-400' : 'left-2 text-teal-600'}`}>
                  {m.role === 'user' ? 'Authorized User' : 'MediMind AI'}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-4 animate-pulse">
              <div className="bg-white/50 p-5 rounded-[2rem] rounded-tl-none border border-slate-100">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.5s]"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Advanced Input Bar */}
      <div className="p-8 bg-gradient-to-t from-white via-white to-white/0">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-25 transition duration-1000"></div>
          
          <div className="relative flex items-end gap-3 bg-white border border-slate-200 p-3 rounded-[2rem] shadow-2xl shadow-slate-200 transition-all focus-within:border-teal-400 focus-within:ring-4 focus-within:ring-teal-50">
            <textarea 
              rows={1}
              className="flex-1 bg-transparent border-none rounded-2xl p-4 text-slate-800 placeholder-slate-400 focus:outline-none resize-none min-h-[56px] max-h-32 text-[15px]"
              placeholder="Query the clinical database..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
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
              className="h-14 w-14 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-teal-600 disabled:bg-slate-200 transition-all duration-300 shadow-lg active:scale-95 group/btn"
            >
              <span className="material-symbols-outlined group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform">
                send
              </span>
            </button>
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <span className="material-symbols-outlined text-xs">shield_check</span>
              HIPAA Protected
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <span className="material-symbols-outlined text-xs">history_edu</span>
              Verbatim Extraction
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}