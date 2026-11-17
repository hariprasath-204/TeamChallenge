'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  ShieldCheck,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Loader2,
  Send,
  CloudUpload,
} from 'lucide-react';
import { TeamRegistration } from '@/types/team';
import { QuestionData, ExamSessionState } from '@/types/examination';
import { SupportedLanguage, CompilerResult } from '@/types/compiler';
import { QuestionPanel } from '@/components/QuestionPanel';
import { QuestionViewToggle } from '@/components/QuestionViewToggle';
import { MonacoEditorComponent } from '@/components/MonacoEditor';
import { InputOutputConsole } from '@/components/InputOutputConsole';
import { NetworkStatus } from '@/components/NetworkStatus';
import { SubmitModal } from '@/components/SubmitModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { STARTERS } from '@/lib/examStore';

export default function ExaminationPage() {
  const router = useRouter();

  // Authentication & Session
  const [team, setTeam] = useState<TeamRegistration | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [examSession, setExamSession] = useState<ExamSessionState | null>(null);
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Focus Editor Mode / Question Panel State (Unlimited viewing)
  const [isQuestionPanelOpen, setIsQuestionPanelOpen] = useState<boolean>(true);
  const [viewCount, setViewCount] = useState<number>(1);

  // Watermark State
  const [watermarkText, setWatermarkText] = useState<string>('');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.055);
  const [watermarkEnabled, setWatermarkEnabled] = useState<boolean>(true);

  // Code Editor State (Preserved throughout transitions)
  const [language, setLanguage] = useState<SupportedLanguage>('cpp');
  const [code, setCode] = useState<string>(STARTERS.cpp);
  const [autosaveStatus, setAutosaveStatus] = useState<'SAVED' | 'SAVING' | 'OFFLINE'>('SAVED');
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Console & Compiler Execution State
  const [customInput, setCustomInput] = useState<string>('3 3\n1 2 -1\n-2 4 2\n1 2 3');
  const [isCompilerRunning, setIsCompilerRunning] = useState<boolean>(false);
  const [queueStatusText, setQueueStatusText] = useState<string>('');
  const [compilerResult, setCompilerResult] = useState<CompilerResult | null>(null);

  // Timer State (Server-Authoritative)
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(120 * 60);

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Submit Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initial Load & Auth Verification
  useEffect(() => {
    const rawTeam = localStorage.getItem('cdt_team_info');
    const tid = localStorage.getItem('cdt_team_id');
    const sid = localStorage.getItem('cdt_session_id');

    if (!rawTeam || !tid || !sid) {
      router.push('/login');
      return;
    }

    try {
      const parsedTeam: TeamRegistration = JSON.parse(rawTeam);
      setTeam(parsedTeam);
      setSessionId(sid);

      // Load exam state & question
      fetch(`/api/examination/status?teamId=${tid}&sessionId=${sid}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.data) {
            setExamSession(d.data.sessionState);
            setQuestion(d.data.question);
            setViewCount(d.data.sessionState.questionViewsCount || 1);

            // Restore saved code if present
            if (d.data.sessionState.currentCode) {
              setCode(d.data.sessionState.currentCode);
              setLanguage(d.data.sessionState.currentLanguage || 'cpp');
            }

            // Calculate remaining time
            if (d.data.sessionState.deadline) {
              const rem = Math.max(0, Math.floor((d.data.sessionState.deadline - Date.now()) / 1000));
              setTimeRemainingSeconds(rem);
            }
          }
        })
        .finally(() => setLoading(false));

      // Fetch dynamic participant-specific watermark
      const participantId = parsedTeam.members[0]?.rollNo || 'P101';
      fetch(`/api/watermark?teamId=${tid}&sessionId=${sid}&participantId=${participantId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.data) {
            setWatermarkText(d.data.watermark.text);
            setWatermarkOpacity(d.data.config.opacity);
            setWatermarkEnabled(d.data.config.enabled);
          }
        })
        .catch(() => {});
    } catch {
      router.push('/login');
    }
  }, [router]);

  // Server-Authoritative Timer & Heartbeat Loop (Runs every second locally, syncs every 20s with server)
  useEffect(() => {
    if (loading) return;

    const timerInterval = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          alert('Examination time has expired. Your latest code is safely preserved.');
          router.push('/completion');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Heartbeat every 20 seconds to keep 1-PC lock alive and sync exact server deadline
    const heartbeatInterval = setInterval(async () => {
      const tid = localStorage.getItem('cdt_team_id');
      const sid = localStorage.getItem('cdt_session_id');
      if (!tid || !sid) return;

      try {
        const res = await fetch('/api/sessions/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teamId: tid, sessionId: sid }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          const exactServerRemSec = Math.floor(data.data.timeRemainingMs / 1000);
          if (exactServerRemSec > 0) {
            setTimeRemainingSeconds(exactServerRemSec);
          }
        } else if (data.status === 401) {
          // Session conflict on another computer
          alert('Your session was invalidated because another computer connected with this team ID.');
          router.push('/login');
        }
      } catch {
        // Network temporary disconnect
      }
    }, 20000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(heartbeatInterval);
    };
  }, [loading, router]);

  // Debounced Autosave (Saves code to server and local backup)
  const triggerAutosave = useCallback(
    (newCode: string, newLang: SupportedLanguage) => {
      setAutosaveStatus('SAVING');
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);

      autosaveTimeoutRef.current = setTimeout(async () => {
        const tid = localStorage.getItem('cdt_team_id');
        const sid = localStorage.getItem('cdt_session_id');
        if (!tid || !sid) return;

        try {
          // Local backup
          localStorage.setItem(`cdt_backup_${tid}`, newCode);

          const res = await fetch('/api/examination/autosave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              teamId: tid,
              sessionId: sid,
              code: newCode,
              language: newLang,
            }),
          });
          const data = await res.json();
          if (data.success) {
            setAutosaveStatus('SAVED');
          } else {
            setAutosaveStatus('OFFLINE');
          }
        } catch {
          setAutosaveStatus('OFFLINE');
        }
      }, 1500); // 1.5 second debounce
    },
    []
  );

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    triggerAutosave(newCode, language);
  };

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    // If switching language and code is default starter of old lang, switch starter
    if (code === STARTERS.cpp || code === STARTERS.java) {
      setCode(STARTERS[newLang]);
      triggerAutosave(STARTERS[newLang], newLang);
    } else {
      triggerAutosave(code, newLang);
    }
  };

  // Toggle Question Panel (FOCUS EDITOR MODE with animated transition and view counter)
  const handleToggleQuestionPanel = async () => {
    const nextState = !isQuestionPanelOpen;
    setIsQuestionPanelOpen(nextState);

    // If reopening question panel, increment view counter without penalty
    if (nextState) {
      const nextCount = viewCount + 1;
      setViewCount(nextCount);

      const tid = localStorage.getItem('cdt_team_id');
      const sid = localStorage.getItem('cdt_session_id');
      if (tid && sid) {
        fetch('/api/examination/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teamId: tid, sessionId: sid, action: 'INCREMENT_VIEW' }),
        }).catch(() => {});

        // Log access event
        fetch('/api/watermark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trackingId: watermarkText.split('•')[3]?.trim() || 'TRK-DEFAULT',
            teamId: tid,
            participantId: team?.members[0]?.rollNo || 'P101',
            sessionId: sid,
            questionId: question?.id || 'CDT27-P01',
            action: 'OPEN',
            viewCount: nextCount,
          }),
        }).catch(() => {});
      }
    }
  };

  // Run Code via Concurrent Compiler Queue
  const handleRunCode = async () => {
    if (!team || !sessionId) return;
    setIsCompilerRunning(true);
    setQueueStatusText('Submitting to execution queue...');

    try {
      const res = await fetch('/api/compiler/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: team.id,
          sessionId,
          language,
          sourceCode: code,
          stdin: customInput,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setCompilerResult({
          jobId: 'ERR',
          status: 'ERROR',
          stdout: '',
          stderr: data.error?.message || 'Rate limit or compilation queue rejected job.',
          compileOutput: '',
          exitCode: 1,
          executionTimeMs: 0,
        });
        setIsCompilerRunning(false);
        return;
      }

      const jobId = data.data.jobId;
      setQueueStatusText(`Queued (Position #${data.data.queuePosition || 1})...`);

      // Poll execution status
      const pollInterval = setInterval(async () => {
        try {
          const pollRes = await fetch(`/api/compiler/status?jobId=${jobId}`);
          const pollData = await pollRes.json();

          if (pollData.success && pollData.data) {
            const status = pollData.data.status;
            if (status === 'COMPLETED' || status === 'COMPILATION_ERROR' || status === 'ERROR') {
              clearInterval(pollInterval);
              setCompilerResult(pollData.data.result);
              setIsCompilerRunning(false);
            } else if (status === 'PROCESSING') {
              setQueueStatusText('Compiling and running in sandbox...');
            } else if (status === 'QUEUED') {
              setQueueStatusText(`Queued (Position #${pollData.data.queuePosition || 1})...`);
            }
          }
        } catch {
          clearInterval(pollInterval);
          setIsCompilerRunning(false);
        }
      }, 300);
    } catch {
      setIsCompilerRunning(false);
      alert('Execution request failed due to network error.');
    }
  };

  // Final Submission Handler
  const handleFinalSubmit = async () => {
    if (!team || !sessionId) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: team.id,
          sessionId,
          leaderEmail: team.leaderEmail,
          language,
          sourceCode: code,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error?.message || 'Final submission failed.');
        setIsSubmitting(false);
        return;
      }

      // Store completion receipt data
      localStorage.setItem('cdt_completion_data', JSON.stringify(data.data));
      setIsSubmitModalOpen(false);
      router.push('/completion');
    } catch {
      alert('Submission failed due to network disconnection.');
      setIsSubmitting(false);
    }
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Format Timer
  const formatTimer = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading || !team || !question) {
    return (
      <div className="min-h-screen bg-void flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-gold-bright animate-spin mb-3" />
        <h3 className="font-cinzel text-base tracking-wider text-gold-light">
          Securing CODATHAN 2K27 Exam Workstation...
        </h3>
      </div>
    );
  }

  const isTimeCritical = timeRemainingSeconds < 15 * 60; // Under 15 mins

  return (
    <div className="h-screen w-screen bg-void flex flex-col overflow-hidden text-white font-sans select-none">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="h-14 px-4 bg-[#0a0d15] border-b border-gold-border/30 flex items-center justify-between flex-shrink-0 z-30 shadow-md">
        {/* Left Branding & Team ID */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-cinzel font-black text-sm tracking-wider gold-gradient-text">
              CODATHAN 2K27
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-gold-border/20 text-gold-bright border border-gold-border/40 font-mono font-semibold">
              {team.id}
            </span>
            <span className="hidden md:inline text-xs text-gray-300 font-medium">
              {team.teamName}
            </span>
          </div>

          <div className="h-4 w-px bg-gold-border/30 mx-1 hidden sm:block" />

          {/* Unique Animated Question View Toggle Button */}
          <QuestionViewToggle
            isOpen={isQuestionPanelOpen}
            onToggle={handleToggleQuestionPanel}
            viewCount={viewCount}
          />
        </div>

        {/* Center Prominent Server-Authoritative 120-Min Timer */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md border font-mono font-bold tracking-widest text-sm transition ${
              isTimeCritical
                ? 'bg-red-950/50 border-red-500/60 text-red-400 animate-pulse'
                : 'bg-[#0f131f] border-gold-border/40 text-gold-bright shadow-gold'
            }`}
          >
            <Clock className={`w-4 h-4 ${isTimeCritical ? 'text-red-400' : 'text-gold-primary'}`} />
            <span>{formatTimer(timeRemainingSeconds)}</span>
          </div>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-3">
          {/* Autosave Status */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-gray-400 font-mono">
            {autosaveStatus === 'SAVING' ? (
              <>
                <CloudUpload className="w-3.5 h-3.5 text-gold-primary animate-bounce" />
                <span>Saving...</span>
              </>
            ) : autosaveStatus === 'SAVED' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-gray-400">Autosaved</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-amber-400">Local Backup</span>
              </>
            )}
          </div>

          {/* Network Status Badge */}
          <NetworkStatus />

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded hover:bg-gold-border/20 text-gray-400 hover:text-gold-bright transition"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Final Submit Solution Button */}
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="btn-gold flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider shadow-gold"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Solution</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE AREA */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Question Panel with Dynamic Watermark */}
        <AnimatePresence initial={false}>
          {isQuestionPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '42%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="h-full flex-shrink-0 relative overflow-hidden"
            >
              <ErrorBoundary fallbackTitle="Question Panel Recovery">
                <QuestionPanel
                  question={question}
                  watermarkText={watermarkText}
                  watermarkOpacity={watermarkOpacity}
                  watermarkEnabled={watermarkEnabled}
                />
              </ErrorBoundary>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Side: Monaco Editor & Terminal Console (Expands to 100% in Focus Mode) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0d14]">
          {/* Monaco Editor Container */}
          <div className="flex-1 relative overflow-hidden">
            <ErrorBoundary fallbackTitle="Monaco Editor Recovery">
              <MonacoEditorComponent
                code={code}
                language={language}
                onCodeChange={handleCodeChange}
                onLanguageChange={handleLanguageChange}
              />
            </ErrorBoundary>
          </div>

          {/* Terminal Style Console */}
          <ErrorBoundary fallbackTitle="Console Recovery">
            <InputOutputConsole
              customInput={customInput}
              onCustomInputChange={setCustomInput}
              onRunCode={handleRunCode}
              isRunning={isCompilerRunning}
              queueStatusText={queueStatusText}
              result={compilerResult}
            />
          </ErrorBoundary>
        </div>
      </main>

      {/* 3. FINAL SUBMISSION CONFIRMATION MODAL */}
      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={handleFinalSubmit}
        teamName={team.teamName}
        leaderName={team.leaderName}
        leaderEmail={team.leaderEmail}
        language={language}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
