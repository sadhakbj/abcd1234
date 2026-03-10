import type { UIStrings } from "@/lib/knowledgeBase";
import type { AppState } from "@/hooks/useVoiceAssistant";
import { Mascot } from "./Mascot";
import { VolumeIndicator } from "./VolumeIndicator";
import { Button } from "./ui/button";
import { Mic } from "lucide-react";

interface ListeningViewProps {
  t: UIStrings;
  appState: AppState;
  volumeLevel: number;
  isSpeaking: boolean;
  liveTranscript: string;
  transcript: string;
  onStop: () => void;
  onCancel: () => void;
}

export function ListeningView({
  t, appState, volumeLevel, isSpeaking, liveTranscript, transcript, onStop, onCancel,
}: ListeningViewProps) {
  const isListening = appState === "listening";

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 w-full animate-in fade-in duration-500">
      <div className="mb-8 relative bg-red-50 border border-red-100 px-8 py-4 rounded-3xl shadow-lg max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-red-800 tracking-tight">
          {isListening ? t.listening : t.processingRequest}
        </h2>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-50 border-r border-b border-red-100 rotate-45" />
      </div>

      <Mascot className="w-40 h-40 mb-12 drop-shadow-md" />

      <div className="relative flex flex-col items-center justify-center">
        {isListening && isSpeaking && (
          <>
            <div className="absolute w-56 h-56 bg-red-100 rounded-full animate-ping opacity-50" style={{ animationDuration: "1.5s" }} />
            <div className="absolute w-44 h-44 bg-red-200 rounded-full animate-ping opacity-50" style={{ animationDelay: "0.2s", animationDuration: "1.2s" }} />
          </>
        )}
        {!isListening && (
          <div className="absolute w-32 h-32 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
        )}
        <button
          onClick={isListening ? onStop : undefined}
          className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
            isListening
              ? "bg-red-500 hover:bg-red-600 hover:scale-105 shadow-red-500/50 cursor-pointer"
              : "bg-slate-200 cursor-default"
          }`}
        >
          {isListening
            ? <Mic className="w-14 h-14 text-white animate-pulse" />
            : <Mascot className="w-14 h-14 opacity-40 grayscale" />
          }
        </button>
      </div>

      <div className="mt-8 min-h-24 flex flex-col items-center justify-start text-center max-w-2xl px-8 w-full gap-3">
        {isListening && <VolumeIndicator volumeLevel={volumeLevel} />}

        {isListening ? (
          liveTranscript ? (
            <p className="text-xl text-slate-700 italic font-medium leading-relaxed animate-in fade-in">
              &quot;{liveTranscript}&quot;
            </p>
          ) : (
            <p className="text-lg text-slate-400 animate-pulse">{t.speakNow}</p>
          )
        ) : transcript ? (
          <p className="text-2xl text-slate-700 italic font-medium leading-relaxed animate-in fade-in">
            &quot;{transcript}&quot;
          </p>
        ) : (
          <p className="text-lg text-slate-400 animate-pulse">{t.processing}</p>
        )}
      </div>

      <Button variant="ghost" onClick={onCancel} className="mt-6 text-slate-500 hover:text-slate-800">
        {t.cancel}
      </Button>
    </div>
  );
}
