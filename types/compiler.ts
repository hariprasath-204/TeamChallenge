export type SupportedLanguage = 'cpp' | 'java';

export interface ExecutionJob {
  id: string;
  teamId: string;
  language: SupportedLanguage;
  sourceCode: string;
  stdin: string;
  isSubmission: boolean;
  priority: number; // 1 for submission, 2 for regular run
  queuedAt: number;
  startedAt?: number;
  completedAt?: number;
  status: 'QUEUED' | 'WAITING_FOR_COMPILER' | 'PROCESSING' | 'COMPILING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'TIMED_OUT';
}

export interface CompilerResult {
  jobId: string;
  status: 'COMPLETED' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR' | 'TIMEOUT' | 'ERROR';
  stdout: string;
  stderr: string;
  compileOutput: string;
  exitCode: number;
  executionTimeMs: number;
  memoryUsageKb?: number;
}
