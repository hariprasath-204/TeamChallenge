import { NextRequest, NextResponse } from 'next/server';
import { EvaluationService } from '@/lib/evaluationService';
import { SessionStore } from '@/lib/sessionStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamId, sessionId, language, sourceCode } = body;
    const leaderEmail = body.leaderEmail || body.submittedBy;

    if (!teamId || !sessionId || !leaderEmail || !sourceCode) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_SUBMISSION', message: 'Missing submission payload', status: 400 } },
        { status: 400 }
      );
    }

    // Validate 1-PC session lock
    const val = SessionStore.validate(teamId, sessionId);
    if (!val.valid) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED_SESSION', message: 'Active session required', status: 401 } },
        { status: 401 }
      );
    }

    const result = await EvaluationService.submitSolution(
      teamId,
      leaderEmail,
      language || 'cpp',
      sourceCode
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SUBMISSION_REJECTED',
            message: result.message || 'Submission could not be completed.',
            status: 403,
          },
        },
        { status: 403 }
      );
    }

    // Prepare student-safe response (STRIP MARKS, SCORES, PERCENTAGES, PASSED COUNTS)
    let displayTitle = 'SUBMISSION RECEIVED SUCCESSFULLY!';
    let displayMessage = 'Your submission has been recorded. Thank you for participating in CODATHAN 2K27.';

    if (result.evaluationStatus === 'ALL_PASSED') {
      displayTitle = 'TASK COMPLETED SUCCESSFULLY!';
      displayMessage =
        'Congratulations! Your solution has successfully passed all test cases. Your submission has been recorded successfully. Thank you for participating in CODATHAN 2K27.';
    } else if (result.evaluationStatus === 'EVALUATION_FAILED' || result.evaluationStatus === 'COMPILATION_ERROR') {
      displayTitle = 'SUBMISSION UNDER REVIEW';
      displayMessage =
        'Your solution could not be evaluated automatically. The event administrator will review the submission if required.';
    } else if (result.evaluationStatus === 'EVALUATING') {
      displayTitle = 'SUBMISSION RECEIVED SUCCESSFULLY!';
      displayMessage =
        'Your solution has been submitted and is currently under evaluation. Please wait while the evaluation is completed.';
    }

    return NextResponse.json({
      success: true,
      data: {
        submissionId: result.submissionId,
        title: displayTitle,
        displayTitle,
        displayMessage,
        evaluationStatus: result.evaluationStatus,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to process submission', status: 500 } },
      { status: 500 }
    );
  }
}
