'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-500/30 rounded bg-red-950/20 text-red-200 text-xs flex flex-col items-center justify-center min-h-[160px] text-center">
          <AlertCircle className="w-6 h-6 text-red-400 mb-2" />
          <p className="font-semibold">{this.props.fallbackTitle || 'Component Encountered an Issue'}</p>
          <p className="text-gray-400 text-[11px] mt-1 max-w-sm">
            {this.state.error?.message || 'A safe fallback has been rendered to protect examination integrity.'}
          </p>
          <button
            onClick={this.handleReset}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-red-900/40 hover:bg-red-800/50 border border-red-700/50 rounded text-red-100 text-xs transition"
          >
            <RefreshCw className="w-3 h-3" /> Retry Component
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
