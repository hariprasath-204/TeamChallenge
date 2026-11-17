export interface WatermarkConfig {
  enabled: boolean;
  opacity: number; // 0.04 - 0.08
  fontSize: number; // 12 - 14
  angle: number; // -25
  spacingX: number;
  spacingY: number;
}

export interface WatermarkData {
  text: string;
  trackingId: string;
  teamId: string;
  participantId: string;
  sessionId: string;
  timestamp: number;
}

export interface QuestionAccessLog {
  id: string;
  trackingId: string;
  teamId: string;
  participantId: string;
  sessionId: string;
  questionId: string;
  action: 'OPEN' | 'CLOSE' | 'SWITCH';
  timestamp: number;
  viewCount: number;
}
