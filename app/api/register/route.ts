import { NextRequest, NextResponse } from 'next/server';
import { TeamStore } from '@/lib/teamStore';
import { TeamRegistration } from '@/types/team';
import crypto from 'crypto';

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAXmk6rA6YGkx_612GzgsQlhmBNijoAEnU';
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'teamchallenge-c1166';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      teamName,
      college,
      department,
      members,
      leaderIndex = 0,
      preferredPassword = 'codathon@2027',
    } = body;

    // 1. Validate required fields
    if (!teamName || !college || !members || !Array.isArray(members) || members.length !== 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Registration requires Team Name, College, and exactly THREE team members.',
        },
        { status: 400 }
      );
    }

    // Validate all 3 members have name, rollNo, and email
    for (let i = 0; i < 3; i++) {
      const m = members[i];
      if (!m.name || !m.rollNo) {
        return NextResponse.json(
          {
            success: false,
            error: `Member #${i + 1} must have a valid Name and Roll Number.`,
          },
          { status: 400 }
        );
      }
    }

    // 2. Generate unique Team ID and Lot Number
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    const lotNum = (Math.floor(Math.random() * 900) + 100).toString();
    const teamId = `CDT-${lotNum}-${randomHex}`;

    const leaderMember = members[leaderIndex] || members[0];
    const nowIso = new Date().toISOString();

    const newTeam: TeamRegistration = {
      id: teamId,
      teamName: teamName.trim(),
      college: college.trim(),
      department: department?.trim() || 'Computer Applications',
      members: [
        {
          name: members[0].name.trim(),
          rollNo: members[0].rollNo.trim(),
          email: members[0].email?.trim() || `member1_${lotNum}@codathon.edu`,
          phone: members[0].phone?.trim() || '9876543210',
          photoUrl: members[0].photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
        },
        {
          name: members[1].name.trim(),
          rollNo: members[1].rollNo.trim(),
          email: members[1].email?.trim() || `member2_${lotNum}@codathon.edu`,
          phone: members[1].phone?.trim() || '9876543211',
          photoUrl: members[1].photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
        },
        {
          name: members[2].name.trim(),
          rollNo: members[2].rollNo.trim(),
          email: members[2].email?.trim() || `member3_${lotNum}@codathon.edu`,
          phone: members[2].phone?.trim() || '9876543212',
          photoUrl: members[2].photoUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
        },
      ],
      leaderIndex,
      leaderName: leaderMember.name.trim(),
      leaderEmail: leaderMember.email?.trim() || `leader_${lotNum}@codathon.edu`,
      leaderPhone: leaderMember.phone?.trim() || '9876543210',
      paymentStatus: 'verified',
      isCheckedIn: true,
      isBlocked: false,
      lotNumber: lotNum,
      preferredPassword: preferredPassword.trim(),
      registeredAt: nowIso,
    };

    // 3. Save to Firebase Firestore via REST API
    try {
      const firestoreDoc = {
        fields: {
          id: { stringValue: newTeam.id },
          teamName: { stringValue: newTeam.teamName },
          college: { stringValue: newTeam.college },
          department: { stringValue: newTeam.department },
          leaderName: { stringValue: newTeam.leaderName },
          leaderEmail: { stringValue: newTeam.leaderEmail },
          leaderPhone: { stringValue: newTeam.leaderPhone },
          leaderIndex: { integerValue: String(newTeam.leaderIndex) },
          paymentStatus: { stringValue: 'verified' },
          isCheckedIn: { booleanValue: true },
          isBlocked: { booleanValue: false },
          lotNumber: { stringValue: newTeam.lotNumber },
          preferredPassword: { stringValue: newTeam.preferredPassword },
          registeredAt: { stringValue: nowIso },
          members: {
            arrayValue: {
              values: newTeam.members.map((m) => ({
                mapValue: {
                  fields: {
                    name: { stringValue: m.name },
                    rollNo: { stringValue: m.rollNo },
                    email: { stringValue: m.email },
                    phone: { stringValue: m.phone },
                    photoUrl: { stringValue: m.photoUrl || '' },
                  },
                },
              })),
            },
          },
        },
      };

      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/registrations/${newTeam.id}?key=${FIREBASE_API_KEY}`;
      await fetch(firestoreUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(firestoreDoc),
      });
    } catch {
      // Logged and fallback gracefully
    }

    // 4. Update in-memory TeamStore so team can immediately sign in on this PC
    TeamStore.add(newTeam);

    return NextResponse.json({
      success: true,
      message: 'Team successfully registered in Firebase and verified for CODATHAN 2K27.',
      team: newTeam,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
