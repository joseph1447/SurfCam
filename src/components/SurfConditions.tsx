"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUp, RefreshCw, Sunrise, Sunset, TrendingDown, TrendingUp } from "lucide-react";
import type { DayOutlook, TideExtreme, WindKind } from "@/lib/conditions";

const TZ = "America/Costa_Rica";
const DAY = 86_400_000;
const HOUR = 3_600_000;
const TEAL = "#00AAFF";
const SUNSET = "#FF6A00";
const SAND = "#D9B98C";
const FOAM = "#F8FAFB";

const KIND_COLOR: Record<WindKind, string> = {
  offshore: TEAL,
  "cross-shore": SAND,
  onshore: SUNSET,
  light: "rgba(248, 250, 251, 0.55)",
};

type Points = DayOutlook["tide"]["points"];

function useOutlook() {
  const [data, setData] = useState<DayOutlook | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/conditions");
      if (!res.ok) throw new Error(String(res.status));
      setData(await res.json());
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 15 * 60_000);
    return () => clearInterval(id);
  }, [load]);

  return { data, failed, retry: load };
}

// The live tide marker moves with the clock, not with the (cached) API response.
function useNow(stepMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), stepMs);
    return () => clearInterval(id);
  }, [stepMs]);
  return now;
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

function heightAt(points: Points, at: number) {
  const i = points.findIndex((p) => p.at > at);
  if (i <= 0) return null;
  const [a, b] = [points[i - 1], points[i]];
  return a.heightFt + ((b.heightFt - a.heightFt) * (at - a.at)) / (b.at - a.at);
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export default function SurfConditions({ sideBySide = false }: { sideBySide?: boolean }) {
  const t = useTranslations("conditions");
  const locale = useLocale();
  const { data, failed, retry } = useOutlook();
  const now = useNow(15_000);

  const time = new Intl.DateTimeFormat(locale === "es" ? "es-CR" : "en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
  });

  const grid = sideBySide ? "grid gap-4 md:grid-cols-12 xl:grid-cols-1" : "grid gap-4 md:grid-cols-12";
  const tilesSpan = sideBySide ? "md:col-span-5 xl:col-span-1" : "md:col-span-5";
  const chartSpan = sideBySide ? "md:col-span-7 xl:col-span-1" : "md:col-span-7";

  if (failed && !data) {
    return (
      <section className="surface-panel w-full rounded-2xl p-5 text-sm text-white/60 flex items-center justify-between gap-4">
        <span>{t("error")}</span>
        <button onClick={retry} className="inline-flex items-center gap-1.5 text-[#00AAFF] hover:text-white transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
          {t("retry")}
        </button>
      </section>
    );
  }

  if (!data) return <ConditionsSkeleton grid={grid} tilesSpan={tilesSpan} chartSpan={chartSpan} />;

  const { now: report } = data;
  const prevTide = [...data.cycle].reverse().find((e) => e.at <= now) ?? null;
  const nextTide = data.cycle.find((e) => e.at > now) ?? null;
  // Heading for the next turn (same rule as the server).
  const rising = nextTide ? nextTide.type === "high" : report.tide.direction === "rising";
  const tideFt = round1(heightAt(data.tide.points, now) ?? report.tide.heightFt);

  return (
    <section aria-labelledby="conditions-title" className="surface-panel relative w-full rounded-2xl overflow-hidden">
      <div aria-hidden className="h-px bg-gradient-to-r from-[#00AAFF]/70 via-[#00AAFF]/15 to-transparent" />
      <div className="p-4 md:p-5">
        <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5" aria-hidden>
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#FF6A00] opacity-60 animate-ping motion-reduce:animate-none" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#FF6A00]" />
            </span>
            <h2 id="conditions-title" className="text-lg md:text-xl text-white">
              {t("title")}
            </h2>
          </div>
          <p className="font-mono text-[11px] tracking-wide text-white/40">
            {t("updated", { time: time.format(data.generatedAt) })}
          </p>
        </header>

        <div className={grid}>
          <div className={`${tilesSpan} grid grid-cols-2 gap-2.5 content-start`}>
            <Tile index={0} label={t("swell")} value={report.swellFt} unit="ft">
              <Direction fromDeg={report.swellFromDeg} label={`${report.swellPeriodS}s · ${report.swellFrom}`} srLabel={t("from", { dir: report.swellFrom })} />
            </Tile>
            <Tile index={1} label={t("wind")} value={report.windKmh} unit="km/h">
              <Direction fromDeg={report.windFromDeg} label={report.windFrom} srLabel={t("from", { dir: report.windFrom })} />
              <span
                className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#0A0C10]"
                style={{ background: KIND_COLOR[report.windKind] }}
              >
                {t(`windKind.${report.windKind}`)}
              </span>
            </Tile>
            <Tile index={2} label={t("tide")} value={tideFt} unit="ft">
              {rising ? (
                <TrendingUp className="w-3.5 h-3.5 text-[#00AAFF]" aria-hidden />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-[#D9B98C]" aria-hidden />
              )}
              <span>{t(rising ? "rising" : "falling")}</span>
            </Tile>
            <Tile index={3} label={t("water")} value={report.waterTempC ?? "—"} unit="°C">
              {report.waterTempC != null && <span>{Math.round(report.waterTempC * 1.8 + 32)}°F</span>}
            </Tile>
          </div>

          <div className={`${chartSpan} rounded-xl bg-black/25 border border-white/5 p-3 fade-in-up`} style={{ animationDelay: "200ms", animationFillMode: "both" }}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-1">
              <h3 className="text-sm text-white/85">{t("today")}</h3>
              <div className="flex items-center gap-3 font-mono text-[11px] text-white/50 whitespace-nowrap">
                <span className="inline-flex items-center gap-1">
                  <Sunrise className="w-3.5 h-3.5 text-[#D9B98C]" aria-label={t("sunrise")} />
                  {time.format(data.sun.sunrise)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Sunset className="w-3.5 h-3.5 text-[#FF6A00]" aria-label={t("sunset")} />
                  {time.format(data.sun.sunset)}
                </span>
              </div>
            </div>

            {prevTide && nextTide && (
              <TidePhase prev={prevTide} next={nextTide} now={now} points={data.tide.points} rising={rising} format={time.format} />
            )}

            <TideChart data={data} now={now} format={time.format} locale={locale} />
            <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-white/50" aria-label={t("windLegend")}>
              <li className="font-mono uppercase tracking-wider text-white/35">{t("wind")}</li>
              {(["offshore", "cross-shore", "onshore", "light"] as WindKind[]).map((k) => (
                <li key={k} className="inline-flex items-center gap-1">
                  <span className="h-2 w-3 rounded-sm" style={{ background: KIND_COLOR[k] }} aria-hidden />
                  {t(`windKind.${k}`)}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-3 text-[10px] text-white/30">
          {t("source")}{" "}
          <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="underline decoration-white/20 hover:text-white/60">
            Open-Meteo
          </a>
        </p>
      </div>
    </section>
  );
}

// Where the water is inside the current cycle: last turn → next turn, live.
function TidePhase({
  prev,
  next,
  now,
  points,
  rising,
  format,
}: {
  prev: TideExtreme;
  next: TideExtreme;
  now: number;
  points: Points;
  rising: boolean;
  format: (d: number) => string;
}) {
  const t = useTranslations("conditions");
  const pct = Math.min(100, Math.max(0, ((now - prev.at) / (next.at - prev.at)) * 100));
  const left = Math.max(0, next.at - now);
  const h = Math.floor(left / HOUR);
  const m = Math.round((left % HOUR) / 60_000);
  const before = heightAt(points, now - 15 * 60_000);
  const after = heightAt(points, now + 15 * 60_000);
  const rate = before != null && after != null ? (after - before) * 2 : null;
  const color = rising ? TEAL : SAND;

  return (
    <div className="mt-2 mb-3" aria-live="polite">
      <div className="flex justify-between font-mono text-[10px] text-white/45">
        <span>{`${t(prev.type)} ${format(prev.at)} · ${prev.heightFt}ft`}</span>
        <span>{`${t(next.type)} ${format(next.at)} · ${next.heightFt}ft`}</span>
      </div>
      <div
        className="relative mt-1.5 h-2"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-label={t("cycleLabel", { from: t(prev.type), to: t(next.type) })}
      >
        <div className="absolute inset-0 rounded-full bg-white/[0.07]" />
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-1000 ease-linear"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}22, ${color})` }}
        />
        <span
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-[left] duration-1000 ease-linear"
          style={{ left: `${pct}%`, background: FOAM, borderColor: color, boxShadow: `0 0 12px ${color}` }}
          aria-hidden
        />
      </div>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 text-[11px]">
        <span className="font-semibold" style={{ color }}>
          {`${t(rising ? "rising" : "falling")} · ${Math.round(pct)}%`}
          {rate != null && <span className="ml-1.5 font-mono font-normal text-white/45">{`${rate >= 0 ? "+" : "−"}${Math.abs(round1(rate))} ft/h`}</span>}
        </span>
        <span className="text-white/60">
          {t("nextIn", { type: t(next.type), time: h ? t("hoursMinutes", { h, m }) : t("minutes", { m }) })}
        </span>
      </div>
    </div>
  );
}

function Tile({
  index,
  label,
  value,
  unit,
  children,
}: {
  index: number;
  label: string;
  value: number | string;
  unit: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl bg-white/[0.04] border border-white/5 px-3 py-2.5 fade-in-up"
      style={{ animationDelay: `${index * 70}ms`, animationFillMode: "both" }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">{label}</p>
      <p className="mt-0.5 font-mono text-white leading-none">
        <span className="text-[1.75rem] font-semibold">{value}</span>
        <span className="ml-1 text-xs text-white/50">{unit}</span>
      </p>
      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] leading-tight text-white/60 min-h-[18px]">{children}</div>
    </div>
  );
}

// Arrow points where the swell/wind is heading, which is what you see on the water.
function Direction({ fromDeg, label, srLabel }: { fromDeg: number; label: string; srLabel: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <ArrowUp className="w-3.5 h-3.5 text-white/70" style={{ transform: `rotate(${fromDeg + 180}deg)` }} aria-hidden />
      <span aria-hidden>{label}</span>
      <span className="sr-only">{srLabel}</span>
    </span>
  );
}

const TICKS: Record<string, string[]> = {
  es: ["00h", "06h", "12h", "18h", "24h"],
  en: ["12a", "6a", "12p", "6p", "12a"],
};

function TideChart({
  data,
  now,
  format,
  locale,
}: {
  data: DayOutlook;
  now: number;
  format: (d: number) => string;
  locale: string;
}) {
  const t = useTranslations("conditions");
  const uid = useId().replace(/:/g, "");
  const [ref, width] = useWidth<HTMLDivElement>();
  const H = 146;
  const STRIP = 12;
  const pad = { l: 4, r: 4, t: 26, b: 34 };
  const start = Date.parse(`${data.date}T00:00:00-06:00`);
  const points = data.tide.points;

  const summary = data.tide.extremes
    .map((e) => `${t(e.type)} ${format(e.at)} (${e.heightFt} ft)`)
    .join(", ");

  if (!width || points.length < 2) {
    return <div ref={ref} style={{ height: H + STRIP + 6 }} role="img" aria-label={t("chartLabel", { summary })} />;
  }

  const x = (at: number) => pad.l + ((at - start) / DAY) * (width - pad.l - pad.r);
  const heights = points.map((p) => p.heightFt);
  const lo = Math.min(...heights) - 0.8;
  const hi = Math.max(...heights) + 0.8;
  const y = (ft: number) => pad.t + (1 - (ft - lo) / (hi - lo)) * (H - pad.t - pad.b);
  const base = H - pad.b;

  const line = points.map((p, i) => `${i ? "L" : "M"}${x(p.at).toFixed(1)},${y(p.heightFt).toFixed(1)}`).join("");
  const area = `${line}L${x(points.at(-1)!.at).toFixed(1)},${base}L${x(points[0].at).toFixed(1)},${base}Z`;
  const nowFt = heightAt(points, now);
  const nowX = Math.min(Math.max(x(now), pad.l), width - pad.r);
  const inDay = nowFt != null;
  // Keep a centred label of `chars` monospace characters (~6px each at 10px) inside the chart.
  const clampX = (v: number, chars: number) => {
    const half = chars * 3.1 + 2;
    return Math.min(Math.max(v, half), width - half);
  };
  const nowLabel = inDay ? `${t("now")} ${round1(nowFt)}ft` : "";
  const nowY = inDay ? y(nowFt) : 0;
  const pillW = nowLabel.length * 6.2 + 12;
  const pillX = Math.min(Math.max(nowX - pillW / 2, 0), width - pillW);
  const pillY = nowY - 30 < 0 ? nowY + 10 : nowY - 30;

  return (
    <div ref={ref}>
      <svg width={width} height={H + STRIP + 6} role="img" aria-label={t("chartLabel", { summary })} className="block overflow-visible">
        <defs>
          <linearGradient id={`fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={TEAL} stopOpacity="0.45" />
            <stop offset="100%" stopColor={TEAL} stopOpacity="0" />
          </linearGradient>
          <clipPath id={`past-${uid}`}>
            <rect x={0} y={0} width={inDay ? nowX : width} height={H} />
          </clipPath>
          <clipPath id={`future-${uid}`}>
            <rect x={inDay ? nowX : width} y={0} width={width} height={H} />
          </clipPath>
        </defs>

        {/* Night: before sunrise and after sunset */}
        <rect x={x(start)} y={0} width={Math.max(0, x(data.sun.sunrise) - x(start))} height={base} fill="rgba(0,0,0,0.35)" />
        <rect x={x(data.sun.sunset)} y={0} width={Math.max(0, x(start + DAY) - x(data.sun.sunset))} height={base} fill="rgba(0,0,0,0.35)" />

        {[0, 6, 12, 18, 24].map((h, i) => (
          <g key={h}>
            <line x1={x(start + h * HOUR)} x2={x(start + h * HOUR)} y1={pad.t - 4} y2={base} stroke="rgba(255,255,255,0.06)" />
            <text
              x={x(start + h * HOUR)}
              y={H - 6}
              textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"}
              className="fill-white/35 font-mono"
              fontSize={10}
            >
              {(TICKS[locale] ?? TICKS.en)[i]}
            </text>
          </g>
        ))}

        {/* The part of the day already behind us is filled in; what's ahead is a dashed forecast */}
        <path d={area} fill={`url(#fill-${uid})`} clipPath={`url(#past-${uid})`} />
        <path d={area} fill={`url(#fill-${uid})`} opacity={0.35} clipPath={`url(#future-${uid})`} />
        <path d={line} fill="none" stroke={TEAL} strokeWidth={2.25} strokeLinejoin="round" pathLength={1} className="tide-draw" clipPath={`url(#past-${uid})`} />
        <path d={line} fill="none" stroke={TEAL} strokeOpacity={0.55} strokeWidth={1.5} strokeDasharray="4 4" clipPath={`url(#future-${uid})`} />

        {data.tide.extremes.map((e: TideExtreme) => {
          const ex = x(e.at);
          const ey = y(e.heightFt);
          const high = e.type === "high";
          const label = `${e.heightFt}ft ${format(e.at)}`;
          return (
            <g key={e.at}>
              <circle cx={ex} cy={ey} r={2.5} fill={high ? FOAM : SAND} />
              <text x={clampX(ex, label.length)} y={high ? ey - 8 : ey + 15} textAnchor="middle" fontSize={10} className="font-mono" fill={high ? "rgba(248,250,251,0.85)" : SAND}>
                {label}
              </text>
            </g>
          );
        })}

        {inDay && (
          <g>
            <line x1={nowX} x2={nowX} y1={pad.t - 6} y2={base} stroke={FOAM} strokeOpacity={0.4} strokeDasharray="2 3" />
            <g style={{ transform: `translate(${nowX}px, ${nowY}px)`, transition: "transform 1s linear" }}>
              <circle r={5} fill={FOAM} className="animate-ping motion-reduce:animate-none" style={{ transformBox: "fill-box", transformOrigin: "center", opacity: 0.5 }} />
              <circle r={4} fill={FOAM} stroke={TEAL} strokeWidth={2} />
            </g>
            <g style={{ transform: `translate(${pillX}px, ${pillY}px)`, transition: "transform 1s linear" }}>
              <rect width={pillW} height={18} rx={9} fill="#06101A" stroke={TEAL} strokeOpacity={0.6} />
              <text x={pillW / 2} y={12.5} textAnchor="middle" fontSize={10} className="font-mono" fill={FOAM}>
                {nowLabel}
              </text>
            </g>
          </g>
        )}

        {/* Hourly wind quality on the same time axis */}
        {data.wind.map((w) => (
          <rect
            key={w.at}
            x={x(w.at) + 0.75}
            y={H + 2}
            width={Math.max(1, x(w.at + HOUR) - x(w.at) - 1.5)}
            height={STRIP - 4}
            rx={2}
            fill={KIND_COLOR[w.kind]}
            opacity={w.at + HOUR < now ? 0.45 : 0.9}
          >
            <title>{`${format(w.at)} · ${w.kmh} km/h · ${t(`windKind.${w.kind}`)}`}</title>
          </rect>
        ))}
      </svg>
    </div>
  );
}

function ConditionsSkeleton({ grid, tilesSpan, chartSpan }: { grid: string; tilesSpan: string; chartSpan: string }) {
  return (
    <div className="surface-panel w-full rounded-2xl p-4 md:p-5" aria-busy="true">
      <div className="h-6 w-48 bg-white/10 rounded mb-4 animate-pulse" />
      <div className={grid}>
        <div className={`${tilesSpan} grid grid-cols-2 gap-2.5`}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[92px] rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
        <div className={`${chartSpan} h-[260px] rounded-xl bg-white/5 animate-pulse`} />
      </div>
    </div>
  );
}
