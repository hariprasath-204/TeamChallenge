'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckSquare, Square, Play, ArrowLeft, Loader2, Award } from 'lucide-react';

const RULES = [
  'Exactly THREE members per team are required to participate.',
  'Only ONE PC or laptop is permitted per team throughout the event.',
  'All three members must work collaboratively using that single workstation.',
  'The official examination duration is strictly 120 MINUTES (2 Hours).',
  'One grand algorithm problem is provided to all participating teams.',
  'Supported programming languages: C++ (GCC) and Java (OpenJDK).',
  'Participants may compile and run their solution repeatedly against custom test inputs.',
  'Only the registered team leader is authorized to submit the final solution.',
  'Refreshing the browser or reconnecting will NOT reset the server examination timer.',
  'Your source code and selected language are automatically preserved and backed up.',
  'All evaluation test cases are hidden and confidential on the backend server.',
  'Questions are dynamically watermarked for leak deterrence and forensic traceability.',
  'Suspicious activity, multiple logins, or window switching may trigger administrative review.',
];

export default function InstructionsPage() {
  const router = useRouter();
  const [acknowledged, setAcknowledged] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [teamId, setTeamId] = useState('');
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    const tid = localStorage.getItem('cdt_team_id');
    const sid = localStorage.getItem('cdt_session_id');
    if (!tid || !sid) {
      router.push('/login');
      return;
    }
    setTeamId(tid);
    setSessionId(sid);
  }, [router]);

  const handleStartExam = async () => {
    if (!acknowledged) return;
    setIsStarting(true);

    try {
      // Trigger server-authoritative examination timer start
      const res = await fetch('/api/examination/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          sessionId,
          action: 'START',
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/examination');
      } else {
        alert(data.error?.message || 'Failed to start exam.');
      }
    } catch {
      alert('Network error while starting exam.');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl ww-card p-6 md:p-8 border-gold-border/40 shadow-gold"
      >
        <div className="text-center mb-6">
          <span className="ww-category-badge">STAGE 4 • EXAMINATION INSTRUCTIONS</span>
          <h1 className="font-cinzel text-2xl md:text-3xl font-extrabold gold-gradient-text tracking-wider">
            CODATHAN 2K27 Rules of Engagement
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Department of Computer Applications • Ayya Nadar Janaki Ammal College (Autonomous)
          </p>
        </div>

        {/* Rules List Container */}
        <div className="bg-[#080b12] border border-gold-border/20 rounded-lg p-5 mb-6 max-h-[380px] overflow-y-auto space-y-3">
          {RULES.map((rule, idx) => (
            <div key={idx} className="flex items-start gap-3 text-xs leading-relaxed text-gray-300">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gold-border/20 border border-gold-border/40 text-gold-bright flex items-center justify-center font-mono font-bold text-[10px]">
                {idx + 1}
              </span>
              <span>{rule}</span>
            </div>
          ))}
        </div>

        {/* Mandatory Acknowledgement Checkbox */}
        <div
          onClick={() => setAcknowledged(!acknowledged)}
          className={`p-4 rounded-md border cursor-pointer select-none transition flex items-center gap-3 mb-6 ${
            acknowledged
              ? 'bg-gold-border/10 border-gold-bright text-white shadow-gold'
              : 'bg-[#0a0d15] border-gold-border/30 text-gray-300 hover:border-gold-border/60'
          }`}
        >
          {acknowledged ? (
            <CheckSquare className="w-5 h-5 text-gold-bright flex-shrink-0" />
          ) : (
            <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
          )}
          <span className="text-xs font-semibold tracking-wide">
            I have read, understood and agree to adhere to all CODATHAN 2K27 examination rules, device policies and conduct guidelines.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gold-border/20">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 rounded border border-gold-border/30 hover:bg-gold-border/10 text-gold-bright text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>

          <button
            onClick={handleStartExam}
            disabled={!acknowledged || isStarting}
            className="btn-gold px-8 py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-gold"
          >
            {isStarting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synchronizing Timer...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Coding Examination</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
