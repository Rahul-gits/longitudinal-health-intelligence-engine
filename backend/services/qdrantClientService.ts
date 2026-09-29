export interface QdrantSearchPayload {
  evidenceId: string;
  sourceOrganization: string;
  documentTitle: string;
  guidelineVersion: string;
  publicationDate: string;
  section: string;
  pageOrParagraph: string;
  clinicalDomain: string;
  recommendation: string;
  evidenceClass: string;
  actionableContraindication: boolean;
  whyCitedRationale: string;
}

export interface QdrantSearchResult {
  id: string | number;
  score: number;
  payload: QdrantSearchPayload;
}

export class QdrantClientService {
  private host: string;
  private port: number;
  private apiKey?: string;
  private collectionName = 'clinical_guidelines';
  private isConnected: boolean = false;
  private connectionChecked: boolean = false;

  constructor() {
    this.host = process.env.VECTOR_DB_HOST || 'localhost';
    this.port = parseInt(process.env.VECTOR_DB_PORT || '6333', 10);
    this.apiKey = process.env.VECTOR_DB_API_KEY;
  }

  private getBaseUrl(): string {
    return `http://${this.host}:${this.port}`;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (this.apiKey) {
      headers['api-key'] = this.apiKey;
    }
    return headers;
  }

  /**
   * Health check to Qdrant cluster
   */
  public async checkHealth(): Promise<{ connected: boolean; version?: string; error?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${this.getBaseUrl()}/healthz`, {
        signal: controller.signal,
        headers: this.getHeaders()
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        this.isConnected = true;
        this.connectionChecked = true;
        return { connected: true, version: 'Qdrant v1.8+' };
      }
      this.isConnected = false;
      return { connected: false, error: `HTTP ${res.status}` };
    } catch (err: any) {
      this.isConnected = false;
      if (!this.connectionChecked) {
        console.warn(`[HEAL-QDRANT] Vector DB notice: ${err.message}. Operating with local embedding fallback.`);
        this.connectionChecked = true;
      }
      return { connected: false, error: err.message };
    }
  }

  /**
   * Vector search in Qdrant collection
   */
  public async search(
    queryVector: number[],
    limit = 5,
    filter?: Record<string, any>
  ): Promise<QdrantSearchResult[]> {
    if (!this.isConnected) {
      const health = await this.checkHealth();
      if (!health.connected) return [];
    }

    try {
      const res = await fetch(`${this.getBaseUrl()}/collections/${this.collectionName}/points/search`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          vector: queryVector,
          limit,
          with_payload: true,
          filter
        })
      });

      if (!res.ok) return [];
      const data = await res.json() as { result?: QdrantSearchResult[] };
      return data.result || [];
    } catch (err: any) {
      console.warn('[HEAL-QDRANT] Search request failed:', err.message);
      return [];
    }
  }

  public isOnline(): boolean {
    return this.isConnected;
  }
}

export const qdrantClientService = new QdrantClientService();
