"use client";

import { ActionInterface } from "@/components/ActionInterface";
import { Mascot } from "@/components/Mascot";
import { Button } from "@/components/ui/button";
import { IntentMatch, LANGUAGES, type SupportedLang, matchQuery } from "@/lib/knowledgeBase";
import { AlertCircle, BotMessageSquare, Globe, MapPin, Mic, RefreshCw, XCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type AppState = "idle" | "listening" | "processing" | "result" | "unsupported";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [selectedLang, setSelectedLang] = useState<SupportedLang>("en");
  const [transcript, setTranscript] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [matchedIntent, setMatchedIntent] = useState<IntentMatch | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speakingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const liveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isTranscribingRef = useRef(false);
  const selectedLangRef = useRef<SupportedLang>(selectedLang);

  useEffect(() => {
    selectedLangRef.current = selectedLang;
  }, [selectedLang]);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      stopRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current =
        new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const transcribeAudio = useCallback(async (audioBlob: Blob, lang: SupportedLang): Promise<string> => {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");
    formData.append("language", lang);

    const res = await fetch("/api/openai/stt", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `STT failed (${res.status})`);
    }

    const data = await res.json();
    return data.text || "";
  }, []);

  const preloadAudio = async (text: string): Promise<AudioBuffer> => {
    const res = await fetch("/api/openai/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) throw new Error("TTS Failed");

    const arrayBuffer = await res.arrayBuffer();
    const audioCtx = getAudioContext();
    return audioCtx.decodeAudioData(arrayBuffer);
  };

  const playAudio = (buffer: AudioBuffer) => {
    const audioCtx = getAudioContext();
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.onended = () => {
      setIsSpeakingTTS(false);
    };
    audioSourceRef.current = source;
    setIsSpeakingTTS(true);
    source.start(0);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream;

    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    volumeIntervalRef.current = setInterval(() => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const normalized = Math.min(100, Math.round((average / 128) * 100));
      setVolumeLevel(normalized);

      if (average > 20) {
        setIsSpeaking(true);
        if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
        speakingTimeoutRef.current = setTimeout(() => setIsSpeaking(false), 500);
      }
    }, 100);

    audioChunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    mediaRecorderRef.current = recorder;
    recorder.start(1000);

    liveIntervalRef.current = setInterval(async () => {
      if (isTranscribingRef.current || audioChunksRef.current.length === 0) return;
      isTranscribingRef.current = true;
      try {
        const blob = new Blob([...audioChunksRef.current], { type: "audio/webm" });
        const text = await transcribeAudio(blob, selectedLangRef.current);
        if (text) setLiveTranscript(text);
      } catch {
        // non-critical — don't break recording
      } finally {
        isTranscribingRef.current = false;
      }
    }, 1000);
  };

  const stopRecording = () => {
    if (liveIntervalRef.current) {
      clearInterval(liveIntervalRef.current);
      liveIntervalRef.current = null;
    }
    isTranscribingRef.current = false;
    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = null;
    }
    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current);
      speakingTimeoutRef.current = null;
    }
    setIsSpeaking(false);
    setVolumeLevel(0);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    analyserRef.current = null;
  };

  const getRecordedBlob = (): Promise<Blob> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve(new Blob(audioChunksRef.current, { type: "audio/webm" }));
        return;
      }
      recorder.onstop = () => {
        resolve(new Blob(audioChunksRef.current, { type: "audio/webm" }));
      };
      recorder.stop();
    });
  };

  const startListening = async () => {
    setAppState("listening");
    setLocalError(null);
    setTranscript("");
    setLiveTranscript("");
    setVolumeLevel(0);

    getAudioContext();

    try {
      await startRecording();
    } catch (e: unknown) {
      console.error("[Recording] setup error:", e);
      setLocalError((e as Error)?.message ?? "Failed to start recording");
      setAppState("idle");
    }
  };

  const forceStopListening = async () => {
    if (appState !== "listening") return;
    setAppState("processing");

    try {
      const audioBlob = await getRecordedBlob();
      stopRecording();

      const text = await transcribeAudio(audioBlob, selectedLang);
      setTranscript(text);
      await handleProcessing(text);
    } catch (e: unknown) {
      console.error("[STT] error:", e);
      setLocalError((e as Error)?.message ?? "Transcription failed");
      setAppState("idle");
    }
  };

  const STEP_LABELS: Record<SupportedLang, { intro: string; step: string }> = {
    en: { intro: "Here is what you need to do.", step: "Step" },
    ja: { intro: "必要な手順は以下の通りです。", step: "ステップ" },
    zh: { intro: "以下是您需要做的。", step: "第" },
    ko: { intro: "다음은 필요한 단계입니다.", step: "단계" },
    vi: { intro: "Dưới đây là những gì bạn cần làm.", step: "Bước" },
    ne: { intro: "यहाँ तपाईंले गर्नुपर्ने कुराहरू छन्।", step: "चरण" },
  };

  const handleProcessing = async (text: string) => {
    const match = matchQuery(text, selectedLang);
    const labels = STEP_LABELS[selectedLang];

    let fullSpeech = match.welcomeMessage;
    if (!match.isUnsupported && match.steps.length > 0) {
      fullSpeech += ` ${labels.intro} `;
      match.steps.forEach((step, idx) => {
        fullSpeech += `${labels.step} ${idx + 1}: ${step.title}. ${step.description} `;
      });
    }

    const audioBuffer = await preloadAudio(fullSpeech);

    setMatchedIntent(match);
    setAppState(match.isUnsupported ? "unsupported" : "result");
    playAudio(audioBuffer);
  };

  const restartProcess = () => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch { }
    }
    stopRecording();
    setIsSpeakingTTS(false);
    setAppState("idle");
    setTranscript("");
    setLiveTranscript("");
    setVolumeLevel(0);
    setMatchedIntent(null);
    setLocalError(null);
  };

  const volumeBars = 5;

  if (!isMounted) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans flex flex-col items-center">

      {/* ── IDLE ─────────────────────────────────────────── */}
      {appState === "idle" && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 w-full animate-in fade-in duration-700">

          {/* Office badge */}
          <div className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-full shadow-md mb-6 tracking-wide">
            <MapPin className="w-4 h-4" />
            北区役所 · Kita-ku Kuyakusho
          </div>

          {/* Speech bubble + mascot */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative bg-blue-50 border border-blue-100 px-10 py-5 rounded-3xl shadow-lg text-center mb-2">
              <p className="text-3xl font-bold text-blue-700 tracking-tight leading-snug">いらっしゃいませ</p>
              <p className="text-base font-medium text-blue-500 mt-1 tracking-widest">Welcome!</p>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-blue-50 border-r border-b border-blue-100 rotate-45"></div>
            </div>
            <Mascot className="w-52 h-52 mt-4 animate-bounce drop-shadow-md" />
          </div>

          {/* Info card */}
          <div className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-3xl p-5 mb-7 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <BotMessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm font-bold text-slate-700">Voice Guide Assistant</p>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Hi, I am your digital guide, and I can help you <span className="font-semibold text-slate-700">finish your ward office</span> operations smoothly and stress-free. <span className="font-semibold text-slate-700">Tell me how I can help you.</span>
            </p>
          </div>

          {/* Language selector */}
          <div className="w-full max-w-sm mb-7">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-slate-500" />
              <p className="text-sm font-semibold text-slate-600">Select your language</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                    selectedLang === lang.code
                      ? "bg-blue-50 border-blue-300 text-blue-700 shadow-sm ring-2 ring-blue-200"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <span className="text-lg leading-none">{lang.flag}</span>
                  <span className="truncate">{lang.nativeLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {localError && (
            <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 max-w-sm w-full">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{localError}</p>
            </div>
          )}

          <Button
            size="lg"
            onClick={startListening}
            className="text-xl px-14 py-7 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-300 flex items-center gap-3"
          >
            <Mic className="w-6 h-6" />
            Begin
          </Button>

        </div>
      )}

      {/* ── LISTENING / PROCESSING ───────────────────────── */}
      {(appState === "listening" || appState === "processing") && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 w-full animate-in fade-in duration-500">
          <div className="mb-8 relative bg-red-50 border border-red-100 px-8 py-4 rounded-3xl shadow-lg max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-red-800 tracking-tight">
              {appState === "listening" ? "I am listening... Please speak clearly." : "Processing your request..."}
            </h2>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-50 border-r border-b border-red-100 rotate-45"></div>
          </div>

          <Mascot className="w-40 h-40 mb-12 drop-shadow-md" />

          <div className="relative flex flex-col items-center justify-center">
            {appState === "listening" && isSpeaking && (
              <>
                <div className="absolute w-56 h-56 bg-red-100 rounded-full animate-ping opacity-50" style={{ animationDuration: "1.5s" }}></div>
                <div className="absolute w-44 h-44 bg-red-200 rounded-full animate-ping opacity-50" style={{ animationDelay: "0.2s", animationDuration: "1.2s" }}></div>
              </>
            )}
            {appState === "processing" && (
              <div className="absolute w-32 h-32 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
            )}
            <button
              onClick={appState === "listening" ? forceStopListening : undefined}
              className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${appState === "listening"
                ? "bg-red-500 hover:bg-red-600 hover:scale-105 shadow-red-500/50 cursor-pointer"
                : "bg-slate-200 cursor-default"
                }`}
            >
              {appState === "listening"
                ? <Mic className="w-14 h-14 text-white animate-pulse" />
                : <Mascot className="w-14 h-14 opacity-40 grayscale" />
              }
            </button>
          </div>

          {/* Volume indicator + transcript */}
          <div className="mt-8 min-h-24 flex flex-col items-center justify-start text-center max-w-2xl px-8 w-full gap-3">
            {appState === "listening" && (
              <div className="flex items-end gap-1.5 h-8">
                {Array.from({ length: volumeBars }).map((_, i) => {
                  const barThreshold = ((i + 1) / volumeBars) * 100;
                  const isActive = volumeLevel >= barThreshold;
                  return (
                    <div
                      key={i}
                      className={`w-2 rounded-full transition-all duration-100 ${
                        isActive ? "bg-red-500" : "bg-slate-200"
                      }`}
                      style={{
                        height: `${8 + (i + 1) * 4}px`,
                      }}
                    />
                  );
                })}
              </div>
            )}

            {appState === "listening" ? (
              liveTranscript ? (
                <p className="text-xl text-slate-700 italic font-medium leading-relaxed animate-in fade-in">
                  &quot;{liveTranscript}&quot;
                </p>
              ) : (
                <p className="text-lg text-slate-400 animate-pulse">Speak now...</p>
              )
            ) : transcript ? (
              <p className="text-2xl text-slate-700 italic font-medium leading-relaxed animate-in fade-in">
                &quot;{transcript}&quot;
              </p>
            ) : (
              <p className="text-lg text-slate-400 animate-pulse">Processing...</p>
            )}
          </div>

          <Button variant="ghost" onClick={restartProcess} className="mt-6 text-slate-500 hover:text-slate-800">
            Cancel
          </Button>
        </div>
      )}

      {/* ── UNSUPPORTED ──────────────────────────────────── */}
      {appState === "unsupported" && matchedIntent && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 w-full animate-in fade-in duration-500">
          <div className="w-full max-w-md flex flex-col items-center text-center">

            {/* Icon */}
            <div className="w-20 h-20 rounded-3xl bg-orange-100 border border-orange-200 flex items-center justify-center mb-6 shadow-sm">
              <XCircle className="w-10 h-10 text-orange-500" />
            </div>

            {/* Mascot */}
            <Mascot className={`w-36 h-36 mb-6 drop-shadow-md ${isSpeakingTTS ? "animate-bounce" : ""}`} />

            {/* Speaking indicator */}
            {isSpeakingTTS && (
              <div className="flex items-center gap-1.5 text-orange-500 text-sm font-medium mb-4">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="ml-1">Speaking</span>
              </div>
            )}

            {/* Message card */}
            <div className="bg-orange-50 border border-orange-200 rounded-3xl px-8 py-6 mb-6 shadow-sm w-full">
              <p className="text-lg font-semibold text-orange-800 leading-relaxed">
                {matchedIntent.welcomeMessage}
              </p>
              {transcript && (
                <p className="text-sm text-orange-600 mt-3 italic">
                  You asked: &quot;{transcript}&quot;
                </p>
              )}
            </div>

            {/* Restart button */}
            <Button
              size="lg"
              onClick={restartProcess}
              className="px-10 py-6 rounded-full bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white text-lg font-semibold shadow-lg transition-all duration-300 flex items-center gap-3"
            >
              <RefreshCw className="w-5 h-5" />
              Start New Request
            </Button>

          </div>
        </div>
      )}

      {/* ── RESULT ───────────────────────────────────────── */}
      {appState === "result" && matchedIntent && (
        <div className="w-full max-w-6xl px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Left sidebar — Mascot */}
          <div className="lg:w-64 shrink-0 flex flex-col items-center bg-gradient-to-b from-blue-50 to-purple-50 rounded-3xl border border-slate-100 shadow-sm p-6 gap-4">
            <div className="flex flex-col items-center gap-4 w-full">
              {/* Speech bubble with transcript */}
              {transcript && (
                <div className="relative bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm w-full text-center">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">You said</p>
                  <p className="text-sm font-medium text-slate-700 italic leading-snug">
                    &quot;{transcript}&quot;
                  </p>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-slate-100 rotate-45" />
                </div>
              )}

              <Mascot className={`w-40 h-40 drop-shadow-md ${isSpeakingTTS ? "animate-bounce" : ""}`} />

              {isSpeakingTTS && (
                <div className="flex items-center gap-1.5 text-blue-500 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="ml-1">Speaking</span>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={restartProcess}
              className="mt-auto w-full rounded-2xl bg-white hover:bg-slate-50 border-slate-200 font-medium"
            >
              Ask Another Question
            </Button>
          </div>

          {/* Right side — Steps */}
          <div className="flex-1 min-w-0">
            <ActionInterface
              match={matchedIntent}
              onRestart={restartProcess}
            />
          </div>

        </div>
      )}
    </main>
  );
}
