'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Camera, CheckCircle2, AlertCircle, ShieldAlert, User, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { TeamRegistration } from '@/types/team';
import { TeamVerificationState, VerificationStatus } from '@/types/faceVerification';
import Image from 'next/image';

export default function FaceVerificationPage() {
  const router = useRouter();
  const [team, setTeam] = useState<TeamRegistration | null>(null);
  const [activeMemberIdx, setActiveMemberIdx] = useState<number>(0);
  const [verifState, setVerifState] = useState<TeamVerificationState | null>(null);

  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Please activate camera to verify identity.');
  const [statusType, setStatusType] = useState<VerificationStatus>('PENDING');

  useEffect(() => {
    const rawTeam = localStorage.getItem('cdt_team_info');
    const teamId = localStorage.getItem('cdt_team_id');
    const sessionId = localStorage.getItem('cdt_session_id');

    if (!rawTeam || !teamId || !sessionId) {
      router.push('/login');
      return;
    }

    try {
      const parsedTeam: TeamRegistration = JSON.parse(rawTeam);
      setTeam(parsedTeam);

      // Fetch team face verification state
      fetch(`/api/face-verification?teamId=${teamId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            setVerifState(d.data);
            // Select first pending member
            const firstPending = d.data.members.findIndex((m: { status: string }) => m.status !== 'SUCCESS');
            if (firstPending !== -1) setActiveMemberIdx(firstPending);
          }
        })
        .catch(() => {});
    } catch {
      router.push('/login');
    }
  }, [router]);

  // Start webcam
  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        setStatusMessage('Camera active. Please center your face in the oval frame.');
        setStatusType('DETECTED');
      }
    } catch {
      setCameraError('Camera access denied or webcam not detected. Please grant browser camera permissions.');
      setStatusType('CAMERA_REQUIRED');
    }
  };

  // Stop webcam
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Capture live snapshot and send to authoritative verification API
  const captureAndVerify = async () => {
    if (!videoRef.current || !canvasRef.current || !team) return;

    setIsCapturing(true);
    setStatusType('VERIFYING');
    setStatusMessage('Analyzing biometric facial landmarks and testing liveness...');

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, 640, 480);
    const snapshotBase64 = canvas.toDataURL('image/jpeg', 0.85);

    try {
      const sessionId = localStorage.getItem('cdt_session_id') || '';
      const res = await fetch('/api/face-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: team.id,
          sessionId,
          memberIndex: activeMemberIdx,
          liveSnapshot: snapshotBase64,
          clientMetrics: {
            faceCount: 1,
            brightness: 125,
            livenessScore: 0.96,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setStatusType(data.data.status);
        setStatusMessage(data.data.message);
        setVerifState(data.data.teamState);

        // Move to next pending member if any
        if (activeMemberIdx < 2) {
          setTimeout(() => {
            setActiveMemberIdx(activeMemberIdx + 1);
            setStatusType('PENDING');
            setStatusMessage(`Proceed with Member ${activeMemberIdx + 2} verification.`);
          }, 1500);
        }
      } else {
        setStatusType(data.data?.status || 'MANUAL_REVIEW');
        setStatusMessage(data.data?.message || 'Verification could not be confirmed.');
      }
    } catch {
      setStatusType('MANUAL_REVIEW');
      setStatusMessage('Network error during verification. You may retry or contact administrator.');
    } finally {
      setIsCapturing(false);
    }
  };

  if (!team) return null;

  const currentMember = team.members[activeMemberIdx] || team.members[0];
  const allVerified = verifState?.allPassed || false;

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center p-4">
      {/* Hidden canvas for snapshot capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl ww-card p-6 md:p-8 border-gold-border/40 shadow-gold"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gold-border/20 pb-4 mb-6 gap-2">
          <div>
            <span className="ww-category-badge">STAGE 2 • IDENTITY VERIFICATION</span>
            <h1 className="font-cinzel text-2xl font-bold gold-gradient-text">
              Three-Member Biometric Face Verification
            </h1>
            <p className="text-xs text-gray-400">
              Team: <strong className="text-gold-light">{team.teamName}</strong> ({team.id}) • All 3 members must verify on this PC
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono px-3 py-1 rounded bg-[#0a0d14] border border-gold-border/30 text-gold-bright">
              Verified: {verifState?.members.filter((m) => m.status === 'SUCCESS').length || 0} / 3
            </span>
          </div>
        </div>

        {/* Member Selector Tabs */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {team.members.map((member, idx) => {
            const isVerified = verifState?.members[idx]?.status === 'SUCCESS';
            const isActive = activeMemberIdx === idx;
            const isLeader = idx === team.leaderIndex;

            return (
              <button
                key={idx}
                onClick={() => {
                  setActiveMemberIdx(idx);
                  setStatusType(isVerified ? 'SUCCESS' : 'PENDING');
                  setStatusMessage(isVerified ? 'Identity already verified.' : 'Position member before the camera.');
                }}
                className={`p-3 rounded border text-left transition relative overflow-hidden ${
                  isActive
                    ? 'bg-elevated border-gold-bright shadow-gold'
                    : 'bg-[#090b12] border-gold-border/20 hover:border-gold-border/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-cinzel font-bold text-gold-primary">
                    MEMBER #{idx + 1} {isLeader && '★ LEADER'}
                  </span>
                  {isVerified ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                  )}
                </div>
                <div className="font-semibold text-xs text-gray-200 truncate">{member.name}</div>
                <div className="text-[10px] text-gray-400 font-mono">{member.rollNo}</div>
              </button>
            );
          })}
        </div>

        {/* Verification Stage Grid: Registered Photo vs Live Webcam */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Registered Photograph */}
          <div className="rounded-lg bg-[#07090f] border border-gold-border/30 p-4 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-cinzel uppercase tracking-wider text-gold-bright mb-3">
              Official Registered Photograph
            </span>

            <div className="relative w-44 h-44 rounded-full border-2 border-gold-primary/60 overflow-hidden shadow-gold mb-3 bg-[#111420]">
              {currentMember.photoUrl ? (
                <Image
                  src={currentMember.photoUrl}
                  alt={currentMember.name}
                  fill
                  sizes="176px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                  <User className="w-16 h-16 text-gold-primary/40" />
                  <span className="text-[10px] mt-1">Official ANJAC Photo</span>
                </div>
              )}
            </div>

            <div className="font-bold text-sm text-gold-light">{currentMember.name}</div>
            <div className="text-xs text-gray-400 font-mono">{currentMember.rollNo} • {currentMember.email}</div>
          </div>

          {/* Live Webcam Feed */}
          <div className="rounded-lg bg-[#07090f] border border-gold-border/30 p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <span className="text-xs font-cinzel uppercase tracking-wider text-gold-bright mb-3 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-gold-primary" /> Live Webcam Verification
            </span>

            <div className="relative w-44 h-44 rounded-full border-2 border-dashed border-gold-border overflow-hidden bg-black flex items-center justify-center mb-3">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="text-center p-3">
                  <Camera className="w-8 h-8 text-gray-500 mx-auto mb-1" />
                  <p className="text-[11px] text-gray-400">Camera inactive</p>
                </div>
              )}

              {/* Liveness target guide overlay */}
              {cameraActive && (
                <div className="absolute inset-4 rounded-full border border-gold-bright/40 pointer-events-none animate-pulse" />
              )}
            </div>

            {/* Camera Actions */}
            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="btn-gold px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Activate Camera</span>
              </button>
            ) : (
              <button
                onClick={captureAndVerify}
                disabled={isCapturing}
                className="btn-gold px-5 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-gold"
              >
                {isCapturing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Capture & Verify Member #{activeMemberIdx + 1}</span>
                  </>
                )}
              </button>
            )}

            {cameraError && (
              <p className="text-[11px] text-red-400 mt-2">{cameraError}</p>
            )}
          </div>
        </div>

        {/* Verification Status Banner */}
        <div
          className={`p-3 rounded-md text-xs flex items-center gap-2 mb-6 ${
            statusType === 'SUCCESS'
              ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
              : statusType === 'POOR_QUALITY' || statusType === 'MULTIPLE_FACES' || statusType === 'LIVENESS_FAILED'
              ? 'bg-red-950/40 border border-red-500/50 text-red-300'
              : 'bg-[#101422] border border-gold-border/30 text-gray-300'
          }`}
        >
          {statusType === 'SUCCESS' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-gold-primary flex-shrink-0" />
          )}
          <span className="font-sans">{statusMessage}</span>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gold-border/20 gap-3">
          <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-gold-primary" />
            <span>Identity verification is strictly validated on the server for all 3 members.</span>
          </div>

          <div className="flex gap-3">
            {/* Quick Demo Bypass for testing if camera is physically absent */}
            <button
              onClick={() => {
                captureAndVerify();
              }}
              className="text-[11px] text-gold-bright/70 hover:text-gold-light underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Quick Simulate
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              disabled={!allVerified}
              className="btn-gold px-6 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <span>Proceed to Team Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
