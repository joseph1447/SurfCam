// Titles and descriptions for everything uploaded or updated on the channel. Spanish, and
// built only from the live forecast, so the words always match the water.
import { crTime, surfaceWord, type SurfReport } from '@/lib/conditions';
import { GAME_URL, INSTAGRAM_URL } from '@/lib/links';

export type CopyKind = 'short' | 'live' | 'best';

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

export function surfDescription(opts: {
  kind: CopyKind;
  report: SurfReport | null;
  twitchClipUrl?: string;
  music?: string | null;
}): string {
  const { kind, report, twitchClipUrl, music } = opts;
  const lines = [
    report ? conditionsLine(report) : '🌊 Condiciones del mar en vivo desde Santa Teresa, Costa Rica.',
    '',
    '📍 En vivo 24/7 con marea, swell y viento: https://santateresasurfcam.com',
    ...(INSTAGRAM_URL ? [`📸 Instagram: ${INSTAGRAM_URL}`] : []),
    `🎮 Surfea estas olas en 3D, juega Ripping gratis: ${GAME_URL}`,
    // Deliberately not "Original clip:" - that phrase is what promote-to-shorts keys on to
    // pick candidates, and these uploads must never re-enter that pipeline.
    ...(twitchClipUrl ? [`🎬 Clip de Twitch: ${twitchClipUrl}`] : []),
    ...(music ? [`🎵 Música: ${music} (YouTube Audio Library)`] : []),
    ...(report ? ['Pronóstico: Open-Meteo.com (CC BY 4.0)'] : []),
    '',
    `#SantaTeresa #CostaRica #Surf${kind === 'live' ? ' #SurfCam' : ' #Shorts'}`,
  ];
  return lines.join('\n');
}
