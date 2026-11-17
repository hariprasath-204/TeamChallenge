'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldAlert, KeyRound, ArrowRight, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState('admin@anjac.edu');
  const [adminPass, setAdminPass] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Default master admin password for CODATHAN 2K27 organizers
    if (adminPass === 'anjac@admin2027' || adminPass === 'codathon@admin') {
      localStorage.setItem('cdt_admin_auth', 'true');
      localStorage.setItem('cdt_admin_user', adminUser);
      router.push('/admin/dashboard');
    } else {
      setError('Invalid administrator credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-void flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[450px] h-[300px] bg-red-900/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-900/20 border border-red-500/40 text-red-400 mb-3 shadow-md">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <span className="text-[10px] uppercase tracking-widest font-cinzel text-red-400 border-b border-red-500/40 pb-0.5">
            AUTHORIZED ORGANIZERS ONLY
          </span>
          <h1 className="font-cinzel text-2xl font-extrabold gold-gradient-text tracking-wider mt-2">
            Administrator Portal
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-sans">
            CODATHAN 2K27 Executive Control & Private Evaluation
          </p>
        </div>

        <div className="ww-card p-6 md:p-8 border-gold-border/40 shadow-gold">
          {error && (
            <div className="p-3 rounded bg-red-950/40 border border-red-500/50 text-red-200 text-xs mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gold-bright mb-1.5 font-cinzel">
                Administrator Email
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded bg-[#07090e] border border-gold-border/30 text-white text-xs focus:outline-none focus:border-gold-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gold-bright mb-1.5 font-cinzel">
                Master Security Key
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="Enter administrator master key"
                  className="w-full pl-9 pr-3 py-2.5 rounded bg-[#07090e] border border-gold-border/30 text-white text-xs focus:outline-none focus:border-gold-primary transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full btn-gold py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 mt-4"
            >
              <span>Access Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gold-border/20 text-center text-[11px] text-gray-400">
            <span>Demo Master Key: </span>
            <button
              type="button"
              onClick={() => setAdminPass('anjac@admin2027')}
              className="text-gold-bright font-mono underline"
            >
              anjac@admin2027
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-xs text-gray-400 hover:text-gold-bright inline-flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Participant Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
