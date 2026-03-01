"use client";

import { ActionInterface } from "@/components/ActionInterface";
import { Mascot } from "@/components/Mascot";
import { Button } from "@/components/ui/button";
import { IntentMatch, matchQuery } from "@/lib/knowledgeBase";
import { agora } from "@/lib/stt-message";
import type { IAgoraRTCClient, ILocalAudioTrack } from "agora-rtc-sdk-ng";
import { AlertCircle, BotMessageSquare, MapPin, Mic, RefreshCw, Square, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type AppState = "idle" | "listening" | "processing" | "result" | "unsupported";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [transcript, setTranscript] = useState("");
  const [matchedIntent, setMatchedIntent] = useState<IntentMatch | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const micRef = useRef<ILocalAudioTrack | null>(null);
  const volumeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speakingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sttTaskIdRef = useRef<string | null>(null);
  const transcriptRef = useRef("");
  const interimRef = useRef("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID ?? "";
  const channel = process.env.NEXT_PUBLIC_AGORA_CHANNEL ?? "test";
  const token = process.env.NEXT_PUBLIC_AGORA_TOKEN ?? null;

  useEffect(() => {
    setIsMounted(true);
    return () => {
      stopAgoraSTT();
      stopAgora();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStreamMessage = (_uid: number, payload: Uint8Array) => {
    try {
      const msg = agora.audio.stt.Text.decode(payload);
      if (!msg.words || msg.words.length === 0) return;

      let isFinal = false;
      let currentText = "";
      msg.words.forEach((word) => {
        if (word.isFinal) isFinal = true;
        currentText += word.text;
      });

      if (isFinal) {
        transcriptRef.current = (transcriptRef.current + " " + currentText).trim();
        interimRef.current = "";
      } else {
        interimRef.current = currentText;
      }

      const full = (transcriptRef.current + " " + interimRef.current).trim();
      setTranscript(full);
    } catch (e) {
      console.error("[STT] stream message decode error:", e);
    }
  };

  const startAgoraSTT = async (userUid: string) => {
    const res = await fetch("/api/agora/stt/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelName: channel, userUid }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        `STT start failed (${res.status}): ${errorData.details || errorData.error || res.statusText}`
      );
    }
    const data = await res.json();
    sttTaskIdRef.current = data.taskId;
  };

  const stopAgoraSTT = async () => {
    if (!sttTaskIdRef.current) return;
    try {
      await fetch("/api/agora/stt/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: sttTaskIdRef.current }),
      });
      sttTaskIdRef.current = null;
    } catch (error) {
      console.error("Error stopping Agora STT:", error);
    }
  };

  const startAgora = async (): Promise<string> => {
    const { default: AgoraRTC } = await import("agora-rtc-sdk-ng");
    if (!clientRef.current) {
      clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current.on("stream-message", handleStreamMessage);
    }
    const assignedUid = await clientRef.current.join(appId, channel, token || null, null);
    micRef.current = await AgoraRTC.createMicrophoneAudioTrack();
    await clientRef.current.publish([micRef.current]);

    volumeIntervalRef.current = setInterval(() => {
      if (micRef.current) {
        const volume = micRef.current.getVolumeLevel();
        if (volume > 0.15) {
          setIsSpeaking(true);
          if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
          speakingTimeoutRef.current = setTimeout(() => setIsSpeaking(false), 500);
        }
      }
    }, 100);

    return String(assignedUid);
  };

  const stopAgora = async () => {
    if (volumeIntervalRef.current) { clearInterval(volumeIntervalRef.current); volumeIntervalRef.current = null; }
    if (speakingTimeoutRef.current) { clearTimeout(speakingTimeoutRef.current); speakingTimeoutRef.current = null; }
    setIsSpeaking(false);
    if (clientRef.current) {
      if (micRef.current) {
        try { await clientRef.current.unpublish([micRef.current]); } catch { }
        try { micRef.current.close(); } catch { }
        micRef.current = null;
      }
      try { await clientRef.current.leave(); } catch { }
    }
  };

  const startListening = async () => {
    setAppState("listening");
    setLocalError(null);
    setTranscript("");
    transcriptRef.current = "";
    interimRef.current = "";

    try {
      const uid = await startAgora();
      await startAgoraSTT(uid);
    } catch (e: unknown) {
      console.error("[STT] setup error:", e);
      setLocalError((e as Error)?.message ?? "Failed to start recording");
      setAppState("idle");
      await stopAgora();
    }
  };

  const forceStopListening = () => {
    if (appState !== "listening") return;
    const finalTranscript = transcriptRef.current;
    setAppState("processing");
    stopAgoraSTT().catch(console.error);
    stopAgora().catch(console.error);
    handleProcessing(finalTranscript);
  };

  const playTTS = async (textToSpeak: string): Promise<void> => {
    return new Promise(async (resolve) => {
      try {
        setIsSpeakingTTS(true);
        const res = await fetch("/api/minimax/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textToSpeak }),
        });

        if (!res.ok) throw new Error("TTS Failed");

        const arrayBuffer = await res.arrayBuffer();

        if (!audioContextRef.current) {
          audioContextRef.current =
            new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        }
        const audioCtx = audioContextRef.current;
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.onended = () => {
          setIsSpeakingTTS(false);
          resolve();
        };

        audioSourceRef.current = source;
        source.start(0);
      } catch (error) {
        console.error("Failed to play TTS:", error);
        setIsSpeakingTTS(false);
        resolve();
      }
    });
  };

  const handleProcessing = async (text: string) => {
    const match = matchQuery(text);

    if (match.isUnsupported) {
      setMatchedIntent(match);
      setAppState("unsupported");
      playTTS(match.welcomeMessage);
      return;
    }

    setMatchedIntent(match);
    setAppState("result");

    let fullSpeech = match.welcomeMessage;
    if (match.steps.length > 0) {
      fullSpeech += " Here is what you need to do. ";
      match.steps.forEach((step, idx) => {
        fullSpeech += `Step ${idx + 1}: ${step.title}. ${step.description} `;
      });
    }

    playTTS(fullSpeech);
  };

  const restartProcess = () => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch { }
    }
    setIsSpeakingTTS(false);
    setAppState("idle");
    setTranscript("");
    transcriptRef.current = "";
    interimRef.current = "";
    setMatchedIntent(null);
    setLocalError(null);
  };

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
              <p className="text-base font-medium text-blue-500 mt-1 tracking-widest">Irashaimase!</p>
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
              I can help you with <span className="font-semibold text-slate-700">address change procedures</span> for residents moving into Kita-ku. Press <span className="font-semibold text-slate-700">Begin</span> and tell me how I can help you.
            </p>
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
              className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
                appState === "listening"
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

          {/* Live transcript */}
          <div className="mt-8 min-h-20 flex flex-col items-center justify-start text-center max-w-2xl px-8 w-full">
            {transcript ? (
              <p className="text-2xl text-slate-700 italic font-medium leading-relaxed animate-in fade-in">
                &quot;{transcript}&quot;
              </p>
            ) : appState === "listening" ? (
              <p className="text-lg text-slate-400 animate-pulse">Listening...</p>
            ) : null}
          </div>

          {appState === "listening" && (
            <Button
              onClick={forceStopListening}
              size="lg"
              variant="destructive"
              className="mt-10 px-8 py-6 rounded-full shadow-lg text-xl flex items-center gap-3 hover:scale-105 transition-transform"
            >
              <Square className="w-6 h-6 fill-current" />
              Stop Recording
            </Button>
          )}

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
