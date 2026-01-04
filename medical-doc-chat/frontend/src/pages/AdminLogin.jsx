import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [creds, setCreds] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleLogin = () => {
    // V1: Simple validation (credentials match backend/adminAuth.js)
    if (creds.username === "admin" && creds.password === "supersecure123") {
      localStorage.setItem("admin_creds", JSON.stringify(creds));
      navigate("/admin/upload");
    } else {
      alert("Invalid Admin Credentials");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="relative z-10 w-full max-w-[440px] flex flex-col">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl"></div>
        
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden">
          <div className="px-8 pt-10 pb-6 text-center flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 mb-5 shadow-sm">
              <span className="material-symbols-outlined text-[28px]">admin_panel_settings</span>
            </div>
            <h2 className="text-slate-800 text-2xl font-bold tracking-tight">Admin Portal</h2>
            
            <p className="text-slate-500 text-sm mt-2">Secure access for medical document management</p>
          </div>
          <div className="p-8 pt-2 space-y-5">
            <div className="space-y-2">
              <label className="text-slate-600 text-xs font-bold uppercase tracking-wider ml-1">Username</label>
              <input 
                type="text" 
                className="w-full rounded-xl border border-slate-200 bg-white/50 h-12 pl-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
                placeholder="Enter username"
                value={creds.username}
                onChange={e => setCreds({...creds, username: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-slate-600 text-xs font-bold uppercase tracking-wider ml-1">Password</label>
              <input 
                type="password" 
                className="w-full rounded-xl border border-slate-200 bg-white/50 h-12 pl-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
                placeholder="Enter password"
                value={creds.password}
                onChange={e => setCreds({...creds, password: e.target.value})}
              />
            </div>
            <button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-12 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 mt-2"
            >
              Login <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}