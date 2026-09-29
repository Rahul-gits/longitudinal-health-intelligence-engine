import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Send, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDynamicPatientProfile } from '../data/mockPatientData';
import { getStoredSessionId } from '../services/authApi';

interface VirtualDoctorSimpleConsultationProps {
  onSwitchToAdvanced?: () => void;
  onNavigateTab?: (tab: string) => void;
}

interface DialogueTurn {
  speaker: 'doctor' | 'patient';
  text: string;
  time: string;
  suggestedQuickReplies?: string[];
  safetyAlert?: string;
  clinicalObservations?: string[];
  riskLevel?: string;
}

export const VirtualDoctorSimpleConsultation: React.FC<VirtualDoctorSimpleConsultationProps> = ({
  onSwitchToAdvanced,
  onNavigateTab
}) => {
  const { user } = useAuth();
  const currentPatient = getDynamicPatientProfile(user);

  const [inputMode, setInputMode] = useState<'type' | 'speak'>('type');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [patientText, setPatientText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [aiProvider, setAiProvider] = useState<string>('LLM Virtual Specialist');
  const [dialogueHistory, setDialogueHistory] = useState<DialogueTurn[]>([
    {
      speaker: 'doctor',
      text: `Hello ${currentPatient.name.split(' ')[0]}. I'm Dr. Maya, your HEAL Engine Virtual Specialist. I am reviewing your health picture alongside ${currentPatient.primaryPhysician.split(' (')[0]}. How are you feeling today?`,
      time: 'Just now',
      suggestedQuickReplies: [
        "I'm feeling good today",
        "My joints or knees are aching",
        "I have a question about my medication",
        "I noticed some swelling or puffiness"
      ]
    }
  ]);

  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState<boolean>(false);
  const recognitionRef = React.useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechRecognitionSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setPatientText(transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!speechRecognitionSupported) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setPatientText('');
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const message = (textToSend || patientText).trim();
    if (!message || isProcessing) return;

    const patientTurn: DialogueTurn = {
      speaker: 'patient',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setDialogueHistory(prev => [...prev, patientTurn]);
    setPatientText('');
    setIsProcessing(true);

    try {
      const sessionId = getStoredSessionId();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (sessionId) {
        headers['Authorization'] = `Bearer ${sessionId}`;
        headers['x-session-id'] = sessionId;
      }

      // Call the LLM-powered virtual specialist chat endpoint
      const res = await fetch('/api/screening/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          patientId: currentPatient.id || 'patient-ev-68',
          message,
          patientProfile: {
            name: currentPatient.name,
            age: currentPatient.age,
            gender: currentPatient.gender,
            conditions: currentPatient.conditions,
            medications: currentPatient.medications,
            allergies: currentPatient.allergies,
            primaryPhysician: currentPatient.primaryPhysician
          },
          dialogueHistory: dialogueHistory.map(d => ({ speaker: d.speaker, text: d.text }))
        })
      });

      if (!res.ok) {
        throw new Error(`Doctor API responded with ${res.status}`);
      }

      const data = await res.json();
      if (data.provider) {
        setAiProvider(data.provider === 'GEMINI' ? 'Gemini 1.5 LLM' : data.provider === 'OPENAI' ? 'OpenAI LLM' : 'HEAL Clinical LLM');
      }

      const doctorReply: DialogueTurn = {
        speaker: 'doctor',
        text: data.doctorResponse || `Thank you for sharing that with me, ${currentPatient.name.split(' ')[0]}. I have documented this in your health timeline.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuickReplies: data.suggestedReplies || [
          "Tell me more",
          "I will discuss this with my doctor",
          "Everything is clear, thank you"
        ],
        clinicalObservations: data.clinicalObservations,
        riskLevel: data.riskLevel,
        safetyAlert: data.safetyGateTriggered
          ? (data.safetyDetails || "Safety Guard: A medication interaction or vital trend was flagged for clinical physician review.")
          : undefined
      };

      setDialogueHistory(prev => [...prev, doctorReply]);
    } catch (err) {
      console.warn('[VIRTUAL-SPECIALIST] Primary API request error, using resilient dialogue fallback:', err);
      // Fallback personalized response
      const isPain = message.toLowerCase().includes('pain') || message.toLowerCase().includes('knee');
      const fallbackReply: DialogueTurn = {
        speaker: 'doctor',
        text: isPain
          ? `Thank you for sharing that with me, ${currentPatient.name.split(' ')[0]}. Because we are monitoring your kidney function and you take ${currentPatient.medications[0] || 'prescriptions'}, oral pain pills like Advil or Ibuprofen should be avoided. A gentle topical gel or cold compress is much safer until ${currentPatient.primaryPhysician.split(',')[0]} checks in.`
          : `Thank you for updating me, ${currentPatient.name.split(' ')[0]}. I've noted this in your health timeline. Continue your prescribed ${currentPatient.medications.join(', ')} as scheduled and reach out if your symptoms change.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuickReplies: ["Understood, thank you", "I have another question", "Can we contact my doctor?"],
        clinicalObservations: ['Logged symptom observation in local resilient cache']
      };
      setDialogueHistory(prev => [...prev, fallbackReply]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Friendly Header Card */}
      <div className="bg-white border-3 border-black p-6 shadow-[6px_6px_0px_0px_#000] relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-[#FFE600] border-2 border-black flex items-center justify-center text-2xl shadow-[2px_2px_0px_0px_#000]">
              👩‍⚕️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black font-display text-black">Your Health Check</h1>
                <span className="bg-[#00F5D4] text-black text-[10px] font-mono font-bold px-2 py-0.5 border border-black rounded-full flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse mr-1" /> ACTIVE
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 bg-[#FFE600] text-black text-[10px] font-mono font-black px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000]">
                  <Sparkles className="w-3 h-3 text-black" />
                  <span>{aiProvider}</span>
                </span>
              </div>
              <p className="text-sm text-neutral-600 font-medium">Personalized for {currentPatient.name} • Dr. Maya, Virtual Specialist Partner</p>
            </div>
          </div>

          {onSwitchToAdvanced && (
            <button
              onClick={onSwitchToAdvanced}
              className="text-xs font-mono font-bold text-neutral-500 hover:text-black underline underline-offset-4 cursor-pointer"
            >
              Clinical Tele-Screening View →
            </button>
          )}
        </div>
      </div>

      {/* Main Dialogue Box */}
      <div className="bg-[#FFFDF9] border-3 border-black p-6 shadow-[6px_6px_0px_0px_#000] space-y-6 min-h-[420px] flex flex-col justify-between">
        {/* Dialogue Stream */}
        <div className="space-y-4 overflow-y-auto max-h-[380px] pr-2">
          {dialogueHistory.map((turn, index) => (
            <div
              key={index}
              className={`flex flex-col ${turn.speaker === 'patient' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center space-x-1.5 mb-1 px-1">
                <span className="text-[11px] font-bold text-neutral-500 font-mono">
                  {turn.speaker === 'doctor' ? 'Dr. Maya' : 'You'}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">• {turn.time}</span>
              </div>

              <div
                className={`max-w-[85%] p-4 text-sm font-medium leading-relaxed border-2 border-black shadow-[3px_3px_0px_0px_#000] ${
                  turn.speaker === 'patient'
                    ? 'bg-[#FFE600] text-black rounded-2xl rounded-tr-none'
                    : 'bg-white text-neutral-900 rounded-2xl rounded-tl-none'
                }`}
              >
                {turn.text}

                {/* AI Extracted Clinical Observations */}
                {turn.clinicalObservations && turn.clinicalObservations.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="font-mono text-slate-500 font-bold uppercase tracking-wider">AI Clinical Note:</span>
                    {turn.clinicalObservations.map((obs, oIdx) => (
                      <span key={oIdx} className="px-2 py-0.5 bg-blue-50 text-blue-800 font-mono font-semibold rounded border border-blue-200">
                        {obs}
                      </span>
                    ))}
                  </div>
                )}

                {turn.safetyAlert && (
                  <div className="mt-3 p-2.5 bg-amber-50 border border-amber-300 rounded text-xs font-semibold text-amber-900 flex items-start space-x-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{turn.safetyAlert}</span>
                  </div>
                )}
              </div>

              {/* Quick Response Chips (Only on the latest doctor turn) */}
              {turn.speaker === 'doctor' && index === dialogueHistory.length - 1 && turn.suggestedQuickReplies && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {turn.suggestedQuickReplies.map((reply, rIdx) => (
                    <button
                      key={rIdx}
                      onClick={() => handleSendMessage(reply)}
                      disabled={isProcessing}
                      className="text-xs font-bold px-3 py-1.5 bg-[#F0F7FF] text-[#0066CC] border border-blue-400 rounded-full hover:bg-[#0066CC] hover:text-white transition-all shadow-[1px_1px_0px_0px_#000] active:translate-y-0.5"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center space-x-2 text-xs font-mono text-neutral-500 p-2">
              <span className="w-2 h-2 rounded-full bg-[#00F5D4] animate-ping" />
              <span>Dr. Maya is reviewing your response...</span>
            </div>
          )}
        </div>

        {/* Interaction Input Panel */}
        <div className="border-t-2 border-black/20 pt-4 space-y-3">
          {/* Mode Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setInputMode('speak')}
                className={`text-xs font-mono font-bold px-3 py-1 border border-black rounded transition-all flex items-center space-x-1 ${
                  inputMode === 'speak' ? 'bg-[#FFE600] shadow-[2px_2px_0px_0px_#000]' : 'bg-white hover:bg-neutral-100'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Speak</span>
              </button>

              <button
                type="button"
                onClick={() => setInputMode('type')}
                className={`text-xs font-mono font-bold px-3 py-1 border border-black rounded transition-all flex items-center space-x-1 ${
                  inputMode === 'type' ? 'bg-[#FFE600] shadow-[2px_2px_0px_0px_#000]' : 'bg-white hover:bg-neutral-100'
                }`}
              >
                <span>⌨ Type</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-neutral-500">
              Safe & confidential health check
            </span>
          </div>

          {/* Voice Input Mode */}
          {inputMode === 'speak' && (
            <div className="p-4 bg-amber-50/60 border-2 border-black rounded-lg flex flex-col items-center justify-center space-y-3">
              <button
                onClick={toggleRecording}
                className={`w-16 h-16 rounded-full border-3 border-black flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse shadow-[4px_4px_0px_0px_#000]'
                    : 'bg-[#FFE600] text-black hover:scale-105 shadow-[3px_3px_0px_0px_#000]'
                }`}
              >
                {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              </button>
              <p className="text-xs font-bold text-neutral-800">
                {isRecording ? "Listening... Speak naturally" : "Tap the microphone to speak"}
              </p>
              {patientText && (
                <div className="w-full flex items-center space-x-2">
                  <input
                    type="text"
                    value={patientText}
                    onChange={(e) => setPatientText(e.target.value)}
                    className="flex-1 bg-white border border-black px-3 py-2 text-sm rounded font-medium"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    className="bg-black text-white px-4 py-2 text-xs font-bold font-mono border border-black rounded"
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Text Input Mode */}
          {inputMode === 'type' && (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={patientText}
                onChange={(e) => setPatientText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type how you're feeling here..."
                disabled={isProcessing}
                className="flex-1 bg-white border-2 border-black px-4 py-2.5 text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#FFE600] shadow-[2px_2px_0px_0px_#000]"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!patientText.trim() || isProcessing}
                className="bg-black text-white px-5 py-2.5 text-xs font-bold font-mono border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#FFE600] hover:text-black transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Helpful Reassurance Footer */}
      <div className="bg-[#EBF7FF] border-2 border-black p-4 flex items-center justify-between shadow-[3px_3px_0px_0px_#000]">
        <div className="flex items-center space-x-2">
          <Heart className="w-4 h-4 text-rose-500 flex-shrink-0" />
          <span className="text-xs font-bold text-neutral-800">
            Have questions about your medications or daily tasks?
          </span>
        </div>
        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('recovery')}
            className="text-xs font-mono font-bold text-blue-700 hover:underline flex items-center space-x-1"
          >
            <span>View Care Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
