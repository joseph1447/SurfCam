// Titles and descriptions for everything uploaded or updated on the channel. Spanish, and
// built only from the live forecast, so the words always match the water.
import { crTime, surfaceWord, type DayOutlook, type SurfReport, type WindKind } from '@/lib/conditions';
import { GAME_URL, INSTAGRAM_URL, YOUTUBE_CHANNEL_URL, YOUTUBE_CHANNEL_ID_URL } from '@/lib/links';

// Lessons and tours are santateresabook's; its UTM cookie records which video sent the booking.
const bookUrl = (kind: CopyKind) =>
  `https://santateresabook.com/surf-lessons?utm_source=youtube&utm_medium=video&utm_campaign=surfcam&utm_content=${kind}`;
import { LIVE_URL_SHORT } from '@/lib/short-overlay';

export type CopyKind = 'short' | 'live' | 'best' | 'day';

// One stop of the day summary: which part of the day, when, and the water then.
export interface DayMoment {
  label: string;
  at: number;
  report: SurfReport | null;
}

const TITLE_MAX = 60;
const meters = (r: SurfReport) => Math.round((r.swellFt / 3.281) * 10) / 10;
const m1 = (r: SurfReport) => meters(r).toFixed(1);
const chars = (s: string) => Array.from(s).length;

const SURFACE_TITLE: Record<string, string> = {
  GLASSY: 'Glassy',
  LIMPIO: 'Limpio',
  PICADO: 'Picado',
  'CON VIENTO': 'Con viento',
};
const WIND_ES = { offshore: 'offshore', onshore: 'onshore', 'cross-shore': 'cruzado', light: 'suave' } as const;

const esTime = (at: number) =>
  new Intl.DateTimeFormat('es-CR', { timeZone: 'America/Costa_Rica', hour: 'numeric', minute: '2-digit' }).format(at);
const esDay = (at: number) =>
  new Intl.DateTimeFormat('es-CR', { timeZone: 'America/Costa_Rica', day: 'numeric', month: 'short' }).format(at).replace('.', '');

// "Glassy 1.8 m", "¡Bombeando! 2.1 m" — the same gates as the thumbnail text.
export function conditionLabel(r: SurfReport): string {
  const m = meters(r);
  const surface = surfaceWord(r);
  if (m >= 2 && r.swellPeriodS >= 12 && (surface === 'GLASSY' || surface === 'LIMPIO')) return `¡Bombeando! ${m1(r)} m`;
  return `${SURFACE_TITLE[surface]} ${m1(r)} m`;
}

function fit(parts: string[]): string {
  // Drop the decorative bits first if a long condition label pushes past 60 characters.
  const full = parts.join('');
  if (chars(full) <= TITLE_MAX) return full;
  const plain = full.replace(' 🌊', '');
  return chars(plain) <= TITLE_MAX ? plain : Array.from(plain).slice(0, TITLE_MAX).join('');
}

// "[condición] en Santa Teresa 🌊 | Surf Report [hora]", under 60 characters.
export function surfTitle(kind: CopyKind, r: SurfReport | null, at: number): string {
  const cond = r ? conditionLabel(r) : 'Surf';
  if (kind === 'live') return fit([`🔴 ${cond} en Santa Teresa`, ' 🌊', ' | Surf Cam en vivo']);
  if (kind === 'best') return fit(['Mejor ola del día en Santa Teresa', ' 🌊', ` | Surf Report ${esDay(at)}`]);
  if (kind === 'day') return fit(['Resumen del día en Santa Teresa', ' 🌊', ` | Surf Report ${esDay(at)}`]);
  return fit([`${cond} en Santa Teresa`, ' 🌊', ` | Surf Report ${crTime(at, '12h')}`]);
}

// First line of every description: waves, period, wind, tide.
export function conditionsLine(r: SurfReport): string {
  const next = r.tide.next;
  const tide = `Marea ${r.tide.direction === 'rising' ? 'subiendo' : 'bajando'}${
    next ? `, ${next.type === 'high' ? 'alta' : 'baja'} ${esTime(next.at)}` : ''
  }`;
  return `🌊 Olas ${m1(r)} m a ${r.swellPeriodS} s del ${r.swellFrom} · 💨 Viento ${r.windKmh} km/h ${r.windFrom} (${WIND_ES[r.windKind]}) · 🌙 ${tide}`;
}

// "• Mañana, 6:00 a. m.: Limpio 1.0 m · 💨 6 km/h offshore"
const momentLine = (m: DayMoment) =>
  `• ${m.label.charAt(0)}${m.label.slice(1).toLowerCase()}, ${esTime(m.at)}: ${
    m.report ? `${conditionLabel(m.report)} · 💨 ${m.report.windKmh} km/h ${WIND_ES[m.report.windKind]}` : 'sin pronóstico'
  }`;

// Tracks are named "Artist - Title". Kevin MacLeod's are CC BY 4.0 and need this exact
// credit; anything else is assumed to come from the YouTube Audio Library.
function musicCredit(name: string): string[] {
  const [artist, ...rest] = name.split(' - ');
  if (artist === 'Kevin MacLeod' && rest.length) {
    return [`🎵 Música: "${rest.join(' - ')}" Kevin MacLeod (incompetech.com), licencia Creative Commons: By Attribution 4.0 http://creativecommons.org/licenses/by/4.0/`];
  }
  return [`🎵 Música: ${name} (YouTube Audio Library)`];
}

export function surfDescription(opts: {
  kind: CopyKind;
  report: SurfReport | null;
  twitchClipUrl?: string;
  music?: string | null;
  moments?: DayMoment[];
  schedule?: string; // the live's day plan, under the conditions line
}): string {
  const { kind, report, twitchClipUrl, music, moments, schedule } = opts;
  const head = moments?.length
    ? ['🌊 Así estuvo el mar hoy en Santa Teresa, Costa Rica:', ...moments.map(momentLine)]
    : [report ? conditionsLine(report) : '🌊 Condiciones del mar en vivo desde Santa Teresa, Costa Rica.', ...(schedule ? [schedule] : [])];
  const forecast = report || moments?.some((m) => m.report);
  const lines = [
    ...head,
    '',
    kind === 'live'
      ? `👉 Suscríbete para no perderte el reporte de olas de cada día: ${YOUTUBE_CHANNEL_URL}`
      : kind === 'best'
        ? `👉 Suscríbete y recibe la mejor ola de Santa Teresa cada día: ${YOUTUBE_CHANNEL_URL}`
        : kind === 'day'
          ? `👉 Suscríbete: el resumen de olas de Santa Teresa todos los días: ${YOUTUBE_CHANNEL_URL}`
          : `👉 Suscríbete: reporte de olas de Santa Teresa todos los días, mañana y tarde: ${YOUTUBE_CHANNEL_URL}`,
    `🔴 Míralo EN VIVO 24/7 con marea, swell y viento: https://${LIVE_URL_SHORT}`,
    ...(INSTAGRAM_URL ? [`📸 Instagram: ${INSTAGRAM_URL}`] : []),
    `🏄 Clases de surf y tours en Santa Teresa: ${bookUrl(kind)}`,
    `🎮 Surfea estas olas en 3D, juega Ripping gratis: ${GAME_URL}`,
    // Deliberately not "Original clip:" - that phrase is what promote-to-shorts keys on to
    // pick candidates, and these uploads must never re-enter that pipeline.
    ...(twitchClipUrl ? [`🎬 Clip de Twitch: ${twitchClipUrl}`] : []),
    ...(music ? musicCredit(music) : []),
    ...(forecast ? ['Pronóstico: Open-Meteo.com (CC BY 4.0)'] : []),
    '',
    `#SantaTeresa #CostaRica #Surf${kind === 'live' ? ' #SurfCam' : ' #Shorts'}`,
  ];
  return lines.join('\n');
}

// Instagram caption for the Reel of a Short. Links aren't clickable in IG captions, so
// the YouTube handle is the thing to remember; the full URL sits in the bio.
export function reelCaption(opts: { kind: CopyKind; report: SurfReport | null; at: number; youtubeUrl?: string; moments?: DayMoment[] }): string {
  const { kind, report, at, youtubeUrl, moments } = opts;
  const head =
    kind === 'best'
      ? `🏄 Mejor ola del día en Santa Teresa · ${esDay(at)}`
      : kind === 'day'
        ? `🌅 Resumen del día en Santa Teresa · ${esDay(at)}`
        : `🌊 ${report ? conditionLabel(report) : 'Surf'} en Santa Teresa · ${esTime(at)}`;
  return [
    head,
    ...(moments?.length ? moments.map(momentLine) : report ? [conditionsLine(report)] : []),
    '',
    kind === 'best'
      ? `👉 Suscríbete en YouTube y recibe la mejor ola de Santa Teresa cada día: ${YOUTUBE_CHANNEL_ID_URL}`
      : `👉 Suscríbete al canal de YouTube para el reporte diario: ${YOUTUBE_CHANNEL_ID_URL}`,
    ...(youtubeUrl ? [`▶️ Este video: ${youtubeUrl}`] : []),
    `🔴 Cámara EN VIVO 24/7 con marea, swell y viento: ${LIVE_URL_SHORT}`,
    '🏄 Clases de surf y tours: santateresabook.com',
    '🔗 Link directo en la bio',
    '',
    '#SantaTeresa #CostaRica #Surf #SurfReport #PuraVida #MalPais #Nicoya #SurfCam #OlasHoy',
  ].join('\n');
}

// --- Live chat -------------------------------------------------------------------------
// YouTube caps a chat message at 200 characters, and the API can't pin one, so the day
// plan is re-posted a few times a day and also sits at the top of the live's description.
const CHAT_MAX = 200;

// "5:28am", "1pm"
const clock = (at: number) => crTime(at, '12h').replace(':00 ', ' ').replace(' ', '').toLowerCase();

const cleanWind = (w: { kmh: number; kind: WindKind }) =>
  w.kind === 'light' || w.kind === 'offshore' || (w.kind === 'cross-shore' && w.kmh < 12);

// Longest daylight stretch of clean wind, as hour marks: "limpio 5am–10am".
function windWindow(o: DayOutlook): string | null {
  const daylight = o.wind.filter((w) => w.at >= o.sun.sunrise - 3_600_000 && w.at <= o.sun.sunset);
  if (!daylight.length) return null;
  let [bestFrom, bestTo] = [-1, -2];
  for (let i = 0, from = -1; i <= daylight.length; i++) {
    const clean = i < daylight.length && cleanWind(daylight[i]);
    if (clean && from < 0) from = i;
    if (!clean && from >= 0) {
      if (i - 1 - from > bestTo - bestFrom) [bestFrom, bestTo] = [from, i - 1];
      from = -1;
    }
  }
  if (bestFrom < 0) return 'con viento todo el día';
  if (bestFrom === 0 && bestTo === daylight.length - 1) return 'limpio todo el día';
  return `limpio ${clock(daylight[bestFrom].at)}–${clock(daylight[bestTo].at + 3_600_000)}`;
}

function fitChat(parts: string[]): string {
  // Drop from the end of the optional tail until it fits.
  const out = [...parts];
  while (chars(out.join(' · ')) > CHAT_MAX && out.length > 1) out.pop();
  return Array.from(out.join(' · ')).slice(0, CHAT_MAX).join('');
}

// "📅 Hoy: 🌅 5:28am · 💨 limpio 5am–10am · 🌊 baja 7:12am, alta 1:25pm · 🌇 5:32pm, mejor luz 4:50pm"
export function chatSchedule(o: DayOutlook): string {
  const wind = windWindow(o);
  const tides = o.tide.extremes.map((e) => `${e.type === 'high' ? 'alta' : 'baja'} ${clock(e.at)}`).join(', ');
  return fitChat([
    `📅 Hoy en Santa Teresa: 🌅 amanece ${clock(o.sun.sunrise)}`,
    ...(wind ? [`💨 ${wind}`] : []),
    ...(tides ? [`🌊 marea ${tides}`] : []),
    `🌇 atardecer ${clock(o.sun.sunset)} (mejor luz desde ${clock(o.sun.sunset - 45 * 60_000)})`,
  ]);
}

// "🔴 7:30am · Glassy 1.1 m · 14 s del SSW · 💨 4 km/h suave · 🌊 subiendo, alta 1:25pm · ¿Quién se tira? 🏄"
export function chatNow(o: DayOutlook, at: number): string {
  const r = o.now;
  const next = r.tide.next;
  return fitChat([
    `🔴 ${clock(at)} · ${conditionLabel(r)} · ${r.swellPeriodS} s del ${r.swellFrom}`,
    `💨 ${r.windKmh} km/h ${WIND_ES[r.windKind]}`,
    `🌊 ${r.tide.direction === 'rising' ? 'subiendo' : 'bajando'}${next ? `, ${next.type === 'high' ? 'alta' : 'baja'} ${clock(next.at)}` : ''}`,
    '¿Quién se tira? 🏄 Escribí cómo la ves',
  ]);
}
