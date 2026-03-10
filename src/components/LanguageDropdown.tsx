"use client";

import { LANGUAGES, type SupportedLang } from "@/lib/knowledgeBase";
import { ChevronDown } from "lucide-react";

interface LanguageDropdownProps {
  selectedLang: SupportedLang;
  onSelect: (lang: SupportedLang) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LanguageDropdown({ selectedLang, onSelect, open, onOpenChange }: LanguageDropdownProps) {
  const current = LANGUAGES.find((l) => l.code === selectedLang)!;

  return (
    <div className="relative">
      <button
        onClick={() => onOpenChange(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span>{current.nativeLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => onOpenChange(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { onSelect(lang.code); onOpenChange(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  selectedLang === lang.code
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="text-lg leading-none">{lang.flag}</span>
                <span>{lang.nativeLabel}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
