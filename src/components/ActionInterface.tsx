import { Button } from "@/components/ui/button";
import { IntentMatch } from "@/lib/knowledgeBase";
import {
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  HelpCircle,
  MapPin,
} from "lucide-react";

interface ActionInterfaceProps {
  match: IntentMatch;
  onRestart: () => void;
  startOverLabel?: string;
}

const colorMap: Record<
  string,
  {
    stepBg: string;
    cardBg: string;
    cardBorder: string;
    titleText: string;
    iconBg: string;
    iconText: string;
    btn: string;
    line: string;
  }
> = {
  amber: {
    stepBg: "bg-amber-500",
    cardBg: "bg-amber-50",
    cardBorder: "border-amber-200",
    titleText: "text-amber-800",
    iconBg: "bg-amber-100",
    iconText: "text-amber-600",
    btn: "bg-amber-500 hover:bg-amber-600",
    line: "bg-amber-200",
  },
  blue: {
    stepBg: "bg-blue-500",
    cardBg: "bg-blue-50",
    cardBorder: "border-blue-200",
    titleText: "text-blue-800",
    iconBg: "bg-blue-100",
    iconText: "text-blue-600",
    btn: "bg-blue-500 hover:bg-blue-600",
    line: "bg-blue-200",
  },
  emerald: {
    stepBg: "bg-emerald-500",
    cardBg: "bg-emerald-50",
    cardBorder: "border-emerald-200",
    titleText: "text-emerald-800",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-600",
    btn: "bg-emerald-500 hover:bg-emerald-600",
    line: "bg-emerald-200",
  },
  rose: {
    stepBg: "bg-rose-500",
    cardBg: "bg-rose-50",
    cardBorder: "border-rose-200",
    titleText: "text-rose-800",
    iconBg: "bg-rose-100",
    iconText: "text-rose-600",
    btn: "bg-rose-500 hover:bg-rose-600",
    line: "bg-rose-200",
  },
};

function renderIcon(type: string, className: string) {
  switch (type) {
    case "document": return <FileText className={className} />;
    case "location": return <MapPin className={className} />;
    case "card":     return <CreditCard className={className} />;
    default:         return <HelpCircle className={className} />;
  }
}

export function ActionInterface({ match, onRestart, startOverLabel = "Start Over" }: ActionInterfaceProps) {
  return (
    <div className="w-full space-y-4">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm px-6 py-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight">
            {match.intent}
          </h2>
          <p className="text-slate-500 mt-1.5 leading-relaxed text-sm">{match.welcomeMessage}</p>
        </div>
        <Button
          onClick={onRestart}
          variant="outline"
          className="shrink-0 rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50 px-5 hidden lg:flex"
        >
          {startOverLabel}
        </Button>
      </div>

      {/* ── Steps ────────────────────────────────────────── */}
      {match.steps.length > 0 && (
        <div>
          {match.steps.map((step, index) => {
            const c = colorMap[step.color] ?? colorMap.blue;
            const isLast = index === match.steps.length - 1;

            return (
              <div key={step.id} className="flex gap-4">
                {/* Number bubble + connector line */}
                <div className="flex flex-col items-center pt-1">
                  <div className={`w-11 h-11 rounded-2xl ${c.stepBg} flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0`}>
                    {index + 1}
                  </div>
                  {!isLast && (
                    <div className={`w-0.5 flex-1 min-h-6 ${c.line} my-2`}></div>
                  )}
                </div>

                {/* Card */}
                <div className={`flex-1 ${isLast ? "pb-0" : "pb-3"}`}>
                  <div className={`rounded-2xl border border-slate-200 border-l-4 ${c.cardBorder} bg-white p-5 shadow-sm`}>
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-800 leading-snug">
                          {step.title}
                        </h3>
                        <p className="text-slate-600 mt-1.5 text-sm leading-relaxed">
                          {step.description}
                        </p>
                        {step.actionText && (
                          <Button
                            className={`mt-4 ${c.btn} text-white rounded-xl px-5 h-10 text-sm font-semibold shadow-sm`}
                          >
                            {step.actionText}
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        )}
                      </div>
                      <div className={`shrink-0 w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center`}>
                        {renderIcon(step.iconType, `w-5 h-5 ${c.iconText}`)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Interactive Prompt ───────────────────────────── */}
      {match.interactivePrompt && (
        <div className="rounded-3xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 shadow-sm p-6 md:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center mb-4 shadow-sm">
              {renderIcon(match.interactivePrompt.iconType, "w-7 h-7 text-purple-600")}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {match.interactivePrompt.question}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-6">
              {match.interactivePrompt.subtitle}
            </p>

            <div className="flex gap-3 w-full max-w-sm">
              <Button
                size="lg"
                className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl h-14 font-semibold shadow-sm"
              >
                {match.interactivePrompt.noText}
              </Button>
              <Button
                size="lg"
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl h-14 font-semibold shadow-md shadow-purple-500/20"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                {match.interactivePrompt.yesText}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
