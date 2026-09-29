import { FhirInteroperabilityService, FHIROperationOutcome } from './fhirInteroperabilityService';

export interface SmartClientConfig {
  fhirBaseUrl: string;
  clientId: string;
  tokenEndpoint?: string;
  clientSecret?: string;
}

export class SmartOutboundClientService {
  private config: SmartClientConfig;

  constructor() {
    this.config = {
      fhirBaseUrl: process.env.FHIR_BASE_URL || 'https://fhir.epic.hospital.org/interconnect-fhir-oauth/api/FHIR/R4',
      clientId: process.env.SMART_CLIENT_ID || 'heal-engine-cdss-client-id',
      tokenEndpoint: process.env.SMART_TOKEN_ENDPOINT || 'https://fhir.epic.hospital.org/interconnect-fhir-oauth/oauth2/token',
      clientSecret: process.env.SMART_CLIENT_SECRET
    };
  }

  /**
   * Discover SMART Configuration from external EHR Base URL
   */
  public async discoverSmartConfiguration(baseUrl?: string): Promise<Record<string, any> | null> {
    const targetUrl = (baseUrl || this.config.fhirBaseUrl).replace(/\/$/, '');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${targetUrl}/.well-known/smart-configuration`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return (await res.json()) as Record<string, any>;
      }
      return null;
    } catch (err: any) {
      console.warn(`[SMART-CLIENT] External discovery notice: ${err.message}. Using configured endpoints.`);
      return null;
    }
  }

  /**
   * Acquire OAuth2 Access Token from external SMART Token endpoint
   */
  public async acquireAccessToken(scope: string = 'patient/*.read launch/patient'): Promise<{ accessToken: string; expiresIn: number } | null> {
    const tokenUrl = this.config.tokenEndpoint;
    if (!tokenUrl) return null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', this.config.clientId);
      if (this.config.clientSecret) {
        params.append('client_secret', this.config.clientSecret);
      }
      params.append('scope', scope);

      const res = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json() as { access_token?: string; expires_in?: number };
        if (data.access_token) {
          return { accessToken: data.access_token, expiresIn: data.expires_in || 3600 };
        }
      }
      return null;
    } catch (err: any) {
      console.warn(`[SMART-CLIENT] OAuth token request notice: ${err.message}`);
      return null;
    }
  }

  /**
   * Sync patient records from an external FHIR EHR and normalize into Canonical State
   */
  public async syncExternalPatient(
    patientId: string,
    accessToken?: string
  ): Promise<{ success: boolean; resourcesImported: number; outcome?: FHIROperationOutcome }> {
    const fhirUrl = `${this.config.fhirBaseUrl}/Patient/${patientId}/$everything`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const headers: Record<string, string> = {
        Accept: 'application/fhir+json'
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const res = await fetch(fhirUrl, { headers, signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const bundle = (await res.json()) as { entry?: Array<{ resource: any }> };
        let count = 0;
        if (bundle.entry && Array.isArray(bundle.entry)) {
          for (const item of bundle.entry) {
            if (item.resource) {
              const ingest = FhirInteroperabilityService.ingestAndNormalizeResource(
                item.resource,
                patientId,
                'External-SMART-EHR'
              );
              if (ingest.success) count++;
            }
          }
        }
        return {
          success: count > 0,
          resourcesImported: count
        };
      }
      return { success: false, resourcesImported: 0 };
    } catch (err: any) {
      console.warn(`[SMART-CLIENT] EHR Sync notice: ${err.message}. Operating in sandbox simulation.`);
      return { success: false, resourcesImported: 0 };
    }
  }
}

export const smartOutboundClientService = new SmartOutboundClientService();
