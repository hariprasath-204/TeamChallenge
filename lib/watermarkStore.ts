import { WatermarkConfig, WatermarkData, QuestionAccessLog } from '@/types/watermark';
import crypto from 'crypto';

declare global {
  // eslint-disable-next-line no-var
  var __codathon_watermark_config: WatermarkConfig | undefined;
  // eslint-disable-next-line no-var
  var __codathon_question_logs: QuestionAccessLog[] | undefined;
  // eslint-disable-next-line no-var
  var __codathon_tracking_map: Map<string, WatermarkData> | undefined;
}

if (!global.__codathon_watermark_config) {
  global.__codathon_watermark_config = {
    enabled: true,
    opacity: 0.055, // 5.5% (between 4% - 7%)
    fontSize: 13,
    angle: -25,
    spacingX: 280,
    spacingY: 140,
  };
}

if (!global.__codathon_question_logs) {
  global.__codathon_question_logs = [];
}

if (!global.__codathon_tracking_map) {
  global.__codathon_tracking_map = new Map<string, WatermarkData>();
}

const watermarkConfig = global.__codathon_watermark_config;
const questionLogs = global.__codathon_question_logs;
const trackingMap = global.__codathon_tracking_map;

export const WatermarkStore = {
  getConfig(): WatermarkConfig {
    return { ...watermarkConfig };
  },

  updateConfig(updates: Partial<WatermarkConfig>): WatermarkConfig {
    if (typeof updates.enabled === 'boolean') watermarkConfig.enabled = updates.enabled;
    if (typeof updates.opacity === 'number') watermarkConfig.opacity = Math.max(0.02, Math.min(0.2, updates.opacity));
    if (typeof updates.fontSize === 'number') watermarkConfig.fontSize = Math.max(10, Math.min(20, updates.fontSize));
    if (typeof updates.angle === 'number') watermarkConfig.angle = updates.angle;
    if (typeof updates.spacingX === 'number') watermarkConfig.spacingX = updates.spacingX;
    if (typeof updates.spacingY === 'number') watermarkConfig.spacingY = updates.spacingY;
    return { ...watermarkConfig };
  },

  /**
   * Generates or retrieves a secure, server-authoritative participant tracking watermark.
   */
  generateWatermark(teamId: string, participantId: string, sessionId: string): WatermarkData {
    const key = `${teamId.toUpperCase()}_${participantId}_${sessionId}`;
    let data = trackingMap.get(key);

    if (!data) {
      const trackingCode = `TRK-${crypto.randomBytes(3).toString('hex').toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      const text = `CODATHAN 2K27 • ${teamId.toUpperCase()} • P-${participantId} • ${trackingCode}`;
      data = {
        text,
        trackingId: trackingCode,
        teamId: teamId.toUpperCase(),
        participantId,
        sessionId,
        timestamp: Date.now(),
      };
      trackingMap.set(key, data);
      // Also index by trackingId for instant leak traceability
      trackingMap.set(trackingCode, data);
    }

    return data;
  },

  /**
   * Log an access event when participant views question
   */
  logQuestionAccess(
    trackingId: string,
    teamId: string,
    participantId: string,
    sessionId: string,
    questionId: string,
    action: 'OPEN' | 'CLOSE' | 'SWITCH',
    viewCount: number
  ): QuestionAccessLog {
    const log: QuestionAccessLog = {
      id: `LOG_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trackingId,
      teamId: teamId.toUpperCase(),
      participantId,
      sessionId,
      questionId,
      action,
      timestamp: Date.now(),
      viewCount,
    };
    questionLogs.unshift(log);
    if (questionLogs.length > 2000) questionLogs.pop();
    return log;
  },

  getQuestionLogs(): QuestionAccessLog[] {
    return [...questionLogs];
  },

  /**
   * Admin Forensic Tool: Trace a leaked image watermark to its owner.
   */
  traceLeak(query: string): WatermarkData[] {
    const clean = query.toUpperCase().trim();
    const results: WatermarkData[] = [];

    for (const [, data] of Array.from(trackingMap.entries())) {
      if (
        data.trackingId.includes(clean) ||
        data.teamId.includes(clean) ||
        data.participantId.includes(clean) ||
        data.text.includes(clean)
      ) {
        if (!results.some((r) => r.trackingId === data.trackingId)) {
          results.push(data);
        }
      }
    }
    return results;
  },
};
