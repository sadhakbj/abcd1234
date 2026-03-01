"use client";

import { ActionInterface } from "@/components/ActionInterface";
import { Mascot } from "@/components/Mascot";
import { Button } from "@/components/ui/button";
import { IntentMatch, matchQuery } from "@/lib/knowledgeBase";
import { Mic, Square } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const AgoraSTT = dynamic(() => import("@/components/AgoraSTT"), { ssr: false });
const AgoraWrapper = dynamic(() => import("@/components/AgoraWrapper"), {
  ssr: false,
});

type AppState = "idle" | "listening" | "processing" | "result";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [transcript, setTranscript] = useState("");
  const [matchedIntent, setMatchedIntent] = useState<IntentMatch | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Agora State
  const [agoraToken, setAgoraToken] = useState<string | null>(null);
  const [agoraUid, setAgoraUid] = useState<number>(0);
  const [channelName, setChannelName] = useState<string>("");
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const appId =
    process.env.NEXT_PUBLIC_AGORA_APP_ID || "2247f11d00e744869a06fae8c40130f9"; // Fallback for demo

  // Audio Recording & Playing Refs
  const transcriptRef = useRef<string>("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const startListening = async () => {
    setAppState("listening");
    setLocalError(null);
    setTranscript("");
    transcriptRef.current = "";

    // Use hardcoded values for testing
    const uid = 0;
    const channel = "BPK";
    const token =
      "007eJxTYHg+KU9C7f+XHgbzotPHGrRvfsz7OVXzUrmixSNpzmXNKvsUGIyMTMzTDA1TDAxSzU1MLMwsEw3M0hJTLZJNDAyNDdIsX/5ZnNkQyMhw4o4hAyMUgvjMDE4B3gwMAGquH+U=";

    setAgoraUid(uid);
    setChannelName(channel);
    setAgoraToken(token);

    // Skip fetching token from API since we have a hardcoded one
    /*
    try {
      const res = await fetch(
        `/api/agora/token?channelName=${channel}&uid=${uid}`,
      );
      const data = await res.json();
      if (data.token) {
        setAgoraToken(data.token);
      } else {
        throw new Error(data.error || "Failed to get token");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error starting Agora:", err);
      setLocalError("Failed to initialize speech service.");
      setAppState("idle");
    }
    */
  };

  const handleAgoraTranscript = (text: string, isFinal: boolean) => {
    setTranscript(text);
    transcriptRef.current = text;

    // If user wants "when user stops talking", usually Agora sends isFinal=true for sentence end
    // Or we can rely on manual stop.
    // For now, let's just log it as requested.
    console.log("Agora Transcript:", text, "Final:", isFinal);
  };

  const forceStopListening = () => {
    if (appState === "listening") {
      setAppState("processing");
      handleProcessing(transcriptRef.current);
    }
  };

  const playTTS = async (textToSpeak: string) => {
    try {
      setIsSpeaking(true);
      const res = await fetch("/api/minimax/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSpeak }),
      });

      if (!res.ok) throw new Error("TTS Failed");

      const arrayBuffer = await res.arrayBuffer();

      // Decode audio data using browser's AudioContext
      if (!audioContextRef.current) {
        audioContextRef.current =
          new // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioCtx = audioContextRef.current;
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.onended = () => setIsSpeaking(false);

      audioSourceRef.current = source;
      source.start(0);
    } catch (error) {
      console.error("Failed to play TTS:", error);
      setIsSpeaking(false);
    }
  };

  const handleProcessing = async (text: string) => {
    // If it's already processing, don't trigger it again
    if (appState === "processing") return;

    setAppState("processing");
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // DEMO FORCE: Always return moving in intent
    // const match = matchQuery(text);
    const match = matchQuery("I moved to this new place");

    setMatchedIntent(match);
    setAppState("result");

    // Play Mascot Voice using Minimax
    // Construct full speech: Welcome message + details of steps
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
      try {
        audioSourceRef.current.stop();
      } catch (e) {}
    }
    setIsSpeaking(false);
    setAppState("idle");
    setTranscript("");
    transcriptRef.current = "";
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
    <main className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-8 overflow-hidden font-sans">
      {/* Agora STT Component - Renders only when listening and token is ready */}
      {appState === "listening" && agoraToken && (
        <AgoraWrapper>
          <AgoraSTT
            appId={appId}
            channel={channelName}
            token={agoraToken}
            uid={agoraUid}
            onTranscript={handleAgoraTranscript}
            onVolumeLevel={setAudioLevel}
          />
        </AgoraWrapper>
      )}

      {/* ----------------- IDLE STATE ----------------- */}
      {appState === "idle" && (
        <div className="flex flex-col items-center animate-in fade-in duration-1000 zoom-in-95">
          <div className="mb-8 relative bg-blue-50 border border-blue-100 px-8 py-4 rounded-3xl shadow-lg">
            <h1 className="text-4xl font-bold text-blue-800 tracking-tight">
              Irashaimase!
            </h1>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-blue-50 border-r border-b border-blue-100 rotate-45"></div>
          </div>
          <Mascot className="w-64 h-64 mb-12 animate-bounce hover:scale-105 transition-transform duration-300" />
          <Button
            size="lg"
            onClick={startListening}
            className="text-2xl px-16 py-8 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-300"
          >
            Begin
          </Button>
        </div>
      )}

      {/* ----------------- LISTENING / PROCESSING STATE ----------------- */}
      {(appState === "listening" || appState === "processing") && (
        <div className="flex flex-col items-center animate-in fade-in duration-700 zoom-in-95">
          {localError ? (
            <div className="mb-8 relative bg-red-100 border border-red-300 px-8 py-6 rounded-3xl shadow-lg max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-red-800 tracking-tight mb-2">
                Microphone Error
              </h2>
              <p className="text-red-700 font-medium break-words whitespace-pre-wrap text-left text-sm max-h-64 overflow-y-auto">
                {localError}
              </p>
              <p className="text-sm mt-4 text-red-600">
                Please check your browser permissions.
              </p>
            </div>
          ) : (
            <div className="mb-8 relative bg-red-50 border border-red-100 px-8 py-4 rounded-3xl shadow-lg max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-red-800 tracking-tight">
                {appState === "listening"
                  ? "I am listening... Please speak clearly."
                  : "Processing your request..."}
              </h2>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-50 border-r border-b border-red-100 rotate-45"></div>
            </div>
          )}

          <Mascot className="w-48 h-48 mb-16 drop-shadow-md transition-transform duration-300" />

          {/* Large Microphone Interface */}
          <div className="relative flex flex-col items-center justify-center">
            {appState === "listening" && audioLevel > 0.1 && (
              <>
                <div
                  className="absolute w-64 h-64 bg-red-100 rounded-full animate-ping opacity-60"
                  style={{ animationDuration: "1.5s" }}
                ></div>
                <div
                  className="absolute w-48 h-48 bg-red-200 rounded-full animate-ping opacity-60"
                  style={{ animationDelay: "0.2s", animationDuration: "1.2s" }}
                ></div>
                <div className="absolute w-32 h-32 bg-red-300 rounded-full animate-pulse"></div>
              </>
            )}

            {appState === "processing" && !localError && (
              <div className="absolute w-32 h-32 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
            )}

            <button
              onClick={
                localError
                  ? restartProcess
                  : appState === "listening"
                    ? forceStopListening
                    : undefined
              }
              className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
                localError
                  ? "bg-red-800 hover:bg-red-900 shadow-red-900/50 cursor-pointer"
                  : appState === "listening"
                    ? "bg-red-500 hover:bg-red-600 hover:scale-105 shadow-red-500/50 cursor-pointer"
                    : "bg-slate-200 shadow-slate-200/50 cursor-default"
              }`}
            >
              {localError ? (
                <Mic className="w-16 h-16 text-red-300 opacity-50" />
              ) : appState === "listening" ? (
                <Mic className="w-16 h-16 text-white animate-pulse" />
              ) : (
                <Mascot className="w-16 h-16 opacity-50 grayscale" />
              )}
            </button>
          </div>

          {/* Transcript Display Below Microphone */}
          <div className="mt-8 min-h-24 flex flex-col items-center justify-start text-center max-w-2xl px-8">
            {transcript ? (
              <p className="text-2xl text-slate-700 italic font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-2">
                &quot;{transcript}&quot;
              </p>
            ) : (
              appState === "listening" && (
                <p className="text-lg text-slate-400 font-medium animate-pulse">
                  Listening...
                </p>
              )
            )}
          </div>

          {appState === "listening" && (
            <Button
              onClick={forceStopListening}
              size="lg"
              variant="destructive"
              className="mt-16 px-8 py-6 rounded-full shadow-lg text-xl flex items-center gap-3 hover:scale-105 transition-transform"
            >
              <Square className="w-6 h-6 fill-current" />
              Stop Recording
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={restartProcess}
            className="mt-8 text-slate-500 hover:text-slate-800"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* ----------------- RESULT STATE ----------------- */}
      {appState === "result" && matchedIntent && (
        <div className="flex flex-col lg:flex-row w-full h-auto lg:h-[90vh] max-w-7xl gap-4 lg:gap-8 animate-in slide-in-from-bottom-8 duration-700 px-4 lg:px-0">
          {/* Left Side: Mascot Contextually Placed */}
          <div className="w-full lg:w-1/4 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-sm relative overflow-hidden mb-6 lg:mb-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-50 to-blue-50 opacity-50 z-0"></div>

            <div className="z-10 flex flex-col items-center">
              <div className="mb-4 lg:mb-6 relative bg-white border border-slate-100 px-4 lg:px-6 py-3 lg:py-4 rounded-3xl shadow-sm cursor-default text-center">
                <p className="text-sm font-medium text-slate-500 mb-1">
                  Your prompt:
                </p>
                <p className="text-sm lg:text-md font-bold text-slate-700 italic">
                  &quot;{transcript}&quot;
                </p>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-slate-100 rotate-45"></div>
              </div>
              <Mascot className="w-32 h-32 lg:w-40 lg:h-40 drop-shadow-sm" />
            </div>

            <Button
              variant="outline"
              onClick={restartProcess}
              className="mt-auto z-10 w-full rounded-xl bg-white hover:bg-slate-50 border-slate-200 text-sm lg:text-base"
            >
              Ask Another Question
            </Button>
          </div>

          {/* Right Side: Action Interface (Steps) */}
          <div className="w-full lg:w-3/4 h-full flex flex-col">
            <ActionInterface match={matchedIntent} onRestart={restartProcess} />
          </div>
        </div>
      )}
    </main>
  );
}
