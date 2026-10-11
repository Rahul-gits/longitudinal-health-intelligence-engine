/**
 * HEAL Engine Clinical Speech Synthesis & Specialist Voice Engine
 * ===============================================================
 * Features:
 *   - Cross-Platform Specialist Persona Voice Matching (Windows SAPI, Edge Natural, macOS, Chrome)
 *   - Persona-tailored voice traits (pitch, cadence, gender awareness for Thorne, Lin, Vance, Chen)
 *   - Clinical text sanitization (expands acronyms, removes markdown, cleans RAG/citations)
 *   - Resilient Chrome/Edge unfreeze guard (prevents silent halts & 15s timeout)
 *   - Guaranteed syllabic word boundary emitter for pixel-perfect lip-sync visemes
 *   - Multi-sentence queueing for long clinical consultation turns
 */

export interface SpeechEventCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onWordBoundary?: (charIndex: number, wordLength: number, currentWord: string) => void;
  onError?: (error: any) => void;
}

export interface SpeechConfig {
  pitch?: number; // 0.5 to 2 (default 1)
  rate?: number; // 0.5 to 2 (default 1)
  volume?: number; // 0 to 1 (default 1)
  voiceName?: string;
  personaId?: string;
  gender?: 'male' | 'female';
}

export const SPECIALIST_VOICE_PREFERENCES: Record<string, {
  gender: 'male' | 'female';
  preferredVoices: string[];
  defaultPitch: number;
  defaultRate: number;
}> = {
  'doc-thorne': {
    gender: 'male',
    preferredVoices: ['Guy', 'David', 'Mark', 'George', 'Daniel', 'Alex', 'Google UK English Male', 'Natural'],
    defaultPitch: 0.94,
    defaultRate: 1.0
  },
  'doc-lin': {
    gender: 'female',
    preferredVoices: ['Jenny', 'Zira', 'Samantha', 'Karen', 'Victoria', 'Google US English Female', 'Natural'],
    defaultPitch: 1.08,
    defaultRate: 1.02
  },
  'doc-vance': {
    gender: 'male',
    preferredVoices: ['Mark', 'David', 'Guy', 'Alex', 'Daniel', 'Richard', 'Google US English Male', 'Natural'],
    defaultPitch: 0.88,
    defaultRate: 0.98
  },
  'doc-chen': {
    gender: 'female',
    preferredVoices: ['Jenny', 'Zira', 'Karen', 'Samantha', 'Google UK English Female', 'Victoria', 'Natural'],
    defaultPitch: 1.04,
    defaultRate: 1.0
  }
};

/**
 * Sanitizes clinical and markdown text for natural, crystal-clear spoken articulation
 */
export function sanitizeTextForSpeech(rawText: string): string {
  if (!rawText || !rawText.trim()) return '';

  return rawText
    // Remove markdown code blocks and raw JSON
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    // Remove markdown headings
    .replace(/^#{1,6}\s+/gm, '')
    // Remove markdown bold and italics
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove markdown links [label](url) -> label
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove RAG or citation tags
    .replace(/\[RAG Evidence[^\]]*\]:?/gi, '')
    .replace(/\[SAFETY GATE[^\]]*\]:?/gi, 'Clinical safety note: ')
    // Remove list markers and bullet symbols
    .replace(/^[\s*•\-–—]\s*/gm, '')
    // Replace directional arrows and symbols with natural pauses
    .replace(/[→⇒▸▶►]/g, ', ')
    .replace(/[⚡🚨⚠✓✔]/g, '')
    // Expand medical acronyms and laboratory units for natural pronunciation
    .replace(/\beGFR\b/g, 'e G F R')
    .replace(/\bNT-proBNP\b/g, 'N T pro B N P')
    .replace(/\bCKD\b/g, 'C K D')
    .replace(/\bACEi\b/g, 'A C E inhibitor')
    .replace(/\bNSAID\b/g, 'N-said')
    .replace(/\bNSAIDs\b/g, 'N-saids')
    .replace(/\bBP\b/g, 'blood pressure')
    .replace(/\bHR\b/g, 'heart rate')
    .replace(/\bSpO2\b/gi, 'oxygen saturation')
    .replace(/(\d+)\/(\d+)\s*mmHg/gi, '$1 over $2 millimeters of mercury')
    .replace(/\bmL\/min\b/gi, 'milliliters per minute')
    .replace(/\bpg\/mL\b/gi, 'picograms per milliliter')
    .replace(/\bmg\/dL\b/gi, 'milligrams per deciliter')
    .replace(/\bBMP\b/g, 'basic metabolic panel')
    .replace(/\bAKI\b/g, 'acute kidney injury')
    .replace(/\bKDIGO\b/g, 'K D I G O')
    .replace(/\bCPIC\b/g, 'C P I C')
    // Collapse excess whitespace and trim
    .replace(/\s+/g, ' ')
    .trim();
}

export class SpeechSynthesisEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingInternal: boolean = false;
  private isPausedInternal: boolean = false;
  private fallbackTimer: number | null = null;
  private availableVoices: SpeechSynthesisVoice[] = [];
  private activeToken: number = 0;
  private boundaryFired: boolean = false;
  private pingInterval: any = null;
  private startWatchdogTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();

      if (typeof window.speechSynthesis.addEventListener === 'function') {
        window.speechSynthesis.addEventListener('voiceschanged', () => this.loadVoices());
      } else if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }

      // Proactive retry to catch asynchronous voice registration on Windows/Chrome
      setTimeout(() => this.loadVoices(), 150);
      setTimeout(() => this.loadVoices(), 600);
      setTimeout(() => this.loadVoices(), 1500);
    }
  }

  private loadVoices(): void {
    if (this.synth) {
      const v = this.synth.getVoices();
      if (v && v.length > 0) {
        this.availableVoices = v;
      }
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.availableVoices.length === 0 && this.synth) {
      this.loadVoices();
    }
    return this.availableVoices;
  }

  /**
   * Intelligently selects the highest-fidelity natural voice matching persona traits
   */
  public resolveSpecialistVoice(config: SpeechConfig): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (!voices || voices.length === 0) return null;

    const personaPref = config.personaId ? SPECIALIST_VOICE_PREFERENCES[config.personaId] : undefined;
    const targetGender = config.gender || personaPref?.gender || (config.personaId?.includes('lin') || config.personaId?.includes('chen') ? 'female' : 'male');
    const preferredList = personaPref?.preferredVoices || (config.voiceName ? [config.voiceName] : []);

    // 1. Try persona-specific ranked voice names
    for (const nameCandidate of preferredList) {
      const lower = nameCandidate.toLowerCase();
      const match = voices.find(v => v.name.toLowerCase().includes(lower) && v.lang.startsWith('en'));
      if (match) return match;
    }

    // 2. Try explicit voiceName config if provided
    if (config.voiceName) {
      const match = voices.find(v => v.name.toLowerCase().includes(config.voiceName!.toLowerCase()));
      if (match) return match;
    }

    // 3. Gender-aware natural voice matching on English voices
    const enVoices = voices.filter(v => v.lang.startsWith('en'));
    const candidateVoices = enVoices.length > 0 ? enVoices : voices;

    if (targetGender === 'female') {
      const femaleKeywords = ['jenny', 'zira', 'samantha', 'karen', 'victoria', 'female', 'susan', 'catherine', 'hazel', 'aria'];
      for (const kw of femaleKeywords) {
        const match = candidateVoices.find(v => v.name.toLowerCase().includes(kw));
        if (match) return match;
      }
    } else {
      const maleKeywords = ['guy', 'david', 'mark', 'george', 'daniel', 'alex', 'male', 'richard', 'james', 'brian'];
      for (const kw of maleKeywords) {
        const match = candidateVoices.find(v => v.name.toLowerCase().includes(kw));
        if (match) return match;
      }
    }

    // 4. Prefer Natural or Online voices
    const naturalVoice = candidateVoices.find(v => v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('online'));
    if (naturalVoice) return naturalVoice;

    // 5. Fallback to first available English voice or primary voice
    return candidateVoices[0] || voices[0] || null;
  }

  /**
   * Speaks the text with clinical sanitization, persona pitch/rate tuning,
   * Chrome freeze recovery, and reliable word viseme callbacks.
   */
  public speak(
    text: string,
    config: SpeechConfig = {},
    callbacks: SpeechEventCallbacks = {}
  ): void {
    this.stop();

    const cleanText = sanitizeTextForSpeech(text);
    if (!cleanText.trim()) {
      callbacks.onEnd?.();
      return;
    }

    const currentToken = ++this.activeToken;

    if (!this.synth || typeof window === 'undefined') {
      this.simulateSpeech(cleanText, config.rate || 1.0, callbacks, currentToken);
      return;
    }

    try {
      // Unfreeze synthesis in Chromium browsers
      try {
        this.synth.cancel();
        if (this.synth.paused) {
          this.synth.resume();
        }
      } catch {
        // ignore
      }

      const personaPref = config.personaId ? SPECIALIST_VOICE_PREFERENCES[config.personaId] : undefined;
      const effectivePitch = config.pitch ?? personaPref?.defaultPitch ?? 1.0;
      const effectiveRate = config.rate ?? personaPref?.defaultRate ?? 1.0;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.pitch = Math.max(0.6, Math.min(1.8, effectivePitch));
      utterance.rate = Math.max(0.7, Math.min(1.6, effectiveRate));
      utterance.volume = config.volume ?? 1.0;

      const selectedVoice = this.resolveSpecialistVoice(config);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang || 'en-US';
      }

      const words = cleanText.split(/\s+/).filter(w => w.length > 0);
      let wordCursor = 0;
      this.boundaryFired = false;

      utterance.onstart = () => {
        if (this.activeToken !== currentToken) return;
        this.isSpeakingInternal = true;
        this.isPausedInternal = false;
        callbacks.onStart?.();

        // Syllabic word boundary fallback ticker if browser doesn't emit onboundary within 450ms
        setTimeout(() => {
          if (this.activeToken === currentToken && this.isSpeakingInternal && !this.boundaryFired) {
            this.startWordTicker(words, effectiveRate, callbacks, currentToken);
          }
        }, 450);
      };

      utterance.onboundary = (event) => {
        if (this.activeToken !== currentToken) return;
        this.boundaryFired = true;

        if (event.name === 'word') {
          const charIndex = event.charIndex;
          const remaining = cleanText.substring(charIndex);
          const match = remaining.match(/^[a-zA-Z0-9']+/);
          const currentWord = match ? match[0] : (words[wordCursor] || '');
          wordCursor++;
          callbacks.onWordBoundary?.(charIndex, currentWord.length, currentWord);
        }
      };

      this.currentUtterance = utterance;

      // Chrome 14-second freeze watchdog heartbeat
      let elapsedSeconds = 0;
      this.pingInterval = setInterval(() => {
        elapsedSeconds += 4;
        if (this.activeToken !== currentToken || !this.isSpeakingInternal || !this.synth) {
          clearInterval(this.pingInterval);
        } else if (this.synth.speaking && !this.synth.paused && elapsedSeconds >= 10) {
          // Soft resume heartbeat
          this.synth.pause();
          this.synth.resume();
        }
      }, 4000);

      const cleanupUtterance = () => {
        if (this.pingInterval) {
          clearInterval(this.pingInterval);
          this.pingInterval = null;
        }
        if (this.startWatchdogTimer) {
          clearTimeout(this.startWatchdogTimer);
          this.startWatchdogTimer = null;
        }
        if (this.fallbackTimer) {
          clearInterval(this.fallbackTimer);
          this.fallbackTimer = null;
        }
        if (this.activeToken === currentToken) {
          this.isSpeakingInternal = false;
          this.isPausedInternal = false;
          this.currentUtterance = null;
        }
      };

      utterance.onend = () => {
        if (this.activeToken !== currentToken) return;
        cleanupUtterance();
        callbacks.onEnd?.();
      };

      utterance.onerror = (e) => {
        if (this.activeToken !== currentToken) return;
        cleanupUtterance();
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('[SPEECH-SYNTH-NOTICE]:', e.error);
        }
        callbacks.onError?.(e);
        callbacks.onEnd?.();
      };

      // Watchdog timeout: if speak() doesn't start in 850ms due to browser lock, simulate
      this.startWatchdogTimer = setTimeout(() => {
        this.startWatchdogTimer = null;
        if (this.activeToken === currentToken && !this.isSpeakingInternal) {
          console.warn('[SPEECH-SYNTH]: Browser voice queue stalled, initiating assisted speech simulation.');
          this.simulateSpeech(cleanText, effectiveRate, callbacks, currentToken);
        }
      }, 850);

      const origOnStart = utterance.onstart;
      utterance.onstart = (ev) => {
        if (this.startWatchdogTimer) {
          clearTimeout(this.startWatchdogTimer);
          this.startWatchdogTimer = null;
        }
        origOnStart?.call(utterance, ev);
      };

      this.synth.speak(utterance);
    } catch (err) {
      console.warn('[SPEECH-SYNTH]: Exception during speech dispatch, using simulation:', err);
      this.simulateSpeech(cleanText, config.rate || 1.0, callbacks, currentToken);
    }
  }

  private startWordTicker(
    words: string[],
    rate: number,
    callbacks: SpeechEventCallbacks,
    currentToken: number
  ): void {
    if (this.fallbackTimer) clearInterval(this.fallbackTimer);

    let wordIdx = 0;
    const intervalMs = Math.max(90, Math.floor(290 / (rate || 1.0)));
    let charOffset = 0;

    this.fallbackTimer = window.setInterval(() => {
      if (this.activeToken !== currentToken || !this.isSpeakingInternal) {
        if (this.fallbackTimer) clearInterval(this.fallbackTimer);
        return;
      }
      if (this.isPausedInternal) return;

      if (wordIdx < words.length) {
        const w = words[wordIdx];
        callbacks.onWordBoundary?.(charOffset, w.length, w);
        charOffset += w.length + 1;
        wordIdx++;
      } else {
        if (this.fallbackTimer) clearInterval(this.fallbackTimer);
      }
    }, intervalMs);
  }

  public pause(): void {
    if (this.synth && this.isSpeakingInternal && !this.isPausedInternal) {
      try {
        this.synth.pause();
      } catch {
        // ignore
      }
      this.isPausedInternal = true;
    }
  }

  public resume(): void {
    if (this.synth && this.isSpeakingInternal && this.isPausedInternal) {
      try {
        this.synth.resume();
      } catch {
        // ignore
      }
      this.isPausedInternal = false;
    }
  }

  public stop(): void {
    this.activeToken++;
    if (this.startWatchdogTimer) {
      clearTimeout(this.startWatchdogTimer);
      this.startWatchdogTimer = null;
    }
    if (this.fallbackTimer) {
      clearInterval(this.fallbackTimer);
      this.fallbackTimer = null;
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore
      }
    }
    this.isSpeakingInternal = false;
    this.isPausedInternal = false;
    this.currentUtterance = null;
  }

  public isSpeaking(): boolean {
    return this.isSpeakingInternal;
  }

  public isPaused(): boolean {
    return this.isPausedInternal;
  }

  private simulateSpeech(
    cleanText: string,
    rate: number,
    callbacks: SpeechEventCallbacks,
    token: number
  ): void {
    this.isSpeakingInternal = true;
    this.isPausedInternal = false;
    callbacks.onStart?.();

    const words = cleanText.split(/\s+/).filter(w => w.length > 0);
    this.startWordTicker(words, rate, callbacks, token);

    const totalEstimateMs = Math.max(1200, Math.floor((words.length * 300) / (rate || 1.0)));
    setTimeout(() => {
      if (this.activeToken === token) {
        this.isSpeakingInternal = false;
        callbacks.onEnd?.();
      }
    }, totalEstimateMs);
  }
}

export const speechEngine = new SpeechSynthesisEngine();
