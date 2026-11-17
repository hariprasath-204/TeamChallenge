import { SessionLock, SessionVerificationResult } from '@/types/session';
import crypto from 'crypto';

declare global {
  // eslint-disable-next-line no-var
  var __codathon_sessions: Map<string, SessionLock> | undefined;
  // eslint-disable-next-line no-var
  var __codathon_session_audit: Array<{
    timestamp: number;
    teamId: string;
    action: string;
    details: string;
    ipAddress?: string;
  }> | undefined;
}

if (!global.__codathon_sessions) {
  global.__codathon_sessions = new Map<string, SessionLock>();
}

if (!global.__codathon_session_audit) {
  global.__codathon_session_audit = [];
}

const sessionsMap = global.__codathon_sessions;
const auditLogs = global.__codathon_session_audit;

// Session TTL: 90 seconds without heartbeat is considered dead / recoverable
const SESSION_TTL_MS = 90 * 1000;

export const SessionStore = {
  /**
   * Attempts to acquire an atomic single-PC session lock for a team.
   */
  acquireLock(
    teamId: string,
    clientFingerprint: string,
    userAgent: string,
    ipAddress: string,
    existingSessionId?: string
  ): { success: boolean; session?: SessionLock; message?: string; conflict?: boolean } {
    const normTeamId = teamId.toUpperCase().trim();
    const now = Date.now();
    const existing = sessionsMap.get(normTeamId);

    // 1. Same computer/tab reconnecting (matching existingSessionId or matching hardware clientFingerprint)
    if (
      existing &&
      existing.status === 'ACTIVE' &&
      (existing.sessionId === existingSessionId || existing.clientFingerprint === clientFingerprint)
    ) {
      existing.lastHeartbeat = now;
      existing.expiresAt = now + SESSION_TTL_MS;
      sessionsMap.set(normTeamId, existing);
      this.logAudit(normTeamId, 'RECONNECT_SAME_DEVICE', `Resumed active session ${existing.sessionId}`, ipAddress);
      return { success: true, session: existing };
    }

    // 2. Active session on another device (or without matching sessionId)
    if (existing && existing.status === 'ACTIVE') {
      const isExpired = now > existing.expiresAt;
      if (!isExpired) {
        this.logAudit(
          normTeamId,
          'SECOND_DEVICE_BLOCKED',
          `Attempted login from new client fingerprint: ${clientFingerprint}. Active session: ${existing.sessionId}`,
          ipAddress
        );
        return {
          success: false,
          conflict: true,
          message:
            'ALREADY LOGGED IN!\n\nThis team is already active on another computer.\n\nOnly ONE PC or laptop is permitted per team.\n\nPlease contact the event administrator if you need assistance.',
        };
      }
      // If expired, previous device timed out, allow recovery
      this.logAudit(normTeamId, 'EXPIRED_SESSION_RECLAIMED', `Reclaimed expired session for new login`, ipAddress);
    }

    // 3. Create fresh atomic session lock
    const newSessionId = `SES_${crypto.randomBytes(16).toString('hex')}`;
    const newLock: SessionLock = {
      sessionId: newSessionId,
      teamId: normTeamId,
      clientFingerprint,
      userAgent,
      ipAddress,
      createdAt: now,
      lastHeartbeat: now,
      expiresAt: now + SESSION_TTL_MS,
      status: 'ACTIVE',
    };

    sessionsMap.set(normTeamId, newLock);
    this.logAudit(normTeamId, 'LOCK_ACQUIRED', `Session lock acquired: ${newSessionId}`, ipAddress);
    return { success: true, session: newLock };
  },

  /**
   * Heartbeat to keep session alive.
   */
  heartbeat(teamId: string, sessionId: string): { success: boolean; message?: string } {
    const normTeamId = teamId.toUpperCase().trim();
    const now = Date.now();
    const lock = sessionsMap.get(normTeamId);

    if (!lock) {
      return { success: false, message: 'No active session found for this team.' };
    }

    if (lock.sessionId !== sessionId) {
      return {
        success: false,
        message: 'Session mismatch. This team is logged in on another computer.',
      };
    }

    if (lock.status !== 'ACTIVE') {
      return { success: false, message: 'Session is no longer active.' };
    }

    lock.lastHeartbeat = now;
    lock.expiresAt = now + SESSION_TTL_MS;
    sessionsMap.set(normTeamId, lock);
    return { success: true };
  },

  /**
   * Validates if a session token is valid and active.
   */
  validate(teamId: string, sessionId: string): SessionVerificationResult {
    const normTeamId = teamId.toUpperCase().trim();
    const lock = sessionsMap.get(normTeamId);

    if (!lock) return { valid: false, reason: 'NOT_FOUND' };
    if (lock.sessionId !== sessionId) return { valid: false, reason: 'CONFLICT' };
    if (lock.status !== 'ACTIVE') return { valid: false, reason: 'BLOCKED' };
    if (Date.now() > lock.expiresAt) return { valid: false, reason: 'EXPIRED' };

    return { valid: true, session: lock };
  },

  /**
   * Admin can reset lock if a team's PC genuinely failed.
   */
  adminReset(teamId: string, adminReason: string): boolean {
    const normTeamId = teamId.toUpperCase().trim();
    const lock = sessionsMap.get(normTeamId);
    if (lock) {
      lock.status = 'FORCE_RELEASED';
      sessionsMap.delete(normTeamId);
      this.logAudit(normTeamId, 'ADMIN_RESET', `Session cleared by admin. Reason: ${adminReason}`);
      return true;
    }
    return false;
  },

  getAllSessions(): SessionLock[] {
    return Array.from(sessionsMap.values());
  },

  getAuditLogs(): Array<{ timestamp: number; teamId: string; action: string; details: string; ipAddress?: string }> {
    return [...auditLogs];
  },

  logAudit(teamId: string, action: string, details: string, ipAddress?: string) {
    auditLogs.unshift({
      timestamp: Date.now(),
      teamId,
      action,
      details,
      ipAddress,
    });
    // Keep last 1000 logs
    if (auditLogs.length > 1000) {
      auditLogs.pop();
    }
  },
};
