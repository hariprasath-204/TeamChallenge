'use client';

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { SupportedLanguage } from '@/types/compiler';
import { Code, RotateCcw, ZoomIn, ZoomOut, Sparkles } from 'lucide-react';
import { STARTERS } from '@/lib/examStore';

interface Props {
  code: string;
  language: SupportedLanguage;
  onCodeChange: (newCode: string) => void;
  onLanguageChange: (newLang: SupportedLanguage) => void;
  readOnly?: boolean;
}

export function MonacoEditorComponent({
  code,
  language,
  onCodeChange,
  onLanguageChange,
  readOnly = false,
}: Props) {
  const [fontSize, setFontSize] = useState<number>(14);
  const [editorLoadError, setEditorLoadError] = useState<boolean>(false);

  const handleResetToStarter = () => {
    if (confirm(`Reset ${language.toUpperCase()} code back to the default starter template? Current unsaved edits will be replaced.`)) {
      onCodeChange(STARTERS[language]);
    }
  };

  const increaseFont = () => setFontSize((prev) => Math.min(22, prev + 1));
  const decreaseFont = () => setFontSize((prev) => Math.max(12, prev - 1));

  return (
    <div className="h-full flex flex-col bg-[#0b0e17] border-l border-gold-border/20 overflow-hidden">
      {/* Editor Top Bar */}
      <div className="h-10 px-4 bg-[#0e121d] border-b border-gold-border/20 flex items-center justify-between text-xs flex-shrink-0">
        {/* Language selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-gold-bright font-cinzel font-semibold">
            <Code className="w-4 h-4 text-gold-primary" />
            <span>LANGUAGE:</span>
          </div>
          <div className="flex rounded bg-[#06070a] p-0.5 border border-gold-border/30">
            <button
              onClick={() => onLanguageChange('cpp')}
              className={`px-3 py-1 rounded text-xs font-mono font-medium transition ${
                language === 'cpp'
                  ? 'bg-gradient-to-r from-gold-dark to-gold-primary text-void font-bold shadow'
                  : 'text-gray-400 hover:text-gold-light'
              }`}
            >
              C++ (GCC)
            </button>
            <button
              onClick={() => onLanguageChange('java')}
              className={`px-3 py-1 rounded text-xs font-mono font-medium transition ${
                language === 'java'
                  ? 'bg-gradient-to-r from-gold-dark to-gold-primary text-void font-bold shadow'
                  : 'text-gray-400 hover:text-gold-light'
              }`}
            >
              Java (OpenJDK)
            </button>
          </div>
        </div>

        {/* Editor controls */}
        <div className="flex items-center gap-2 text-gray-400">
          <div className="flex items-center gap-1 bg-[#06070a] px-2 py-0.5 rounded border border-gold-border/20 font-mono text-[11px]">
            <button onClick={decreaseFont} className="hover:text-gold-bright p-1" title="Decrease font size">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span>{fontSize}px</span>
            <button onClick={increaseFont} className="hover:text-gold-bright p-1" title="Increase font size">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleResetToStarter}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#06070a] hover:bg-gold-border/20 hover:text-gold-bright border border-gold-border/20 text-[11px] transition"
            title="Reset to default starter code"
          >
            <RotateCcw className="w-3 h-3" /> Starter
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 relative overflow-hidden bg-[#0a0d14]">
        {editorLoadError ? (
          // Safe basic textarea fallback if Monaco encounters an issue
          <div className="h-full flex flex-col p-2">
            <div className="text-[11px] text-amber-300 p-2 bg-amber-950/40 border border-amber-600/30 rounded mb-2 flex items-center justify-between">
              <span>Monaco CDN fallback active. Source code editing remains completely functional.</span>
              <button
                onClick={() => setEditorLoadError(false)}
                className="underline text-gold-bright"
              >
                Retry Monaco
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              className="w-full flex-1 p-4 bg-[#06070a] text-emerald-300 font-mono text-sm border border-gold-border/30 rounded resize-none focus:outline-none focus:border-gold-primary"
              spellCheck={false}
            />
          </div>
        ) : (
          <Editor
            height="100%"
            language={language === 'cpp' ? 'cpp' : 'java'}
            value={code}
            theme="vs-dark"
            onChange={(val) => onCodeChange(val || '')}
            onMount={() => {
              // Monaco mounted successfully
            }}
            loading={
              <div className="h-full flex items-center justify-center text-xs text-gold-bright gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-gold-primary" />
                <span>Initializing Monaco Code Editor...</span>
              </div>
            }
            options={{
              fontSize,
              minimap: { enabled: true, maxColumn: 80 },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 4,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
              fontLigatures: true,
              readOnly,
              lineNumbers: 'on',
              folding: true,
              bracketPairColorization: { enabled: true },
              suggestOnTriggerCharacters: true,
              renderWhitespace: 'selection',
            }}
          />
        )}
      </div>
    </div>
  );
}
