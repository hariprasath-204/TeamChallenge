import { NextResponse } from 'next/server';
import { EvaluationService } from '@/lib/evaluationService';

export async function GET() {
  const submissions = EvaluationService.getAllSubmissions();

  // Sort submissions by highest score first, then earliest submission time (official tie-breaker)
  const ranked = [...submissions].sort((a, b) => {
    if (b.internalScore !== a.internalScore) {
      return b.internalScore - a.internalScore;
    }
    return a.submittedAt - b.submittedAt;
  });

  return NextResponse.json({
    success: true,
    data: {
      submissionsCount: ranked.length,
      leaderboard: ranked.map((s, idx) => ({
        rank: idx + 1,
        teamId: s.teamId,
        teamName: s.teamName,
        leaderName: s.leaderName,
        language: s.language,
        evaluationStatus: s.evaluationStatus,
        internalScore: s.internalScore,
        passedTestsCount: s.passedTestsCount,
        totalTestsCount: s.totalTestsCount,
        submittedAt: s.submittedAt,
        sourceCode: s.sourceCode,
        evaluatorLogs: s.evaluatorLogs,
      })),
    },
  });
}

export async function DELETE() {
  if (global.__codathon_submissions) {
    global.__codathon_submissions.clear();
  }
  return NextResponse.json({ success: true, message: 'Submissions reset.' });
}
