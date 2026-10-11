import React from 'react';
import { AvatarState, DoctorPostureMode, postureToAvatarState } from '../../types/health';

export interface AvatarBehavioralParameters {
  state: AvatarState;
  gazeTarget: 'direct_camera' | 'patient_chart' | 'thoughtful_tilt' | 'alert_fixed';
  blinkRateMultiplier: number;
  noddingEnabled: boolean;
  smileWeight: number;
  browFurrowWeight: number;
  browInnerUpWeight: number;
  breathingAmplitude: number;
  postureLean: number; // Z-axis forward or backward lean
  statusLabel: string;
  statusBadgeColor: string;
  safetyEscalated: boolean;
}

/**
 * Deterministic resolution of avatar behavioral parameters for each clinical state
 */
export function getAvatarBehavior(state: AvatarState, hasSafetyAlert: boolean = false): AvatarBehavioralParameters {
  // If clinical safety violation detected, force ALERTING state
  const effectiveState: AvatarState = hasSafetyAlert ? 'ALERTING' : state;

  switch (effectiveState) {
    case 'GREETING':
      return {
        state: 'GREETING',
        gazeTarget: 'direct_camera',
        blinkRateMultiplier: 1.0,
        noddingEnabled: false,
        smileWeight: 0.45,
        browFurrowWeight: 0.0,
        browInnerUpWeight: 0.15,
        breathingAmplitude: 1.0,
        postureLean: 0.0,
        statusLabel: 'Welcoming consultation & verifying patient ID',
        statusBadgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        safetyEscalated: false
      };

    case 'LISTENING':
      return {
        state: 'LISTENING',
        gazeTarget: 'direct_camera',
        blinkRateMultiplier: 0.95,
        noddingEnabled: true,
        smileWeight: 0.1,
        browFurrowWeight: 0.05,
        browInnerUpWeight: 0.2,
        breathingAmplitude: 0.9,
        postureLean: 0.03, // Slight attentive forward lean
        statusLabel: 'Attentively listening to patient feedback...',
        statusBadgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        safetyEscalated: false
      };

    case 'UNDERSTANDING':
      return {
        state: 'UNDERSTANDING',
        gazeTarget: 'thoughtful_tilt',
        blinkRateMultiplier: 0.85,
        noddingEnabled: true,
        smileWeight: 0.15,
        browFurrowWeight: 0.15,
        browInnerUpWeight: 0.45,
        breathingAmplitude: 1.0,
        postureLean: 0.01,
        statusLabel: 'Synthesizing reported symptoms & context',
        statusBadgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
        safetyEscalated: false
      };

    case 'REVIEWING':
      return {
        state: 'REVIEWING',
        gazeTarget: 'patient_chart', // Gaze shifts down & right towards longitudinal labs
        blinkRateMultiplier: 1.1,
        noddingEnabled: false,
        smileWeight: 0.0,
        browFurrowWeight: 0.35,
        browInnerUpWeight: 0.2,
        breathingAmplitude: 0.8,
        postureLean: 0.02,
        statusLabel: 'Reviewing longitudinal timeline, labs & pharmacology',
        statusBadgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        safetyEscalated: false
      };

    case 'EXPLAINING':
      return {
        state: 'EXPLAINING',
        gazeTarget: 'direct_camera',
        blinkRateMultiplier: 1.0,
        noddingEnabled: true,
        smileWeight: 0.2,
        browFurrowWeight: 0.1,
        browInnerUpWeight: 0.25,
        breathingAmplitude: 1.1,
        postureLean: 0.02,
        statusLabel: 'Explaining clinical findings & evidence',
        statusBadgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        safetyEscalated: false
      };

    case 'CHECKING':
      return {
        state: 'CHECKING',
        gazeTarget: 'direct_camera',
        blinkRateMultiplier: 0.9,
        noddingEnabled: false,
        smileWeight: 0.05,
        browFurrowWeight: 0.2,
        browInnerUpWeight: 0.1,
        breathingAmplitude: 0.95,
        postureLean: 0.04,
        statusLabel: 'Evaluating safety rules & interaction constraints',
        statusBadgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        safetyEscalated: false
      };

    case 'REASSURING':
      return {
        state: 'REASSURING',
        gazeTarget: 'direct_camera',
        blinkRateMultiplier: 1.0,
        noddingEnabled: true,
        smileWeight: 0.4,
        browFurrowWeight: 0.0,
        browInnerUpWeight: 0.3,
        breathingAmplitude: 1.05,
        postureLean: 0.01,
        statusLabel: 'Calm reassurance without false promises',
        statusBadgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
        safetyEscalated: false
      };

    case 'ALERTING':
      return {
        state: 'ALERTING',
        gazeTarget: 'alert_fixed',
        blinkRateMultiplier: 0.7, // Focused, reduced blinking
        noddingEnabled: false,
        smileWeight: 0.0,
        browFurrowWeight: 0.75, // Deep serious brow furrow
        browInnerUpWeight: 0.1,
        breathingAmplitude: 1.15,
        postureLean: 0.06, // Forward serious clinical posture
        statusLabel: 'Clinical Safety Advisory • Escalation Handled',
        statusBadgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse',
        safetyEscalated: true
      };

    default:
      return {
        state: 'LISTENING',
        gazeTarget: 'direct_camera',
        blinkRateMultiplier: 1.0,
        noddingEnabled: false,
        smileWeight: 0.1,
        browFurrowWeight: 0.0,
        browInnerUpWeight: 0.1,
        breathingAmplitude: 1.0,
        postureLean: 0.0,
        statusLabel: 'Connected in clinical session',
        statusBadgeColor: 'bg-slate-700 text-slate-300 border-slate-600',
        safetyEscalated: false
      };
  }
}

export interface AvatarStateControllerProps {
  state?: AvatarState;
  posture?: DoctorPostureMode;
  isSpeaking: boolean;
  isListeningToPatient?: boolean;
  hasSafetyAlert?: boolean;
  onStateChange?: (newState: AvatarState) => void;
  children?: (behavior: AvatarBehavioralParameters) => React.ReactNode;
}

/**
 * AvatarStateController: Deterministic state engine enforcing clinical safety isolation.
 * The 3D avatar strictly mirrors approved clinical states and cannot generate medical claims.
 */
export const AvatarStateController: React.FC<AvatarStateControllerProps> = ({
  state,
  posture,
  isSpeaking,
  isListeningToPatient = false,
  hasSafetyAlert = false,
  onStateChange,
  children
}) => {
  // Resolve current active state deterministically
  const resolvedState: AvatarState = React.useMemo(() => {
    if (hasSafetyAlert) return 'ALERTING';
    if (isListeningToPatient) return 'LISTENING';
    if (isSpeaking) {
      if (state === 'ALERTING' || posture === 'alerting') return 'ALERTING';
      if (state === 'REASSURING' || posture === 'reassuring') return 'REASSURING';
      if (state === 'REVIEWING' || posture === 'reviewing') return 'REVIEWING';
      return 'EXPLAINING';
    }
    if (state) return state;
    if (posture) return postureToAvatarState(posture);
    return 'LISTENING';
  }, [state, posture, isSpeaking, isListeningToPatient, hasSafetyAlert]);

  React.useEffect(() => {
    onStateChange?.(resolvedState);
  }, [resolvedState, onStateChange]);

  const behavior = getAvatarBehavior(resolvedState, hasSafetyAlert);

  if (children) {
    return <>{children(behavior)}</>;
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${behavior.statusBadgeColor}`}>
      <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
      <span>{behavior.state}</span>
      <span className="opacity-60">•</span>
      <span className="truncate max-w-[220px]">{behavior.statusLabel}</span>
    </div>
  );
};
