import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';
import { crTime, type SurfReport } from '@/lib/conditions';
import { SPONSORS } from '@/lib/sponsors';

// Same size as the vertical crop in shorts.ts, so the PNG lays over the video 1:1.
export const OVERLAY_W = 608;
export const OVERLAY_H = 1080;

const OCEAN = 'rgba(6, 17, 28, 0.78)';
const TEAL = '#00AAFF';
const SUNSET = '#FF6A00';
const FOAM = '#F8FAFB';
const SAND = '#D9B98C';

// Rotated per upload and stored on the TwitchShort record, so Analytics can tell which
// first-frame question holds viewers best. Kept to one line at the hook's size.
export const HOOKS = ['Waves today?', 'Worth a paddle?', 'Surf or skip?'];

// The block hangs from this line: above it the phone player shows its search/camera bar.
const TOP_UI = 96;

const font = (file: string) => readFileSync(join(process.cwd(), 'assets', 'fonts', file));

// "7am" / "5:46pm" (Costa Rica time).
export function clockLabel(at: number): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Costa_Rica', hour: 'numeric', minute: '2-digit', hour12: true }).formatToParts(at);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const minute = get('minute');
  return `${get('hour')}${minute === '00' ? '' : `:${minute}`}${get('dayPeriod').toLowerCase()}`;
}

// "oct 2 · 7am" / "oct 2 · 5:46pm" (Costa Rica time): when the clip was cut.
export function captureStamp(at: number): string {
  const d = new Date(at);
  const month = new Intl.DateTimeFormat('es-CR', { timeZone: 'America/Costa_Rica', month: 'short' }).format(d).replace('.', '').toLowerCase();
  const day = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Costa_Rica', day: 'numeric' }).format(d);
  return `${month} ${day} · ${clockLabel(at)}`;
}

export interface TimelineStop {
  label: string; // MAÑANA / MEDIODÍA / TARDE
  at: number;
}

function Row({ label, value, hidden = false }: { label: string; value: string; hidden?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 4, opacity: hidden ? 0 : 1 }}>
      <div style={{ width: 76, fontFamily: 'JetBrains Mono', fontSize: 14, letterSpacing: 2, color: TEAL }}>{label}</div>
      <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 21, color: FOAM }}>{value}</div>
    </div>
  );
}

// A compact block at the top, over open water far outside the lineup: the break mid-frame
// and the shore below stay clear (Joseph's call on 2026-09-30, after seeing it at the bottom
// on a real Short). It covers about the top third; width stops short of the like/comment
// column down the right edge.
// The day summary adds a row of its stops under the card, the current one lit, so the
// cuts read as the day moving on rather than as random clips.
export async function renderOverlay(opts: {
  hook: string;
  at: number;
  report: SurfReport | null;
  timeline?: { stops: TimelineStop[]; current: number };
  rows?: number; // conditions rows shown so far (staged reveal); hidden ones keep their space
}): Promise<Buffer> {
  const { hook, at, report, timeline, rows = 3 } = opts;
  const next = report?.tide.next;

  const image = new ImageResponse(
    (
      <div style={{ width: OVERLAY_W, height: OVERLAY_H, display: 'flex', position: 'relative' }}>
        <div style={{ position: 'absolute', top: TOP_UI, left: 28, width: 470, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ fontFamily: 'Playfair Display', fontSize: 54, lineHeight: 1.05, color: FOAM, background: SUNSET, padding: '2px 14px 10px' }}>
            {hook}
          </div>
          <div style={{ marginTop: 8, width: 470, display: 'flex', flexDirection: 'column', background: `linear-gradient(160deg, ${OCEAN}, rgba(4, 52, 78, 0.72))`, border: '1px solid rgba(255, 255, 255, 0.18)', borderRadius: 16, padding: '4px 16px 10px' }}>
            {report && (
              <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 8, marginBottom: 8, borderBottom: '1px solid rgba(255, 255, 255, 0.14)' }}>
                <Row label="SWELL" value={`${report.swellFt} ft · ${report.swellPeriodS}s · ${report.swellFrom}`} hidden={rows < 1} />
                <Row label="WIND" value={`${report.windKmh} km/h ${report.windFrom} · ${report.windKind}`} hidden={rows < 2} />
                <Row
                  label="TIDE"
                  value={`${report.tide.direction === 'rising' ? 'Rising' : 'Falling'}${next ? ` · ${next.type === 'high' ? 'High' : 'Low'} ${crTime(next.at, '12h')}` : ''}`}
                  hidden={rows < 3}
                />
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: report ? 0 : 6, fontFamily: 'JetBrains Mono', fontSize: 16, letterSpacing: 1, color: SAND }}>
              <span style={{ color: 'rgba(248, 250, 251, 0.6)' }}>{captureStamp(at)}</span>
              <span>santateresasurfcam.com</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8, paddingTop: 6, borderTop: '1px solid rgba(255, 255, 255, 0.14)' }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: 2, color: SAND }}>APOYAN EL SURF CAM</span>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 5 }}>
              {SPONSORS.map((sp, i) => (
                <div key={sp.domain} style={{ display: 'flex', alignItems: 'center', marginLeft: i ? 14 : 0 }}>
                  <img
                    src={dataUrl(sp.logo)}
                    width={22}
                    height={22}
                    style={{ borderRadius: sp.shape === 'circle' ? 11 : 5, background: '#FFFFFF', objectFit: 'cover', marginRight: 5 }}
                  />
                  <span style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 12, color: 'rgba(248, 250, 251, 0.85)' }}>{sp.name}</span>
                </div>
              ))}
              </div>
            </div>
          </div>
          {timeline && (
            <div style={{ marginTop: 8, width: 470, display: 'flex' }}>
              {timeline.stops.map((stop, i) => {
                const on = i === timeline.current;
                return (
                  <div
                    key={stop.label}
                    style={{
                      flex: 1,
                      marginLeft: i ? 8 : 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '4px 0 6px',
                      borderRadius: 12,
                      background: on ? SUNSET : 'rgba(6, 17, 28, 0.62)',
                      border: on ? `1px solid ${SUNSET}` : '1px solid rgba(255, 255, 255, 0.14)',
                    }}
                  >
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, letterSpacing: 2, color: on ? '#0A0C10' : SAND }}>{stop.label}</div>
                    <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 19, lineHeight: 1.1, color: on ? '#0A0C10' : 'rgba(248, 250, 251, 0.7)' }}>
                      {clockLabel(stop.at)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: OVERLAY_W,
      height: OVERLAY_H,
      fonts: [
        { name: 'Playfair Display', data: font('PlayfairDisplay-Black.ttf'), weight: 900, style: 'normal' },
        { name: 'IBM Plex Sans', data: font('IBMPlexSans-SemiBold.ttf'), weight: 600, style: 'normal' },
        { name: 'JetBrains Mono', data: font('JetBrainsMono-Bold.ttf'), weight: 700, style: 'normal' },
      ],
    },
  );
  return Buffer.from(await image.arrayBuffer());
}

// The closing subscribe band: short, so the end runs back into the start without a wall
// of text (it held 4.5 s until 2026-10-23 and retention dropped across it).
export const CARD_SECONDS = 1.5;
// Conditions appear one row at a time instead of all on the first frame, which answered
// the hook at once: swell, then wind, then tide (seconds into the Short).
export const REVEAL_AT = [3, 8, 13];
// Every Short now opens ~3 s before its best break, so the Reel cover is the wave itself.
export const REEL_COVER_MS = 3000;
// Shown as a URL, not a bare handle: on Instagram a bare "@..." reads as an IG account.
export const YOUTUBE_URL_SHORT = 'youtube.com/@QuesadaJoseph';
export const LIVE_URL_SHORT = 'santateresasurfcam.com/live';

const dataUrl = (file: string) => {
  const mime = file.endsWith('.png') ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${readFileSync(join(process.cwd(), 'assets', 'brand', 'sponsors', file)).toString('base64')}`;
};

// Closing band (last CARD_SECONDS): one compact strip over open water, under the conditions
// card and well above the break, so the loop back to the first frame stays clean. The
// "best wave" Short leads with its own promise: that's the format people rewatch (936
// views at 113% on 2026-10-01), so it carries the most concrete reason to subscribe.
export async function renderEndCard(kind: 'short' | 'best' | 'day' = 'short'): Promise<Buffer> {
  const eyebrow = kind === 'best' ? 'La mejor ola de Santa Teresa, cada día' : kind === 'day' ? '¿Te gustó el resumen?' : '¿Te gustó el reporte?';
  const image = new ImageResponse(
    (
      <div style={{ width: OVERLAY_W, height: OVERLAY_H, display: 'flex', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: 480,
            left: 28,
            width: OVERLAY_W - 56,
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(6, 17, 28, 0.88)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 18,
            padding: '12px 14px',
          }}
        >
          <div style={{ fontFamily: 'Playfair Display', fontSize: 30, lineHeight: 1, color: FOAM, background: SUNSET, padding: '4px 12px 8px', borderRadius: 8 }}>
            SUSCRÍBETE
          </div>
          <div style={{ marginLeft: 14, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 15, color: SAND }}>{eyebrow}</div>
            <div style={{ marginTop: 3, display: 'flex', alignItems: 'center', fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 18, color: FOAM }}>
              <div style={{ width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '11px solid #FF2D2D', marginRight: 8 }} />
              {YOUTUBE_URL_SHORT}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: OVERLAY_W,
      height: OVERLAY_H,
      fonts: [
        { name: 'Playfair Display', data: font('PlayfairDisplay-Black.ttf'), weight: 900, style: 'normal' },
        { name: 'IBM Plex Sans', data: font('IBMPlexSans-SemiBold.ttf'), weight: 600, style: 'normal' },
        { name: 'JetBrains Mono', data: font('JetBrainsMono-Bold.ttf'), weight: 700, style: 'normal' },
      ],
    },
  );
  return Buffer.from(await image.arrayBuffer());
}
