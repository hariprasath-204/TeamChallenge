import { NextRequest, NextResponse } from 'next/server';
import { WatermarkStore } from '@/lib/watermarkStore';
import { SessionStore } from '@/lib/sessionStore';

export async function GET(req: NextRequest) {
  try {
    const teamId = req.nextUrl.searchParams.get('teamId');
    const sessionId = req.nextUrl.searchParams.get('sessionId');
    const participantId = req.nextUrl.searchParams.get('participantId') || 'MEMBER';

    if (!teamId || !sessionId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Missing credentials', status: 401 } },
        { status: 401 }
      );
    }

    const sessionCheck = SessionStore.validate(teamId, sessionId);
    if (!sessionCheck.valid) {
      return NextResponse.json(
        { success: false, error: { code: 'SESSION_EXPIRED', message: 'Active session required', status: 401 } },
        { status: 401 }
      );
    }

    const config = WatermarkStore.getConfig();
    const watermark = WatermarkStore.generateWatermark(teamId, participantId, sessionId);

    return NextResponse.json({
      success: true,
      data: {
        config,
        watermark,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'WATERMARK_ERROR', message: 'Failed to generate watermark', status: 500 } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { trackingId, teamId, participantId, sessionId, questionId, action, viewCount } = body;

    if (!trackingId || !teamId || !sessionId) {
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
    }

    const log = WatermarkStore.logQuestionAccess(
      trackingId,
      teamId,
      participantId || 'MEMBER',
      sessionId,
      questionId || 'CDT27-P01',
      action || 'OPEN',
      viewCount || 1
    );

    return NextResponse.json({ success: true, data: log });
  } catch {
    return NextResponse.json({ success: false, message: 'Logging failed' }, { status: 500 });
  }
}
