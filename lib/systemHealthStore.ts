export interface SystemIncident {
  id: string;
  timestamp: number;
  category: 'FRONTEND' | 'API' | 'COMPILER' | 'SESSION' | 'WATERMARK' | 'SECURITY';
  httpStatus?: number;
  service: string;
  teamId?: string;
  requestId?: string;
  message: string;
  resolved: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var __codathon_system_incidents: SystemIncident[] | undefined;
}

if (!global.__codathon_system_incidents) {
  global.__codathon_system_incidents = [];
}

const incidents = global.__codathon_system_incidents;

export const SystemHealthStore = {
  logIncident(
    category: SystemIncident['category'],
    service: string,
    message: string,
    options?: { httpStatus?: number; teamId?: string; requestId?: string }
  ): SystemIncident {
    const incident: SystemIncident = {
      id: `ERR_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      timestamp: Date.now(),
      category,
      service,
      message,
      httpStatus: options?.httpStatus,
      teamId: options?.teamId?.toUpperCase(),
      requestId: options?.requestId,
      resolved: false,
    };
    incidents.unshift(incident);
    if (incidents.length > 500) incidents.pop();
    return incident;
  },

  getIncidents(): SystemIncident[] {
    return [...incidents];
  },

  resolveIncident(id: string): boolean {
    const inc = incidents.find((i) => i.id === id);
    if (inc) {
      inc.resolved = true;
      return true;
    }
    return false;
  },

  getHealthSummary() {
    const now = Date.now();
    const last10Min = incidents.filter((i) => now - i.timestamp < 10 * 60 * 1000);
    return {
      status: last10Min.length > 10 ? 'DEGRADED' : 'HEALTHY',
      recentIncidentsCount: last10Min.length,
      totalLogged: incidents.length,
      services: {
        authentication: 'ONLINE',
        sessionLocking: 'ONLINE',
        faceVerification: 'ONLINE',
        monacoEditor: 'ONLINE',
        compilerQueue: 'ONLINE',
        watermarkEngine: 'ONLINE',
      },
    };
  },
};
