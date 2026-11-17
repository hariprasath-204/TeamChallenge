'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-gold-border/20 border border-gold-border flex items-center justify-center mb-4 text-gold-bright">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="font-cinzel text-3xl font-bold gold-gradient-text mb-2">404 - Chamber Not Found</h1>
      <p className="text-gray-400 max-w-md text-sm mb-6">
        The competition portal route you attempted to access does not exist or has been restricted by event rules.
      </p>
      <Link
        href="/login"
        className="btn-gold inline-flex items-center gap-2 px-6 py-2.5 rounded text-sm uppercase tracking-wider"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Login
      </Link>
    </div>
  );
}
