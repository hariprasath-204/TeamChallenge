import { TeamRegistration } from '@/types/team';

// Seeded with official Codathon registered teams (including the live CDT-001-ZX0L document found on Firestore)
const initialTeams: TeamRegistration[] = [
  {
    id: 'CDT-001-ZX0L',
    teamName: "edvs's Team",
    college: 'Ayya Nadar Janaki Ammal College — CS',
    department: 'Computer Applications',
    members: [
      {
        name: 'Edvs Vance',
        rollNo: '23MCA001',
        email: 'softtech.admin.st.1@gmail.com',
        phone: '2132435432',
        college: 'Ayya Nadar Janaki Ammal College',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      },
      {
        name: 'Alex Rivera',
        rollNo: '23MCA002',
        email: 'alex.rivera@anjac.edu',
        phone: '9876543210',
        college: 'Ayya Nadar Janaki Ammal College',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      },
      {
        name: 'David Chen',
        rollNo: '23MCA003',
        email: 'david.chen@anjac.edu',
        phone: '9876543211',
        college: 'Ayya Nadar Janaki Ammal College',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      },
    ],
    leaderIndex: 0,
    leaderName: 'Edvs Vance',
    leaderEmail: 'softtech.admin.st.1@gmail.com',
    leaderPhone: '2132435432',
    paymentStatus: 'verified',
    isCheckedIn: true,
    isBlocked: false,
    lotNumber: '130',
    preferredPassword: 'codathon@2027',
    registeredAt: '2026-11-14T05:57:00.337Z',
  },
  {
    id: 'CDT-007-GOLD',
    teamName: 'Cyber Alchemists',
    college: 'Ayya Nadar Janaki Ammal College',
    department: 'Computer Applications (PG)',
    members: [
      {
        name: 'Hari Prasath S',
        rollNo: '24MCA101',
        email: 'hariprasath@anjac.edu',
        phone: '9791486908',
        college: 'ANJAC Sivakasi',
        photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
      },
      {
        name: 'Mageshwaran B',
        rollNo: '24MCA102',
        email: 'magesh@anjac.edu',
        phone: '7358810478',
        college: 'ANJAC Sivakasi',
        photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
      },
      {
        name: 'Maheswaran S',
        rollNo: '24MCA103',
        email: 'mahesh@anjac.edu',
        phone: '7094269941',
        college: 'ANJAC Sivakasi',
        photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
      },
    ],
    leaderIndex: 0,
    leaderName: 'Hari Prasath S',
    leaderEmail: 'hariprasath@anjac.edu',
    leaderPhone: '9791486908',
    paymentStatus: 'verified',
    isCheckedIn: true,
    isBlocked: false,
    lotNumber: '007',
    preferredPassword: 'codathon@2027',
    registeredAt: '2026-11-15T08:30:00.000Z',
  },
  {
    id: 'CDT-012-TITAN',
    teamName: 'Quantum Coders',
    college: 'National Engineering College',
    department: 'Computer Science and Engineering',
    members: [
      {
        name: 'Suresh Kumar',
        rollNo: '22CSE045',
        email: 'suresh@nec.edu.in',
        phone: '9842100001',
        college: 'NEC Kovilpatti',
        photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
      },
      {
        name: 'Priya Dharshini',
        rollNo: '22CSE078',
        email: 'priya@nec.edu.in',
        phone: '9842100002',
        college: 'NEC Kovilpatti',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
      },
      {
        name: 'Karthik Raja',
        rollNo: '22CSE099',
        email: 'karthik@nec.edu.in',
        phone: '9842100003',
        college: 'NEC Kovilpatti',
        photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
      },
    ],
    leaderIndex: 0,
    leaderName: 'Suresh Kumar',
    leaderEmail: 'suresh@nec.edu.in',
    leaderPhone: '9842100001',
    paymentStatus: 'verified',
    isCheckedIn: true,
    isBlocked: false,
    lotNumber: '012',
    preferredPassword: 'codathon@2027',
    registeredAt: '2026-11-15T09:45:00.000Z',
  },
];

// Generate additional teams up to 34 teams to fulfill competition scale tests
for (let i = 4; i <= 34; i++) {
  const pad = i.toString().padStart(3, '0');
  initialTeams.push({
    id: `CDT-${pad}-SIM`,
    teamName: `Triwizard Squad ${i}`,
    college: 'Regional Coding Consortium',
    department: 'Information Technology',
    members: [
      {
        name: `Lead Member ${i}`,
        rollNo: `23IT${pad}A`,
        email: `leader${i}@codathon.test`,
        phone: `98000000${pad.slice(-2)}`,
        college: 'Regional Coding Consortium',
        photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
      },
      {
        name: `Dev Member ${i}B`,
        rollNo: `23IT${pad}B`,
        email: `memberB${i}@codathon.test`,
        phone: `98000001${pad.slice(-2)}`,
        college: 'Regional Coding Consortium',
        photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
      },
      {
        name: `Dev Member ${i}C`,
        rollNo: `23IT${pad}C`,
        email: `memberC${i}@codathon.test`,
        phone: `98000002${pad.slice(-2)}`,
        college: 'Regional Coding Consortium',
        photoUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&auto=format&fit=crop&q=80',
      },
    ],
    leaderIndex: 0,
    leaderName: `Lead Member ${i}`,
    leaderEmail: `leader${i}@codathon.test`,
    leaderPhone: `98000000${pad.slice(-2)}`,
    paymentStatus: 'verified',
    isCheckedIn: true,
    isBlocked: false,
    lotNumber: pad,
    preferredPassword: 'codathon@2027',
    registeredAt: '2026-11-16T10:00:00.000Z',
  });
}

// Global in-memory storage persisted across hot reloads in Node
declare global {
  // eslint-disable-next-line no-var
  var __codathon_teams: Map<string, TeamRegistration> | undefined;
}

if (!global.__codathon_teams) {
  global.__codathon_teams = new Map<string, TeamRegistration>();
  for (const team of initialTeams) {
    global.__codathon_teams.set(team.id.toUpperCase(), team);
  }
}

const teamsMap = global.__codathon_teams;

export const TeamStore = {
  getAll(): TeamRegistration[] {
    return Array.from(teamsMap.values());
  },

  getById(teamId: string): TeamRegistration | null {
    if (!teamId) return null;
    return teamsMap.get(teamId.toUpperCase().trim()) || null;
  },

  getByEmail(email: string): TeamRegistration | null {
    if (!email) return null;
    const clean = email.toLowerCase().trim();
    for (const team of Array.from(teamsMap.values())) {
      if (team.leaderEmail.toLowerCase() === clean) return team;
      for (const m of team.members) {
        if (m.email.toLowerCase() === clean) return team;
      }
    }
    return null;
  },

  update(teamId: string, updates: Partial<TeamRegistration>): TeamRegistration | null {
    const existing = this.getById(teamId);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    teamsMap.set(existing.id.toUpperCase(), updated);
    return updated;
  },
};
