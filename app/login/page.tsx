'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, User, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [teamIdOrEmail, setTeamIdOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isConflict, setIsConflict] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setIsConflict(false);

    try {
      // Generate client fingerprint
      const fp = `fp_${window.screen.width}x${window.screen.height}_${navigator.userAgent.length}`;
      const existingSessionId = localStorage.getItem('cdt_session_id') || undefined;

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamIdOrEmail: teamIdOrEmail.trim(),
          password: password.trim(),
          clientFingerprint: fp,
          existingSessionId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 409) {
          setIsConflict(true);
        }
        setErrorMessage(data.error?.message || 'Login failed. Please check your credentials.');
        return;
      }

      // Store authenticated team & session state
      localStorage.setItem('cdt_team_id', data.data.team.id);
      localStorage.setItem('cdt_session_id', data.data.session.sessionId);
      localStorage.setItem('cdt_team_info', JSON.stringify(data.data.team));

      router.push('/face-verification');
    } catch {
      setErrorMessage('Network connection lost. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative Golden Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-gold-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold-border/10 border border-gold-border text-gold-bright mb-3 shadow-gold">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <span className="ww-category-badge">AYYA NADAR JANAKI AMMAL COLLEGE</span>
          <h1 className="font-cinzel text-3xl font-extrabold gold-gradient-text tracking-wider">
            CODATHAN 2K27
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-sans">
            Department of Computer Applications • Coding Examination Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="ww-card p-6 md:p-8 border-gold-border/40 shadow-gold">
          <h2 className="font-cinzel text-lg font-bold text-gold-light mb-1 text-center">
            Student Team Authentication
          </h2>
          <p className="text-[12px] text-gray-400 mb-6 text-center">
            Sign in using your Team ID or registered Team Leader Email
          </p>

          {/* Error / Conflict Alert */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3.5 rounded mb-5 text-xs flex items-start gap-2.5 ${
                isConflict
                  ? 'bg-red-950/40 border border-red-500/60 text-red-200'
                  : 'bg-amber-950/40 border border-amber-500/50 text-amber-200'
              }`}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="whitespace-pre-line leading-relaxed font-sans">{errorMessage}</div>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gold-bright mb-1.5 font-cinzel">
                Team ID or Leader Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={teamIdOrEmail}
                  onChange={(e) => setTeamIdOrEmail(e.target.value)}
                  placeholder="e.g. CDT-001-ZX0L or softtech.admin.st.1@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded bg-[#07090e] border border-gold-border/30 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-gold-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gold-bright mb-1.5 font-cinzel">
                Passcode / Preferred Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter passcode (if configured during registration)"
                  className="w-full pl-9 pr-3 py-2.5 rounded bg-[#07090e] border border-gold-border/30 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-gold-primary transition"
                />
              </div>
            </div>

            {/* Strict Event Rule Note */}
            <div className="p-2.5 rounded bg-[#090c13] border border-gold-border/20 text-[11px] text-gray-400">
              <span className="text-gold-primary font-semibold">Strict Rule:</span> Exactly ONE PC or laptop is permitted per team. Once logged in, this computer is locked to your team.
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-gold py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating Registration...</span>
                </>
              ) : (
                <>
                  <span>Sign In & Verify Device</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials helper */}
          <div className="mt-6 pt-4 border-t border-gold-border/20 text-center text-[11px] text-gray-400">
            <span>Registered Team ID: </span>
            <button
              type="button"
              onClick={() => {
                setTeamIdOrEmail('CDT-001-ZX0L');
                setPassword('codathon@2027');
              }}
              className="text-gold-bright font-mono underline hover:text-white"
            >
              CDT-001-ZX0L
            </button>
            <span className="mx-1.5">•</span>
            <button
              type="button"
              onClick={() => {
                setTeamIdOrEmail('CDT-007-GOLD');
                setPassword('codathon@2027');
              }}
              className="text-gold-bright font-mono underline hover:text-white"
            >
              CDT-007-GOLD
            </button>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex items-center justify-between mt-6 text-xs text-gray-500">
          <a href="/register" className="text-gold-bright hover:underline transition">
            New Team? Register Members →
          </a>
          <a href="/admin/login" className="hover:text-gold-bright transition">
            Administrator Portal Access →
          </a>
        </div>
      </motion.div>
    </div>
  );
}
