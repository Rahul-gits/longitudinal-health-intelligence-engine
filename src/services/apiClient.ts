/**
 * HEAL Engine Full Stack API Client
 * Connects frontend UI components directly to backend Express services.
 * Features automated health pinging, fallback mock safety, and typed responses.
 */

export const API_BASE_URL = typeof window !== 'undefined' ? (window.location.origin.includes(':3000') ? '' : 'http://localhost:5000') : 'http://localhost:5000';

export interface ServerHealthStatus {
  status: 'HEALTHY' | 'UNREACHABLE' | 'CONNECTING';
  service?: string;
  version?: string;
  uptimeSeconds?: number;
  timestamp?: string;
  endpoints?: string[];
}

export const checkBackendHealth = async (): Promise<ServerHealthStatus> => {
  try {
    const res = await fetch('/api/health', { method: 'GET', headers: { 'Accept': 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      return { ...data, status: 'HEALTHY' };
    }
    return { status: 'UNREACHABLE' };
  } catch (err) {
    return { status: 'UNREACHABLE' };
  }
};

export const fetchPatientData = async (patientId: string = 'patient-ev-68') => {
  try {
    const res = await fetch(`/api/patients/${patientId}`);
    if (res.ok) {
      return await res.json();
    }
    throw new Error('Failed to fetch patient data from server');
  } catch (err) {
    console.warn('[API-FALLBACK] Backend unreachable, using fallback patient state', err);
    return null;
  }
};

export const executeWorkflowRun = async () => {
  try {
    const res = await fetch('/api/workflow/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      return await res.json();
    }
    throw new Error('Workflow execution failed');
  } catch (err) {
    console.warn('[API-FALLBACK] Workflow backend unreachable', err);
    return null;
  }
};

export const sendVirtualDoctorMessage = async (userMessage: string) => {
  try {
    const res = await fetch('/api/screening/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage })
    });
    if (res.ok) {
      return await res.json();
    }
    throw new Error('Screening message failed');
  } catch (err) {
    console.warn('[API-FALLBACK] Screening backend unreachable', err);
    return null;
  }
};

export const simulateSwarmOptimization = async (iterations: number = 25) => {
  try {
    const res = await fetch('/api/swarm/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ iterations })
    });
    if (res.ok) {
      return await res.json();
    }
    throw new Error('Swarm simulation failed');
  } catch (err) {
    console.warn('[API-FALLBACK] Swarm backend unreachable', err);
    return null;
  }
};

export const fetchCaseDebate = async () => {
  try {
    const res = await fetch('/api/conference/debate', { method: 'POST' });
    if (res.ok) {
      return await res.json();
    }
    throw new Error('Conference debate fetch failed');
  } catch (err) {
    console.warn('[API-FALLBACK] Debate backend unreachable', err);
    return null;
  }
};

export const checkSafetyConstraints = async (proposedInterventions?: string[]) => {
  try {
    const res = await fetch('/api/safety/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposedInterventions })
    });
    if (res.ok) {
      return await res.json();
    }
    throw new Error('Safety check failed');
  } catch (err) {
    console.warn('[API-FALLBACK] Safety backend unreachable', err);
    return null;
  }
};

export const fetchFHIRBundle = async () => {
  try {
    const res = await fetch('/api/reports/fhir');
    if (res.ok) {
      return await res.json();
    }
    throw new Error('FHIR bundle fetch failed');
  } catch (err) {
    console.warn('[API-FALLBACK] FHIR backend unreachable', err);
    return null;
  }
};

export const evaluateBenchmarks = async () => {
  try {
    const res = await fetch('/api/benchmarks/evaluate', { method: 'POST' });
    if (res.ok) {
      return await res.json();
    }
    throw new Error('Benchmark evaluation failed');
  } catch (err) {
    console.warn('[API-FALLBACK] Benchmark backend unreachable', err);
    return null;
  }
};
