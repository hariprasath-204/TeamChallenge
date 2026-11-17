'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Code, Users, Clock, Terminal, ArrowRight, Lock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-void flex flex-col justify-between p-6 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gold-primary/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Navigation Top Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4 border-b border-gold-border/20 z-10">
        <div className="flex items-center gap-2">
          <span className="font-cinzel text-xl font-black gold-gradient-text">CODATHAN 2K27</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-cinzel">
          <Link
            href="/admin/login"
            className="text-gray-400 hover:text-gold-bright flex items-center gap-1.5 transition"
          >
            <Lock className="w-3.5 h-3.5 text-gold-primary" /> Admin Portal
          </Link>
          <Link
            href="/login"
            className="btn-gold px-4 py-1.5 rounded text-xs font-bold tracking-wider uppercase"
          >
            Participant Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl w-full mx-auto text-center my-auto py-12 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="ww-category-badge mb-3">AYYA NADAR JANAKI AMMAL COLLEGE (AUTONOMOUS)</span>
          <h1 className="font-cinzel text-4xl md:text-6xl font-extrabold gold-gradient-text tracking-wide mb-4">
            CODATHAN 2K27
          </h1>
          <p className="font-playfair text-xl md:text-2xl text-gold-light/90 italic mb-3">
            Secure Online Coding Examination & Competition Platform
          </p>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto mb-8 font-sans leading-relaxed">
            Organized by the Department of Computer Applications (UG & PG), Sivakasi, Tamil Nadu.
            Featuring three-member team verification, one-PC enforcement, dynamic watermark protection, and real-time execution in C++ and Java.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/login"
              className="btn-gold px-8 py-3.5 rounded text-sm font-bold uppercase tracking-wider flex items-center gap-2 shadow-gold"
            >
              <Terminal className="w-4 h-4 fill-current" />
              <span>Enter Coding Examination</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/admin/login"
              className="px-6 py-3.5 rounded border border-gold-border/40 hover:bg-gold-border/10 text-gold-bright text-sm font-semibold tracking-wider flex items-center gap-2 transition"
            >
              <Lock className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </Link>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
            <div className="p-4 rounded bg-[#0b0e17] border border-gold-border/20">
              <Users className="w-5 h-5 text-gold-primary mb-2" />
              <h3 className="font-cinzel text-xs font-bold text-gold-bright mb-1">Golden Trio</h3>
              <p className="text-[11px] text-gray-400">
                Exactly 3 members per team with individual face verification.
              </p>
            </div>

            <div className="p-4 rounded bg-[#0b0e17] border border-gold-border/20">
              <Shield className="w-5 h-5 text-gold-primary mb-2" />
              <h3 className="font-cinzel text-xs font-bold text-gold-bright mb-1">One-PC Lock</h3>
              <p className="text-[11px] text-gray-400">
                Atomic single workstation locking prevents multi-device login.
              </p>
            </div>

            <div className="p-4 rounded bg-[#0b0e17] border border-gold-border/20">
              <Code className="w-5 h-5 text-gold-primary mb-2" />
              <h3 className="font-cinzel text-xs font-bold text-gold-bright mb-1">C++ & Java</h3>
              <p className="text-[11px] text-gray-400">
                Monaco Editor with concurrent compilation queue for ~34 teams.
              </p>
            </div>

            <div className="p-4 rounded bg-[#0b0e17] border border-gold-border/20">
              <Clock className="w-5 h-5 text-gold-primary mb-2" />
              <h3 className="font-cinzel text-xs font-bold text-gold-bright mb-1">120-Min Timer</h3>
              <p className="text-[11px] text-gray-400">
                Server-authoritative timer resilient to refreshes and reboots.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center py-4 border-t border-gold-border/20 text-xs text-gray-500 font-sans z-10">
        © 2027 Ayya Nadar Janaki Ammal College (Autonomous), Sivakasi. Codathon 2K27 Championship.
      </footer>
    </div>
  );
}
