import { NextRequest, NextResponse } from 'next/server';
import { CompilerService } from '@/lib/compilerService';

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json(
      { success: false, error: { code: 'MISSING_JOB_ID', message: 'Job ID required', status: 400 } },
      { status: 400 }
    );
  }

  const status = CompilerService.getJobStatus(jobId);

  return NextResponse.json({
    success: true,
    data: status,
  });
}
