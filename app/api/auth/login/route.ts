import { NextRequest, NextResponse } from 'next/server';
import { TeamStore } from '@/lib/teamStore';
import { SessionStore } from '@/lib/sessionStore';
import { SystemHealthStore } from '@/lib/systemHealthStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamIdOrEmail, password, clientFingerprint, existingSessionId } = body;

    if (!teamIdOrEmail) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'Please enter your Team ID or registered Leader Email.',
            retryable: true,
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    // 1. Look up registered team
    let team = TeamStore.getById(teamIdOrEmail);
    if (!team) {
      team = TeamStore.getByEmail(teamIdOrEmail);
    }

    // Fallback: Query Firestore if not found in local cache
    if (!team) {
      try {
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAXmk6rA6YGkx_612GzgsQlhmBNijoAEnU';
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'teamchallenge-c1166';
        const cleanId = teamIdOrEmail.toUpperCase().trim();
        const firestoreRes = await fetch(
          `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/registrations/${cleanId}?key=${apiKey}`
        );
        if (firestoreRes.ok) {
          const doc = await firestoreRes.json();
          if (doc.fields) {
            const f = doc.fields;
            team = {
              id: cleanId,
              teamName: f.teamName?.stringValue || cleanId,
              college: f.college?.stringValue || 'ANJAC',
              department: f.department?.stringValue || 'Computer Applications',
              leaderName: f.leaderName?.stringValue || 'Leader',
              leaderEmail: f.leaderEmail?.stringValue || '',
              leaderPhone: f.leaderPhone?.stringValue || '',
              leaderIndex: parseInt(f.leaderIndex?.integerValue || '0', 10),
              paymentStatus: (f.paymentStatus?.stringValue as 'verified') || 'verified',
              isCheckedIn: true,
              isBlocked: false,
              lotNumber: f.lotNumber?.stringValue || '001',
              preferredPassword: f.preferredPassword?.stringValue || 'codathon@2027',
              members: (f.members?.arrayValue?.values || []).map((m: { mapValue: { fields: Record<string, { stringValue?: string }> } }) => ({
                name: m.mapValue.fields.name?.stringValue || '',
                rollNo: m.mapValue.fields.rollNo?.stringValue || '',
                email: m.mapValue.fields.email?.stringValue || '',
                phone: m.mapValue.fields.phone?.stringValue || '',
                photoUrl: m.mapValue.fields.photoUrl?.stringValue || '',
              })) as [any, any, any],
            };
            TeamStore.add(team);
          }
        }
      } catch {
        // Fallback checked
      }
    }

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TEAM_NOT_FOUND',
            message: 'Your team registration was not found. Please contact the event administrator.',
            retryable: false,
            status: 404,
          },
        },
        { status: 404 }
      );
    }

    // 2. Check team eligibility & blocking
    if (team.isBlocked) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TEAM_BLOCKED',
            message: 'This team has been temporarily restricted by the event administrator.',
            retryable: false,
            status: 403,
          },
        },
        { status: 403 }
      );
    }

    // Check payment verification
    if (team.paymentStatus !== 'verified') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PAYMENT_PENDING',
            message: 'Your team registration payment is pending verification by the organizers.',
            retryable: false,
            status: 403,
          },
        },
        { status: 403 }
      );
    }

    // 3. Password check (if configured)
    if (team.preferredPassword && password && team.preferredPassword !== password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid team passcode. Please verify your credentials.',
            retryable: true,
            status: 401,
          },
        },
        { status: 401 }
      );
    }

    // 4. Atomic 1-PC-per-team Session Lock Enforcement
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';

    const lockResult = SessionStore.acquireLock(
      team.id,
      clientFingerprint || 'fp_default',
      userAgent,
      ipAddress,
      existingSessionId
    );

    if (!lockResult.success) {
      SystemHealthStore.logIncident(
        'SESSION',
        'SessionLocking',
        `Second device attempt blocked for team ${team.id}`,
        { httpStatus: 409, teamId: team.id }
      );

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SESSION_CONFLICT',
            message: lockResult.message || 'Team already active on another computer.',
            retryable: false,
            status: 409,
          },
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        team: {
          id: team.id,
          teamName: team.teamName,
          college: team.college,
          department: team.department,
          members: team.members,
          leaderIndex: team.leaderIndex,
          leaderName: team.leaderName,
          leaderEmail: team.leaderEmail,
          lotNumber: team.lotNumber,
        },
        session: {
          sessionId: lockResult.session?.sessionId,
          expiresAt: lockResult.session?.expiresAt,
        },
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Login failed';
    SystemHealthStore.logIncident('API', 'LoginRoute', msg, { httpStatus: 500 });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected authentication error occurred.',
          retryable: true,
          status: 500,
        },
      },
      { status: 500 }
    );
  }
}
