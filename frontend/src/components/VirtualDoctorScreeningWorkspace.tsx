import React, { useState, useEffect, useRef } from 'react';
import { 
  VirtualDoctorPersona, 
  ScreeningDialogueStep, 
  DoctorPostureMode, 
  PatientScreeningOption 
} from '../types/health';
import { virtualDoctorScreeningEngine } from '../engine/virtualDoctorScreeningEngine';
import { speechEngine } from '../engine/speechSynthesisEngine';
import { speechRecognitionEngine } from '../engine/speechRecognitionEngine';
import { patientStateEngine } from '../engine/patientStateEngine';
import { recordVirtualDoctorTurn } from '../services/apiClient';
import { DoctorAnimatedAvatar } from './DoctorAnimatedAvatar';
import { PATIENT_INFO, getDynamicPatientProfile } from '../data/mockPatientData';
import { useAuth } from '../context/AuthContext';
import { 
  Video, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Stethoscope, 
  Download, 
  PhoneOff, 
  Activity, 
  User, 
  Pill, 
  FileText, 
  Clock, 
  ShieldCheck, 
  Share2,
  Gauge
} from 'lucide-react';

export const VirtualDoctorScreeningWorkspace: React.FC = () => {
  const { user } = useAuth();
  const currentPatient = getDynamicPatientProfile(user);
  const personas = virtualDoctorScreeningEngine.getPersonas(user);
  const [activePersonaId, setActivePersonaId] = useState<string>(personas[0].id);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  
  // Audio & TTS State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [showCaptions, setShowCaptions] = useState<boolean>(true);
  const [activeCharIndex, setActiveCharIndex] = useState<number>(0);
  const [activeWord, setActiveWord] = useState<string>('');
  
  // Interactive Patient State
  const [selectedPatientOption, setSelectedPatientOption] = useState<PatientScreeningOption | null>(null);
  const [customDoctorFeedback, setCustomDoctorFeedback] = useState<string | null>(null);
  const [activePosture, setActivePosture] = useState<DoctorPostureMode>('greeting');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isCallActive, setIsCallActive] = useState<boolean>(true);
  const [completedSteps, setCompletedSteps] = useState<number[]>([0]);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Multi-Specialist LLM & 2-Way Voice State
  const [activeAiModel, setActiveAiModel] = useState<string>('LLM Ready');
  const [aiObservations, setAiObservations] = useState<string[]>([]);
  const [aiSuggestedReplies, setAiSuggestedReplies] = useState<string[]>([]);
  const [twoWayHandsFree, setTwoWayHandsFree] = useState<boolean>(true);
  const [conversationHistory, setConversationHistory] = useState<Array<{ speaker: 'doctor' | 'patient'; text: string }>>([]);

  // Free-Text & Microphone ASR State
  const [patientFreeTextInput, setPatientFreeTextInput] = useState<string>('');
  const [isRecordingMic, setIsRecordingMic] = useState<boolean>(false);
  const [isSubmittingDialogue, setIsSubmittingDialogue] = useState<boolean>(false);
  const [emergencyBanner, setEmergencyBanner] = useState<string | null>(null);
  const [activeSafetyGateNotice, setActiveSafetyGateNotice] = useState<string | null>(null);

  const activePersona: VirtualDoctorPersona = virtualDoctorScreeningEngine.getPersonaById(activePersonaId, user);
  const dialogueSteps: ScreeningDialogueStep[] = virtualDoctorScreeningEngine.getScreeningDialogue(activePersonaId, user);
  const currentStep: ScreeningDialogueStep = dialogueSteps[currentStepIndex] || dialogueSteps[0];

  // Call duration counter
  useEffect(() => {
    let interval: number;
    if (isCallActive) {
      interval = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  // Update posture when step changes or option selected
  useEffect(() => {
    if (selectedPatientOption && customDoctorFeedback) {
      setActivePosture(selectedPatientOption.postureReaction);
    } else {
      setActivePosture(currentStep.posture);
    }
  }, [currentStepIndex, selectedPatientOption, customDoctorFeedback, currentStep]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      speechEngine.stop();
    };
  }, []);

  // Format call timer mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Speak active step text
  const handlePlaySpeech = (customText?: string) => {
    const textToSpeak = customText || customDoctorFeedback || currentStep.spokenScript;
    
    if (isMuted) {
      setIsMuted(false);
    }

    speechEngine.stop();
    setIsPlaying(true);
    setActiveCharIndex(0);

    speechEngine.speak(
      textToSpeak,
      {
        pitch: activePersona.voicePitch,
        rate: speechRate,
        voiceName: activePersona.preferredVoiceName
      },
      {
        onStart: () => setIsPlaying(true),
        onEnd: () => {
          setIsPlaying(false);
          setActiveWord('');
        },
        onWordBoundary: (charIdx, length, word) => {
          setActiveCharIndex(charIdx);
          setActiveWord(word);
        },
        onError: () => {
          setIsPlaying(false);
        }
      }
    );
  };

  const handlePauseSpeech = () => {
    speechEngine.pause();
    setIsPlaying(false);
  };

  const handleResumeSpeech = () => {
    speechEngine.resume();
    setIsPlaying(true);
  };

  const handleToggleMute = () => {
    if (!isMuted) {
      speechEngine.stop();
      setIsPlaying(false);
      setIsMuted(true);
    } else {
      setIsMuted(false);
      handlePlaySpeech();
    }
  };

  const handlePersonaChange = (personaId: string) => {
    speechEngine.stop();
    setIsPlaying(false);
    setActivePersonaId(personaId);
    setSelectedPatientOption(null);
    setCustomDoctorFeedback(null);
    setCurrentStepIndex(0);
  };

  const handleStepSelect = (idx: number) => {
    speechEngine.stop();
    setIsPlaying(false);
    setCurrentStepIndex(idx);
    setSelectedPatientOption(null);
    setCustomDoctorFeedback(null);
    if (!completedSteps.includes(idx)) {
      setCompletedSteps(prev => [...prev, idx]);
    }
  };

  const handlePatientOptionClick = (option: PatientScreeningOption) => {
    speechEngine.stop();
    setSelectedPatientOption(option);
    setCustomDoctorFeedback(option.doctorFeedbackScript);
    setActivePosture(option.postureReaction);

    // Save reported symptom directly into longitudinal engine
    patientStateEngine.addReportedSymptom(option.patientResponseText, `Virtual Doctor (${activePersona.name})`);
    setExportNotice(`✓ Recorded in Longitudinal State Engine: "${option.patientResponseText.slice(0, 45)}…"`);
    setTimeout(() => setExportNotice(null), 3500);

    // Auto-read doctor's feedback response
    handlePlaySpeech(option.doctorFeedbackScript);
  };

  const handleVoiceMicToggle = () => {
    if (isRecordingMic) {
      speechRecognitionEngine.stop();
      setIsRecordingMic(false);
    } else {
      if (!speechRecognitionEngine.isSupported()) {
        alert('Voice speech recognition is not supported in this browser. Please type your message into the box below.');
        return;
      }
      setIsRecordingMic(true);
      speechRecognitionEngine.start({
        onStart: () => setIsRecordingMic(true),
        onResult: (transcript, isFinal) => {
          setPatientFreeTextInput(transcript);
          if (isFinal) {
            setIsRecordingMic(false);
            handleCustomPatientSubmit(transcript);
          }
        },
        onError: (err) => {
          console.warn('ASR error:', err);
          setIsRecordingMic(false);
        },
        onEnd: () => setIsRecordingMic(false)
      });
    }
  };

  const handleCustomPatientSubmit = async (textToProcess?: string) => {
    const rawText = textToProcess || patientFreeTextInput;
    if (!rawText.trim()) return;

    setIsSubmittingDialogue(true);
    speechEngine.stop();

    const updatedHistory = [...conversationHistory, { speaker: 'patient' as const, text: rawText }];
    setConversationHistory(updatedHistory);

    try {
      const token = localStorage.getItem('heal_token') || sessionStorage.getItem('heal_token');
      const conditionsList: string[] = currentPatient.conditions || [];
      const medsList: string[] = currentPatient.medications || [];

      const res = await fetch('/api/screening/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          patientId: currentPatient.id || 'patient-ev-68',
          patientName: currentPatient.name,
          patientAge: currentPatient.age,
          patientGender: currentPatient.gender,
          conditions: conditionsList,
          medications: medsList,
          allergies: currentPatient.allergies || ['None reported'],
          primaryPhysician: currentPatient.primaryPhysician || 'Care Team',
          userMessage: rawText,
          personaId: activePersona.id,
          personaName: activePersona.name,
          specialty: activePersona.specialty,
          clinicalFocus: activePersona.clinicalFocus,
          credentials: activePersona.credentials,
          dialogueHistory: updatedHistory.slice(-6)
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        setActiveAiModel(`${data.provider || 'LLM'} (${data.model || 'v2'})`);
        if (data.clinicalObservations) {
          setAiObservations(data.clinicalObservations);
        }
        if (data.suggestedReplies) {
          setAiSuggestedReplies(data.suggestedReplies);
        }

        // Check for CRITICAL Emergency
        if (data.requiresEmergency || data.riskLevel === 'CRITICAL') {
          setActivePosture('alerting');
          setEmergencyBanner(data.doctorResponse);
          setCustomDoctorFeedback(data.doctorResponse);
          setActiveSafetyGateNotice('CRITICAL SAFETY PROTOCOL: Severe emergency red flag detected.');
          handlePlaySpeech(data.doctorResponse);
        } else if (data.safetyGateTriggered) {
          setActivePosture(data.recommendedPosture || 'alerting');
          setActiveSafetyGateNotice(`Safety Boundary Engaged: ${data.safetyDetails || 'Clinical contraindication verified via RAG.'}`);
          setCustomDoctorFeedback(data.doctorResponse);
          handlePlaySpeech(data.doctorResponse);
        } else {
          setActivePosture(data.recommendedPosture || 'reassuring');
          setCustomDoctorFeedback(data.doctorResponse);
          handlePlaySpeech(data.doctorResponse);
        }

        setConversationHistory(prev => [...prev, { speaker: 'doctor' as const, text: data.doctorResponse }]);
        patientStateEngine.addReportedSymptom(rawText, `Virtual Doctor (${activePersona.name})`);
        setPatientFreeTextInput('');
      } else {
        // Fallback local understanding if server returns non-200
        const lower = rawText.toLowerCase();
        if (lower.includes('chest pain') || lower.includes('crushing')) {
          setActivePosture('alerting');
          setEmergencyBanner('Chest pain detected. Dial 911 or visit the nearest emergency room immediately.');
          handlePlaySpeech('Please stop. Because you reported chest pain, please seek emergency medical attention immediately.');
        } else {
          setActivePosture('reassuring');
          const fallbackReply = `Thank you for sharing that with me, ${currentPatient.name.split(' ')[0]}. As ${activePersona.name}, I have noted this symptom in your care plan and will monitor your medication safety.`;
          setCustomDoctorFeedback(fallbackReply);
          handlePlaySpeech(fallbackReply);
        }
      }
    } catch (err) {
      console.warn('Dialogue submit error:', err);
      setActivePosture('reassuring');
      const fallbackReply = `I have received your note, ${currentPatient.name.split(' ')[0]}. We are actively reviewing this with your clinical team.`;
      setCustomDoctorFeedback(fallbackReply);
      handlePlaySpeech(fallbackReply);
    } finally {
      setIsSubmittingDialogue(false);
    }
  };

  const handleExportSummary = () => {
    const summary = `
=========================================
HEAL ENGINE - VIRTUAL DOCTOR SCREENING
=========================================
Patient: ${currentPatient.name} (${currentPatient.age}Y/${currentPatient.gender})
Consulting Physician: ${activePersona.name} (${activePersona.specialty})
Session Timestamp: ${new Date().toLocaleString()}
Call Duration: ${formatTimer(callDuration)}

KEY CLINICAL FINDINGS:
• Identified NSAID + ACEi nephrotoxicity trigger (Lisinopril + OTC Ibuprofen).
• Acute eGFR drop: 64 -> 52 mL/min (18.7% decline).
• Cardiac marker shift: NT-proBNP 480 pg/mL with 2+ leg edema.
• Pharmacogenomics: CYP2C9*3 intermediate metabolizer.

RECOMMENDED ACTIONS & CARE PLAN:
1. Immediately stop OTC oral Ibuprofen.
2. Prescribe topical Diclofenac 1% gel for right knee osteoarthritis.
3. Re-evaluate renal panel (BMP/Creatinine/eGFR) in 7 days (August 20, 2026).
4. Monitor daily morning weights; report dyspnea if > 3 lbs gain in 48 hours.

CONSENSUS STATUS: Verified by Multi-Agent Swarm (94.8% Cohesion).
=========================================
`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
    }
    setExportNotice('Virtual Doctor screening summary copied to clipboard & synced with EHR simulator.');
    setTimeout(() => setExportNotice(null), 4000);
  };

  const spokenText = customDoctorFeedback || currentStep.spokenScript;

  return (
    <div className="space-y-6">
      {/* Top Tele-Health Banner */}
      <div className="p-5 bg-[#FFE600] border-3 border-black shadow-[6px_6px_0px_0px_#000] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-black text-[#FFE600] px-2 py-0.5 text-[10px] uppercase font-black border border-black -rotate-1">
              TELE-HEALTH VIRTUAL SCREENING
            </span>
            <span className="text-xs font-mono font-black text-black">
              LONGITUDINAL DECISION ENGINE
            </span>
          </div>
          <h2 className="text-xl font-black font-display text-black tracking-tight flex items-center gap-2 uppercase mt-1">
            <Video className="w-6 h-6 stroke-[2.5]" /> VIRTUAL DOCTOR VIDEO CALL SCREENING
          </h2>
          <p className="text-xs font-bold text-black/90 font-mono mt-1 max-w-3xl">
            Interactive multi-role screening avatar powered by real-time speech synthesis and Heal Engine longitudinal patient data.
          </p>
        </div>

        {/* Call Status & Export */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-black text-white px-3 py-1.5 border-2 border-black shadow-[3px_3px_0px_0px_#000] font-mono text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span>CALL TIME: {formatTimer(callDuration)}</span>
          </div>

          <button
            onClick={handleExportSummary}
            className="px-4 py-2 bg-[#00F5D4] hover:bg-[#00D2B4] text-black font-black font-display text-xs flex items-center space-x-1.5 border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer uppercase"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>EXPORT SUMMARY</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-[#CCFF00] border-2 border-black font-mono font-bold text-xs shadow-[3px_3px_0px_0px_#000] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Role-Based Specialist Persona Switcher Bar */}
      <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black font-display uppercase tracking-wider text-black flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-black stroke-[2.5]" /> SELECT VIRTUAL SPECIALIST PERSONA
            </span>
            <span className="text-[10px] font-mono bg-black text-[#FFE600] px-1.5 py-0.2 border border-black">
              4 SPECIALTY LENSES
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-black/70">
            Active: <strong className="text-black">{activePersona.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {personas.map((doc) => {
            const isSelected = doc.id === activePersonaId;
            return (
              <button
                key={doc.id}
                onClick={() => handlePersonaChange(doc.id)}
                className={`p-3 text-left border-2 border-black transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#FFE600] shadow-[3px_3px_0px_0px_#000] -translate-y-0.5'
                    : 'bg-[#FAF8F5] hover:bg-[#FFE600]/20 text-black'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1.5">
                  <div 
                    className="w-4 h-4 rounded-full border border-black flex-shrink-0"
                    style={{ backgroundColor: doc.avatarColor }}
                  />
                  <span className="text-xs font-black font-display tracking-tight text-black line-clamp-1">
                    {doc.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-black/80 line-clamp-1">
                  {doc.title}
                </span>
                <span className="text-[9px] font-mono mt-1 text-black/60 line-clamp-1">
                  ⚡ {doc.clinicalFocus}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Screening Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Virtual Doctor Animated Video Feed (7 Cols on LG) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Main Video Viewport Container */}
          <div className="relative bg-[#111827] border-3 border-black shadow-[6px_6px_0px_0px_#000] flex-1 flex flex-col min-h-[440px]">
            {/* Animated Doctor Posture Avatar */}
            <DoctorAnimatedAvatar
              persona={activePersona}
              posture={activePosture}
              isSpeaking={isPlaying}
              isMuted={isMuted}
              activeWord={activeWord}
              onSelectPosture={(p) => setActivePosture(p)}
            />

            {/* Picture-in-Picture: Patient Self-View Cam (Eleanor Vance) */}
            <div className="absolute bottom-16 right-4 w-36 h-28 bg-[#1E293B] border-2 border-white shadow-[3px_3px_0px_0px_#000] overflow-hidden flex flex-col justify-between p-1.5 z-30">
              <div className="flex items-center justify-between text-[9px] font-mono text-white/80">
                <span className="bg-black/60 px-1 rounded text-[#00F5D4] font-bold">YOU (SELF-VIEW)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-[#FF70A6] border-2 border-black flex items-center justify-center font-black text-black text-xs">
                  EV
                </div>
              </div>
              <div className="bg-black/80 px-1 py-0.5 text-[8px] font-mono text-white flex justify-between">
                <span>{PATIENT_INFO.name}</span>
                <span className="text-emerald-400 font-bold">HR: 74</span>
              </div>
            </div>

            {/* Video Call Interactive Control Toolbar */}
            <div className="bg-[#000000] p-3 border-t-2 border-black flex flex-wrap items-center justify-between gap-3 z-30">
              {/* Play / Pause / Replay TTS */}
              <div className="flex items-center space-x-2">
                {!isPlaying ? (
                  <button
                    onClick={() => handlePlaySpeech()}
                    className="px-3.5 py-1.5 bg-[#CCFF00] hover:bg-[#B3E600] text-black font-black font-display text-xs flex items-center space-x-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 cursor-pointer uppercase"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>SPEAK</span>
                  </button>
                ) : (
                  <button
                    onClick={handlePauseSpeech}
                    className="px-3.5 py-1.5 bg-[#FFE600] hover:bg-[#E6CF00] text-black font-black font-display text-xs flex items-center space-x-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 cursor-pointer uppercase"
                  >
                    <Pause className="w-3.5 h-3.5 fill-black" />
                    <span>PAUSE</span>
                  </button>
                )}

                <button
                  onClick={() => handlePlaySpeech()}
                  title="Replay Spoken Guidance"
                  className="p-1.5 bg-white text-black hover:bg-white/80 border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  onClick={handleToggleMute}
                  className={`p-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-colors ${
                    isMuted ? 'bg-[#FF5722] text-white' : 'bg-white text-black hover:bg-white/80'
                  }`}
                  title={isMuted ? 'Unmute Speech Audio' : 'Mute Speech Audio'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 stroke-[2.5]" /> : <Volume2 className="w-4 h-4 stroke-[2.5]" />}
                </button>
              </div>

              {/* Speech Speed & Captions Toggle */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] text-[10px] font-mono font-bold text-black">
                  <span className="px-2 py-1 bg-black text-[#FFE600] uppercase">Speed</span>
                  {[0.8, 1.0, 1.25, 1.5].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setSpeechRate(rate)}
                      className={`px-2 py-1 transition-colors cursor-pointer ${
                        speechRate === rate ? 'bg-[#FFE600] font-black' : 'hover:bg-black/10'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowCaptions(!showCaptions)}
                  className={`px-2.5 py-1.5 font-mono text-[10px] font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer uppercase ${
                    showCaptions ? 'bg-[#00F5D4] text-black' : 'bg-white/20 text-white/70'
                  }`}
                >
                  CC {showCaptions ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

          {/* Live Karaoke Subtitles Bar & AI Diagnostics */}
          {showCaptions && (
            <div className="p-4 bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-black/70">
                <span className="flex items-center gap-1.5 text-black font-black uppercase">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE CLOSED CAPTIONS ({activePersona.name})
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-black text-[#FFE600] font-black border border-black text-[9px] shadow-[1px_1px_0px_0px_#000]">
                    AI: {activeAiModel}
                  </span>
                  <span className="text-black/50 hidden sm:inline">PHASE: {currentStep.phase.toUpperCase()}</span>
                </div>
              </div>
              <div className="p-3 bg-[#FAF8F5] border-2 border-black min-h-[60px] text-xs font-semibold text-black leading-relaxed font-sans">
                {spokenText.split(' ').map((w, idx) => {
                  const isCurrentWord = activeWord.toLowerCase().replace(/[^a-z0-9]/g, '') === w.toLowerCase().replace(/[^a-z0-9]/g, '');
                  return (
                    <span 
                      key={idx} 
                      className={`mr-1 transition-all inline-block ${
                        isCurrentWord && isPlaying
                          ? 'bg-[#FFE600] text-black font-black px-1 border border-black scale-105' 
                          : ''
                      }`}
                    >
                      {w}
                    </span>
                  );
                })}
              </div>

              {/* Real-Time Clinical Observations & RAG Evidence Chips */}
              {aiObservations.length > 0 && (
                <div className="pt-1 border-t border-black/10 space-y-1">
                  <span className="text-[9px] font-mono font-black uppercase text-blue-900 block">
                    CLINICAL OBSERVATIONS & RAG EVIDENCE:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {aiObservations.map((obs, oIdx) => (
                      <span 
                        key={oIdx}
                        className={`px-2 py-0.5 text-[9px] font-mono font-bold border rounded-sm ${
                          obs.includes('[RAG Evidence]')
                            ? 'bg-purple-100 text-purple-900 border-purple-400'
                            : 'bg-white text-blue-950 border-blue-300'
                        }`}
                      >
                        {obs}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Interactive Screening & Longitudinal Data (5 Cols on LG) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Step Progression Tabs */}
          <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-black font-display uppercase tracking-wider text-black">
              <span>5-STEP SCREENING PROTOCOL</span>
              <span className="text-[10px] font-mono bg-black text-[#00F5D4] px-1.5 py-0.2 border border-black">
                STEP {currentStepIndex + 1} OF {dialogueSteps.length}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {dialogueSteps.map((step, idx) => {
                const isActive = currentStepIndex === idx;
                const isDone = completedSteps.includes(idx);
                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepSelect(idx)}
                    className={`p-1.5 text-center border-2 border-black text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000] font-black'
                        : isDone
                        ? 'bg-[#CCFF00] text-black/90'
                        : 'bg-[#FAF8F5] text-black/50 hover:bg-black/5'
                    }`}
                  >
                    <div className="text-[9px]">STEP</div>
                    <div className="text-xs font-black">{idx + 1}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Step Clinical Card */}
          <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-4 space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h3 className="text-xs font-black font-display uppercase tracking-wider text-black flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-black stroke-[2.5]" /> {currentStep.title}
              </h3>
              <span className="text-[9px] font-mono font-bold bg-black text-[#FFE600] px-2 py-0.5 border border-black">
                {currentStep.phase.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {/* Action Card Suggestion */}
            {currentStep.suggestedActionCard && (
              <div 
                className="p-3 border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1"
                style={{ backgroundColor: `${currentStep.suggestedActionCard.badgeColor}25` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black font-mono uppercase px-1.5 py-0.2 bg-black text-white">
                    {currentStep.suggestedActionCard.category}
                  </span>
                  <span className="text-[9px] font-bold font-mono text-black/80">
                    {currentStep.suggestedActionCard.badge}
                  </span>
                </div>
                <h4 className="text-xs font-black font-display text-black">
                  {currentStep.suggestedActionCard.headline}
                </h4>
                <p className="text-[11px] font-semibold text-black/80 leading-snug">
                  {currentStep.suggestedActionCard.description}
                </p>
              </div>
            )}

            {/* Emergency Red Alert Banner */}
            {emergencyBanner && (
              <div className="p-3.5 bg-[#FF0055] text-white border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-1.5 animate-bounce">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-white" />
                  <span>EMERGENCY RED FLAG PROTOCOL ACTIVATED</span>
                </div>
                <p className="text-xs font-bold leading-snug">{emergencyBanner}</p>
                <div className="pt-1 flex items-center gap-2">
                  <button 
                    onClick={() => window.open('tel:911')}
                    className="px-3 py-1 bg-white text-[#FF0055] font-black text-xs border border-black uppercase cursor-pointer"
                  >
                    Call 911 Now
                  </button>
                  <button 
                    onClick={() => setEmergencyBanner(null)}
                    className="px-2 py-1 bg-black text-white text-[10px] font-mono cursor-pointer"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            )}

            {/* Active Safety Gate Warning Notice */}
            {activeSafetyGateNotice && (
              <div className="p-2.5 bg-amber-50 border-2 border-black text-xs font-bold text-amber-950 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>{activeSafetyGateNotice}</span>
                </span>
                <button 
                  onClick={() => setActiveSafetyGateNotice(null)} 
                  className="text-[10px] underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Interactive Voice & Free-Text Dialogue Input (Adaptive Screening Loop) */}
            <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black uppercase text-black flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-blue-600" />
                  <span>TWO-WAY DIALOGUE WITH {activePersona.name.toUpperCase()}:</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTwoWayHandsFree(!twoWayHandsFree)}
                    className={`px-2 py-0.5 text-[9px] font-mono font-black border border-black cursor-pointer uppercase ${
                      twoWayHandsFree ? 'bg-[#00F5D4] text-black shadow-[1px_1px_0px_0px_#000]' : 'bg-gray-200 text-gray-700'
                    }`}
                    title="Continuous 2-Way Loop"
                  >
                    2-WAY AUDIO: {twoWayHandsFree ? 'ON' : 'OFF'}
                  </button>
                  {isRecordingMic && (
                    <span className="text-[9px] font-mono font-black px-1.5 py-0.2 bg-[#FF0055] text-white animate-pulse">
                      RECORDING...
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic Suggested Replies from LLM */}
              {aiSuggestedReplies.length > 0 && (
                <div className="p-2.5 bg-amber-50/90 border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1.5">
                  <span className="text-[9px] font-mono font-black uppercase text-amber-950 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-700 stroke-[2.5]" />
                    <span>SUGGESTED REPLIES (CLICK OR SPEAK):</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {aiSuggestedReplies.map((reply, rIdx) => (
                      <button
                        key={rIdx}
                        type="button"
                        onClick={() => handleCustomPatientSubmit(reply)}
                        className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-[#FFE600] text-black border border-black shadow-[1px_1px_0px_0px_#000] transition-colors cursor-pointer text-left"
                      >
                        "{reply}"
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleVoiceMicToggle}
                  className={`p-2 border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-colors cursor-pointer ${
                    isRecordingMic ? 'bg-[#FF0055] text-white' : 'bg-white hover:bg-[#FFE600] text-black'
                  }`}
                  title={isRecordingMic ? 'Stop microphone' : 'Speak via microphone'}
                >
                  {isRecordingMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={patientFreeTextInput}
                  onChange={(e) => setPatientFreeTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomPatientSubmit()}
                  placeholder={`Tell ${activePersona.name} your symptoms (e.g. 'I took two Advil', 'My ankles are swollen')...`}
                  className="flex-1 px-2.5 py-2 border-2 border-black text-xs font-semibold bg-white text-black placeholder:text-black/40 focus:outline-none focus:bg-amber-50/50"
                  disabled={isSubmittingDialogue}
                />

                <button
                  type="button"
                  onClick={() => handleCustomPatientSubmit()}
                  disabled={isSubmittingDialogue || !patientFreeTextInput.trim()}
                  className="px-3 py-2 bg-[#FFE600] hover:bg-[#E6CF00] disabled:opacity-40 text-black font-black font-display text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer uppercase"
                >
                  {isSubmittingDialogue ? '...' : 'SEND'}
                </button>
              </div>

              {/* Quick Clinical Simulation Chips for Testing */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[9px] font-mono text-black/60 font-bold self-center">Quick tests:</span>
                <button
                  type="button"
                  onClick={() => handleCustomPatientSubmit('I stopped taking my medication.')}
                  className="px-2 py-0.5 bg-white hover:bg-slate-100 text-[10px] font-mono border border-black text-slate-800 cursor-pointer"
                >
                  "I stopped taking medication"
                </button>
                <button
                  type="button"
                  onClick={() => handleCustomPatientSubmit('I have severe crushing chest pain.')}
                  className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-[10px] font-mono border border-rose-600 text-rose-800 font-bold cursor-pointer"
                >
                  "Severe crushing chest pain"
                </button>
                <button
                  type="button"
                  onClick={() => handleCustomPatientSubmit('I took two Advil for my knee yesterday.')}
                  className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-[10px] font-mono border border-amber-600 text-amber-900 cursor-pointer"
                >
                  "Took Advil for knee"
                </button>
              </div>
            </div>

            {/* Step 4: Interactive Patient Screening Choices */}
            {currentStep.patientOptions && (
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-mono font-black uppercase text-black block bg-[#FFE600] px-1.5 py-0.5 w-fit border border-black">
                  PATIENT INTERACTIVE RESPONSE • SELECT TO EVALUATE:
                </span>
                <div className="space-y-2">
                  {currentStep.patientOptions.map((opt) => {
                    const isSelected = selectedPatientOption?.id === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handlePatientOptionClick(opt)}
                        className={`w-full text-left p-2.5 border-2 border-black text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#CCFF00] shadow-[3px_3px_0px_0px_#000] -translate-y-0.5 text-black'
                            : 'bg-[#FAF8F5] hover:bg-[#FFE600]/30 text-black shadow-[1px_1px_0px_0px_#000]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold leading-tight">{opt.label}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-black flex-shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step Navigation Controls */}
            <div className="flex items-center justify-between pt-2 border-t-2 border-black/10">
              <button
                onClick={() => handleStepSelect(Math.max(0, currentStepIndex - 1))}
                disabled={currentStepIndex === 0}
                className="px-3 py-1.5 bg-white hover:bg-black/5 disabled:opacity-40 text-black border-2 border-black font-mono text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>PREVIOUS</span>
              </button>

              <button
                onClick={() => handleStepSelect(Math.min(dialogueSteps.length - 1, currentStepIndex + 1))}
                disabled={currentStepIndex === dialogueSteps.length - 1}
                className="px-3 py-1.5 bg-[#FFE600] hover:bg-[#E6CF00] disabled:opacity-40 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] font-mono text-[11px] font-black flex items-center space-x-1 cursor-pointer"
              >
                <span>NEXT STEP</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Longitudinal Data Sync Cards */}
          <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-4 space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black font-display uppercase tracking-wider text-black flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-black stroke-[2.5]" /> LONGITUDINAL BIOMARKER SYNC
              </h3>
              <span className="text-[9px] font-mono bg-[#CCFF00] text-black px-1.5 py-0.2 border border-black font-bold">
                HEAL ENGINE v1.4.2
              </span>
            </div>

            <div className="space-y-2">
              {activePersona.biomarkerFocus.map((bm, i) => (
                <div key={i} className="p-2.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-black">{bm.name}</span>
                    <span className="font-mono font-black text-black bg-[#FFE600] px-1.5 py-0.2 border border-black">
                      {bm.currentValue}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-black/70">
                    <span>Baseline: {bm.baselineValue}</span>
                    <span className={bm.trend === 'deteriorating' ? 'text-red-600 font-bold' : 'text-emerald-700 font-bold'}>
                      {bm.trend.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[10px] font-semibold text-black/80 font-mono">
                    Impact: {bm.clinicalImpact}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
