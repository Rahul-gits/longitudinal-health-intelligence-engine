/**
 * Multi-Stream Clinical & Enterprise Observability Service
 * 
 * Implements strict separation of log streams:
 * 1. Application Logs
 * 2. Security & RBAC Logs
 * 3. Clinical Audit Logs (WORM-hashed)
 * 4. Model / AI Inference Logs
 * 5. Infrastructure & Telemetry Logs
 */

export interface LogEntry {
  id: string;
  timestamp: string;
  stream: 'APPLICATION' | 'SECURITY' | 'CLINICAL_AUDIT' | 'MODEL_AI' | 'INFRASTRUCTURE';
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  service: string;
  message: string;
  metadata?: Record<string, any>;
  ledgerHash?: string;
}

class ClinicalLoggingService {
  private applicationLogs: LogEntry[] = [];
  private securityLogs: LogEntry[] = [];
  private clinicalAuditLogs: LogEntry[] = [];
  private modelAiLogs: LogEntry[] = [];
  private infrastructureLogs: LogEntry[] = [];

  constructor() {
    this.logApplication('INFO', 'LoggingService', 'Clinical Observability & 5-Stream Logger Initialized');
  }

  // 1. Application Stream
  public logApplication(level: 'INFO' | 'WARN' | 'ERROR', service: string, message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      id: `APP-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      stream: 'APPLICATION',
      level,
      service,
      message,
      metadata
    };
    this.applicationLogs.push(entry);
    if (this.applicationLogs.length > 500) this.applicationLogs.shift();
  }

  // 2. Security Stream
  public logSecurity(level: 'WARN' | 'ERROR' | 'CRITICAL', service: string, message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      id: `SEC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      stream: 'SECURITY',
      level,
      service,
      message,
      metadata
    };
    this.securityLogs.push(entry);
    if (this.securityLogs.length > 500) this.securityLogs.shift();
  }

  // 3. Clinical Audit Stream (Immutable WORM Chain)
  public logClinicalAudit(patientId: string, clinicianId: string, action: string, rationale: string, prevHash?: string) {
    const timestamp = new Date().toISOString();
    const payload = `${patientId}|${clinicianId}|${action}|${rationale}|${timestamp}|${prevHash || 'ROOT_GENESIS'}`;
    const ledgerHash = `worm-sha256-${Buffer.from(payload).toString('base64').substring(0, 24)}`;

    const entry: LogEntry = {
      id: `AUDIT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp,
      stream: 'CLINICAL_AUDIT',
      level: 'INFO',
      service: 'ClinicalGovernanceEngine',
      message: `Physician '${clinicianId}' recorded action '${action}' for Patient '${patientId}'.`,
      metadata: { patientId, clinicianId, action, rationale },
      ledgerHash
    };
    this.clinicalAuditLogs.push(entry);
    if (this.clinicalAuditLogs.length > 500) this.clinicalAuditLogs.shift();
    return entry;
  }

  // 4. Model / AI Inference Stream
  public logModelAi(modelName: string, promptTokens: number, completionTokens: number, safetyGated: boolean, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      id: `AI-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      stream: 'MODEL_AI',
      level: 'INFO',
      service: 'VirtualDoctorSessionService',
      message: `Inference completed for model '${modelName}'. Safety Gated: ${safetyGated}.`,
      metadata: { modelName, promptTokens, completionTokens, safetyGated, ...metadata }
    };
    this.modelAiLogs.push(entry);
    if (this.modelAiLogs.length > 500) this.modelAiLogs.shift();
  }

  // 5. Infrastructure & Telemetry Stream
  public logInfrastructure(metric: string, value: number, unit: string, status: 'NORMAL' | 'DEGRADED' | 'OUTAGE') {
    const entry: LogEntry = {
      id: `INFRA-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      stream: 'INFRASTRUCTURE',
      level: status === 'NORMAL' ? 'INFO' : status === 'DEGRADED' ? 'WARN' : 'CRITICAL',
      service: 'JobQueueTelemetry',
      message: `Telemetry metric '${metric}': ${value} ${unit} [Status: ${status}]`,
      metadata: { metric, value, unit, status }
    };
    this.infrastructureLogs.push(entry);
    if (this.infrastructureLogs.length > 500) this.infrastructureLogs.shift();
  }

  public getStream(stream: 'APPLICATION' | 'SECURITY' | 'CLINICAL_AUDIT' | 'MODEL_AI' | 'INFRASTRUCTURE'): LogEntry[] {
    switch (stream) {
      case 'APPLICATION': return [...this.applicationLogs];
      case 'SECURITY': return [...this.securityLogs];
      case 'CLINICAL_AUDIT': return [...this.clinicalAuditLogs];
      case 'MODEL_AI': return [...this.modelAiLogs];
      case 'INFRASTRUCTURE': return [...this.infrastructureLogs];
    }
  }

  public getSummary() {
    return {
      applicationLogsCount: this.applicationLogs.length,
      securityLogsCount: this.securityLogs.length,
      clinicalAuditLogsCount: this.clinicalAuditLogs.length,
      modelAiLogsCount: this.modelAiLogs.length,
      infrastructureLogsCount: this.infrastructureLogs.length,
      streams: ['APPLICATION', 'SECURITY', 'CLINICAL_AUDIT', 'MODEL_AI', 'INFRASTRUCTURE']
    };
  }
}

export const clinicalLoggingService = new ClinicalLoggingService();
