import { TeamRegistration } from '@/types/team';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const TEAMS_FILE = path.join(DATA_DIR, 'teams.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // Ignore
    }
  }
}

// Global in-memory storage persisted across hot reloads in Node
declare global {
  // eslint-disable-next-line no-var
  var __codathon_teams: Map<string, TeamRegistration> | undefined;
  // eslint-disable-next-line no-var
  var __codathon_teams_mtime: number | undefined;
}

if (!global.__codathon_teams) {
  global.__codathon_teams = new Map<string, TeamRegistration>();
}

if (!global.__codathon_teams_mtime) {
  global.__codathon_teams_mtime = 0;
}

const teamsMap = global.__codathon_teams;

function syncFromDisk() {
  try {
    ensureDataDir();
    if (fs.existsSync(TEAMS_FILE)) {
      const stat = fs.statSync(TEAMS_FILE);
      if (stat.mtimeMs > (global.__codathon_teams_mtime || 0) || teamsMap.size === 0) {
        global.__codathon_teams_mtime = stat.mtimeMs;
        const content = fs.readFileSync(TEAMS_FILE, 'utf8');
        const teams: TeamRegistration[] = JSON.parse(content);
        teamsMap.clear();
        if (Array.isArray(teams)) {
          for (const t of teams) {
            if (t && t.id) {
              teamsMap.set(t.id.toUpperCase().trim(), t);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error syncing teams from disk:', err);
  }
}

function saveToDisk() {
  try {
    ensureDataDir();
    const teams = Array.from(teamsMap.values());
    fs.writeFileSync(TEAMS_FILE, JSON.stringify(teams, null, 2), 'utf8');
    if (fs.existsSync(TEAMS_FILE)) {
      global.__codathon_teams_mtime = fs.statSync(TEAMS_FILE).mtimeMs;
    }
  } catch (err) {
    console.error('Error saving teams to disk:', err);
  }
}

// Initial sync on module load
syncFromDisk();

export const TeamStore = {
  add(team: TeamRegistration) {
    syncFromDisk();
    teamsMap.set(team.id.toUpperCase().trim(), team);
    saveToDisk();
  },

  getAll(): TeamRegistration[] {
    syncFromDisk();
    return Array.from(teamsMap.values());
  },

  getById(teamId: string): TeamRegistration | null {
    if (!teamId) return null;
    syncFromDisk();
    return teamsMap.get(teamId.toUpperCase().trim()) || null;
  },

  getByEmail(email: string): TeamRegistration | null {
    if (!email) return null;
    syncFromDisk();
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
    syncFromDisk();
    const existing = teamsMap.get(teamId.toUpperCase().trim());
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    teamsMap.set(existing.id.toUpperCase(), updated);
    saveToDisk();
    return updated;
  },

  delete(teamId: string): boolean {
    syncFromDisk();
    const deleted = teamsMap.delete(teamId.toUpperCase().trim());
    if (deleted) saveToDisk();
    return deleted;
  },

  clearAll() {
    teamsMap.clear();
    saveToDisk();
  },
};
