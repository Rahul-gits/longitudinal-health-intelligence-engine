import React, { useState } from 'react';
import { DoctorPostureMode, VirtualDoctorPersona, AvatarState, postureToAvatarState } from '../types/health';
import { DigitalHumanAvatar } from './DigitalHuman/DigitalHumanAvatar';
import { DigitalHumanConsultationView } from './DigitalHuman/DigitalHumanConsultationView';

export interface DoctorAnimatedAvatarProps {
  persona: VirtualDoctorPersona;
  posture: DoctorPostureMode;
  state?: AvatarState;
  isSpeaking: boolean;
  isMuted?: boolean;
  activeWord?: string;
  transcriptText?: string;
  patientTranscript?: string;
  patientName?: string;
  hasSafetyAlert?: boolean;
  defaultTo3D?: boolean;
  onSelectPosture?: (posture: DoctorPostureMode) => void;
  onSelectPersona?: (personaId: string) => void;
  onToggleMute?: () => void;
  onEndCall?: () => void;
  clinicalContext?: {
    title: string;
    description: string;
    severity?: 'warning' | 'info' | 'success';
    keyFindings?: Array<{ label: string; value: string; note?: string }>;
  };
}

export const DoctorAnimatedAvatar: React.FC<DoctorAnimatedAvatarProps> = ({
  persona,
  posture,
  state,
  isSpeaking,
  isMuted = false,
  activeWord = '',
  transcriptText,
  patientTranscript,
  patientName,
  hasSafetyAlert = false,
  defaultTo3D = true,
  onSelectPosture,
  onSelectPersona,
  onToggleMute,
  onEndCall,
  clinicalContext
}) => {
  const [is3DMode, setIs3DMode] = useState<boolean>(defaultTo3D);

  const effectiveState = state || postureToAvatarState(posture);

  if (is3DMode) {
    return (
      <DigitalHumanAvatar
        persona={persona}
        posture={posture}
        state={effectiveState}
        isSpeaking={isSpeaking}
        isMuted={isMuted}
        activeWord={activeWord}
        transcriptText={transcriptText}
        patientTranscript={patientTranscript}
        patientName={patientName}
        hasSafetyAlert={hasSafetyAlert}
        onSelectPersona={onSelectPersona}
        onToggleMute={onToggleMute}
        onEndCall={onEndCall}
        onFallbackTo2D={() => setIs3DMode(false)}
      />
    );
  }

  return (
    <div className="relative w-full h-full">
      <DigitalHumanConsultationView
        persona={persona}
        posture={posture}
        isSpeaking={isSpeaking}
        isMuted={isMuted}
        activeWord={activeWord}
        transcriptText={transcriptText}
        patientTranscript={patientTranscript}
        patientName={patientName}
        onSelectPosture={onSelectPosture}
        onSelectPersona={onSelectPersona}
        onToggleMute={onToggleMute}
        onEndCall={onEndCall}
        clinicalContext={clinicalContext}
      />
      {/* Quick Switch back to 3D */}
      <button
        onClick={() => setIs3DMode(true)}
        className="absolute top-4 right-4 z-40 px-3 py-1 bg-cyan-600/90 hover:bg-cyan-500 text-white rounded-full text-xs font-semibold backdrop-blur-md border border-cyan-400/30 shadow-lg flex items-center gap-1.5 transition-all"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        Switch to 3D Avatar
      </button>
    </div>
  );
};

export default DoctorAnimatedAvatar;
