import type { IntentMatch, UIStrings } from "@/lib/knowledgeBase";
import { Mascot } from "./Mascot";
import { SpeakingIndicator } from "./SpeakingIndicator";
import { Button } from "./ui/button";
import { RefreshCw, XCircle } from "lucide-react";

interface UnsupportedViewProps {
  t: UIStrings;
  match: IntentMatch;
  transcript: string;
  isSpeakingTTS: boolean;
  onRestart: () => void;
}

export function UnsupportedView({ t, match, transcript, isSpeakingTTS, onRestart }: UnsupportedViewProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 w-full animate-in fade-in duration-500">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-3xl bg-orange-100 border border-orange-200 flex items-center justify-center mb-6 shadow-sm">
          <XCircle className="w-10 h-10 text-orange-500" />
        </div>

        <Mascot className={`w-36 h-36 mb-6 drop-shadow-md ${isSpeakingTTS ? "animate-bounce" : ""}`} />

        {isSpeakingTTS && (
          <div className="mb-4">
            <SpeakingIndicator label={t.speaking} color="orange" />
          </div>
        )}

        <div className="bg-orange-50 border border-orange-200 rounded-3xl px-8 py-6 mb-6 shadow-sm w-full">
          <p className="text-lg font-semibold text-orange-800 leading-relaxed">
            {match.welcomeMessage}
          </p>
          {transcript && (
            <p className="text-sm text-orange-600 mt-3 italic">
              {t.youAsked} &quot;{transcript}&quot;
            </p>
          )}
        </div>

        <Button
          size="lg"
          onClick={onRestart}
          className="px-10 py-6 rounded-full bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white text-lg font-semibold shadow-lg transition-all duration-300 flex items-center gap-3"
        >
          <RefreshCw className="w-5 h-5" />
          {t.startNew}
        </Button>
      </div>
    </div>
  );
}
