'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, CheckCircle2, Loader2, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  language: string;
  isSubmitting: boolean;
}

export function SubmitModal({
  isOpen,
  onClose,
  onSubmit,
  teamName,
  leaderName,
  leaderEmail,
  language,
  isSubmitting,
}: Props) {
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-[#0e121d] border border-gold-border rounded-lg shadow-gold-lg overflow-hidden p-6"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon & Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-cinzel text-lg font-bold text-gold-bright">
                FINAL SUBMISSION CONFIRMATION
              </h3>
              <p className="text-xs text-gray-400">CODATHAN 2K27 Grand Final Round</p>
            </div>
          </div>

          {/* Warning Message */}
          <div className="p-3.5 rounded bg-amber-950/20 border border-amber-600/30 text-amber-200/90 text-xs mb-4 leading-relaxed">
            <strong className="block text-amber-300 font-semibold mb-1">
              ARE YOU SURE YOU WANT TO SUBMIT YOUR FINAL SOLUTION?
            </strong>
            After final submission, you cannot edit or resubmit your solution unless explicitly authorized by the event administrator.
          </div>

          {/* Submission Details */}
          <div className="space-y-2 text-xs bg-void p-3 rounded border border-gold-border/20 mb-4 font-mono">
            <div className="flex justify-between">
              <span className="text-gray-400">Team:</span>
              <span className="text-gold-light font-semibold">{teamName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Registered Leader:</span>
              <span className="text-gold-light font-semibold">{leaderName} ({leaderEmail})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Submitted Language:</span>
              <span className="text-emerald-400 uppercase font-semibold">{language}</span>
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-2.5 text-xs text-gray-300 select-none cursor-pointer mb-6">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              disabled={isSubmitting}
              className="mt-0.5 rounded border-gold-border/40 text-gold-primary focus:ring-gold-primary"
            />
            <span>
              I confirm that I am the registered team leader, and all 3 team members agree to lock this final solution.
            </span>
          </label>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded text-xs border border-gray-700 hover:bg-gray-800 text-gray-300"
            >
              Cancel & Continue Editing
            </button>
            <button
              onClick={onSubmit}
              disabled={!confirmed || isSubmitting}
              className="btn-gold flex items-center gap-1.5 px-6 py-2 rounded text-xs font-bold uppercase tracking-wider"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating Solution...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Final Submission</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
