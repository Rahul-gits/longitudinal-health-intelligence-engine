import React from 'react';
import { DoctorPostureMode, VirtualDoctorPersona } from '../types/health';
import { DigitalHumanConsultationView } from './DigitalHuman/DigitalHumanConsultationView';

export interface DoctorAnimatedAvatarProps {
  persona: VirtualDoctorPersona;
  posture: DoctorPostureMode;
  isSpeaking: boolean;
  isMuted?: boolean;
  activeWord?: string;
  transcriptText?: string;
  patientTranscript?: string;
  patientName?: string;
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
  isSpeaking,
  isMuted = false,
  activeWord = '',
  transcriptText,
  patientTranscript,
  patientName,
  onSelectPosture,
  onSelectPersona,
  onToggleMute,
  onEndCall,
  clinicalContext
}) => {
  return (
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
  );
};

export default DoctorAnimatedAvatar;
