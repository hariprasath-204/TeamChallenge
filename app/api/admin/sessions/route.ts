import { NextRequest, NextResponse } from 'next/server';
import { SessionStore } from '@/lib/sessionStore';

export async function GET() {
  const sessions = SessionStore.getAllSessions();
  const auditLogs = SessionStore.getAuditLogs();

  return NextResponse.json({
    success: true,
    data: {
      activeSessions: sessions.filter((s) => s.status === 'ACTIVE'),
      allSessions: sessions,
      auditLogs,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { teamId, action, reason } = await req.json();

    if (action === 'RESET_LOCK') {
      const reset = SessionStore.adminReset(teamId, reason || 'Admin authorized device reset');
      return NextResponse.json({
        success: reset,
        message: reset ? `Session lock cleared for team ${teamId}` : `No active lock found for ${teamId}`,
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid admin action' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, message: 'Operation failed' }, { status: 500 });
  }
}
