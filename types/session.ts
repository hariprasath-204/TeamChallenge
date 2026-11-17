export interface SessionLock {
  sessionId: string;
  teamId: string;
  clientFingerprint: string;
  userAgent: string;
  ipAddress: string;
  createdAt: number;
  lastHeartbeat: number;
  expiresAt: number;
  status: 'ACTIVE' | 'EXPIRED' | 'FORCE_RELEASED';
}

export interface SessionVerificationResult {
  valid: boolean;
  reason?: 'NOT_FOUND' | 'EXPIRED' | 'CONFLICT' | 'BLOCKED';
  session?: SessionLock;
}
