/**
 * Security Incident Alert Dispatcher Service
 * Dispatches real-time security alerts to external monitoring webhooks (PagerDuty, Slack, Opsgenie)
 * when critical security events (isolation violations, prompt injections, rate-limit breaches) occur.
 */

import { SecurityAuditEvent } from '../middleware/securityHardeningMiddleware';

export interface WebhookIncidentPayload {
  incidentId: string;
  timestamp: string;
  severity: 'HIGH' | 'CRITICAL';
  eventType: string;
  clientIp: string;
  endpoint: string;
  actorRole: string;
  summary: string;
  environment: string;
  platform: string;
}

export class SecurityAlertDispatcherService {
  private static webhookUrl = process.env.SECURITY_ALERT_WEBHOOK_URL;
  private static alertHistory: WebhookIncidentPayload[] = [];

  public static async dispatchAlert(event: SecurityAuditEvent): Promise<boolean> {
    const payload: WebhookIncidentPayload = {
      incidentId: event.id,
      timestamp: event.timestamp,
      severity: event.severity,
      eventType: event.eventType,
      clientIp: event.ip,
      endpoint: event.endpoint,
      actorRole: event.actorRole,
      summary: event.details,
      environment: process.env.NODE_ENV || 'development',
      platform: 'HEAL-ENGINE-CLINICAL-OS'
    };

    this.alertHistory.push(payload);
    if (this.alertHistory.length > 500) {
      this.alertHistory.shift();
    }

    console.warn(`[SECURITY-ALERT-DISPATCHER] [${event.severity}] ${event.eventType} on ${event.endpoint} from ${event.ip}`);

    const targetUrl = this.webhookUrl || process.env.SECURITY_ALERT_WEBHOOK_URL;
    if (!targetUrl) {
      // In development or when webhook URL is not configured, record event locally
      return true;
    }

    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (err: any) {
      console.error('[SECURITY-ALERT-DISPATCHER] Webhook dispatch failed:', err.message);
      return false;
    }
  }

  public static getAlertHistory(): WebhookIncidentPayload[] {
    return [...this.alertHistory];
  }

  public static clearHistoryForTesting(): void {
    this.alertHistory = [];
  }
}
