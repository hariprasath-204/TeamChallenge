export type EvaluationStatus =
  | 'PENDING'
  | 'EVALUATING'
  | 'ALL_PASSED'
  | 'SOME_FAILED'
  | 'COMPILATION_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIME_LIMIT_EXCEEDED'
  | 'EVALUATION_FAILED';

export interface SubmissionRecord {
  submissionId: string;
  teamId: string;
  teamName: string;
  leaderName: string;
  submittedBy: string;
  language: 'cpp' | 'java';
  sourceCode: string;
  submittedAt: number;
  evaluationStatus: EvaluationStatus;
  passedTestsCount: number;
  totalTestsCount: number;
  internalScore: number;
  evaluatorLogs?: string[];
}
