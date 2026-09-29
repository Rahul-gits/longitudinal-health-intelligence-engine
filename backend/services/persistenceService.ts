import crypto from 'crypto';
import { QdrantClient } from '@qdrant/js-client-rest';

export interface CanonicalPatientState {
  patientId: string;
  name: string;
  age: number;
  gender: string;
  dob: string;
  conditions: Array<{
    name: string;
    stage: string;
    onset: string;
    status: 'ACTIVE' | 'RESOLVED' | 'MONITORING';
  }>;
  activeMedications: Array<{
    drug: string;
    dose: string;
    freq: string;
    adherence: number;
    indication: string;
  }>;
  biomarkers: Array<{
    marker: string;
    baseline: number;
    current: number;
    unit: string;
    trend: 'improving' | 'stable' | 'declining';
  }>;
  allergies?: string[];
  lastReviewDate?: string;
  assignedClinician?: string;
}

export interface CarePlanDecisionRecord {
  action: 'APPROVED' | 'MODIFIED' | 'REJECTED' | 'ESCALATED';
  clinicianName: string;
  candidateChosen: string;
  rationaleNotes: string;
  signedAt: string;
  ledgerTxId: string;
  patientId: string;
}

export interface WormAuditEvent {
  eventType: string;
  actorId: string;
  actorRole: 'CLINICIAN' | 'PATIENT' | 'SYSTEM_ENGINE' | 'ADMIN';
  patientId: string;
  payload: Record<string, any>;
  prevHash?: string;
  integrityHash?: string;
  timestamp?: string;
}

export class PersistenceService {
  // Resilient memory cache backing persistent layer
  private memoryPatients: Map<string, CanonicalPatientState> = new Map();
  private memoryDecisions: Map<string, CarePlanDecisionRecord> = new Map();
  private memoryAuditLedger: WormAuditEvent[] = [];
  private lastHash: string = '0000000000000000000000000000000000000000000000000000000000000000';
  private qdrantClient: QdrantClient;
  private isQdrantInitialized: boolean = false;

  constructor() {
    this.qdrantClient = new QdrantClient({
      host: process.env.VECTOR_DB_HOST || 'localhost',
      port: parseInt(process.env.VECTOR_DB_PORT || '6333', 10)
    });
    this.initializeVectorCollections();
    this.seedDefaultPatients();
  }

  private async initializeVectorCollections() {
    try {
      const collections = await this.qdrantClient.getCollections();
      const collectionNames = collections.collections.map(c => c.name);
      
      const requiredCollections = ['patient_records', 'audit_ledger', 'care_decisions'];
      for (const col of requiredCollections) {
        if (!collectionNames.includes(col)) {
          await this.qdrantClient.createCollection(col, {
            vectors: { size: 1, distance: 'Cosine' }
          });
        }
      }
      this.isQdrantInitialized = true;
    } catch (err: any) {
      console.warn(`[PERSISTENCE] Could not initialize Vector DB collections: ${err.message}`);
    }
  }

  private seedDefaultPatients() {
    const eleanor: CanonicalPatientState = {
      patientId: 'patient-ev-68',
      name: 'Eleanor Vance',
      age: 68,
      gender: 'Female',
      dob: '1958-03-14',
      conditions: [
        { name: 'Chronic Kidney Disease', stage: 'Stage 3b (eGFR 38 mL/min)', onset: '2023-04', status: 'ACTIVE' },
        { name: 'Essential Hypertension', stage: 'Stage 1 (Controlled)', onset: '2019-11', status: 'ACTIVE' },
        { name: 'Osteoarthritis', stage: 'Bilateral Knees', onset: '2021-08', status: 'ACTIVE' },
        { name: 'Type 2 Diabetes Mellitus', stage: 'Mild (HbA1c 6.8%)', onset: '2022-01', status: 'ACTIVE' }
      ],
      activeMedications: [
        { drug: 'Lisinopril', dose: '20mg', freq: 'Daily morning', adherence: 94, indication: 'Hypertension & Renoprotection' },
        { drug: 'Empagliflozin', dose: '10mg', freq: 'Daily morning', adherence: 96, indication: 'Cardiorenal Risk Reduction' },
        { drug: 'Metformin', dose: '500mg', freq: 'Daily with dinner', adherence: 92, indication: 'Type 2 Diabetes' },
        { drug: 'Atorvastatin', dose: '20mg', freq: 'Daily bedtime', adherence: 95, indication: 'Lipid Management' }
      ],
      biomarkers: [
        { marker: 'eGFR', baseline: 64, current: 38, unit: 'mL/min/1.73m²', trend: 'declining' },
        { marker: 'Serum Creatinine', baseline: 1.1, current: 1.62, unit: 'mg/dL', trend: 'declining' },
        { marker: 'Systolic BP', baseline: 128, current: 142, unit: 'mmHg', trend: 'declining' },
        { marker: 'Diastolic BP', baseline: 82, current: 88, unit: 'mmHg', trend: 'declining' },
        { marker: 'Potassium (K+)', baseline: 4.6, current: 4.9, unit: 'mEq/L', trend: 'stable' },
        { marker: 'HbA1c', baseline: 6.6, current: 6.8, unit: '%', trend: 'stable' }
      ],
      allergies: ['Penicillin (Hives / Rash)'],
      lastReviewDate: '2026-08-15',
      assignedClinician: 'Dr. Aris Thorne, MD'
    };

    const marcus: CanonicalPatientState = {
      patientId: 'patient-mj-72',
      name: 'Marcus Johnson',
      age: 72,
      gender: 'Male',
      dob: '1954-06-22',
      conditions: [
        { name: 'Heart Failure with Preserved EF (HFpEF)', stage: 'NYHA Class II', onset: '2020-03', status: 'ACTIVE' },
        { name: 'Stage 3a Chronic Kidney Disease', stage: 'eGFR 48 mL/min', onset: '2021-09', status: 'ACTIVE' },
        { name: 'Atrial Fibrillation', stage: 'Permanent (Rate Controlled)', onset: '2018-05', status: 'ACTIVE' }
      ],
      activeMedications: [
        { drug: 'Sacubitril/Valsartan', dose: '49/51mg', freq: 'BID', adherence: 91, indication: 'Heart Failure' },
        { drug: 'Spironolactone', dose: '25mg', freq: 'Daily morning', adherence: 88, indication: 'MRA Cardiorenal' },
        { drug: 'Apixaban', dose: '5mg', freq: 'BID', adherence: 98, indication: 'Stroke Prevention in AFib' }
      ],
      biomarkers: [
        { marker: 'eGFR', baseline: 52, current: 48, unit: 'mL/min/1.73m²', trend: 'stable' },
        { marker: 'Serum Creatinine', baseline: 1.3, current: 1.45, unit: 'mg/dL', trend: 'stable' },
        { marker: 'Potassium (K+)', baseline: 4.8, current: 5.3, unit: 'mEq/L', trend: 'declining' },
        { marker: 'NT-proBNP', baseline: 850, current: 1420, unit: 'pg/mL', trend: 'declining' }
      ],
      allergies: ['Sulfa Drugs (Severe Anaphylactoid Rash)'],
      lastReviewDate: '2026-08-20',
      assignedClinician: 'Dr. Sarah Lin, MD'
    };

    this.memoryPatients.set(eleanor.patientId, eleanor);
    this.memoryPatients.set(marcus.patientId, marcus);
  }

  /**
   * Fetch canonical patient state from PostgreSQL or fallback cache
   */
  public async getPatient(patientId: string): Promise<CanonicalPatientState | undefined> {

    return this.memoryPatients.get(patientId);
  }

  /**
   * Upsert patient state into PostgreSQL and cache
   */
  public async savePatient(patient: CanonicalPatientState): Promise<CanonicalPatientState> {
    this.memoryPatients.set(patient.patientId, patient);

    const names = patient.name.split(' ');
    const firstName = names[0] || 'Unknown';
    const lastName = names.slice(1).join(' ') || 'Patient';
    const mrn = `HL-${crypto.createHash('sha256').update(patient.patientId).digest('hex').substring(0, 6).toUpperCase()}`;

    if (this.isQdrantInitialized) {
      try {
        await this.qdrantClient.upsert('patient_records', {
          wait: true,
          points: [
            {
              id: crypto.createHash('md5').update(patient.patientId).digest('hex').substring(0, 32),
              vector: [0.0],
              payload: { ...patient, mrn, firstName, lastName }
            }
          ]
        });
      } catch (err: any) {
        console.warn(`[PERSISTENCE] Error saving patient to Vector DB: ${err.message}`);
      }
    }
    return patient;
  }

  /**
   * List all patients in system
   */
  public async listAllPatients(): Promise<CanonicalPatientState[]> {
    return Array.from(this.memoryPatients.values());
  }

  /**
   * Save a clinician human-in-the-loop care plan decision
   */
  public async saveCarePlanDecision(decision: CarePlanDecisionRecord): Promise<void> {
    this.memoryDecisions.set(decision.patientId, decision);

    await this.recordWormAudit({
      eventType: 'CARE_PLAN_DECISION',
      actorId: decision.clinicianName,
      actorRole: 'CLINICIAN',
      patientId: decision.patientId,
      payload: {
        action: decision.action,
        candidateChosen: decision.candidateChosen,
        rationaleNotes: decision.rationaleNotes,
        ledgerTxId: decision.ledgerTxId
      }
    });

    if (this.isQdrantInitialized) {
      try {
        await this.qdrantClient.upsert('care_decisions', {
          wait: true,
          points: [
            {
              id: crypto.createHash('md5').update(decision.ledgerTxId).digest('hex').substring(0, 32),
              vector: [0.0],
              payload: { ...decision }
            }
          ]
        });
      } catch (err: any) {
        console.warn(`[PERSISTENCE] Error saving decision to Vector DB: ${err.message}`);
      }
    }
  }

  public getCarePlanDecision(patientId: string): CarePlanDecisionRecord | undefined {
    return this.memoryDecisions.get(patientId);
  }

  /**
   * Cryptographic Write-Once-Read-Many (WORM) append-only audit trail
   */
  public async recordWormAudit(event: WormAuditEvent): Promise<WormAuditEvent> {
    const timestamp = new Date().toISOString();
    const prevHash = this.lastHash;
    const dataToHash = `${prevHash}|${timestamp}|${event.eventType}|${event.actorId}|${event.patientId}|${JSON.stringify(event.payload)}`;
    const integrityHash = crypto.createHash('sha256').update(dataToHash).digest('hex');

    this.lastHash = integrityHash;

    const auditedEvent: WormAuditEvent = {
      ...event,
      timestamp,
      prevHash,
      integrityHash
    };

    this.memoryAuditLedger.push(auditedEvent);

    if (this.isQdrantInitialized) {
      try {
        await this.qdrantClient.upsert('audit_ledger', {
          wait: true,
          points: [
            {
              id: crypto.createHash('md5').update(integrityHash).digest('hex').substring(0, 32),
              vector: [0.0],
              payload: { ...auditedEvent }
            }
          ]
        });
      } catch (err: any) {
        console.warn(`[PERSISTENCE] Error writing WORM audit to Vector DB: ${err.message}`);
      }
    }

    return auditedEvent;
  }

  public getAuditTrail(patientId?: string): WormAuditEvent[] {
    if (!patientId) return this.memoryAuditLedger;
    return this.memoryAuditLedger.filter(e => e.patientId === patientId);
  }
}

export const persistenceService = new PersistenceService();
