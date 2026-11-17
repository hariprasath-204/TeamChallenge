'use client';

import React, { useState } from 'react';
import { QuestionData } from '@/types/examination';
import { DynamicWatermark } from './DynamicWatermark';
import { Copy, Check, Clock, Cpu, Award } from 'lucide-react';

interface Props {
  question: QuestionData;
  watermarkText?: string;
  watermarkOpacity?: number;
  watermarkEnabled?: boolean;
}

export function QuestionPanel({
  question,
  watermarkText,
  watermarkOpacity = 0.055,
  watermarkEnabled = true,
}: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="relative h-full flex flex-col bg-surface border-r border-gold-border/30 overflow-hidden select-text">
      {/* Participant-Specific Dynamic Watermark Overlay (Only covers question area) */}
      {watermarkEnabled && (
        <DynamicWatermark
          text={watermarkText}
          opacity={watermarkOpacity}
          fontSize={13}
          angle={-25}
          spacingX={320}
          spacingY={160}
        />
      )}

      {/* Header */}
      <div className="p-4 border-b border-gold-border/20 bg-[#0c0e15]/90 backdrop-blur z-20 flex-shrink-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[10px] uppercase tracking-widest font-cinzel text-gold-primary border-b border-gold-primary/40 pb-0.5">
            {question.category}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-gold-border/10 text-gold-bright border border-gold-border/30">
            <Award className="w-3 h-3 text-gold-bright" />
            {question.difficulty}
          </span>
        </div>

        <h2 className="font-cinzel text-xl font-bold gold-gradient-text tracking-wide">
          {question.title}
        </h2>

        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 font-mono">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gold-primary" /> {question.timeLimitSec}s Limit
          </span>
          <span className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-gold-primary" /> {question.memoryLimitMb}MB RAM
          </span>
        </div>
      </div>

      {/* Scrollable Question Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm text-gray-200 z-20 leading-relaxed">
        {/* Description */}
        <section>
          <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-gold-bright mb-2">
            Problem Description
          </h3>
          <div className="whitespace-pre-line text-gray-300 font-sans leading-relaxed text-[13.5px]">
            {question.description}
          </div>
        </section>

        {/* Input Format */}
        <section className="p-3.5 rounded bg-elevated/80 border border-gold-border/20">
          <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-gold-bright mb-1.5">
            Input Format
          </h3>
          <div className="text-xs text-gray-300 whitespace-pre-line leading-relaxed font-sans">
            {question.inputFormat}
          </div>
        </section>

        {/* Output Format */}
        <section className="p-3.5 rounded bg-elevated/80 border border-gold-border/20">
          <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-gold-bright mb-1.5">
            Output Format
          </h3>
          <div className="text-xs text-gray-300 whitespace-pre-line leading-relaxed font-sans">
            {question.outputFormat}
          </div>
        </section>

        {/* Constraints */}
        <section>
          <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-gold-bright mb-2">
            Constraints
          </h3>
          <ul className="space-y-1 text-xs font-mono text-gray-300 list-disc list-inside bg-elevated/40 p-3 rounded border border-gold-border/10">
            {question.constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </section>

        {/* Sample Test Cases */}
        <section className="space-y-4">
          <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-gold-bright">
            Sample Cases
          </h3>

          {question.sampleCases.map((tc, idx) => (
            <div key={tc.id} className="rounded border border-gold-border/30 bg-[#0a0d14] overflow-hidden text-xs">
              <div className="bg-elevated px-3 py-1.5 border-b border-gold-border/20 flex items-center justify-between text-gold-light font-mono text-[11px]">
                <span>Sample #{idx + 1}</span>
                <span className="text-gray-400 text-[10px]">Standard IO</span>
              </div>

              <div className="p-3 space-y-3">
                {/* Input */}
                <div>
                  <div className="flex items-center justify-between text-gray-400 text-[11px] mb-1">
                    <span>Input:</span>
                    <button
                      onClick={() => copyToClipboard(tc.input, `in-${tc.id}`)}
                      className="text-gray-400 hover:text-gold-bright inline-flex items-center gap-1"
                      title="Copy sample input"
                    >
                      {copiedId === `in-${tc.id}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="p-2 rounded bg-[#06070a] border border-gold-border/15 font-mono text-[12px] text-emerald-300 overflow-x-auto whitespace-pre">
                    {tc.input}
                  </pre>
                </div>

                {/* Output */}
                <div>
                  <div className="text-gray-400 text-[11px] mb-1">Expected Output:</div>
                  <pre className="p-2 rounded bg-[#06070a] border border-gold-border/15 font-mono text-[12px] text-gold-bright overflow-x-auto whitespace-pre">
                    {tc.expectedOutput}
                  </pre>
                </div>

                {/* Explanation */}
                {tc.explanation && (
                  <div className="text-[11.5px] text-gray-400 italic pt-1 border-t border-gray-800">
                    <strong className="text-gold-primary not-italic">Explanation: </strong>
                    {tc.explanation}
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Important Examination Note */}
        <div className="p-3 rounded bg-amber-950/20 border border-amber-600/30 text-amber-200/80 text-[11.5px]">
          <strong className="text-amber-300 font-cinzel">Important: </strong>
          Hidden test cases evaluate boundary cases, negative values, and large inputs. Make sure to adhere to time constraints.
        </div>
      </div>
    </div>
  );
}
