import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (creds.username === "admin" && creds.password === "supersecure123") {
      localStorage.setItem("admin_creds", JSON.stringify(creds));
      navigate("/admin/upload");
    } else {
      alert("Invalid Admin Credentials");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#f4f7f6] font-sans selection:bg-teal-100">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-teal-100/40 to-emerald-50/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[600px] h-[600px] bg-gradient-to-tr from-blue-100/30 to-mint-50/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-[480px] z-10">
        {/* Main Glass Card */}
        <div className="bg-white/70 backdrop-blur-3xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-white/80 overflow-hidden transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)]">
          
          {/* Top Decorative Section */}
          <div className="px-10 pt-12 pb-8 text-center">
            <div className="relative inline-flex mb-6">
              <div className="absolute inset-0 bg-teal-200/40 blur-2xl rounded-full animate-ping" />
              <div className="relative bg-gradient-to-br from-teal-500 to-emerald-600 w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-xl rotate-3 hover:rotate-0 transition-transform duration-300">
                <span className="material-symbols-outlined text-[40px]">clinical_notes</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">
              Medi<span className="text-teal-600">Gate</span>
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest">Secure Admin Node</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="px-10 pb-12 space-y-8">
            <div className="space-y-5">
              
              {/* Username Field */}
              <div className="relative group">
                <input 
                  type="text" 
                  required
                  className="peer w-full bg-slate-50/50 border-2 border-transparent rounded-2xl h-16 pl-14 pr-4 text-slate-800 font-medium placeholder-transparent focus:outline-none focus:border-teal-500/30 focus:bg-white transition-all shadow-sm"
                  placeholder="Username"
                  value={creds.username}
                  onChange={e => setCreds({...creds, username: e.target.value})}
                />
                <label className="absolute left-14 top-1/2 -translate-y-1/2 text-slate-400 font-medium pointer-events-none transition-all peer-focus:top-[-10px] peer-focus:left-4 peer-focus:text-xs peer-focus:text-teal-600 peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-[-10px] peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-xs">
                  Operator ID
                </label>
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors">
                  
                </span>
              </div>

              {/* Password Field */}
              <div className="relative group">
                <input 
                  type="password" 
                  required
                  className="peer w-full bg-slate-50/50 border-2 border-transparent rounded-2xl h-16 pl-14 pr-4 text-slate-800 font-medium placeholder-transparent focus:outline-none focus:border-teal-500/30 focus:bg-white transition-all shadow-sm"
                  placeholder="Password"
                  value={creds.password}
                  onChange={e => setCreds({...creds, password: e.target.value})}
                />
                <label className="absolute left-14 top-1/2 -translate-y-1/2 text-slate-400 font-medium pointer-events-none transition-all peer-focus:top-[-10px] peer-focus:left-4 peer-focus:text-xs peer-focus:text-teal-600 peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-[-10px] peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-xs">
                  Access Key
                </label>
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors">
                
                </span>
              </div>
            </div>

            {/* Premium Button */}
            <button 
              onClick={handleLogin}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="group relative w-full h-16 bg-slate-900 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-slate-200"
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
              <div className="relative flex items-center justify-center gap-3">
                <span className="text-white font-bold text-lg tracking-wide">Enter System</span>
                <span className="material-symbols-outlined text-white animate-bounce-x">login</span>
              </div>
            </button>

            {/* Compliance Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="material-symbols-outlined text-sm">verified</span>
                <span className="text-[11px] font-bold uppercase tracking-tighter">Encrypted</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-tighter">v4.0.2 Stage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Support Chip */}
        <div className="mt-8 flex justify-center">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white/50 backdrop-blur-md border border-white rounded-full text-slate-500 text-xs font-bold hover:bg-white transition-all shadow-sm">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            System Status: Operational
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        .animate-bounce-x {
          animation: bounce-x 1s infinite;
        }
      `}</style>
    </div>
  );
}