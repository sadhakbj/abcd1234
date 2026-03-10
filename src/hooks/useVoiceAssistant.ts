"use client";

import { useCallback, useState } from "react";
import { type IntentMatch, type SupportedLang, UI_STRINGS, matchQuery } from "@/lib/knowledgeBase";
import { transcribeAudio } from "@/services/openai";
import { useAudioRecorder } from "./useAudioRecorder";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useTextToSpeech } from "./useTextToSpeech";

export type AppState = "idle" | "listening" | "processing" | "result" | "unsupported";

export interface VoiceAssistant {
  appState: AppState;
  transcript: string;
  liveTranscript: string;
  volumeLevel: number;
  isSpeaking: boolean;
  isSpeakingTTS: boolean;
  matchedIntent: IntentMatch | null;
  localError: string | null;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  restart: () => void;
}

export function useVoiceAssistant(lang: SupportedLang): VoiceAssistant {
  const [appState, setAppState] = useState<AppState>("idle");
  const [transcript, setTranscript] = useState("");
  const [matchedIntent, setMatchedIntent] = useState<IntentMatch | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const recorder = useAudioRecorder();
  const recognition = useSpeechRecognition();
  const tts = useTextToSpeech();
  const t = UI_STRINGS[lang];

  const buildSpeechText = useCallback((match: IntentMatch): string => {
    let speech = match.welcomeMessage;
    if (!match.isUnsupported && match.steps.length > 0) {
      speech += ` ${t.stepIntro} `;
      match.steps.forEach((step, idx) => {
        speech += `${t.stepLabel} ${idx + 1}: ${step.title}. ${step.description} `;
      });
    }
    return speech;
  }, [t]);

  const handleProcessing = useCallback(async (text: string) => {
    const match = matchQuery(text, lang);
    const audioBuffer = await tts.preloadAudio(buildSpeechText(match));
    setMatchedIntent(match);
    setAppState(match.isUnsupported ? "unsupported" : "result");
    tts.playAudio(audioBuffer);
  }, [lang, tts, buildSpeechText]);

  const startListening = useCallback(async () => {
    setAppState("listening");
    setLocalError(null);
    setTranscript("");
    recognition.resetTranscript();
    tts.warmUp();

    try {
      await recorder.startRecording();
      recognition.startRecognition(lang);
    } catch (e: unknown) {
      console.error("[Recording] setup error:", e);
      setLocalError((e as Error)?.message ?? "Failed to start recording");
      setAppState("idle");
    }
  }, [recorder, recognition, tts, lang]);

  const stopListening = useCallback(async () => {
    if (appState !== "listening") return;
    setAppState("processing");

    const instantText = recognition.liveTranscript;

    try {
      if (instantText) {
        recorder.stopRecording();
        recognition.stopRecognition();
        setTranscript(instantText);
        await handleProcessing(instantText);
      } else {
        const audioBlob = await recorder.getRecordedBlob();
        recorder.stopRecording();
        recognition.stopRecognition();
        const text = await transcribeAudio(audioBlob, lang);
        setTranscript(text);
        await handleProcessing(text);
      }
    } catch (e: unknown) {
      console.error("[STT] error:", e);
      setLocalError((e as Error)?.message ?? "Transcription failed");
      setAppState("idle");
    }
  }, [appState, lang, recorder, recognition, handleProcessing]);

  const restart = useCallback(() => {
    tts.stopAudio();
    recorder.stopRecording();
    recognition.stopRecognition();
    recognition.resetTranscript();
    setAppState("idle");
    setTranscript("");
    setMatchedIntent(null);
    setLocalError(null);
  }, [tts, recorder, recognition]);

  return {
    appState,
    transcript,
    liveTranscript: recognition.liveTranscript,
    volumeLevel: recorder.volumeLevel,
    isSpeaking: recorder.isSpeaking,
    isSpeakingTTS: tts.isSpeakingTTS,
    matchedIntent,
    localError,
    startListening,
    stopListening,
    restart,
  };
}
