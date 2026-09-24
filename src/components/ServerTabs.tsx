"use client";

import { useTranslations } from "next-intl";
import { Tv, Youtube } from "lucide-react";

interface ServerTabsProps {
  currentServer: 'youtube' | 'twitch';
  onServerChange: (server: 'youtube' | 'twitch') => void;
}

const SOURCES = [
  { id: 'youtube', label: 'YouTube', Icon: Youtube, active: 'bg-[#E0241B] text-white shadow-[0_0_18px_rgba(224,36,27,0.35)]', hint: 'youtubeHint' },
  { id: 'twitch', label: 'Twitch HD', Icon: Tv, active: 'bg-[#7C3AED] text-white shadow-[0_0_18px_rgba(124,58,237,0.35)]', hint: 'twitchHint' },
] as const;

export default function ServerTabs({ currentServer, onServerChange }: ServerTabsProps) {
  const t = useTranslations("home");
  const current = SOURCES.find((s) => s.id === currentServer)!;

  return (
    <div className="flex flex-col items-start gap-1.5 md:items-end">
      <div className="surface-panel inline-flex rounded-full p-1" role="group" aria-label={t("sourceLabel")}>
        {SOURCES.map(({ id, label, Icon, active }) => (
          <button
            key={id}
            onClick={() => onServerChange(id)}
            aria-pressed={currentServer === id}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00AAFF] ${
              currentServer === id ? active : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>
      <p className="px-2 font-mono text-[10px] tracking-wide text-white/40">{t(current.hint)}</p>
    </div>
  );
}
