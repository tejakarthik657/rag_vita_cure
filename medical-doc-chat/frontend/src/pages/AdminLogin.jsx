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
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-background-light dark:bg-background-dark font-display">
      <div className="relative z-10 w-full max-w-[440px] flex flex-col">
        <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg border border-slate-200/60 dark:border-slate-700/50 overflow-hidden">
          <div className="px-8 pt-10 pb-2 text-center flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-5 ring-4 ring-primary/5">
              <span className="material-symbols-outlined text-[32px]">admin_panel_settings</span>
            </div>
            <h2 className="text-slate-900 dark:text-white text-[26px] font-bold tracking-tight">Admin Portal</h2>
            <p className="text-slate-500 text-sm mt-2">Secure access for medical document management.</p>
          </div>
          <div className="p-8 space-y-5">
            <div className="space-y-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Username</label>
              <input 
                type="text" 
                className="w-full rounded-lg border-slate-200 dark:bg-[#111921] h-12 pl-4 text-white"
                onChange={e => setCreds({...creds, username: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Password</label>
              <input 
                type="password" 
                className="w-full rounded-lg border-slate-200 dark:bg-[#111921] h-12 pl-4 text-white"
                onChange={e => setCreds({...creds, password: e.target.value})}
              />
            </div>
            <button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-white font-bold h-12 hover:bg-blue-600 transition-all"
            >
              Login <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}