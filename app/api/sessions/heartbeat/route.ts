import { NextRequest, NextResponse } from 'next/server';
import { SessionStore } from '@/lib/sessionStore';
import { ExamStore } from '@/lib/examStore';

export async function POST(req: NextRequest) {
  try {
    const { teamId, sessionId } = await req.json();

    if (!teamId || !sessionId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Missing session params', status: 400 } },
        { status: 400 }
      );
    }

    const result = SessionStore.heartbeat(teamId, sessionId);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SESSION_INVALID',
            message: result.message || 'Session expired or invalidated',
            status: 401,
          },
        },
        { status: 401 }
      );
    }

    const examState = ExamStore.getOrCreateSession(teamId);
    let timeRemainingMs = 0;
    if (examState.deadline) {
      timeRemainingMs = Math.max(0, examState.deadline - Date.now());
    }

    return NextResponse.json({
      success: true,
      data: {
        alive: true,
        timeRemainingMs,
        examStatus: examState.status,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Heartbeat error', status: 500 } },
      { status: 500 }
    );
  }
}
