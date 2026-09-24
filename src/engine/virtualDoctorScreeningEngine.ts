import { 
  VirtualDoctorPersona, 
  ScreeningDialogueStep, 
  DoctorPostureMode, 
  PatientClinicalState,
  PatientScreeningOption
} from '../types/health';
import { patientStateEngine } from './patientStateEngine';
import { AuthUser, getStoredUser } from '../services/authApi';
import { getDynamicPatientProfile } from '../data/mockPatientData';

export class VirtualDoctorScreeningEngine {
  private basePersonas: VirtualDoctorPersona[] = [
    {
      id: 'doc-thorne',
      name: 'Dr. Aris Thorne, MD',
      title: 'Chief of Cardiorenal Medicine',
      specialty: 'Cardiorenal & Vascular Medicine',
      credentials: 'MD, FACC, FASN • Harvard Medical School',
      avatarColor: '#3A86FF',
      badgeBg: '#00F5D4',
      accentColor: '#3A86FF',
      voicePitch: 0.95,
      voiceRate: 1.0,
      preferredVoiceName: 'Daniel',
      clinicalFocus: 'Acute-on-Chronic Renal Perfusion & Fluid Hemodynamics',
      greetingScript: 'Hello {NAME}. I am Dr. Aris Thorne from the Cardiorenal care team. We have been monitoring your continuous telemetry and recent lab reports. I am reaching out for a priority video screening to review your kidney markers and circulation.',
      explanationScript: 'Looking at your longitudinal record, your baseline kidney filtration rate was steady. However, recent markers show an acute drop, while cardiac strain marker NT-proBNP rose. We are also monitoring your reports of shortness of breath and fluid accumulation.',
      safetyAlertScript: 'Our safety engine identified a critical factor: concurrent analgesic intake interacting with your blood pressure regimen restricts renal arteriolar blood flow into your kidney filters.',
      actionPlanScript: 'Here is our clear action plan: 1. Stop taking oral NSAIDs immediately. 2. We will substitute safe topical analgesia. 3. We will re-check your blood chemistry in 7 days to ensure your kidney function bounces back.',
      longitudinalClustersCited: ['reports', 'symptoms', 'medication', 'risk'],
      biomarkerFocus: [
        {
          name: 'eGFR (Kidney Filtration)',
          currentValue: '52 mL/min',
          baselineValue: '64 mL/min',
          trend: 'deteriorating',
          clinicalImpact: '18.7% acute drop due to afferent arteriolar constriction'
        },
        {
          name: 'NT-proBNP (Cardiac Strain)',
          currentValue: '480 pg/mL',
          baselineValue: '180 pg/mL',
          trend: 'deteriorating',
          clinicalImpact: 'Mild fluid retention from reduced renal clearance'
        },
        {
          name: 'Serum Creatinine',
          currentValue: '1.45 mg/dL',
          baselineValue: '1.18 mg/dL',
          trend: 'deteriorating',
          clinicalImpact: 'Reflects acute hemodynamic workload on nephrons'
        }
      ]
    },
    {
      id: 'doc-lin',
      name: 'Dr. Maya Lin, PharmD',
      title: 'Geriatric Clinical Pharmacologist',
      specialty: 'Precision Pharmacotherapy & Drug Interactions',
      credentials: 'PharmD, BCPS • Johns Hopkins Medicine',
      avatarColor: '#FF70A6',
      badgeBg: '#FFE600',
      accentColor: '#FF70A6',
      voicePitch: 1.1,
      voiceRate: 1.02,
      preferredVoiceName: 'Samantha',
      clinicalFocus: 'Drug-Drug Interactions & CYP2C9 Pharmacogenomics',
      greetingScript: 'Hello Eleanor, wonderful to see you. I am Dr. Maya Lin, your clinical pharmacologist. I want to walk you through exactly what is happening between your medications in simple, everyday terms.',
      explanationScript: 'Your genetic panel shows you carry the CYP2C9 intermediate metabolizer variant. This means your body clears NSAIDs like Ibuprofen about 40% slower than average, causing the medication to stay active in your kidneys much longer.',
      safetyAlertScript: 'Because Lisinopril already relaxes the exit valve of your kidney filters, the Ibuprofen simultaneously tightens the entry valve. This creates a pinch that reduces filtration pressure. We call this the double-whammy interaction.',
      actionPlanScript: 'Good news: this is completely reversible once we stop the Ibuprofen. I have queued a prescription for topical Diclofenac gel and Acetaminophen which deliver pain relief straight to the knee joint without circulating through your kidneys.',
      longitudinalClustersCited: ['medication', 'history', 'risk'],
      biomarkerFocus: [
        {
          name: 'CYP2C9*3 Genetic Clearance',
          currentValue: 'Intermediate Metabolizer',
          baselineValue: 'Normal Clearance',
          trend: 'stable',
          clinicalImpact: 'Extends systemic half-life of oral NSAIDs by 40%'
        },
        {
          name: 'Lisinopril + Ibuprofen Interaction',
          currentValue: 'HIGH RISK CONCURRENT',
          baselineValue: 'Safe Single Agent',
          trend: 'deteriorating',
          clinicalImpact: 'Arteriolar hemodynamics mismatch causing AKI risk'
        }
      ]
    },
    {
      id: 'doc-vance',
      name: 'Dr. Marcus Vance, MD',
      title: 'Primary Care Physician & Patient Advocate',
      specialty: 'Family Medicine & Chronic Care Management',
      credentials: 'MD, FAAFP • UCSF Medical Center',
      avatarColor: '#00F5D4',
      badgeBg: '#FF70A6',
      accentColor: '#00F5D4',
      voicePitch: 0.9,
      voiceRate: 0.98,
      preferredVoiceName: 'Alex',
      clinicalFocus: 'Holistic Symptom Management & Daily Mobility',
      greetingScript: 'Hi Eleanor, good to speak with you today. As your primary care physician, my top priority is making sure you can stay active, sleep comfortably, and keep your knee pain well managed without putting your kidneys in jeopardy.',
      explanationScript: 'I noticed in your daily logs that you have been having trouble walking up stairs and noted some puffiness in your ankles in the evening. It makes total sense why you reached for the Ibuprofen, but we have much safer options.',
      safetyAlertScript: 'If you ever notice your breathing feeling heavier when lying flat in bed, or sudden weight gain over 3 pounds in 2 days, that means your body is holding onto extra water. That is a clear sign to call our office directly.',
      actionPlanScript: 'Let us get you set up with low-impact seated knee exercises, gentle heat therapy, and safe pain relief. You are doing great by monitoring your symptoms, and we will get your kidney numbers right back on track.',
      longitudinalClustersCited: ['symptoms', 'lifestyle', 'recovery'],
      biomarkerFocus: [
        {
          name: 'Right Knee Joint Pain',
          currentValue: '6 / 10 Severity',
          baselineValue: '3 / 10 Baseline',
          trend: 'deteriorating',
          clinicalImpact: 'Triggered self-medication with OTC Ibuprofen'
        },
        {
          name: 'Leg Edema / Swelling',
          currentValue: '2+ Pitting Edema',
          baselineValue: 'None',
          trend: 'deteriorating',
          clinicalImpact: 'Early peripheral fluid accumulation'
        },
        {
          name: 'Daily Step Count',
          currentValue: '3,840 steps/day',
          baselineValue: '5,500 steps/day',
          trend: 'deteriorating',
          clinicalImpact: 'Mobility reduced due to knee stiffness'
        }
      ]
    },
    {
      id: 'doc-chen',
      name: 'Dr. Sarah Chen, MD',
      title: 'Preventive Nephrology Specialist',
      specialty: 'Renal Function Recovery & Electrolyte Balance',
      credentials: 'MD, PhD • Stanford University School of Medicine',
      avatarColor: '#CCFF00',
      badgeBg: '#3A86FF',
      accentColor: '#CCFF00',
      voicePitch: 1.05,
      voiceRate: 1.0,
      preferredVoiceName: 'Karen',
      clinicalFocus: '7-Day Renal Recovery Trajectory & Hydration Protocol',
      greetingScript: 'Hello Eleanor, I am Dr. Sarah Chen from Nephrology. I specialize in protecting and restoring kidney function. I am here to guide your 7-day renal recovery pathway.',
      explanationScript: 'Your kidneys are resilient organs. Because this eGFR dip occurred recently over just three weeks, removing the offending medication typically allows intraglomerular pressure to normalize within 5 to 7 days.',
      safetyAlertScript: 'While we pause the Ibuprofen, it is crucial that you stay properly hydrated with 1.5 to 2 liters of water daily, and avoid high-potassium salt substitutes while on Lisinopril.',
      actionPlanScript: 'We have ordered a follow-up Renal Function Panel for you on August 20th. If your eGFR returns above 60 as we expect, you will remain safely in Stage 2 CKD without long-term damage.',
      longitudinalClustersCited: ['reports', 'medication', 'recovery'],
      biomarkerFocus: [
        {
          name: 'Renal Recovery Trajectory',
          currentValue: 'Target: > 60 mL/min',
          baselineValue: '64 mL/min',
          trend: 'improving',
          clinicalImpact: 'Projected 7-day rebound following NSAID cessation'
        },
        {
          name: 'Serum Potassium (K+)',
          currentValue: '4.4 mEq/L (Normal)',
          baselineValue: '4.2 mEq/L',
          trend: 'stable',
          clinicalImpact: 'Maintain within safe 3.5 - 5.0 mEq/L range'
        }
      ]
    }
  ];

  public getPersonas(userOverride?: AuthUser | null): VirtualDoctorPersona[] {
    const user = userOverride !== undefined ? userOverride : getStoredUser();
    const dynamicProfile = getDynamicPatientProfile(user);
    const firstName = dynamicProfile.name.split(' ')[0] || 'Patient';

    return this.basePersonas.map(p => ({
      ...p,
      greetingScript: p.greetingScript.replace('{NAME}', firstName)
    }));
  }

  public getPersonaById(id: string, userOverride?: AuthUser | null): VirtualDoctorPersona {
    const personas = this.getPersonas(userOverride);
    return personas.find(p => p.id === id) || personas[0];
  }

  public getScreeningDialogue(personaId: string, userOverride?: AuthUser | null): ScreeningDialogueStep[] {
    const user = userOverride !== undefined ? userOverride : getStoredUser();
    const persona = this.getPersonaById(personaId, user);
    const patientState: PatientClinicalState = patientStateEngine.getPatientState(user);

    return [
      {
        id: 'step-1',
        stepNumber: 1,
        phase: 'welcome',
        title: 'Tele-Health Consultation Welcome',
        spokenScript: persona.greetingScript,
        posture: 'greeting',
        suggestedActionCard: {
          headline: `Virtual Screening with ${persona.name}`,
          description: `Longitudinal clinical screening session for ${patientState.demographics.name} (${patientState.demographics.age}Y/${patientState.demographics.gender[0]}).`,
          badge: 'LIVE VIDEO SCREENING',
          badgeColor: '#00F5D4',
          category: 'Specialist Referral'
        }
      },
      {
        id: 'step-2',
        stepNumber: 2,
        phase: 'biomarker_review',
        title: 'Longitudinal Biomarker Trajectory',
        spokenScript: persona.explanationScript,
        posture: 'explaining',
        suggestedActionCard: {
          headline: 'Renal & Cardiac Biomarker Shift (August 2026)',
          description: `eGFR dropped from 64 to 52 mL/min. Serum Creatinine rose to 1.45 mg/dL. NT-proBNP at 480 pg/mL.`,
          badge: 'BIOMARKER ALERT',
          badgeColor: '#FF70A6',
          category: 'Lab Monitoring'
        },
        evidenceReference: 'KDIGO 2024 Clinical Practice Guideline for Acute Kidney Injury Evaluation'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        phase: 'medication_alert',
        title: 'Medication Safety & Interaction Root Cause',
        spokenScript: persona.safetyAlertScript,
        posture: 'alerting',
        suggestedActionCard: {
          headline: 'Hard Safety Stop: Lisinopril + OTC Ibuprofen',
          description: 'Concurrent NSAID + ACE-inhibitor impairs afferent/efferent glomerular pressure regulation.',
          badge: 'SAFETY CONSTRAINT TRIGGERED',
          badgeColor: '#FFE600',
          category: 'Medication'
        },
        evidenceReference: 'AHA/ACC 2023 Guidelines on Cardiorenal Medication Safety in CKD'
      },
      {
        id: 'step-4',
        stepNumber: 4,
        phase: 'symptom_check',
        title: 'Interactive Patient Symptom Screening',
        spokenScript: 'Eleanor, to tailor your immediate care plan, could you confirm how you are feeling right now regarding your knee pain and shortness of breath?',
        posture: 'listening',
        patientOptions: [
          {
            id: 'opt-stop-nsaid',
            label: '✅ I understand and have stopped taking the OTC Ibuprofen.',
            patientResponseText: 'I stopped taking the Ibuprofen today. My knee is still stiff, but I want to protect my kidneys.',
            doctorFeedbackScript: 'Excellent decision, Eleanor. Halting the Ibuprofen immediately removes the vascular pinch on your kidneys. We will replace it with a soothing topical option right now.',
            postureReaction: 'reassuring',
            safetyImpact: 'safe',
            actionableNextStep: 'Prescribe topical Diclofenac gel / Lidocaine patch.'
          },
          {
            id: 'opt-knee-pain',
            label: '⚠️ My right knee pain is severe (6/10). What can I safely take?',
            patientResponseText: 'My knee pain is really bothering me when I walk. What safe pain medication can I take instead of Ibuprofen?',
            doctorFeedbackScript: 'I completely understand your pain concern. We recommend Acetaminophen 500mg as needed, combined with topical Diclofenac gel applied directly to the joint. This avoids kidney exposure.',
            postureReaction: 'explaining',
            safetyImpact: 'safe',
            actionableNextStep: 'Authorize OTC Acetaminophen up to 2,000mg/day + Topical Analgesia.'
          },
          {
            id: 'opt-edema-dyspnea',
            label: '🚨 I still notice swollen ankles and mild breathlessness when walking.',
            patientResponseText: 'I noticed my socks leaving deep marks on my ankles, and I get winded after climbing 6 stairs.',
            doctorFeedbackScript: 'Thank you for telling me. This mild fluid buildup is related to the temporary kidney slowdown. We will monitor your daily weight and have Dr. Thorne review if a brief diuretic adjustment is needed.',
            postureReaction: 'alerting',
            safetyImpact: 'warning',
            actionableNextStep: 'Schedule 48-hour fluid check & outpatient cardiology review.'
          }
        ]
      },
      {
        id: 'step-5',
        stepNumber: 5,
        phase: 'care_plan',
        title: 'Personalized 7-Day Care & Recovery Plan',
        spokenScript: persona.actionPlanScript,
        posture: 'prescribing',
        suggestedActionCard: {
          headline: '7-Day Renal Recovery Care Protocol',
          description: '1. Cease OTC NSAIDs. 2. Apply topical analgesia for knee. 3. Re-check BMP/Renal Panel on Aug 20. 4. Daily morning weight log.',
          badge: 'CARE PLAN PRESCRIBED',
          badgeColor: '#00F5D4',
          category: 'Lifestyle'
        },
        evidenceReference: 'Heal Engine Multi-Agent Clinical Consensus (Swarm Cohesion: 94.8%)'
      }
    ];
  }
}

export const virtualDoctorScreeningEngine = new VirtualDoctorScreeningEngine();
