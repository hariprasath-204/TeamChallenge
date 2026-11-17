'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-900/30 border border-red-500/40 flex items-center justify-center mb-4 text-red-400">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="font-cinzel text-2xl font-bold text-red-200 mb-2">Portal Connection Disrupted</h1>
      <p className="text-gray-400 max-w-lg text-sm mb-6">
        {error.message || 'An unexpected operational error occurred while rendering the examination view.'}
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="btn-gold inline-flex items-center gap-2 px-6 py-2.5 rounded text-sm uppercase tracking-wider"
        >
          <RefreshCw className="w-4 h-4" /> Safe Retry
        </button>
        <button
          onClick={() => (window.location.href = '/login')}
          className="px-6 py-2.5 rounded border border-gold-border/50 text-gold-bright hover:bg-gold-border/20 text-sm tracking-wider"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
