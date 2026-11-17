export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isSample: boolean;
  explanation?: string;
  weight: number;
}

export interface QuestionData {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  timeLimitSec: number;
  memoryLimitMb: number;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  sampleCases: TestCase[];
  hiddenCases?: TestCase[]; // Backend only, never leaked to participant frontend
  status: 'DRAFT' | 'PUBLISHED';
}

export type ExamStatus = 'NOT_STARTED' | 'WAITING' | 'READY' | 'ACTIVE' | 'SUBMITTED' | 'TIME_EXPIRED' | 'COMPLETED';

export interface ExamSessionState {
  examId: string;
  teamId: string;
  startTime: number | null;
  durationMs: number; // 120 * 60 * 1000 = 7200000 ms
  deadline: number | null;
  status: ExamStatus;
  questionViewsCount: number;
  currentLanguage: 'cpp' | 'java';
  currentCode: string;
  lastSavedAt: number;
}
