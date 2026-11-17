'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Award, Clock, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';

interface Props {
  title: string;
  message: string;
  submissionId: string;
  teamName: string;
  allPassed: boolean;
}

export function CompletionView({
  title,
  message,
  submissionId,
  teamName,
  allPassed,
}: Props) {
  useEffect(() => {
    if (allPassed) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#c5a059', '#e7ca7a', '#ffffff', '#740001'],
        });
      } catch {
        // Safe canvas fallback
      }
    }
  }, [allPassed]);

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute w-[600px] h-[600px] bg-gold-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-xl ww-card p-8 text-center border-gold-border/40 shadow-gold-lg relative"
      >
        {/* Animated Checkmark / Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-gradient-to-tr from-gold-dark via-gold-primary to-gold-bright text-void shadow-gold"
        >
          {allPassed ? (
            <Award className="w-10 h-10" />
          ) : (
            <CheckCircle2 className="w-10 h-10" />
          )}
        </motion.div>

        {/* Dynamic Title (NO MARKS) */}
        <h1 className="font-cinzel text-2xl md:text-3xl font-extrabold gold-gradient-text tracking-wide mb-3">
          {title}
        </h1>

        <div className="inline-block px-3 py-1 rounded-full bg-gold-border/10 border border-gold-border/30 text-gold-bright text-xs font-mono mb-6">
          Team: {teamName} • Ref: {submissionId}
        </div>

        {/* Official Participant Message (CONFIDENTIAL EVALUATION ENFORCED) */}
        <div className="text-sm text-gray-300 font-sans leading-relaxed whitespace-pre-line mb-8 max-w-md mx-auto">
          {message}
        </div>

        {/* Institution / Event Seal */}
        <div className="pt-6 border-t border-gold-border/20 text-xs text-gray-400 font-cinzel space-y-1">
          <p className="font-semibold text-gold-light">AYYA NADAR JANAKI AMMAL COLLEGE (AUTONOMOUS)</p>
          <p className="text-[11px] text-gray-400">Department of Computer Applications (UG & PG) • Sivakasi</p>
          <p className="text-[10px] text-gold-primary/80 pt-1 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" /> Official Event Record Safely Preserved
          </p>
        </div>

        {/* Return Button */}
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-2 rounded bg-elevated hover:bg-[#1c2233] border border-gold-border/30 text-gold-bright text-xs font-semibold tracking-wider transition"
          >
            <span>Return to Team Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
