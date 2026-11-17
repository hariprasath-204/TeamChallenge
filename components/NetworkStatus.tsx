'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs">
        <Wifi className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-mono text-[11px] font-semibold tracking-wide">ONLINE</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/70 border border-red-500/60 text-red-300 text-xs animate-pulse">
      <WifiOff className="w-3.5 h-3.5 text-red-400" />
      <span className="font-mono text-[11px] font-semibold tracking-wide">CONNECTION LOST</span>
    </div>
  );
}
