import { NextRequest, NextResponse } from 'next/server';
import { ExamStore } from '@/lib/examStore';
import { SessionStore } from '@/lib/sessionStore';

export async function GET(req: NextRequest) {
  try {
    const teamId = req.nextUrl.searchParams.get('teamId');
    const sessionId = req.nextUrl.searchParams.get('sessionId');

    if (!teamId || !sessionId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Missing credentials', status: 401 } },
        { status: 401 }
      );
    }

    const val = SessionStore.validate(teamId, sessionId);
    if (!val.valid) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_SESSION', message: 'Session expired or conflict', status: 401 } },
        { status: 401 }
      );
    }

    const sessionState = ExamStore.getOrCreateSession(teamId);
    const question = ExamStore.getQuestion(false); // strip hidden cases

    return NextResponse.json({
      success: true,
      data: {
        sessionState,
        question,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch exam state', status: 500 } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamId, sessionId, action } = body;

    if (!teamId || !sessionId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Missing credentials', status: 401 } },
        { status: 401 }
      );
    }

    const val = SessionStore.validate(teamId, sessionId);
    if (!val.valid) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_SESSION', message: 'Session expired or conflict', status: 401 } },
        { status: 401 }
      );
    }

    if (action === 'START') {
      const state = ExamStore.startExam(teamId);
      return NextResponse.json({ success: true, data: state });
    }

    if (action === 'INCREMENT_VIEW') {
      const count = ExamStore.incrementQuestionView(teamId);
      return NextResponse.json({ success: true, data: { questionViewsCount: count } });
    }

    return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Action execution failed', status: 500 } },
      { status: 500 }
    );
  }
}
