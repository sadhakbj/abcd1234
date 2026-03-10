"use client";

import { useCallback, useRef, useState } from "react";
import type { SupportedLang } from "@/lib/knowledgeBase";

const LANG_CODES: Record<SupportedLang, string> = {
  en: "en-US",
  ja: "ja-JP",
  zh: "zh-CN",
  ko: "ko-KR",
  vi: "vi-VN",
  ne: "ne-NP",
};

export interface SpeechRecognitionHook {
  startRecognition: (lang: SupportedLang) => void;
  stopRecognition: () => void;
  liveTranscript: string;
  resetTranscript: () => void;
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [liveTranscript, setLiveTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
  }, []);

  const startRecognition = useCallback((lang: SupportedLang) => {
    stopRecognition();

    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = LANG_CODES[lang];
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        interim += event.results[i][0].transcript;
      }
      if (interim) setLiveTranscript(interim);
    };

    recognition.onerror = () => { /* non-critical */ };
    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        try { recognition.start(); } catch { /* ignore */ }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [stopRecognition]);

  const resetTranscript = useCallback(() => setLiveTranscript(""), []);

  return { startRecognition, stopRecognition, liveTranscript, resetTranscript };
}
