'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center p-4">
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-full border-2 border-gold-border animate-ping absolute inset-0" />
        <div className="w-16 h-16 rounded-full border-2 border-t-gold-bright border-b-gold-primary border-l-transparent border-r-transparent animate-spin flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-gold-bright animate-spin" />
        </div>
      </div>
      <h3 className="font-cinzel text-lg tracking-wider text-gold-bright font-bold">CODATHAN 2K27</h3>
      <p className="text-xs text-gray-400 mt-1">Establishing secure connection...</p>
    </div>
  );
}
