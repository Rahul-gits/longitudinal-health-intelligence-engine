export interface SpeechEventCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onWordBoundary?: (charIndex: number, wordLength: number, currentWord: string) => void;
  onError?: (error: any) => void;
}

export interface SpeechConfig {
  pitch?: number; // 0 to 2 (default 1)
  rate?: number; // 0.1 to 10 (default 1)
  volume?: number; // 0 to 1 (default 1)
  voiceName?: string;
}

export class SpeechSynthesisEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingInternal: boolean = false;
  private isPausedInternal: boolean = false;
  private fallbackTimer: number | null = null;
  private availableVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices(): void {
    if (this.synth) {
      this.availableVoices = this.synth.getVoices();
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.availableVoices.length === 0 && this.synth) {
      this.availableVoices = this.synth.getVoices();
    }
    return this.availableVoices;
  }

  public speak(
    text: string,
    config: SpeechConfig = {},
    callbacks: SpeechEventCallbacks = {}
  ): void {
    this.stop();

    if (!text.trim()) {
      callbacks.onEnd?.();
      return;
    }

    if (!this.synth || typeof window === 'undefined') {
      // Fallback simulation when speechSynthesis is unavailable
      this.simulateSpeech(text, config.rate || 1.0, callbacks);
      return;
    }

    try {
      // Cancel any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = config.pitch ?? 1.0;
      utterance.rate = config.rate ?? 1.0;
      utterance.volume = config.volume ?? 1.0;

      // Select voice if available
      const voices = this.getVoices();
      if (config.voiceName && voices.length > 0) {
        const matched = voices.find(v => v.name.toLowerCase().includes(config.voiceName!.toLowerCase()));
        if (matched) {
          utterance.voice = matched;
        }
      } else if (voices.length > 0) {
        // Prefer natural English voices if available
        const preferred = voices.find(v => 
          (v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Zira')))
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
        if (preferred) {
          utterance.voice = preferred;
        }
      }

      const words = text.split(/\s+/);
      let wordCursor = 0;

      utterance.onstart = () => {
        this.isSpeakingInternal = true;
        this.isPausedInternal = false;
        callbacks.onStart?.();
      };

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const charIndex = event.charIndex;
          const wordLength = event.charLength || 5;
          const currentWord = text.substring(charIndex, charIndex + wordLength).trim() || words[wordCursor] || '';
          wordCursor++;
          callbacks.onWordBoundary?.(charIndex, wordLength, currentWord);
        }
      };

      utterance.onend = () => {
        this.isSpeakingInternal = false;
        this.isPausedInternal = false;
        this.currentUtterance = null;
        callbacks.onEnd?.();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis notice/error:', e);
        this.isSpeakingInternal = false;
        this.isPausedInternal = false;
        this.currentUtterance = null;
        callbacks.onError?.(e);
        // If error due to audio policy or interrupted, complete gracefully
        callbacks.onEnd?.();
      };

      utterance.onpause = () => {
        this.isPausedInternal = true;
        callbacks.onPause?.();
      };

      utterance.onresume = () => {
        this.isPausedInternal = false;
        callbacks.onResume?.();
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis exception, falling back to simulated speech:', err);
      this.simulateSpeech(text, config.rate || 1.0, callbacks);
    }
  }

  public pause(): void {
    if (this.synth && this.isSpeakingInternal && !this.isPausedInternal) {
      this.synth.pause();
      this.isPausedInternal = true;
    }
  }

  public resume(): void {
    if (this.synth && this.isSpeakingInternal && this.isPausedInternal) {
      this.synth.resume();
      this.isPausedInternal = false;
    }
  }

  public stop(): void {
    if (this.fallbackTimer) {
      window.clearInterval(this.fallbackTimer);
      this.fallbackTimer = null;
    }
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
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
    text: string,
    rate: number,
    callbacks: SpeechEventCallbacks
  ): void {
    this.isSpeakingInternal = true;
    this.isPausedInternal = false;
    callbacks.onStart?.();

    const words = text.split(/\s+/);
    let wordIndex = 0;
    const wordIntervalMs = Math.max(80, Math.floor(320 / (rate || 1.0)));

    let charCursor = 0;
    this.fallbackTimer = window.setInterval(() => {
      if (this.isPausedInternal) return;

      if (wordIndex < words.length) {
        const word = words[wordIndex];
        callbacks.onWordBoundary?.(charCursor, word.length, word);
        charCursor += word.length + 1;
        wordIndex++;
      } else {
        if (this.fallbackTimer) {
          window.clearInterval(this.fallbackTimer);
          this.fallbackTimer = null;
        }
        this.isSpeakingInternal = false;
        callbacks.onEnd?.();
      }
    }, wordIntervalMs);
  }
}

export const speechEngine = new SpeechSynthesisEngine();
