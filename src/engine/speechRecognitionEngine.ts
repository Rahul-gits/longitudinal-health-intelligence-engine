/**
 * Speech Recognition Engine (ASR)
 * Provides browser Web Speech API SpeechRecognition integration with microphone state,
 * interim transcript streaming, error handling, and keyboard text fallback.
 */

export interface SpeechRecognitionCallbacks {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export class SpeechRecognitionEngine {
  private recognition: any = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        this.recognition = new SpeechRecognitionClass();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      }
    }
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public start(callbacks: SpeechRecognitionCallbacks = {}): void {
    if (!this.recognition) {
      callbacks.onError?.('Speech recognition is not supported in this browser. Please type your response.');
      return;
    }

    if (this.isListening) {
      this.stop();
    }

    this.recognition.onstart = () => {
      this.isListening = true;
      callbacks.onStart?.();
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        callbacks.onResult?.(finalTranscript, true);
      } else if (interimTranscript) {
        callbacks.onResult?.(interimTranscript, false);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      callbacks.onError?.(event.error || 'Microphone error during speech recognition');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      callbacks.onEnd?.();
    };

    try {
      this.recognition.start();
    } catch (err) {
      console.warn('SpeechRecognition start error:', err);
      callbacks.onError?.('Unable to access microphone.');
    }
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        // Ignored
      }
      this.isListening = false;
    }
  }
}

export const speechRecognitionEngine = new SpeechRecognitionEngine();
