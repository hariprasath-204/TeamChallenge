'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, UserCheck, Monitor, Clock, Play, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { TeamRegistration } from '@/types/team';

export default function TeamDashboardPage() {
  const router = useRouter();
  const [team, setTeam] = useState<TeamRegistration | null>(null);
  const [examStatus, setExamStatus] = useState<string>('READY');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const rawTeam = localStorage.getItem('cdt_team_info');
    const teamId = localStorage.getItem('cdt_team_id');
    const sessionId = localStorage.getItem('cdt_session_id');

    if (!rawTeam || !teamId || !sessionId) {
      router.push('/login');
      return;
    }

    try {
      setTeam(JSON.parse(rawTeam));

      // Fetch exam session status
      fetch(`/api/examination/status?teamId=${teamId}&sessionId=${sessionId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.data) {
            setExamStatus(d.data.sessionState.status);
          }
        })
        .finally(() => setLoading(false));
    } catch {
      router.push('/login');
    }
  }, [router]);

  if (loading || !team) return null;

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl ww-card p-6 md:p-8 border-gold-border/40 shadow-gold"
      >
        {/* Header Branding */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gold-border/20 pb-4 mb-6 gap-2">
          <div>
            <span className="ww-category-badge">STAGE 3 • TEAM HEADQUARTERS</span>
            <h1 className="font-cinzel text-2xl md:text-3xl font-extrabold gold-gradient-text">
              {team.teamName}
            </h1>
            <p className="text-xs text-gray-400">
              {team.college} • {team.department}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-3 py-1.5 rounded bg-[#090d16] border border-gold-border/30 text-gold-bright">
              Lot #{team.lotNumber || '001'} • {team.id}
            </span>
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded bg-elevated border border-gold-border/20">
            <div className="flex items-center gap-1.5 text-gold-primary text-xs font-cinzel font-semibold mb-1">
              <UserCheck className="w-4 h-4" /> Face Verification
            </div>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> All 3 Passed
            </div>
          </div>

          <div className="p-3 rounded bg-elevated border border-gold-border/20">
            <div className="flex items-center gap-1.5 text-gold-primary text-xs font-cinzel font-semibold mb-1">
              <Monitor className="w-4 h-4" /> Device Session
            </div>
            <div className="text-xs font-bold text-emerald-400">Locked to This PC</div>
          </div>

          <div className="p-3 rounded bg-elevated border border-gold-border/20">
            <div className="flex items-center gap-1.5 text-gold-primary text-xs font-cinzel font-semibold mb-1">
              <Clock className="w-4 h-4" /> Duration
            </div>
            <div className="text-xs font-bold text-gold-light">120 Minutes</div>
          </div>

          <div className="p-3 rounded bg-elevated border border-gold-border/20">
            <div className="flex items-center gap-1.5 text-gold-primary text-xs font-cinzel font-semibold mb-1">
              <ShieldCheck className="w-4 h-4" /> Examination Status
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-gold-bright">
              {examStatus}
            </div>
          </div>
        </div>

        {/* Registered Members List */}
        <div className="mb-6">
          <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-gold-bright mb-3">
            Registered Golden Trio Members (3 Members Required)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {team.members.map((m, idx) => {
              const isLeader = idx === team.leaderIndex;
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded border ${
                    isLeader
                      ? 'bg-gradient-to-b from-[#141824] to-[#0c0f18] border-gold-border shadow-md'
                      : 'bg-[#090b12] border-gold-border/20'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-cinzel font-bold text-gold-primary">
                      Member #{idx + 1}
                    </span>
                    {isLeader && (
                      <span className="px-1.5 py-0.5 rounded bg-gold-border/30 text-gold-bright text-[9px] font-bold">
                        LEADER
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-xs text-white">{m.name}</div>
                  <div className="text-[11px] text-gray-400 font-mono mt-0.5">{m.rollNo}</div>
                  <div className="text-[10px] text-gray-500 font-mono truncate">{m.email}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strict Event Notice */}
        <div className="p-3.5 rounded bg-[#090c13] border border-gold-border/20 text-xs text-gray-300 mb-6 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-gold-primary flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed text-[11.5px]">
            <strong>CODATHAN 2K27 Policy:</strong> All 3 team members work together using this single workstation. Individual laptops are strictly prohibited. The timer starts authoritatively when you proceed to the examination.
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gold-border/20 gap-3">
          <button
            onClick={() => router.push('/instructions')}
            className="px-4 py-2 rounded border border-gold-border/30 hover:bg-gold-border/10 text-gold-bright text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <FileText className="w-4 h-4" /> Review Rules & Instructions
          </button>

          {examStatus === 'SUBMITTED' || examStatus === 'COMPLETED' ? (
            <button
              onClick={() => router.push('/completion')}
              className="btn-gold px-8 py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-gold"
            >
              <span>View Completion Receipt</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => router.push('/instructions')}
              className="btn-gold px-8 py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-gold"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Proceed to Instructions & Exam</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
