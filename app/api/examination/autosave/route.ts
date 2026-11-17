import { NextRequest, NextResponse } from 'next/server';
import { ExamStore } from '@/lib/examStore';
import { SessionStore } from '@/lib/sessionStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamId, sessionId, code, language } = body;

    if (!teamId || !sessionId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Missing credentials', status: 401 } },
        { status: 401 }
      );
    }

    const val = SessionStore.validate(teamId, sessionId);
    if (!val.valid) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_SESSION', message: 'Session conflict or expired', status: 401 } },
        { status: 401 }
      );
    }

    const updatedSession = ExamStore.autosave(teamId, code, language || 'cpp');

    return NextResponse.json({
      success: true,
      data: {
        lastSavedAt: updatedSession.lastSavedAt,
        status: updatedSession.status,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'AUTOSAVE_FAILED', message: 'Failed to autosave', status: 500 } },
      { status: 500 }
    );
  }
}
