import { NextResponse } from 'next/server';
import { TeamStore } from '@/lib/teamStore';
import { ExamStore } from '@/lib/examStore';
import { FaceVerificationStore } from '@/lib/faceStore';
import { EvaluationService } from '@/lib/evaluationService';

export async function GET() {
  const teams = TeamStore.getAll();
  const examSessions = ExamStore.getAllExamSessions();
  const verifications = FaceVerificationStore.getAllVerifications();
  const submissions = EvaluationService.getAllSubmissions();

  const enrichedTeams = teams.map((team) => {
    const exam = examSessions.find((e) => e.teamId === team.id);
    const verif = verifications.find((v) => v.teamId === team.id);
    const sub = submissions.find((s) => s.teamId === team.id);

    return {
      ...team,
      examStatus: exam?.status || 'NOT_STARTED',
      questionViews: exam?.questionViewsCount || 0,
      faceVerified: verif?.allPassed || false,
      submission: sub
        ? {
            id: sub.submissionId,
            language: sub.language,
            status: sub.evaluationStatus,
            score: sub.internalScore,
            passedTests: sub.passedTestsCount,
            totalTests: sub.totalTestsCount,
            submittedAt: sub.submittedAt,
          }
        : null,
    };
  });

  return NextResponse.json({
    success: true,
    data: {
      totalTeams: teams.length,
      teams: enrichedTeams,
    },
  });
}
