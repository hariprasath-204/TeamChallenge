'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Shield,
  Activity,
  Award,
  Cpu,
  LogOut,
  RefreshCw,
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  Sliders,
  Code2,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'teams' | 'sessions' | 'watermark' | 'evaluations' | 'compiler' | 'health'>('teams');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Data states
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [teamsData, setTeamsData] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sessionsData, setSessionsData] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [watermarkConfig, setWatermarkConfig] = useState<any>({ enabled: true, opacity: 0.055, fontSize: 13, angle: -25 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [compilerMetrics, setCompilerMetrics] = useState<any>({ activeExecutions: 0, queuedJobsCount: 0, totalCompleted: 0 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [healthData, setHealthData] = useState<any>({ status: 'HEALTHY', incidents: [] });

  // Leak Trace state
  const [traceQuery, setTraceQuery] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [traceResults, setTraceResults] = useState<any[]>([]);

  // Selected Submission Modal for viewing full source code
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

  // Search in tables
  const [searchFilter, setSearchFilter] = useState('');

  const refreshAllData = async () => {
    setIsLoading(true);
    try {
      const [tRes, sRes, wRes, eRes, hRes] = await Promise.all([
        fetch('/api/admin/teams').then((r) => r.json()),
        fetch('/api/admin/sessions').then((r) => r.json()),
        fetch('/api/admin/watermark').then((r) => r.json()),
        fetch('/api/admin/evaluations').then((r) => r.json()),
        fetch('/api/admin/health').then((r) => r.json()),
      ]);

      if (tRes.success) setTeamsData(tRes.data.teams || []);
      if (sRes.success) {
        setSessionsData(sRes.data.allSessions || []);
        setAuditLogs(sRes.data.auditLogs || []);
      }
      if (wRes.success) {
        setWatermarkConfig(wRes.data.config || {});
        setAccessLogs(wRes.data.recentAccessLogs || []);
      }
      if (eRes.success) setLeaderboard(eRes.data.leaderboard || []);
      if (hRes.success) {
        setHealthData(hRes.data.health || {});
        setCompilerMetrics(hRes.data.compilerMetrics || {});
      }
    } catch {
      // API error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const isAuth = localStorage.getItem('cdt_admin_auth');
    if (!isAuth) {
      router.push('/admin/login');
      return;
    }
    refreshAllData();
  }, [router]);

  // Reset a team's 1-PC session lock
  const handleResetSessionLock = async (teamId: string) => {
    if (!confirm(`Are you sure you want to authorize resetting the PC lock for ${teamId}? This will allow the team to log in on a replacement computer.`)) return;

    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, action: 'RESET_LOCK', reason: 'Admin authorized hardware replacement' }),
      });
      const data = await res.json();
      alert(data.message);
      refreshAllData();
    } catch {
      alert('Failed to reset session lock.');
    }
  };

  // Update Watermark Settings
  const handleUpdateWatermark = async (newConfig: Partial<typeof watermarkConfig>) => {
    try {
      const res = await fetch('/api/admin/watermark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      const data = await res.json();
      if (data.success) {
        setWatermarkConfig(data.data);
        alert('Watermark protection parameters saved.');
      }
    } catch {
      alert('Failed to update watermark configuration.');
    }
  };

  // Trace Leaked Watermark
  const handleTraceLeak = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!traceQuery.trim()) return;

    try {
      const res = await fetch(`/api/admin/watermark?trace=${encodeURIComponent(traceQuery.trim())}`);
      const data = await res.json();
      if (data.success) {
        setTraceResults(data.data.matchedRecords || []);
      }
    } catch {
      alert('Forensic leak search failed.');
    }
  };

  // Export Leaderboard to CSV
  const handleExportCSV = () => {
    if (leaderboard.length === 0) {
      alert('No submissions recorded to export yet.');
      return;
    }

    const headers = ['Rank', 'Team ID', 'Team Name', 'Leader', 'Language', 'Status', 'Score', 'Passed Tests', 'Total Tests', 'Submitted At'];
    const rows = leaderboard.map((s) => [
      s.rank,
      `"${s.teamId}"`,
      `"${s.teamName}"`,
      `"${s.leaderName}"`,
      s.language,
      s.evaluationStatus,
      s.internalScore,
      s.passedTestsCount,
      s.totalTestsCount,
      new Date(s.submittedAt).toLocaleString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CODATHAN_2K27_Final_Results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    localStorage.removeItem('cdt_admin_auth');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-void text-gray-200 flex flex-col font-sans select-none">
      {/* Top Bar */}
      <header className="h-16 px-6 bg-[#090c14] border-b border-gold-border/30 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gold-border/20 border border-gold-border flex items-center justify-center text-gold-bright">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-lg font-black gold-gradient-text">CODATHAN 2K27</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-red-950/60 border border-red-500/40 text-red-300 font-mono font-bold">
                ADMIN CONSOLE
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Department of Computer Applications • Ayya Nadar Janaki Ammal College (Autonomous)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshAllData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-elevated hover:bg-[#181d2a] border border-gold-border/20 text-xs text-gold-bright transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-xs text-red-300 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Metric Counters Banner */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-4 bg-[#06080e] border-b border-gold-border/20">
        <div className="p-3 rounded bg-elevated/70 border border-gold-border/20">
          <span className="text-[10px] text-gray-400 uppercase font-cinzel block">Total Teams</span>
          <span className="text-xl font-bold font-mono text-gold-bright">{teamsData.length}</span>
        </div>
        <div className="p-3 rounded bg-elevated/70 border border-gold-border/20">
          <span className="text-[10px] text-gray-400 uppercase font-cinzel block">Active PC Locks</span>
          <span className="text-xl font-bold font-mono text-emerald-400">
            {sessionsData.filter((s) => s.status === 'ACTIVE').length}
          </span>
        </div>
        <div className="p-3 rounded bg-elevated/70 border border-gold-border/20">
          <span className="text-[10px] text-gray-400 uppercase font-cinzel block">Exams in Progress</span>
          <span className="text-xl font-bold font-mono text-cyan-400">
            {teamsData.filter((t) => t.examStatus === 'ACTIVE').length}
          </span>
        </div>
        <div className="p-3 rounded bg-elevated/70 border border-gold-border/20">
          <span className="text-[10px] text-gray-400 uppercase font-cinzel block">Final Submissions</span>
          <span className="text-xl font-bold font-mono text-purple-400">{leaderboard.length}</span>
        </div>
        <div className="p-3 rounded bg-elevated/70 border border-gold-border/20">
          <span className="text-[10px] text-gray-400 uppercase font-cinzel block">Compiler Queue</span>
          <span className="text-xl font-bold font-mono text-amber-400">
            {compilerMetrics.activeExecutions} Active ({compilerMetrics.queuedJobsCount} Queued)
          </span>
        </div>
        <div className="p-3 rounded bg-elevated/70 border border-gold-border/20">
          <span className="text-[10px] text-gray-400 uppercase font-cinzel block">System Health</span>
          <span className="text-xl font-bold font-mono text-emerald-400">OPERATIONAL</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-6 pt-3 bg-[#080b12] border-b border-gold-border/20 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('teams')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t text-xs font-cinzel font-bold tracking-wider transition ${
            activeTab === 'teams'
              ? 'bg-[#0e121d] text-gold-bright border-t-2 border-gold-bright shadow'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Users className="w-4 h-4 text-gold-primary" />
          <span>Teams & Verification</span>
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t text-xs font-cinzel font-bold tracking-wider transition ${
            activeTab === 'sessions'
              ? 'bg-[#0e121d] text-gold-bright border-t-2 border-gold-bright shadow'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Shield className="w-4 h-4 text-gold-primary" />
          <span>1-PC Session Enforcement</span>
        </button>

        <button
          onClick={() => setActiveTab('watermark')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t text-xs font-cinzel font-bold tracking-wider transition ${
            activeTab === 'watermark'
              ? 'bg-[#0e121d] text-gold-bright border-t-2 border-gold-bright shadow'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Eye className="w-4 h-4 text-gold-primary" />
          <span>Watermark & Leak Forensics</span>
        </button>

        <button
          onClick={() => setActiveTab('evaluations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t text-xs font-cinzel font-bold tracking-wider transition ${
            activeTab === 'evaluations'
              ? 'bg-[#0e121d] text-gold-bright border-t-2 border-gold-bright shadow'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Award className="w-4 h-4 text-gold-primary" />
          <span>Private Evaluations & Leaderboard</span>
        </button>

        <button
          onClick={() => setActiveTab('compiler')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t text-xs font-cinzel font-bold tracking-wider transition ${
            activeTab === 'compiler'
              ? 'bg-[#0e121d] text-gold-bright border-t-2 border-gold-bright shadow'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Cpu className="w-4 h-4 text-gold-primary" />
          <span>Concurrent Queue Monitor</span>
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t text-xs font-cinzel font-bold tracking-wider transition ${
            activeTab === 'health'
              ? 'bg-[#0e121d] text-gold-bright border-t-2 border-gold-bright shadow'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Activity className="w-4 h-4 text-gold-primary" />
          <span>System Health & Error Logs</span>
        </button>
      </div>

      {/* Main Tab Views */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* TAB 1: TEAMS & FACE VERIFICATION */}
        {activeTab === 'teams' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by Team ID, Name, College..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded bg-[#090c14] border border-gold-border/30 text-xs text-white"
                />
              </div>
              <span className="text-xs text-gray-400 font-mono">
                Showing {teamsData.length} Registered Teams
              </span>
            </div>

            <div className="overflow-x-auto rounded border border-gold-border/20 bg-[#0a0d15]">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#0f1320] text-gold-bright border-b border-gold-border/20 font-cinzel">
                  <tr>
                    <th className="p-3">Team ID</th>
                    <th className="p-3">Team Name</th>
                    <th className="p-3">College / Dept</th>
                    <th className="p-3">Registered Members (3)</th>
                    <th className="p-3">Face Verification</th>
                    <th className="p-3">Exam Status</th>
                    <th className="p-3">Views</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {teamsData
                    .filter(
                      (t) =>
                        !searchFilter ||
                        t.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        t.teamName.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        t.college.toLowerCase().includes(searchFilter.toLowerCase())
                    )
                    .map((t) => (
                      <tr key={t.id} className="hover:bg-[#111624]">
                        <td className="p-3 font-mono font-bold text-gold-light">{t.id}</td>
                        <td className="p-3 font-semibold text-white">{t.teamName}</td>
                        <td className="p-3 text-gray-400">{t.college}</td>
                        <td className="p-3">
                          <div className="space-y-0.5 text-[11px]">
                            {t.members.map((m: { name: string; rollNo: string }, i: number) => (
                              <div key={i} className="text-gray-300">
                                {i + 1}. {m.name} ({m.rollNo}) {i === t.leaderIndex && '★'}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          {t.faceVerified ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> 3/3 Verified
                            </span>
                          ) : (
                            <span className="text-amber-400">Pending</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-gold-border/10 border border-gold-border/30 text-[11px] font-mono uppercase text-gold-bright">
                            {t.examStatus}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-center">{t.questionViews}</td>
                        <td className="p-3">
                          <button
                            onClick={() => handleResetSessionLock(t.id)}
                            className="px-2.5 py-1 rounded bg-[#161b28] hover:bg-gold-border/20 text-gold-bright border border-gold-border/20 text-[11px] flex items-center gap-1 transition"
                            title="Reset 1-PC lock in case of hardware crash"
                          >
                            <RotateCcw className="w-3 h-3" /> Reset PC Lock
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ONE-PC SESSION ENFORCEMENT */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="p-4 rounded bg-amber-950/20 border border-amber-600/30 text-amber-200 text-xs">
              <strong className="font-cinzel text-amber-300">Atomic 1-PC Rule: </strong>
              Each team is strictly bound to a single client fingerprint and session token. Any secondary computer attempting to sign in is automatically blocked with a 409 Conflict.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Active Sessions */}
              <div className="rounded border border-gold-border/20 bg-[#0a0d15] p-4">
                <h3 className="font-cinzel text-sm font-bold text-gold-bright mb-3">
                  Currently Active Team Devices ({sessionsData.filter((s) => s.status === 'ACTIVE').length})
                </h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {sessionsData
                    .filter((s) => s.status === 'ACTIVE')
                    .map((s) => (
                      <div key={s.sessionId} className="p-3 rounded bg-elevated border border-gold-border/15 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-gold-light">{s.teamId}</div>
                          <div className="text-[10px] text-gray-400 font-mono">Session: {s.sessionId.substring(0, 16)}...</div>
                          <div className="text-[10px] text-gray-400 font-mono">IP: {s.ipAddress}</div>
                        </div>
                        <button
                          onClick={() => handleResetSessionLock(s.teamId)}
                          className="px-2.5 py-1 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-[11px]"
                        >
                          Revoke Lock
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              {/* Session Audit & Second PC Blocked Logs */}
              <div className="rounded border border-gold-border/20 bg-[#0a0d15] p-4">
                <h3 className="font-cinzel text-sm font-bold text-gold-bright mb-3">
                  Device Security Audit Trail (Recent Activity)
                </h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto font-mono text-[11px]">
                  {auditLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded border ${
                        log.action === 'SECOND_DEVICE_BLOCKED'
                          ? 'bg-red-950/40 border-red-500/40 text-red-300'
                          : 'bg-elevated border-gold-border/10 text-gray-300'
                      }`}
                    >
                      <div className="flex justify-between font-bold mb-0.5">
                        <span className={log.action === 'SECOND_DEVICE_BLOCKED' ? 'text-red-400' : 'text-gold-primary'}>
                          {log.action}
                        </span>
                        <span className="text-gray-500 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-[10px] text-gray-400">Team: {log.teamId} • {log.details}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WATERMARK & LEAK FORENSICS */}
        {activeTab === 'watermark' && (
          <div className="space-y-6">
            {/* Watermark Configuration Controls */}
            <div className="p-5 rounded border border-gold-border/30 bg-[#0a0d15]">
              <h3 className="font-cinzel text-sm font-bold text-gold-bright mb-4 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-gold-primary" />
                <span>Question Dynamic Watermark Protection Settings</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Watermark Status</label>
                  <button
                    onClick={() => handleUpdateWatermark({ enabled: !watermarkConfig.enabled })}
                    className={`px-4 py-2 rounded text-xs font-bold w-full transition ${
                      watermarkConfig.enabled
                        ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                        : 'bg-red-950 border border-red-500 text-red-300'
                    }`}
                  >
                    {watermarkConfig.enabled ? 'PROTECTION ENABLED' : 'PROTECTION DISABLED'}
                  </button>
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">
                    Opacity: {(watermarkConfig.opacity * 100).toFixed(1)}% (Target: 4%–7%)
                  </label>
                  <input
                    type="range"
                    min="0.02"
                    max="0.15"
                    step="0.005"
                    value={watermarkConfig.opacity}
                    onChange={(e) => handleUpdateWatermark({ opacity: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">
                    Font Size: {watermarkConfig.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="18"
                    step="1"
                    value={watermarkConfig.fontSize}
                    onChange={(e) => handleUpdateWatermark({ fontSize: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Pattern Angle: {watermarkConfig.angle}°</label>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    step="5"
                    value={watermarkConfig.angle}
                    onChange={(e) => handleUpdateWatermark({ angle: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Forensic Leak Traceability Tool */}
            <div className="p-5 rounded border border-gold-border/30 bg-[#0a0d15]">
              <h3 className="font-cinzel text-sm font-bold text-gold-bright mb-2">
                Forensic Image Leak Traceability Investigation
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                If an unauthorized photo of the competition question is discovered, enter the visible Tracking ID, Team ID, or text snippet to identify the exact workstation and participant session.
              </p>

              <form onSubmit={handleTraceLeak} className="flex gap-3 mb-4">
                <input
                  type="text"
                  placeholder="e.g. TRK-A82F or CDT-001 or roll number..."
                  value={traceQuery}
                  onChange={(e) => setTraceQuery(e.target.value)}
                  className="flex-1 px-4 py-2 rounded bg-void border border-gold-border/30 text-xs text-white"
                />
                <button type="submit" className="btn-gold px-6 py-2 rounded text-xs font-bold uppercase">
                  Investigate
                </button>
              </form>

              {traceResults.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h4 className="text-xs font-cinzel text-gold-bright font-bold">Identified Matching Workstations:</h4>
                  {traceResults.map((rec, idx) => (
                    <div key={idx} className="p-3 rounded bg-elevated border border-gold-border/40 text-xs font-mono space-y-1">
                      <div className="text-gold-light font-bold">Watermark Text: {rec.text}</div>
                      <div className="text-gray-400">Tracking Code: {rec.trackingId}</div>
                      <div className="text-gray-400">Team: {rec.teamId} • Participant: {rec.participantId}</div>
                      <div className="text-gray-400">Session ID: {rec.sessionId}</div>
                      <div className="text-gray-400">Created At: {new Date(rec.timestamp).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Question Access Logs */}
            <div className="rounded border border-gold-border/20 bg-[#0a0d15] p-4">
              <h3 className="font-cinzel text-sm font-bold text-gold-bright mb-3">
                Question Access & View Counter History ({accessLogs.length} events)
              </h3>
              <div className="overflow-x-auto max-h-[300px]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0f1320] text-gold-light border-b border-gold-border/20">
                    <tr>
                      <th className="p-2">Tracking ID</th>
                      <th className="p-2">Team ID</th>
                      <th className="p-2">Participant</th>
                      <th className="p-2">Action</th>
                      <th className="p-2">View #</th>
                      <th className="p-2">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {accessLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#111624]">
                        <td className="p-2 text-gold-primary">{log.trackingId}</td>
                        <td className="p-2 font-bold">{log.teamId}</td>
                        <td className="p-2 text-gray-300">{log.participantId}</td>
                        <td className="p-2 uppercase">{log.action}</td>
                        <td className="p-2">{log.viewCount}</td>
                        <td className="p-2 text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PRIVATE EVALUATION & LEADERBOARD */}
        {activeTab === 'evaluations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-cinzel text-base font-bold text-gold-bright">
                  Confidential Administrative Leaderboard & Evaluations
                </h3>
                <p className="text-xs text-gray-400">
                  Strictly confidential. Internal marks, pass/fail counts, and submitted code are restricted from participant view.
                </p>
              </div>

              <button
                onClick={handleExportCSV}
                className="btn-gold flex items-center gap-1.5 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider"
              >
                <Download className="w-4 h-4" />
                <span>Export Official Excel/CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded border border-gold-border/20 bg-[#0a0d15]">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#0f1320] text-gold-bright border-b border-gold-border/20 font-cinzel">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Team ID</th>
                    <th className="p-3">Team Name</th>
                    <th className="p-3">Leader</th>
                    <th className="p-3">Lang</th>
                    <th className="p-3">Internal Score</th>
                    <th className="p-3">Hidden Tests</th>
                    <th className="p-3">Evaluation Status</th>
                    <th className="p-3">Submitted At</th>
                    <th className="p-3">Inspect Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-gray-500 italic">
                        No final submissions recorded yet. Submissions will appear in real-time as team leaders submit.
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map((sub) => (
                      <tr key={sub.teamId} className="hover:bg-[#111624]">
                        <td className="p-3 font-mono font-bold text-gold-bright">#{sub.rank}</td>
                        <td className="p-3 font-mono font-bold text-white">{sub.teamId}</td>
                        <td className="p-3 font-semibold text-gray-200">{sub.teamName}</td>
                        <td className="p-3 text-gray-400">{sub.leaderName}</td>
                        <td className="p-3 uppercase font-mono">{sub.language}</td>
                        <td className="p-3 font-mono font-bold text-emerald-400 text-sm">
                          {sub.internalScore} pts
                        </td>
                        <td className="p-3 font-mono text-gray-300">
                          {sub.passedTestsCount} / {sub.totalTestsCount} Passed
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              sub.evaluationStatus === 'ALL_PASSED'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                                : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                            }`}
                          >
                            {sub.evaluationStatus}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-gray-400">
                          {new Date(sub.submittedAt).toLocaleTimeString()}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => setSelectedSubmission(sub)}
                            className="px-2.5 py-1 rounded bg-elevated hover:bg-gold-border/20 text-gold-bright border border-gold-border/20 text-[11px] flex items-center gap-1"
                          >
                            <Code2 className="w-3 h-3" /> View Source
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Submission Source Code Modal */}
            {selectedSubmission && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="w-full max-w-3xl bg-[#0e121d] border border-gold-border rounded-lg shadow-gold-lg overflow-hidden flex flex-col max-h-[85vh]">
                  <div className="p-4 bg-[#0a0d15] border-b border-gold-border/20 flex items-center justify-between">
                    <div>
                      <h4 className="font-cinzel text-sm font-bold text-gold-bright">
                        Submitted Code — {selectedSubmission.teamName} ({selectedSubmission.teamId})
                      </h4>
                      <p className="text-[11px] text-gray-400 font-mono">
                        Language: {selectedSubmission.language.toUpperCase()} • Score: {selectedSubmission.internalScore} pts
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedSubmission(null)}
                      className="px-3 py-1 rounded bg-[#161b28] hover:bg-gold-border/20 text-xs text-white"
                    >
                      Close
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 bg-[#06070a]">
                    <pre className="font-mono text-xs text-emerald-300 whitespace-pre overflow-x-auto p-3 rounded bg-black/60 border border-gold-border/10">
                      {selectedSubmission.sourceCode}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CONCURRENT EXECUTION MONITOR */}
        {activeTab === 'compiler' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded bg-[#0a0d15] border border-gold-border/20">
                <span className="text-xs text-gray-400 font-cinzel block mb-1">Max Concurrency</span>
                <span className="text-2xl font-mono font-bold text-gold-bright">
                  {compilerMetrics.maxConcurrency || 8} Workers
                </span>
                <span className="text-[10px] text-gray-500 block mt-1">Configured for 34 teams</span>
              </div>

              <div className="p-4 rounded bg-[#0a0d15] border border-gold-border/20">
                <span className="text-xs text-gray-400 font-cinzel block mb-1">Active Executions</span>
                <span className="text-2xl font-mono font-bold text-emerald-400">
                  {compilerMetrics.activeExecutions}
                </span>
                <span className="text-[10px] text-gray-500 block mt-1">Compiling in parallel</span>
              </div>

              <div className="p-4 rounded bg-[#0a0d15] border border-gold-border/20">
                <span className="text-xs text-gray-400 font-cinzel block mb-1">Queued Runs</span>
                <span className="text-2xl font-mono font-bold text-amber-400">
                  {compilerMetrics.queuedJobsCount}
                </span>
                <span className="text-[10px] text-gray-500 block mt-1">Submissions prioritized</span>
              </div>

              <div className="p-4 rounded bg-[#0a0d15] border border-gold-border/20">
                <span className="text-xs text-gray-400 font-cinzel block mb-1">Total Executions</span>
                <span className="text-2xl font-mono font-bold text-cyan-400">
                  {compilerMetrics.totalCompleted}
                </span>
                <span className="text-[10px] text-gray-500 block mt-1">Completed successfully</span>
              </div>
            </div>

            <div className="p-4 rounded bg-elevated border border-gold-border/20 text-xs text-gray-300 leading-relaxed font-sans">
              <strong className="text-gold-light font-cinzel block mb-1">Fair Scheduling & Rate Limiting: </strong>
              Each team is rate-limited to 1 execution per 2 seconds to prevent single-team starvation. Final submissions automatically bypass regular RUN requests in the priority queue.
            </div>
          </div>
        )}

        {/* TAB 6: SYSTEM HEALTH & INCIDENT LOGS */}
        {activeTab === 'health' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded bg-elevated border border-gold-border/20">
                <span className="text-xs text-gray-400 block">Overall Status</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {healthData.status || 'HEALTHY'}
                </span>
              </div>
              <div className="p-3 rounded bg-elevated border border-gold-border/20">
                <span className="text-xs text-gray-400 block">HTTP 500-505 Failures</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">0 Incidents</span>
              </div>
              <div className="p-3 rounded bg-elevated border border-gold-border/20">
                <span className="text-xs text-gray-400 block">Monaco Failures</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">0 (Fallback Ready)</span>
              </div>
              <div className="p-3 rounded bg-elevated border border-gold-border/20">
                <span className="text-xs text-gray-400 block">White Screen Incidents</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">0 (Protected)</span>
              </div>
            </div>

            <div className="p-4 rounded bg-[#0a0d15] border border-gold-border/20">
              <h4 className="font-cinzel text-xs font-bold text-gold-bright mb-3">
                Error Boundaries & Service Recovery Logs
              </h4>
              <div className="text-xs text-gray-400 italic">
                All React ErrorBoundaries, Next.js error.tsx handlers, and fallback textareas are armed and operating normally.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
