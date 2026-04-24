export type SttContinueMode = "off" | "continuous" | "interval";

export interface SttConfig {
  /** BCP-47 language for SpeechRecognition + playback of user transcription. */
  language: string;
  /** BCP-47 language used when reading AI paragraphs aloud (TTS). */
  aiLanguage: string;
  /** Ms of silence after speech ends before stopping. */
  silenceMs: number;
  /** Ms before nudging when no speech has started. */
  nudgeMs: number;
  /** How many nudges to emit before giving up. */
  maxNudges: number;
  /**
   * Hard cap (ms) on listening once the user starts speaking. Protects
   * against the silence detector failing to fire (e.g. noisy environments).
   */
  maxSpeechMs: number;
  continueMode: SttContinueMode;
  intervalSeconds: number;
}

export const STT_DEFAULTS: SttConfig = {
  language: "en-US",
  aiLanguage: "en-US",
  silenceMs: 4000,
  nudgeMs: 10500,
  maxNudges: 2,
  maxSpeechMs: 30000,
  continueMode: "off",
  intervalSeconds: 10,
};

export const STT_LANGUAGES: ReadonlyArray<{ code: string; label: string }> = [
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "en-AU", label: "English (Australia)" },
  { code: "en-IN", label: "English (India)" },
  { code: "es-ES", label: "Spanish (Spain)" },
  { code: "es-MX", label: "Spanish (Mexico)" },
  { code: "fr-FR", label: "French" },
  { code: "de-DE", label: "German" },
  { code: "it-IT", label: "Italian" },
  { code: "pt-BR", label: "Portuguese (Brazil)" },
  { code: "pt-PT", label: "Portuguese (Portugal)" },
  { code: "nl-NL", label: "Dutch" },
  { code: "pl-PL", label: "Polish" },
  { code: "ru-RU", label: "Russian" },
  { code: "tr-TR", label: "Turkish" },
  { code: "ar-SA", label: "Arabic" },
  { code: "he-IL", label: "Hebrew" },
  { code: "hi-IN", label: "Hindi" },
  { code: "zh-CN", label: "Chinese (Mandarin)" },
  { code: "zh-TW", label: "Chinese (Taiwan)" },
  { code: "ja-JP", label: "Japanese" },
  { code: "ko-KR", label: "Korean" },
];
