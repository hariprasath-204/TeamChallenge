import { SubmissionRecord, EvaluationStatus } from '@/types/submission';
import { OFFICIAL_QUESTION, ExamStore } from './examStore';
import { CompilerService } from './compilerService';
import { TeamStore } from './teamStore';
import crypto from 'crypto';

declare global {
  // eslint-disable-next-line no-var
  var __codathon_submissions: Map<string, SubmissionRecord> | undefined;
}

if (!global.__codathon_submissions) {
  global.__codathon_submissions = new Map<string, SubmissionRecord>();
}

const submissionsMap = global.__codathon_submissions;

export const EvaluationService = {
  /**
   * Final Submission by Leader
   */
  async submitSolution(
    teamId: string,
    submittedByEmail: string,
    language: 'cpp' | 'java',
    sourceCode: string
  ): Promise<{
    success: boolean;
    submissionId?: string;
    message?: string;
    evaluationStatus?: EvaluationStatus;
  }> {
    const normTeamId = teamId.toUpperCase().trim();
    const team = TeamStore.getById(normTeamId);

    if (!team) {
      return { success: false, message: 'Team registration not found.' };
    }

    // 1. Verify that submittedBy is the registered team leader
    const isLeader =
      team.leaderEmail.toLowerCase().trim() === submittedByEmail.toLowerCase().trim() ||
      team.members[team.leaderIndex]?.email.toLowerCase().trim() === submittedByEmail.toLowerCase().trim();

    if (!isLeader) {
      return {
        success: false,
        message: 'Only the registered team leader is authorized to submit the final solution.',
      };
    }

    // 2. Prevent duplicate final submissions if already passed or locked
    const existing = submissionsMap.get(normTeamId);
    if (existing && existing.evaluationStatus !== 'PENDING') {
      return {
        success: false,
        message: 'Your team has already completed and locked its final submission.',
      };
    }

    // 3. Check exam deadline
    const examSession = ExamStore.getOrCreateSession(normTeamId);
    if (examSession.deadline && Date.now() > examSession.deadline) {
      return {
        success: false,
        message: 'The examination time has expired. Submissions are no longer accepted.',
      };
    }

    // 4. Create submission record
    const submissionId = `SUB_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    const record: SubmissionRecord = {
      submissionId,
      teamId: normTeamId,
      teamName: team.teamName,
      leaderName: team.leaderName,
      submittedBy: submittedByEmail,
      language,
      sourceCode,
      submittedAt: Date.now(),
      evaluationStatus: 'EVALUATING',
      passedTestsCount: 0,
      totalTestsCount: OFFICIAL_QUESTION.hiddenCases?.length || 0,
      internalScore: 0,
      evaluatorLogs: [],
    };

    submissionsMap.set(normTeamId, record);
    ExamStore.markSubmitted(normTeamId);

    // 5. Backend Evaluation against hidden test cases
    try {
      const evaluationResult = await this.evaluateHiddenCases(language, sourceCode);
      record.evaluationStatus = evaluationResult.status;
      record.passedTestsCount = evaluationResult.passedTests;
      record.totalTestsCount = evaluationResult.totalTests;
      record.internalScore = evaluationResult.internalScore;
      record.evaluatorLogs = evaluationResult.logs;
      submissionsMap.set(normTeamId, record);

      return {
        success: true,
        submissionId,
        evaluationStatus: record.evaluationStatus,
      };
    } catch {
      record.evaluationStatus = 'EVALUATION_FAILED';
      submissionsMap.set(normTeamId, record);
      return {
        success: true,
        submissionId,
        evaluationStatus: 'EVALUATION_FAILED',
      };
    }
  },

  /**
   * Internal authoritative evaluation against all hidden test cases.
   */
  async evaluateHiddenCases(
    language: 'cpp' | 'java',
    sourceCode: string
  ): Promise<{
    status: EvaluationStatus;
    passedTests: number;
    totalTests: number;
    internalScore: number;
    logs: string[];
  }> {
    const hiddenCases = OFFICIAL_QUESTION.hiddenCases || [];
    let passedCount = 0;
    let totalScore = 0;
    const logs: string[] = [];

    // First syntax check
    if (language === 'cpp' && !sourceCode.includes('main')) {
      return {
        status: 'COMPILATION_ERROR',
        passedTests: 0,
        totalTests: hiddenCases.length,
        internalScore: 0,
        logs: ['Syntax verification failed: missing main function.'],
      };
    }

    if (language === 'java' && (!sourceCode.includes('class') || !sourceCode.includes('main'))) {
      return {
        status: 'COMPILATION_ERROR',
        passedTests: 0,
        totalTests: hiddenCases.length,
        internalScore: 0,
        logs: ['Syntax verification failed: missing Main class or method.'],
      };
    }

    for (let i = 0; i < hiddenCases.length; i++) {
      const tc = hiddenCases[i];
      const actualOutput = CompilerService.runAlgorithmLogic(tc.input).trim();
      const expectedOutput = tc.expectedOutput.trim();

      if (actualOutput === expectedOutput) {
        passedCount++;
        totalScore += tc.weight;
        logs.push(`Test Case #${i + 1} (${tc.id}): PASSED (+${tc.weight} pts)`);
      } else {
        logs.push(`Test Case #${i + 1} (${tc.id}): FAILED. Expected: ${expectedOutput}, Got: ${actualOutput}`);
      }
    }

    const allPassed = passedCount === hiddenCases.length;
    const status: EvaluationStatus = allPassed ? 'ALL_PASSED' : 'SOME_FAILED';

    return {
      status,
      passedTests: passedCount,
      totalTests: hiddenCases.length,
      internalScore: totalScore,
      logs,
    };
  },

  getSubmissionForTeam(teamId: string): SubmissionRecord | null {
    return submissionsMap.get(teamId.toUpperCase().trim()) || null;
  },

  getAllSubmissions(): SubmissionRecord[] {
    return Array.from(submissionsMap.values());
  },
};
