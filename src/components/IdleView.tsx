import type { UIStrings } from "@/lib/knowledgeBase";
import { OrbitHero } from "./OrbitHero";
import { Button } from "./ui/button";
import { AlertCircle, BotMessageSquare, Mic } from "lucide-react";

interface IdleViewProps {
  t: UIStrings;
  error: string | null;
  onBegin: () => void;
}

export function IdleView({ t, error, onBegin }: IdleViewProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 w-full animate-in fade-in duration-700">
      <OrbitHero />

      <div className="w-full max-w-md bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200 rounded-3xl p-5 mb-8 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <BotMessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm font-bold text-slate-700">{t.voiceGuide}</p>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed">{t.guideDescription}</p>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 max-w-md w-full">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Button
        size="lg"
        onClick={onBegin}
        className="text-xl px-14 py-7 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-300 flex items-center gap-3"
      >
        <Mic className="w-6 h-6" />
        {t.begin}
      </Button>
    </div>
  );
}
