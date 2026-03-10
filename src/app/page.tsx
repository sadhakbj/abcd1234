"use client";

import { IdleView } from "@/components/IdleView";
import { ListeningView } from "@/components/ListeningView";
import { ResultView } from "@/components/ResultView";
import { TopBar } from "@/components/TopBar";
import { UnsupportedView } from "@/components/UnsupportedView";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { UI_STRINGS, type SupportedLang } from "@/lib/knowledgeBase";
import { useEffect, useState } from "react";

export default function Home() {
  const [selectedLang, setSelectedLang] = useState<SupportedLang>("en");
  const [isMounted, setIsMounted] = useState(false);
  const t = UI_STRINGS[selectedLang];
  const assistant = useVoiceAssistant(selectedLang);

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans flex flex-col items-center">
      <TopBar selectedLang={selectedLang} onLangChange={setSelectedLang} />

      {assistant.appState === "idle" && (
        <IdleView t={t} error={assistant.localError} onBegin={assistant.startListening} />
      )}

      {(assistant.appState === "listening" || assistant.appState === "processing") && (
        <ListeningView
          t={t}
          appState={assistant.appState}
          volumeLevel={assistant.volumeLevel}
          isSpeaking={assistant.isSpeaking}
          liveTranscript={assistant.liveTranscript}
          transcript={assistant.transcript}
          onStop={assistant.stopListening}
          onCancel={assistant.restart}
        />
      )}

      {assistant.appState === "unsupported" && assistant.matchedIntent && (
        <UnsupportedView
          t={t}
          match={assistant.matchedIntent}
          transcript={assistant.transcript}
          isSpeakingTTS={assistant.isSpeakingTTS}
          onRestart={assistant.restart}
        />
      )}

      {assistant.appState === "result" && assistant.matchedIntent && (
        <ResultView
          t={t}
          match={assistant.matchedIntent}
          transcript={assistant.transcript}
          isSpeakingTTS={assistant.isSpeakingTTS}
          onRestart={assistant.restart}
        />
      )}
    </main>
  );
}
