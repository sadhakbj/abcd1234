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
}

export function ActionInterface({ match, onRestart }: ActionInterfaceProps) {
  const renderIcon = (type: string, className: string) => {
    switch (type) {
      case "document":
        return <FileText className={className} />;
      case "location":
        return <MapPin className={className} />;
      case "card":
        return <CreditCard className={className} />;
      default:
        return <HelpCircle className={className} />;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case "emerald":
        return {
          border: "border-l-emerald-500",
          bg: "bg-gradient-to-r from-emerald-50/50 to-white",
          iconBg: "bg-emerald-100",
          text: "text-emerald-600",
          iconDark: "text-emerald-900",
          btn: "bg-emerald-600 hover:bg-emerald-700",
        };
      case "amber":
        return {
          border: "border-l-amber-500",
          bg: "bg-gradient-to-r from-amber-50/50 to-white",
          iconBg: "bg-amber-100",
          text: "text-amber-600",
          iconDark: "text-amber-900",
          btn: "bg-amber-600 hover:bg-amber-700",
        };
      case "rose":
        return {
          border: "border-l-rose-500",
          bg: "bg-gradient-to-r from-rose-50/50 to-white",
          iconBg: "bg-rose-100",
          text: "text-rose-600",
          iconDark: "text-rose-900",
          btn: "bg-rose-600 hover:bg-rose-700",
        };
      default:
        return {
          border: "border-l-blue-500",
          bg: "bg-gradient-to-r from-blue-50/50 to-white",
          iconBg: "bg-blue-100",
          text: "text-blue-600",
          iconDark: "text-blue-900",
          btn: "bg-blue-600 hover:bg-blue-700",
        };
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-in slide-in-from-bottom-8 duration-700 px-4 sm:px-0">
      <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between z-10 gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-1 sm:mb-2 break-words">
            {match.intent}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-500 break-words">
            {match.welcomeMessage}
          </p>
        </div>
        <Button
          onClick={onRestart}
          variant="outline"
          className="w-full sm:w-auto rounded-full px-4 sm:px-6 whitespace-nowrap overflow-hidden text-ellipsis shrink-0 h-10 sm:h-12 text-sm sm:text-base"
        >
          Start New Context
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6 flex-1 overflow-y-auto pr-0 sm:pr-2 lg:pr-4 pb-4 sm:pb-8 pl-1">
        {match.steps.map((step, index) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const colors = getColorClasses(step.color) as any;
          return (
            <div
              key={step.id}
              className={`p-4 sm:p-5 lg:p-6 rounded-2xl lg:rounded-3xl border ${colors.border} border-y-slate-100 border-r-slate-100 border-y-[1px] border-r-[1px] border-l-4 shadow-sm hover:shadow-md transition-all ${colors.bg} relative overflow-hidden bg-white group`}
            >
              {/* Background Watermark Icon */}
              <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none transform rotate-12">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {renderIcon(
                  step.iconType,
                  `w-24 h-24 sm:w-32 sm:h-32 lg:w-48 lg:h-48 ${colors.iconDark}`,
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 lg:gap-6 relative z-10 w-full">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl ${colors.iconBg} flex items-center justify-center shrink-0 shadow-sm border border-white/50 mt-1`}
                >
                  <span
                    className={`text-base sm:text-lg lg:text-xl font-bold ${colors.text}`}
                  >
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 flex flex-col min-w-0">
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 mb-1 tracking-tight break-words">
                    {step.title}
                  </h3>
                  <p className="text-sm lg:text-base text-slate-600 mb-2 lg:mb-3 leading-relaxed break-words">
                    {step.description}
                  </p>
                  {step.actionText && (
                    <div className="mt-2">
                      <Button
                        className={`${colors.btn} w-full sm:w-auto text-white rounded-lg lg:rounded-xl px-4 py-2 lg:px-5 lg:py-2 h-auto text-sm font-medium shadow-sm hover:translate-x-1 transition-transform min-h-[44px] touch-manipulation active:scale-95`}
                      >
                        {step.actionText}{" "}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Interactive Prompt Step */}
        {match.interactivePrompt && (
          <div className="p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl border border-purple-200 shadow-xl bg-purple-50/70 overflow-hidden relative mt-4">
            {/* Background Decoration */}
            <div className="absolute -top-24 -right-24 w-48 h-48 sm:w-64 sm:h-64 bg-purple-200/50 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>

            <div className="flex flex-col items-center text-center max-w-2xl mx-auto relative z-10 px-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-white shadow-sm border border-purple-100 flex items-center justify-center mb-4 sm:mb-6">
                {renderIcon(
                  match.interactivePrompt.iconType,
                  "w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-purple-600",
                )}
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 mb-1 sm:mb-2 break-words">
                {match.interactivePrompt.question}
              </h3>
              <p className="text-sm sm:text-base lg:text-lg text-slate-600 mb-4 sm:mb-6 break-words">
                {match.interactivePrompt.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full justify-center max-w-md pb-4 relative z-20">
                <Button
                  size="lg"
                  className="flex-1 w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm text-sm sm:text-base lg:text-lg font-medium py-3 sm:py-4 lg:py-6 h-auto rounded-xl lg:rounded-2xl transition-all hover:scale-105 active:scale-95"
                >
                  {match.interactivePrompt.noText}
                </Button>
                <Button
                  size="lg"
                  className="flex-1 w-full bg-purple-600 hover:bg-purple-700 text-white shadow-md text-sm sm:text-base lg:text-lg font-semibold py-3 sm:py-4 lg:py-6 h-auto rounded-xl lg:rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />{" "}
                  {match.interactivePrompt.yesText}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
