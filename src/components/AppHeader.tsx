"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { Gamepad2, Menu, X } from "lucide-react";
import { GAME_URL } from "@/lib/links";

function Wordmark() {
  return (
    <Link href="/" className="group flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00AAFF]" aria-label="Santa Teresa Surf Cam">
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0 transition-transform duration-300 group-hover:-rotate-3" aria-hidden>
        <defs>
          <linearGradient id="st-mark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00AAFF" />
            <stop offset="100%" stopColor="#004E7A" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="11" fill="url(#st-mark)" />
        <path d="M6 24c4 0 5-6 9.5-6S20 24 24.5 24 30 16 34 16" stroke="#F8FAFB" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M6 30.5c4 0 5-3.2 9.5-3.2S20 30.5 24.5 30.5 30 26.8 34 26.8" stroke="#F8FAFB" strokeOpacity=".45" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
      <span className="leading-none">
        <span className="block font-headline text-[1.3rem] font-semibold tracking-tight text-white">Santa Teresa</span>
        <span className="mt-1 block whitespace-nowrap font-mono text-[10px] tracking-[0.32em] text-[#00AAFF]">SURF CAM · CR</span>
      </span>
    </Link>
  );
}

// Live dot + Costa Rica wall-clock time. Rendered after mount so SSR and the browser agree.
function LiveClock() {
  const locale = useLocale();
  const t = useTranslations("home");
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  const time =
    now &&
    new Intl.DateTimeFormat(locale === "es" ? "es-CR" : "en-US", {
      timeZone: "America/Costa_Rica",
      hour: "numeric",
      minute: "2-digit",
    }).format(now);

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[11px] text-white/70">
      <span className="relative flex h-2 w-2" aria-hidden>
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#FF6A00] opacity-60 animate-ping motion-reduce:animate-none" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FF6A00]" />
      </span>
      <span>LIVE</span>
      <span className="text-white/30" aria-hidden>·</span>
      <span title={t("localTime")}>{time || "--:--"}</span>
      <span className="text-white/40">CR</span>
    </span>
  );
}

function GameLink({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("nav");
  return (
    <a
      href={GAME_URL}
      target="_blank"
      rel="noopener"
      aria-label={compact ? t("game") : undefined}
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-[#FF6A00]/50 bg-[#FF6A00]/10 py-1.5 text-sm font-medium text-[#FFB07A] transition-colors hover:bg-[#FF6A00]/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00] ${compact ? "px-3" : "px-3.5"}`}
    >
      <Gamepad2 className="h-4 w-4" aria-hidden />
      {t(compact ? "gameShort" : "game")}
    </a>
  );
}

export default function AppHeader() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#06101A]/75 backdrop-blur-xl">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Wordmark />

          <nav className="hidden md:flex items-center gap-2" aria-label="Main">
            <LiveClock />
            <Link
              href="/surf-lessons"
              className="rounded-full px-3.5 py-1.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00AAFF]"
            >
              {t("surfLessons")}
            </Link>
            <GameLink />
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <GameLink compact />
            <button
              onClick={() => setOpen(!open)}
              className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Menu"
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="md:hidden border-t border-white/[0.06] py-3 space-y-2 fade-in-up" aria-label="Mobile">
            <LiveClock />
            <Link href="/surf-lessons" className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/5 hover:text-white">
              {t("surfLessons")}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
