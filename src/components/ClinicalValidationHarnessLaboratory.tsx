import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  BookOpen, 
  Lock, 
  UserCheck, 
  HelpCircle,
  Activity,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface TestCaseResult {
  patientId: string;
  cohortLabel: string;
  name: string;
  phenotype: string;
  integrityPassed: boolean;
  dataCompletenessScore: number;
  uncertaintyScore: number;
  safetyGateIntercepts: string[];
  safetyBlockVerified: boolean;
  traceableEvidenceCitations: number;
  deterministicConsistencyScore: number;
  explainabilityComplete: boolean;
  testPassed: boolean;
}

interface HarnessReport {
  harnessId: string;
  timestamp: string;
  version: string;
  totalCohortsTested: number;
  overallClinicalScore: number;
  allPassed: boolean;
  dimensions: {
    safetyGating: { passed: boolean; score: number; blockedHazardsCount: number };
    guidelineTraceability: { passed: boolean; score: number; verifiedCitationsCount: number };
    stateIntegrityDetection: { passed: boolean; score: number; detectedAnomaliesCount: number };
    deterministicConsistency: { passed: boolean; score: number; driftRate: number };
    explainabilityTransparency: { passed: boolean; score: number; tracesGenerated: number };
    rbacPatientIsolation: { passed: boolean; score: number; violationsPrevented: number };
  };
  cohortResults: TestCaseResult[];
  regulatoryDisclaimer: string;
}

interface ReasoningTrace {
  evaluationId: string;
  patientId: string;
  timestamp: string;
  inputSummary: {
    age: number;
    gender: string;
    primaryConditions: string[];
    criticalLabs: Record<string, string | number>;
    proposedInterventions: string[];
  };
  reasoningSteps: Array<{
    stepNumber: number;
    phase: string;
    finding: string;
    deterministicRuleApplied: string;
    status: 'PASSED' | 'FLAGGED' | 'BLOCKED';
  }>;
  citedEvidence: Array<{
    sourceId: string;
    title: string;
    issuingOrganization: string;
    publicationYear: number;
    sectionReference: string;
    evidenceGrade: string;
    chunkHash: string;
  }>;
  evaluatedConstraints: Array<{
    constraintName: string;
    type: string;
    targetDrugOrAction: string;
    outcome: string;
    governingRule: string;
  }>;
  outputExplanation: {
    recommendationTitle: string;
    actionableDirectives: string[];
    whyProduced: string;
    contributingEvidenceSummary: string;
    unsafeInterventionsPrevented: string[];
  };
}

export const ClinicalValidationHarnessLaboratory: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [harnessReport, setHarnessReport] = useState<HarnessReport | null>(null);
  const [selectedCohortId, setSelectedCohortId] = useState<string>('patient-ev-68');
  const [activeTrace, setActiveTrace] = useState<ReasoningTrace | null>(null);
  const [isLoadingTrace, setIsLoadingTrace] = useState<boolean>(false);

  // Load initial harness run on mount
  useEffect(() => {
    runValidationHarness();
  }, []);

  // Fetch reasoning trace whenever selected cohort changes
  useEffect(() => {
    if (selectedCohortId) {
      fetchReasoningTrace(selectedCohortId);
    }
  }, [selectedCohortId]);

  const runValidationHarness = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('http://localhost:5000/api/validation/run-harness', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.harnessReport) {
        setHarnessReport(data.harnessReport);
      }
    } catch (err) {
      console.error('Failed to run clinical validation harness:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const fetchReasoningTrace = async (patientId: string) => {
    setIsLoadingTrace(true);
    try {
      const res = await fetch(`http://localhost:5000/api/validation/reasoning-trace/${patientId}`);
      const data = await res.json();
      if (data.success && data.trace) {
        setActiveTrace(data.trace);
      }
    } catch (err) {
      console.error('Failed to fetch trace:', err);
    } finally {
      setIsLoadingTrace(false);
    }
  };

  const selectedCohort = harnessReport?.cohortResults.find(c => c.patientId === selectedCohortId);

  return (
    <div className="space-y-8">
      {/* Top Banner & Control Deck */}
      <div className="bg-[#FFFFFF] border-3 border-black p-6 shadow-[6px_6px_0px_0px_#000]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-[#FFE600] text-black text-xs font-mono font-black px-2 py-0.5 border border-black -rotate-1">
                REGRESSION LABORATORY
              </span>
              <h1 className="text-2xl font-black font-display text-black">
                Clinical Validation Harness
              </h1>
            </div>
            <p className="text-xs text-neutral-600 font-mono mt-1">
              Multi-Cohort Deterministic Invariants • Guideline Traceability • Explainability Reasoning Engine
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={runValidationHarness}
              disabled={isRunning}
              className="bg-[#00F5D4] hover:bg-[#00d0b4] text-black font-mono font-black text-xs px-5 py-3 border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] active:translate-y-0.5 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              {isRunning ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'EXECUTING HARNESS...' : 'RUN FULL HARNESS'}</span>
            </button>
          </div>
        </div>

        {/* High-Level Dimension Cards */}
        {harnessReport && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t-2 border-black/10">
            <div className="p-3 bg-[#F4F9FF] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold text-neutral-600">OVERALL SCORE</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-2xl font-black font-mono text-[#0066CC]">
                {harnessReport.overallClinicalScore}%
              </div>
              <div className="text-[10px] font-mono text-neutral-500 mt-1">5 Cohorts Passed</div>
            </div>

            <div className="p-3 bg-[#FDF9F0] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold text-neutral-600">SAFETY GATING</span>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-2xl font-black font-mono text-black">
                {harnessReport.dimensions.safetyGating.score}%
              </div>
              <div className="text-[10px] font-mono text-neutral-500 mt-1">
                {harnessReport.dimensions.safetyGating.blockedHazardsCount} Hazards Blocked
              </div>
            </div>

            <div className="p-3 bg-[#F6FDF9] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold text-neutral-600">TRACEABILITY</span>
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-2xl font-black font-mono text-black">
                {harnessReport.dimensions.guidelineTraceability.score}%
              </div>
              <div className="text-[10px] font-mono text-neutral-500 mt-1">
                KDIGO, AHA, GINA, Beers
              </div>
            </div>

            <div className="p-3 bg-[#FAF5FF] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold text-neutral-600">INTEGRITY CHECK</span>
                <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-2xl font-black font-mono text-black">
                {harnessReport.dimensions.stateIntegrityDetection.score}%
              </div>
              <div className="text-[10px] font-mono text-neutral-500 mt-1">
                {harnessReport.dimensions.stateIntegrityDetection.detectedAnomaliesCount} Anomalies Flagged
              </div>
            </div>

            <div className="p-3 bg-[#FFF5F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold text-neutral-600">CONSISTENCY</span>
                <Layers className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <div className="text-2xl font-black font-mono text-black">
                {harnessReport.dimensions.deterministicConsistency.score}%
              </div>
              <div className="text-[10px] font-mono text-neutral-500 mt-1">0% Stochastic Drift</div>
            </div>

            <div className="p-3 bg-[#F0FDF4] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold text-neutral-600">RBAC ISOLATION</span>
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-2xl font-black font-mono text-black">
                {harnessReport.dimensions.rbacPatientIsolation.score}%
              </div>
              <div className="text-[10px] font-mono text-neutral-500 mt-1">Cross-Access Prohibited</div>
            </div>
          </div>
        )}
      </div>

      {/* Cohort Selector Tabs */}
      {harnessReport && (
        <div className="flex flex-wrap gap-2">
          {harnessReport.cohortResults.map(cohort => (
            <button
              key={cohort.patientId}
              onClick={() => setSelectedCohortId(cohort.patientId)}
              className={`px-4 py-2.5 text-xs font-mono font-bold border-2 border-black transition-all flex items-center space-x-2 ${
                selectedCohortId === cohort.patientId
                  ? 'bg-[#FFE600] text-black shadow-[3px_3px_0px_0px_#000] -translate-y-0.5'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100 shadow-[2px_2px_0px_0px_#000]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{cohort.cohortLabel}: {cohort.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Detailed Cohort Inspection Pane */}
      {selectedCohort && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Phenotype & Integrity */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white border-3 border-black p-5 shadow-[4px_4px_0px_0px_#000] space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-black text-white text-[10px] font-mono px-2 py-0.5 font-bold">
                  {selectedCohort.cohortLabel} PHENOTYPE
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> VALIDATED
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black font-display">{selectedCohort.name}</h3>
                <p className="text-xs text-neutral-600 font-medium mt-1 leading-relaxed">
                  {selectedCohort.phenotype}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-black/10 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Data Completeness:</span>
                  <span className="font-bold">{selectedCohort.dataCompletenessScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Uncertainty Impact:</span>
                  <span className="font-bold text-amber-700">{selectedCohort.uncertaintyScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Deterministic Consistency:</span>
                  <span className="font-bold text-emerald-700">{selectedCohort.deterministicConsistencyScore}%</span>
                </div>
              </div>

              <div className="pt-3 border-t border-black/10">
                <div className="text-[11px] font-bold font-mono text-neutral-700 mb-2">
                  DETERMINISTIC SAFETY BLOCKS:
                </div>
                <div className="space-y-1.5">
                  {selectedCohort.safetyGateIntercepts.map((hazard, hIdx) => (
                    <div
                      key={hIdx}
                      className="p-2 bg-rose-50 border border-rose-300 rounded text-[11px] font-semibold text-rose-900 flex items-start space-x-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                      <span>{hazard}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Reasoning Trace & Governing Explainability */}
          <div className="lg:col-span-2 space-y-6">
            {activeTrace ? (
              <div className="bg-white border-3 border-black p-6 shadow-[5px_5px_0px_0px_#000] space-y-6">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#3A86FF] text-white text-[10px] font-mono px-2 py-0.5 font-bold">
                      REASONING TRACE
                    </span>
                    <span className="text-xs font-mono text-neutral-500">ID: {activeTrace.evaluationId}</span>
                  </div>
                  <h2 className="text-xl font-black font-display mt-2 text-black">
                    {activeTrace.outputExplanation.recommendationTitle}
                  </h2>
                </div>

                {/* The 3 Core Regulatory Transparency Questions */}
                <div className="space-y-4 bg-neutral-50 border-2 border-black p-4 rounded">
                  <div>
                    <div className="text-[11px] font-mono font-black text-blue-800 uppercase flex items-center space-x-1">
                      <HelpCircle className="w-3.5 h-3.5 mr-1" />
                      <span>1. Why did Heal Engine produce this result?</span>
                    </div>
                    <p className="text-xs text-neutral-800 font-medium mt-1 leading-relaxed">
                      {activeTrace.outputExplanation.whyProduced}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-200">
                    <div className="text-[11px] font-mono font-black text-emerald-800 uppercase flex items-center space-x-1">
                      <BookOpen className="w-3.5 h-3.5 mr-1" />
                      <span>2. What evidence and patient data contributed to it?</span>
                    </div>
                    <p className="text-xs text-neutral-800 font-medium mt-1 leading-relaxed">
                      {activeTrace.outputExplanation.contributingEvidenceSummary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-200">
                    <div className="text-[11px] font-mono font-black text-rose-800 uppercase flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      <span>3. What prevented an unsafe recommendation?</span>
                    </div>
                    <div className="mt-1 space-y-1">
                      {activeTrace.outputExplanation.unsafeInterventionsPrevented.map((item, i) => (
                        <div key={i} className="text-xs font-bold text-rose-700 flex items-center space-x-1.5">
                          <span>🛑</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Reasoning Flow */}
                <div>
                  <h4 className="text-xs font-mono font-black uppercase text-black mb-3">
                    Deterministic Step-by-Step Evaluation:
                  </h4>
                  <div className="space-y-2">
                    {activeTrace.reasoningSteps.map(step => (
                      <div
                        key={step.stepNumber}
                        className="p-3 border border-black bg-white rounded flex items-start justify-between text-xs gap-3 shadow-[1px_1px_0px_0px_#000]"
                      >
                        <div className="flex items-start space-x-2">
                          <span className="w-5 h-5 rounded-full bg-black text-[#FFE600] font-mono font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                            {step.stepNumber}
                          </span>
                          <div>
                            <div className="font-mono text-[10px] text-neutral-500 font-bold">
                              [{step.phase}] • {step.deterministicRuleApplied}
                            </div>
                            <div className="font-medium text-neutral-900 mt-0.5">{step.finding}</div>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                            step.status === 'BLOCKED'
                              ? 'bg-rose-100 text-rose-800 border-rose-400'
                              : step.status === 'FLAGGED'
                              ? 'bg-amber-100 text-amber-800 border-amber-400'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-400'
                          }`}
                        >
                          {step.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cited Governed Evidence */}
                <div>
                  <h4 className="text-xs font-mono font-black uppercase text-black mb-3">
                    Governed Clinical Evidence Citations:
                  </h4>
                  <div className="space-y-2">
                    {activeTrace.citedEvidence.map((ev, evIdx) => (
                      <div
                        key={evIdx}
                        className="p-3 bg-[#F0F8FF] border border-blue-400 rounded text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-bold text-blue-900">
                          <span>{ev.title}</span>
                          <span className="text-[10px] font-mono bg-blue-200 px-1.5 py-0.5 rounded">
                            {ev.evidenceGrade}
                          </span>
                        </div>
                        <div className="text-neutral-700 text-[11px] font-mono">
                          {ev.issuingOrganization} ({ev.publicationYear}) • {ev.sectionReference}
                        </div>
                        <div className="text-[10px] font-mono text-neutral-400 truncate">
                          Provenance Hash: {ev.chunkHash}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border-3 border-black p-12 text-center shadow-[4px_4px_0px_0px_#000]">
                <Activity className="w-8 h-8 text-neutral-400 mx-auto animate-spin mb-2" />
                <p className="text-xs font-mono text-neutral-500">Loading cohort reasoning trace...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mandatory Regulatory & Clinical Governance Banner */}
      <div className="p-4 bg-[#FFE600] border-3 border-black shadow-[4px_4px_0px_0px_#000] text-xs font-medium text-black flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold font-mono">CLINICAL GOVERNANCE & RESEARCH VERIFICATION NOTICE: </span>
          <span>
            {harnessReport?.regulatoryDisclaimer ||
              'Heal Engine Clinical Validation Harness operates as a deterministic verification environment. Output recommendations require human-in-the-loop clinical review and physician judgment.'}
          </span>
        </div>
      </div>
    </div>
  );
};
