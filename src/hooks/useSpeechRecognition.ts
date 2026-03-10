"use client";

import { useCallback, useRef, useState } from "react";
import type { SupportedLang } from "@/lib/knowledgeBase";

const LANG_CODES: Record<SupportedLang, string> = {
  en: "en-US",
  ja: "ja-JP",
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
  // Text committed from previous recognition sessions (survives auto-restarts)
  const committedRef = useRef("");
  // Always mirrors the latest full text (committed + current session)
  const fullTextRef = useRef("");

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
  }, []);

  const startRecognition = useCallback((lang: SupportedLang) => {
    stopRecognition();
    committedRef.current = "";
    fullTextRef.current = "";

    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = LANG_CODES[lang];
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let sessionFinal = "";
      let interim = "";

      for (let i = 0; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          sessionFinal += text;
        } else {
          interim += text;
        }
      }

      const full = committedRef.current + sessionFinal + interim;
      fullTextRef.current = full;
      if (full) setLiveTranscript(full);
    };

    recognition.onerror = () => { /* non-critical */ };

    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        // Persist everything spoken so far before the session restarts
        committedRef.current = fullTextRef.current;
        try { recognition.start(); } catch { /* ignore */ }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [stopRecognition]);

  const resetTranscript = useCallback(() => {
    committedRef.current = "";
    fullTextRef.current = "";
    setLiveTranscript("");
  }, []);

  return { startRecognition, stopRecognition, liveTranscript, resetTranscript };
}
