export interface TeamMember {
  name: string;
  rollNo: string;
  email: string;
  phone: string;
  college?: string;
  photoUrl?: string;
}

export interface TeamRegistration {
  id: string; // e.g. "CDT-001-ZX0L" or "CDT-007-GOLD"
  teamName: string;
  college: string;
  department: string;
  members: [TeamMember, TeamMember, TeamMember];
  leaderIndex: number; // 0, 1, or 2
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  paymentStatus: 'verified' | 'pending' | 'rejected';
  isCheckedIn: boolean;
  isBlocked: boolean;
  lotNumber?: string;
  preferredPassword?: string;
  registeredAt?: string;
}
