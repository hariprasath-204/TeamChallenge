'use client';

import React, { useState } from 'react';
import { Terminal, Play, Loader2, ChevronUp, ChevronDown, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { CompilerResult } from '@/types/compiler';

interface Props {
  customInput: string;
  onCustomInputChange: (val: string) => void;
  onRunCode: () => void;
  isRunning: boolean;
  queueStatusText?: string;
  result: CompilerResult | null;
}

type TabType = 'input' | 'output' | 'errors' | 'details';

export function InputOutputConsole({
  customInput,
  onCustomInputChange,
  onRunCode,
  isRunning,
  queueStatusText,
  result,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('output');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <div className={`flex flex-col bg-[#080a10] border-t border-gold-border/30 transition-all duration-300 ${isExpanded ? 'h-52' : 'h-10'}`}>
      {/* Console Top Bar */}
      <div className="h-10 px-4 bg-[#0d101a] border-b border-gold-border/20 flex items-center justify-between text-xs select-none flex-shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-gold-bright font-cinzel font-semibold hover:text-gold-light pr-2 border-r border-gold-border/20 mr-1"
          >
            <Terminal className="w-4 h-4 text-gold-primary" />
            <span>CONSOLE</span>
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

          {isExpanded && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('input')}
                className={`px-3 py-1 rounded text-xs transition ${
                  activeTab === 'input'
                    ? 'bg-elevated text-gold-bright border border-gold-border/30 font-medium'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Custom Input
              </button>
              <button
                onClick={() => setActiveTab('output')}
                className={`px-3 py-1 rounded text-xs transition flex items-center gap-1 ${
                  activeTab === 'output'
                    ? 'bg-elevated text-gold-bright border border-gold-border/30 font-medium'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <span>Output</span>
                {result && result.status === 'COMPLETED' && (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                )}
                {result && result.status !== 'COMPLETED' && (
                  <XCircle className="w-3 h-3 text-red-400" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('errors')}
                className={`px-3 py-1 rounded text-xs transition flex items-center gap-1 ${
                  activeTab === 'errors'
                    ? 'bg-elevated text-gold-bright border border-gold-border/30 font-medium'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <span>Compiler Errors</span>
                {result && (result.stderr || result.status === 'COMPILATION_ERROR') && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`px-3 py-1 rounded text-xs transition ${
                  activeTab === 'details'
                    ? 'bg-elevated text-gold-bright border border-gold-border/30 font-medium'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Execution Details
              </button>
            </div>
          )}
        </div>

        {/* Right side: RUN Button & Queue Indicator */}
        <div className="flex items-center gap-3">
          {isRunning && queueStatusText && (
            <span className="text-[11px] font-mono text-gold-bright flex items-center gap-1.5 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-primary" />
              {queueStatusText}
            </span>
          )}

          <button
            onClick={() => {
              if (!isExpanded) setIsExpanded(true);
              setActiveTab('output');
              onRunCode();
            }}
            disabled={isRunning}
            className="btn-gold flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-semibold uppercase tracking-wider"
            title="Execute code in sandbox against custom input"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>RUN CODE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {isExpanded && (
        <div className="flex-1 p-3 overflow-y-auto bg-[#06070a] text-xs font-mono select-text">
          {activeTab === 'input' && (
            <div className="h-full flex flex-col">
              <div className="text-[11px] text-gray-400 mb-1">
                Enter custom standard input (stdin) for your program:
              </div>
              <textarea
                value={customInput}
                onChange={(e) => onCustomInputChange(e.target.value)}
                placeholder="Example:&#10;3 3&#10;1 2 -1&#10;-2 4 2&#10;1 2 3"
                className="w-full flex-1 p-2 bg-[#0c0e15] border border-gold-border/20 rounded text-emerald-300 font-mono text-xs resize-none focus:outline-none focus:border-gold-primary"
                spellCheck={false}
              />
            </div>
          )}

          {activeTab === 'output' && (
            <div className="h-full">
              {isRunning ? (
                <div className="flex items-center gap-2 text-gold-bright/80 p-4">
                  <Loader2 className="w-4 h-4 animate-spin text-gold-primary" />
                  <span>Processing program through concurrent execution queue...</span>
                </div>
              ) : result ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 border-b border-gray-800 pb-1">
                    <span>Program Output (stdout):</span>
                    <span className="text-emerald-400">Exit Code: {result.exitCode}</span>
                  </div>
                  <pre className="p-2 rounded bg-[#0b0e17] border border-gold-border/10 text-emerald-300 text-xs overflow-x-auto whitespace-pre">
                    {result.stdout || '(Program completed with no output printed)'}
                  </pre>
                </div>
              ) : (
                <div className="text-gray-500 italic p-3">
                  Click &apos;RUN CODE&apos; to compile and execute your solution. Output will appear here.
                </div>
              )}
            </div>
          )}

          {activeTab === 'errors' && (
            <div className="h-full">
              {result && (result.stderr || result.compileOutput || result.status === 'COMPILATION_ERROR') ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-red-400 font-semibold border-b border-red-900/30 pb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Compiler Diagnostics / Error Trace:</span>
                  </div>
                  <pre className="p-2.5 rounded bg-red-950/20 border border-red-500/30 text-red-300 text-xs overflow-x-auto whitespace-pre">
                    {result.stderr || result.compileOutput}
                  </pre>
                </div>
              ) : (
                <div className="text-gray-500 italic p-3">
                  No compiler warnings or runtime errors reported.
                </div>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-2 text-xs">
              {result ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-2 rounded bg-elevated border border-gold-border/15">
                    <span className="text-gray-400 text-[10px] block">Status</span>
                    <span className="font-bold text-gold-bright">{result.status}</span>
                  </div>
                  <div className="p-2 rounded bg-elevated border border-gold-border/15">
                    <span className="text-gray-400 text-[10px] block">Execution Time</span>
                    <span className="font-bold text-emerald-400">{result.executionTimeMs} ms</span>
                  </div>
                  <div className="p-2 rounded bg-elevated border border-gold-border/15">
                    <span className="text-gray-400 text-[10px] block">Memory Footprint</span>
                    <span className="font-bold text-cyan-400">{result.memoryUsageKb ? `${result.memoryUsageKb} KB` : 'Standard Sandbox'}</span>
                  </div>
                  <div className="p-2 rounded bg-elevated border border-gold-border/15">
                    <span className="text-gray-400 text-[10px] block">Exit Code</span>
                    <span className="font-bold text-gray-200">{result.exitCode}</span>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 italic p-3">Run code to inspect execution metrics.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
