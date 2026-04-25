import { useState, useEffect } from "react";
import { STT_DEFAULTS, type SttConfig } from "@/config/stt";

export type GameMode = "auto" | "manual";

export interface StorySettings {
  model: string;
  maxTokens: number;
  temperature: number;
  apiKey: string;
  apiUrl: string;
  blindMode: boolean;
  playUserTranscription: boolean;
  gameMode: GameMode;
  stt: SttConfig;
  /**
   * BCP-47 language to display each story line translated into. Set to
   * "off" to show only the original text. The translation is rendered
   * inline below each paragraph and powered by Google Translate's free
   * public endpoint (no API key required).
   */
  viewLanguage: string;
  /**
   * Per-language playback speed (rate) for text-to-speech, keyed by the
   * BCP-47 language tag (e.g. { "en-US": 1.0, "ja-JP": 0.85 }). When a
   * language is missing from this map the global `ttsRateDefault` is used.
   * Range matches SpeechSynthesisUtterance.rate (typically 0.5–2.0).
   */
  ttsRates: Record<string, number>;
  /** Default playback rate when a language has no explicit override. */
  ttsRateDefault: number;
}

const STORAGE_KEY = "story-together-settings";

const DEFAULTS: StorySettings = {
  model: "openrouter/free",
  maxTokens: 10,
  temperature: 1.0,
  apiKey: "",
  apiUrl: "",
  blindMode: false,
  playUserTranscription: true,
  gameMode: "auto",
  stt: { ...STT_DEFAULTS },
  viewLanguage: "off",
  ttsRates: {},
  ttsRateDefault: 0.95,
};

function load(): StorySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StorySettings>;
      return {
        ...DEFAULTS,
        ...parsed,
        stt: { ...DEFAULTS.stt, ...(parsed.stt ?? {}) },
        ttsRates: { ...DEFAULTS.ttsRates, ...(parsed.ttsRates ?? {}) },
      };
    }
  } catch {}
  return DEFAULTS;
}

export function useSettings() {
  const [settings, setSettingsState] = useState<StorySettings>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const updateSettings = (patch: Partial<StorySettings>) => {
    setSettingsState((prev) => ({ ...prev, ...patch }));
  };

  return { settings, updateSettings, DEFAULTS };
}
