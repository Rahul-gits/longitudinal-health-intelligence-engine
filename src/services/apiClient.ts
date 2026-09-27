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

/**
 * Real-Time Server-Sent Events (SSE) Bus Listener
 * Listens for asynchronous clinical events (overrides, order signs, job updates).
 */
export const subscribeToWorkflowEvents = (
  onEvent: (eventType: string, data: any) => void
): (() => void) => {
  if (typeof window === 'undefined' || !('EventSource' in window)) {
    return () => {};
  }

  try {
    const eventSource = new EventSource('/api/workflow/events/stream');

    eventSource.addEventListener('message', (e) => {
      try {
        const parsed = JSON.parse(e.data);
        onEvent('MESSAGE', parsed);
      } catch (err) {
        // ignore malformed
      }
    });

    const eventNames = [
      'SAFETY_OVERRIDE_AUTHORIZED', 
      'ORDERS_BATCH_SIGNED', 
      'JOB_ENQUEUED', 
      'CDS_HOOK_EVALUATED',
      'CLINICIAN_DECISION_RECORDED',
      'TASK_STATUS_CHANGED',
      'VIRTUAL_DOCTOR_ESCALATION',
      'SCENARIO_SUITE_EVALUATED'
    ];
    eventNames.forEach(evt => {
      eventSource.addEventListener(evt, (e: any) => {
        try {
          const parsed = JSON.parse(e.data);
          onEvent(evt, parsed);
        } catch (err) {
          // ignore
        }
      });
    });

    return () => {
      eventSource.close();
    };
  } catch (err) {
    console.warn('SSE subscription notice:', err);
    return () => {};
  }
};

/**
 * Semantic Vector Guideline Retrieval
 */
export const searchGuidelinesVector = async (query: string, org?: string) => {
  try {
    const url = `/api/workflow/vector/search?q=${encodeURIComponent(query)}${org ? `&org=${encodeURIComponent(org)}` : ''}`;
    const res = await fetch(url);
    if (res.ok) return await res.json();
    return null;
  } catch (err) {
    console.warn('Vector search fallback:', err);
    return null;
  }
};

/**
 * Asynchronous Background Task Enqueuer
 */
export const enqueueBackgroundJob = async (type: string, payload: Record<string, any>) => {
  try {
    const res = await fetch('/api/workflow/jobs/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload })
    });
    if (res.ok) return await res.json();
    return null;
  } catch (err) {
    console.warn('Job enqueue fallback:', err);
    return null;
  }
};

/**
 * SMART-on-FHIR CDS Hooks Evaluation
 */
export const evaluateCdsHookMedication = async (medications: Array<{ code: string; display: string }>) => {
  try {
    const res = await fetch('/api/workflow/cds-services/medication-prescribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hook: 'medication-prescribe',
        hookInstance: `hook-${Date.now()}`,
        context: {
          patientId: 'patient-ev-68',
          userId: 'dr-thorne',
          medications
        }
      })
    });
    if (res.ok) return await res.json();
    return null;
  } catch (err) {
    console.warn('CDS Hook evaluation fallback:', err);
    return null;
  }
};

/**
 * Execute Automated Clinical Scenario Test Suite (Scenarios 001-004)
 */
export const runClinicalScenarioSuite = async () => {
  try {
    const res = await fetch('/api/workflow/scenarios/run-suite', { method: 'POST' });
    if (res.ok) return await res.json();
    return null;
  } catch (err) {
    console.warn('Clinical scenario test suite fallback:', err);
    return null;
  }
};

/**
 * Record a Virtual Doctor Dialogue Turn with NegEx & Longitudinal Safety
 */
export const recordVirtualDoctorTurn = async (params: {
  sessionId: string;
  patientResponseRaw: string;
  questionVersionId?: string;
  doctorQuestionScript?: string;
  doctorPosture?: string;
}) => {
  try {
    const res = await fetch('/api/workflow/virtual-doctor/turn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (res.ok) return await res.json();
    return null;
  } catch (err) {
    console.warn('Virtual doctor turn fallback:', err);
    return null;
  }
};

/**
 * Fetch AI Model, Prompt & Clinical Rules Version Registry
 */
export const fetchAiGovernanceRegistry = async () => {
  try {
    const res = await fetch('/api/workflow/governance/registry');
    if (res.ok) return await res.json();
    return null;
  } catch (err) {
    console.warn('AI Governance registry fallback:', err);
    return null;
  }
};

/**
 * Fetch System & Clinical Observability Metrics
 */
export const fetchObservabilityMetrics = async () => {
  try {
    const res = await fetch('/api/workflow/observability/metrics');
    if (res.ok) return await res.json();
    return null;
  } catch (err) {
    console.warn('Observability metrics fallback:', err);
    return null;
  }
};

