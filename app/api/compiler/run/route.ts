import { NextRequest, NextResponse } from 'next/server';
import { CompilerService } from '@/lib/compilerService';
import { SessionStore } from '@/lib/sessionStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamId, sessionId, language, sourceCode, stdin, isSubmission } = body;

    if (!teamId || !sessionId || !language || !sourceCode) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: 'Missing required code parameters', status: 400 } },
        { status: 400 }
      );
    }

    // Session validation
    const val = SessionStore.validate(teamId, sessionId);
    if (!val.valid) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED_SESSION', message: 'Session is invalid or active on another device', status: 401 } },
        { status: 401 }
      );
    }

    // Submit to concurrent queue
    const enqueueRes = CompilerService.enqueueJob(
      teamId,
      language,
      sourceCode,
      stdin || '',
      Boolean(isSubmission)
    );

    if (!enqueueRes.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'QUEUE_REJECTED',
            message: enqueueRes.message || 'Execution queue could not accept job',
            status: 429,
          },
        },
        { status: 429 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        jobId: enqueueRes.jobId,
        queuePosition: enqueueRes.queuePosition,
        message: 'Your code is in the execution queue. Please wait while your program is processed.',
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to queue execution', status: 500 } },
      { status: 500 }
    );
  }
}
