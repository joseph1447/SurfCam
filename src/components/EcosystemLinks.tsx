"use client";

import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, House, Sailboat } from "lucide-react";
import { sisterUrl, type SisterSite } from "@/lib/links";

// Right under the live: where a visitor who just checked the waves goes next. Tourists get
// tours and lessons, owners get house maintenance. Each card is one link (stretched ::after).
const CARDS: {
  site: SisterSite;
  domain: string;
  icon: typeof House;
  accent: string;
  keys: { title: string; text: string; cta: string };
}[] = [
  { site: "book", domain: "santateresabook.com", icon: Sailboat, accent: "#FF6A00", keys: { title: "bookTitle", text: "bookText", cta: "bookCta" } },
  { site: "homecare", domain: "santateresahomecare.com", icon: House, accent: "#00AAFF", keys: { title: "homecareTitle", text: "homecareText", cta: "homecareCta" } },
];

export default function EcosystemLinks() {
  const t = useTranslations("ecosystem");
  const locale = useLocale();

  return (
    <section aria-labelledby="ecosystem-title" className="space-y-3">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#D9B98C]">{t("eyebrow")}</p>
        <h2 id="ecosystem-title" className="mt-1 font-headline text-2xl font-semibold text-white md:text-3xl">
          {t("title")}
        </h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {CARDS.map(({ site, domain, icon: Icon, accent, keys }) => (
          <article
            key={site}
            className="surface-panel group relative overflow-hidden rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none md:p-6"
          >
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-35"
              style={{ background: accent }}
              aria-hidden
            />
            <div className="relative flex items-start gap-4">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-white/10"
                style={{ background: `${accent}22`, color: accent }}
                aria-hidden
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 space-y-2">
                <p className="font-mono text-[11px] tracking-wider text-white/45">{domain}</p>
                <h3 className="text-xl font-semibold text-white">{t(keys.title)}</h3>
                <p className="text-sm leading-relaxed text-white/65">{t(keys.text)}</p>
                <a
                  href={sisterUrl(site, "home", locale)}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1.5 pt-1 text-sm font-semibold after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                  style={{ color: accent }}
                >
                  {t(keys.cta)}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  <span className="sr-only">{t("external")}</span>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
