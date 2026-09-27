-- ==============================================================================
-- HEAL ENGINE: Production Database Schema (PostgreSQL 16 + TimescaleDB)
-- Target Class: Class IIa / Class IIb SaMD & Clinical Decision Support System
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- CREATE EXTENSION IF NOT EXISTS "timescaledb"; -- Uncomment in TimescaleDB instance

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(64) PRIMARY KEY,
    mrn VARCHAR(64) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    blood_type VARCHAR(10),
    primary_care_physician VARCHAR(150),
    baseline_egfr NUMERIC(5, 2),
    baseline_creatinine NUMERIC(5, 2),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Versioned Patient Consents (RFC-3881 & HIPAA Compliance)
CREATE TABLE IF NOT EXISTS patient_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id VARCHAR(64) REFERENCES patients(id) ON DELETE CASCADE,
    consent_version VARCHAR(20) NOT NULL,
    hipaa_data_sharing BOOLEAN NOT NULL DEFAULT FALSE,
    care_team_authorization BOOLEAN NOT NULL DEFAULT FALSE,
    ai_screening_authorized BOOLEAN NOT NULL DEFAULT FALSE,
    sha256_audit_hash VARCHAR(66) NOT NULL,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT
);

-- 3. Immutable WORM Audit Trail (Append-Only, Non-Repudiation)
CREATE TABLE IF NOT EXISTS audit_events_worm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(50) NOT NULL, -- SAFETY_OVERRIDE, ORDER_BATCH_SIGN, NLP_ASSERTION, CDS_HOOK_INTERCEPT
    actor_id VARCHAR(100) NOT NULL,
    actor_role VARCHAR(50) NOT NULL, -- CLINICIAN, PATIENT, SYSTEM_ENGINE
    patient_id VARCHAR(64) REFERENCES patients(id),
    payload JSONB NOT NULL,
    prev_hash VARCHAR(66),
    integrity_hash VARCHAR(66) NOT NULL,
    pki_signature VARCHAR(512) -- Optional X.509/KMS signature
);
CREATE INDEX IF NOT EXISTS idx_audit_patient ON audit_events_worm(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_events_worm(timestamp);

-- 4. Longitudinal Biomarker Time-Series (TimescaleDB Hypertable Ready)
CREATE TABLE IF NOT EXISTS biomarker_telemetry (
    time TIMESTAMPTZ NOT NULL,
    patient_id VARCHAR(64) REFERENCES patients(id),
    marker_name VARCHAR(64) NOT NULL, -- eGFR, Serum Creatinine, SBP, DBP, Pulse, Weight, NT-proBNP
    value NUMERIC(10, 3) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    source_device VARCHAR(100), -- Smart Cuff BLE, Lab PDF, Outpatient EHR, Manual
    anomaly_flag VARCHAR(50) -- OPTIMAL, ELEVATED, CRITICAL_DECLINE
);
-- SELECT create_hypertable('biomarker_telemetry', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_biomarker_query ON biomarker_telemetry(patient_id, marker_name, time DESC);

-- 5. Ingested Documents & Provenance
CREATE TABLE IF NOT EXISTS clinical_documents (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) REFERENCES patients(id),
    title VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- Lab Record, Clinical Note, Prescription, Wearable Stream
    file_size VARCHAR(50),
    s3_object_key VARCHAR(512),
    mime_type VARCHAR(100),
    ocr_status VARCHAR(50) DEFAULT 'PROCESSED', -- PENDING, PROCESSING, PROCESSED, FAILED
    extracted_entities_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Clinical Job Queue Table (Async Queue Persistence)
CREATE TABLE IF NOT EXISTS clinical_jobs (
    id VARCHAR(64) PRIMARY KEY,
    job_type VARCHAR(64) NOT NULL, -- OCR_PROCESSING, DOCUMENT_PARSING, RAG_EMBEDDING, LONGITUDINAL_RECALC
    status VARCHAR(30) NOT NULL DEFAULT 'QUEUED', -- QUEUED, PROCESSING, COMPLETED, FAILED
    progress INT DEFAULT 0,
    worker_node VARCHAR(100),
    payload JSONB NOT NULL,
    result JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON clinical_jobs(status);

-- 7. Seed Initial Patient Eleanor Vance
INSERT INTO patients (id, mrn, first_name, last_name, date_of_birth, gender, blood_type, primary_care_physician, baseline_egfr, baseline_creatinine)
VALUES ('patient-ev-68', 'HL-882910', 'Eleanor', 'Vance', '1958-03-14', 'Female', 'A+', 'Dr. Aris Thorne, MD', 64.00, 1.10)
ON CONFLICT (id) DO NOTHING;
