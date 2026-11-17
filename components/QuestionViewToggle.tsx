'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Code2, Eye } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  viewCount: number;
}

export function QuestionViewToggle({ isOpen, onToggle, viewCount }: Props) {
  return (
    <div className="flex items-center gap-3">
      {/* Unlimited Question View Counter Badge */}
      <div
        className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#131722] border border-gold-border/40 text-gold-bright text-xs select-none"
        title="Unlimited Question Views permitted without penalty"
      >
        <Eye className="w-3.5 h-3.5 text-gold-primary" />
        <span className="font-mono font-medium">Question Views: {viewCount}</span>
      </div>

      {/* Unique Animated VIEW QUESTION Button */}
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`relative group flex items-center gap-2 px-4 py-1.5 rounded text-xs font-cinzel font-bold tracking-wider transition-all duration-300 border shadow-md ${
          isOpen
            ? 'bg-gradient-to-r from-gold-dark via-gold-primary to-gold-bright text-void border-gold-bright shadow-gold'
            : 'bg-[#131722] text-gold-bright border-gold-border hover:border-gold-bright hover:shadow-gold'
        }`}
        title={isOpen ? 'Collapse Question Panel to enter Focus Editor Mode' : 'Open Question Panel'}
      >
        <motion.div
          animate={{ rotate: isOpen ? 0 : 360 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {isOpen ? <Code2 className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
        </motion.div>

        <span>{isOpen ? 'FOCUS EDITOR MODE' : 'VIEW QUESTION'}</span>

        {/* Subtle glowing animated border effect */}
        <span className="absolute -inset-0.5 rounded bg-gradient-to-r from-gold-primary to-gold-bright opacity-0 group-hover:opacity-30 blur transition duration-300 -z-10" />
      </motion.button>
    </div>
  );
}
