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
// first-frame question holds viewers best. Kept to one line at the hook's size.
export const HOOKS = ['Waves today?', 'Worth a paddle?', 'Surf or skip?'];

// The block hangs from this line: above it the phone player shows its search/camera bar.
const TOP_UI = 96;

const font = (file: string) => readFileSync(join(process.cwd(), 'assets', 'fonts', file));

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 4 }}>
      <div style={{ width: 76, fontFamily: 'JetBrains Mono', fontSize: 14, letterSpacing: 2, color: TEAL }}>{label}</div>
      <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 21, color: FOAM }}>{value}</div>
    </div>
  );
}

// A compact block at the top, over open water far outside the lineup: the break mid-frame
// and the shore below stay clear (Joseph's call on 2026-09-30, after seeing it at the bottom
// on a real Short). It covers about the top third; width stops short of the like/comment
// column down the right edge.
export async function renderOverlay(opts: { hook: string; at: number; report: SurfReport | null }): Promise<Buffer> {
  const { hook, at, report } = opts;
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
                <Row label="SWELL" value={`${report.swellFt} ft · ${report.swellPeriodS}s · ${report.swellFrom}`} />
                <Row
                  label="TIDE"
                  value={`${report.tide.direction === 'rising' ? 'Rising' : 'Falling'}${next ? ` · ${next.type === 'high' ? 'High' : 'Low'} ${crTime(next.at, '12h')}` : ''}`}
                />
                <Row label="WIND" value={`${report.windKmh} km/h ${report.windFrom} · ${report.windKind}`} />
              </div>
            )}
            <div style={{ display: 'flex', marginTop: report ? 0 : 6, fontFamily: 'JetBrains Mono', fontSize: 16, letterSpacing: 1, color: SAND }}>
              santateresasurfcam.com
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
