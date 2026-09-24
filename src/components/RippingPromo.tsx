"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowUpRight, Gamepad2, Monitor, Smartphone } from "lucide-react";
import { GAME_URL } from "@/lib/links";

// Banner for Ripping, the 3D surf game built on Santa Teresa's waves. The whole card is
// clickable through the CTA's stretched ::after, so there's a single link to tab to.
export default function RippingPromo() {
  const t = useTranslations("game");

  return (
    <section aria-labelledby="ripping-title" className="surface-panel group relative overflow-hidden rounded-2xl">
      <div className="grid md:grid-cols-[1.2fr_1fr]">
        <div className="relative aspect-[1200/630] overflow-hidden md:aspect-auto md:min-h-[250px]">
          <Image
            src="/ripping-og.jpg"
            alt={t("imageAlt")}
            fill
            sizes="(min-width: 768px) 55vw, 100vw"
            className="object-cover object-left-bottom transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
          />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-transparent via-transparent to-[#07111B] md:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07111B] via-transparent to-transparent md:hidden" />
        </div>

        <div className="relative flex flex-col justify-center gap-2.5 p-5 md:p-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#FF8A3D]">{t("eyebrow")}</p>
          <h2 id="ripping-title" className="text-3xl font-semibold text-white md:text-4xl">
            {t("title")}
          </h2>
          <p className="text-base text-white/85">{t("tagline")}</p>
          <p className="max-w-md text-sm text-white/55">{t("description")}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <a
              href={GAME_URL}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-full bg-[#FF6A00] px-5 py-2.5 text-sm font-semibold text-[#0A0C10] shadow-[0_8px_24px_-8px_rgba(255,106,0,0.7)] transition-all hover:-translate-y-0.5 hover:bg-[#FF8A3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white after:absolute after:inset-0 after:content-['']"
            >
              <Gamepad2 className="h-4 w-4" aria-hidden />
              {t("cta")}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-white/45">
              <Monitor className="h-3.5 w-3.5" aria-hidden />
              <Smartphone className="h-3.5 w-3.5" aria-hidden />
              {t("platforms")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
