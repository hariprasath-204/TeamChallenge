import { NextResponse } from 'next/server';
import { SystemHealthStore } from '@/lib/systemHealthStore';
import { CompilerService } from '@/lib/compilerService';

export async function GET() {
  const health = SystemHealthStore.getHealthSummary();
  const incidents = SystemHealthStore.getIncidents();
  const compilerMetrics = CompilerService.getMetrics();

  return NextResponse.json({
    success: true,
    data: {
      health,
      compilerMetrics,
      incidents: incidents.slice(0, 30),
    },
  });
}
