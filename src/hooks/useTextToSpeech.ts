"use client";

import { useCallback, useRef, useState } from "react";
import { generateSpeech } from "@/services/openai";

export interface TextToSpeechHook {
  preloadAudio: (text: string) => Promise<AudioBuffer>;
  playAudio: (buffer: AudioBuffer) => void;
  stopAudio: () => void;
  warmUp: () => void;
  isSpeakingTTS: boolean;
}

export function useTextToSpeech(): TextToSpeechHook {
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
    }
    return audioContextRef.current;
  }, []);

  const warmUp = useCallback(() => {
    getAudioContext();
  }, [getAudioContext]);

  const preloadAudio = useCallback(async (text: string): Promise<AudioBuffer> => {
    const arrayBuffer = await generateSpeech(text);
    const ctx = getAudioContext();
    return ctx.decodeAudioData(arrayBuffer);
  }, [getAudioContext]);

  const playAudio = useCallback((buffer: AudioBuffer) => {
    const ctx = getAudioContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => setIsSpeakingTTS(false);
    audioSourceRef.current = source;
    setIsSpeakingTTS(true);
    source.start(0);
  }, [getAudioContext]);

  const stopAudio = useCallback(() => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch { /* ignore */ }
    }
    setIsSpeakingTTS(false);
  }, []);

  return { preloadAudio, playAudio, stopAudio, warmUp, isSpeakingTTS };
}
