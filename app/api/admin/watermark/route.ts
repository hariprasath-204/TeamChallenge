import { NextRequest, NextResponse } from 'next/server';
import { WatermarkStore } from '@/lib/watermarkStore';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('trace');

  if (query) {
    const leakResults = WatermarkStore.traceLeak(query);
    return NextResponse.json({
      success: true,
      data: {
        query,
        matchedRecords: leakResults,
      },
    });
  }

  const config = WatermarkStore.getConfig();
  const logs = WatermarkStore.getQuestionLogs();

  return NextResponse.json({
    success: true,
    data: {
      config,
      recentAccessLogs: logs.slice(0, 50),
      totalLogsCount: logs.length,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const updates = await req.json();
    const updatedConfig = WatermarkStore.updateConfig(updates);
    return NextResponse.json({
      success: true,
      data: updatedConfig,
      message: 'Watermark protection settings updated successfully.',
    });
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to update settings' }, { status: 500 });
  }
}
