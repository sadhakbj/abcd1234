import type { IntentMatch, UIStrings } from "@/lib/knowledgeBase";
import { ActionInterface } from "./ActionInterface";
import { Mascot } from "./Mascot";
import { SpeakingIndicator } from "./SpeakingIndicator";
import { Button } from "./ui/button";

interface ResultViewProps {
  t: UIStrings;
  match: IntentMatch;
  transcript: string;
  isSpeakingTTS: boolean;
  onRestart: () => void;
}

export function ResultView({ t, match, transcript, isSpeakingTTS, onRestart }: ResultViewProps) {
  return (
    <div className="w-full max-w-6xl px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Left sidebar — Mascot */}
      <div className="lg:w-64 shrink-0 flex flex-col items-center bg-gradient-to-b from-blue-50 to-purple-50 rounded-3xl border border-slate-100 shadow-sm p-6 gap-4">
        <div className="flex flex-col items-center gap-4 w-full">
          {transcript && (
            <div className="relative bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm w-full text-center">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t.youSaid}</p>
              <p className="text-sm font-medium text-slate-700 italic leading-snug">
                &quot;{transcript}&quot;
              </p>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-slate-100 rotate-45" />
            </div>
          )}

          <Mascot className={`w-40 h-40 drop-shadow-md ${isSpeakingTTS ? "animate-bounce" : ""}`} />

          {isSpeakingTTS && <SpeakingIndicator label={t.speaking} color="blue" />}
        </div>

        <Button
          variant="outline"
          onClick={onRestart}
          className="mt-auto w-full rounded-2xl bg-white hover:bg-slate-50 border-slate-200 font-medium"
        >
          {t.askAnother}
        </Button>
      </div>

      {/* Right side — Steps */}
      <div className="flex-1 min-w-0">
        <ActionInterface match={match} onRestart={onRestart} startOverLabel={t.startNew} />
      </div>
    </div>
  );
}
