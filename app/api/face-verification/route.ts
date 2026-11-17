import { NextRequest, NextResponse } from 'next/server';
import { FaceVerificationStore } from '@/lib/faceStore';
import { SessionStore } from '@/lib/sessionStore';

export async function GET(req: NextRequest) {
  const teamId = req.nextUrl.searchParams.get('teamId');
  if (!teamId) {
    return NextResponse.json({ success: false, message: 'Missing teamId' }, { status: 400 });
  }

  const state = FaceVerificationStore.getOrCreateTeamState(teamId);
  return NextResponse.json({ success: true, data: state });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamId, sessionId, memberIndex, liveSnapshot, clientMetrics } = body;

    if (!teamId || !sessionId || memberIndex === undefined || !liveSnapshot) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_PAYLOAD', message: 'Missing verification data', status: 400 },
        },
        { status: 400 }
      );
    }

    // Validate 1-PC session lock
    const sessionVal = SessionStore.validate(teamId, sessionId);
    if (!sessionVal.valid) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED_SESSION', message: 'Session expired or invalidated', status: 401 },
        },
        { status: 401 }
      );
    }

    // Process face verification
    const result = FaceVerificationStore.processVerification(
      teamId,
      memberIndex,
      liveSnapshot,
      clientMetrics
    );

    return NextResponse.json({
      success: result.success,
      data: {
        status: result.status,
        confidence: result.confidence,
        message: result.message,
        teamState: result.teamState,
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'VERIFICATION_ERROR', message: 'Failed to process face verification', status: 500 },
      },
      { status: 500 }
    );
  }
}
