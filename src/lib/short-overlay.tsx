import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';
import { crTime, type SurfReport } from '@/lib/conditions';

// Same size as the vertical crop in shorts.ts, so the PNG lays over the video 1:1.
export const OVERLAY_W = 608;
export const OVERLAY_H = 1080;

const OCEAN = 'rgba(6, 17, 28, 0.78)';
const TEAL = '#00AAFF';
const SUNSET = '#FF6A00';
const FOAM = '#F8FAFB';
const SAND = '#D9B98C';

// Rotated per upload and stored on the TwitchShort record, so Analytics can tell which
// first-frame question holds viewers best.
export const HOOKS = ['Waves today?', 'Worth the paddle?', 'Should you surf today?'];

const font = (file: string) => readFileSync(join(process.cwd(), 'assets', 'fonts', file));

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 10 }}>
      <div style={{ width: 92, fontFamily: 'JetBrains Mono', fontSize: 17, letterSpacing: 2, color: TEAL }}>{label}</div>
      <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 27, color: FOAM }}>{value}</div>
    </div>
  );
}

// Everything stacks in the top half, over open water: the lower half is where the waves
// break near shore, and the Shorts player chrome (title/channel at the bottom, like/comment
// column on the right) covers the rest.
export async function renderOverlay(opts: { hook: string; at: number; report: SurfReport | null }): Promise<Buffer> {
  const { hook, at, report } = opts;
  const next = report?.tide.next;

  const image = new ImageResponse(
    (
      <div style={{ width: OVERLAY_W, height: OVERLAY_H, display: 'flex', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 92, left: 28, right: 28, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'JetBrains Mono', fontSize: 18, letterSpacing: 3, color: FOAM, background: OCEAN, padding: '6px 12px', borderRadius: 6 }}>
            <div style={{ width: 11, height: 11, borderRadius: 6, background: SUNSET, marginRight: 10 }} />
            LIVE · SANTA TERESA, CR
          </div>
          <div style={{ marginTop: 14, fontFamily: 'Playfair Display', fontSize: 64, lineHeight: 1.05, color: FOAM, background: SUNSET, padding: '4px 18px 12px' }}>
            {hook}
          </div>
          <div style={{ marginTop: 12, fontFamily: 'JetBrains Mono', fontSize: 21, letterSpacing: 2, color: FOAM, background: OCEAN, padding: '6px 12px', borderRadius: 6 }}>
            {`SURF CHECK · ${crTime(at, '12h')}`}
          </div>
          {report && (
            <div style={{ marginTop: 18, width: 470, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', flexDirection: 'column', background: `linear-gradient(160deg, ${OCEAN}, rgba(4, 52, 78, 0.72))`, border: '1px solid rgba(255, 255, 255, 0.18)', borderRadius: 22, padding: '10px 22px 18px' }}>
                <Row label="SWELL" value={`${report.swellFt} ft · ${report.swellPeriodS}s · ${report.swellFrom}`} />
                <Row
                  label="TIDE"
                  value={`${report.tide.direction === 'rising' ? 'Rising' : 'Falling'}${next ? ` · ${next.type === 'high' ? 'High' : 'Low'} ${crTime(next.at, '12h')}` : ''}`}
                />
                <Row label="WIND" value={`${report.windKmh} km/h ${report.windFrom} · ${report.windKind}`} />
              </div>
              <div style={{ marginTop: 10, alignSelf: 'flex-start', fontFamily: 'JetBrains Mono', fontSize: 17, letterSpacing: 1, color: SAND, background: OCEAN, padding: '5px 10px', borderRadius: 6 }}>
                santateresasurfcam.com · 24/7 live
              </div>
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
