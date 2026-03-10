"use client";

import type { SupportedLang } from "@/lib/knowledgeBase";
import { LanguageDropdown } from "./LanguageDropdown";
import { MapPin } from "lucide-react";
import { useState } from "react";

interface TopBarProps {
  selectedLang: SupportedLang;
  onLangChange: (lang: SupportedLang) => void;
}

export function TopBar({ selectedLang, onLangChange }: TopBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="w-full flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <MapPin className="w-4 h-4 text-blue-600" />
        <span>北区役所</span>
      </div>

      <LanguageDropdown
        selectedLang={selectedLang}
        onSelect={onLangChange}
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
      />
    </div>
  );
}
