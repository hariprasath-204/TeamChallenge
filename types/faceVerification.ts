export type VerificationStatus =
  | 'PENDING'
  | 'CAMERA_REQUIRED'
  | 'DETECTED'
  | 'VERIFYING'
  | 'SUCCESS'
  | 'MISMATCH'
  | 'MULTIPLE_FACES'
  | 'POOR_QUALITY'
  | 'LIVENESS_FAILED'
  | 'MANUAL_REVIEW';

export interface MemberVerificationRecord {
  memberIndex: number;
  memberName: string;
  status: VerificationStatus;
  confidenceScore: number;
  liveSnapshot?: string;
  verifiedAt?: number;
  reviewerNotes?: string;
  bypassAuthorizedByAdmin?: boolean;
}

export interface TeamVerificationState {
  teamId: string;
  members: MemberVerificationRecord[];
  allPassed: boolean;
  lastUpdated: number;
}
