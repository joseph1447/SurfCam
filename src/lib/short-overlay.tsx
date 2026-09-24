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

// The block grows upward from this line: below it the phone player lays the channel name,
// title and sound over the video (~18% of the height).
const BOTTOM_UI = 190;

const font = (file: string) => readFileSync(join(process.cwd(), 'assets', 'fonts', file));

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 4 }}>
      <div style={{ width: 76, fontFamily: 'JetBrains Mono', fontSize: 14, letterSpacing: 2, color: TEAL }}>{label}</div>
      <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 21, color: FOAM }}>{value}</div>
    </div>
  );
}

// Everything sits over the vegetation at the bottom of the crop: the top two thirds are
// the lineup and the break near shore, which is what viewers came to see. Width stops
// short of the like/comment column down the right edge.
export async function renderOverlay(opts: { hook: string; at: number; report: SurfReport | null }): Promise<Buffer> {
  const { hook, at, report } = opts;
  const next = report?.tide.next;

  const image = new ImageResponse(
    (
      <div style={{ width: OVERLAY_W, height: OVERLAY_H, display: 'flex', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: BOTTOM_UI, left: 28, width: 470, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ fontFamily: 'Playfair Display', fontSize: 54, lineHeight: 1.05, color: FOAM, background: SUNSET, padding: '2px 14px 10px' }}>
            {hook}
          </div>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', fontFamily: 'JetBrains Mono', fontSize: 15, letterSpacing: 1, color: FOAM, background: OCEAN, padding: '5px 10px', borderRadius: 6 }}>
            <div style={{ width: 9, height: 9, borderRadius: 5, background: SUNSET, marginRight: 8 }} />
            {`LIVE ${crTime(at, '12h')}`}
            <span style={{ marginLeft: 8, color: SAND }}>· santateresasurfcam.com</span>
          </div>
          {report && (
            <div style={{ marginTop: 8, width: 470, display: 'flex', flexDirection: 'column', background: `linear-gradient(160deg, ${OCEAN}, rgba(4, 52, 78, 0.72))`, border: '1px solid rgba(255, 255, 255, 0.18)', borderRadius: 16, padding: '4px 16px 10px' }}>
              <Row label="SWELL" value={`${report.swellFt} ft · ${report.swellPeriodS}s · ${report.swellFrom}`} />
              <Row
                label="TIDE"
                value={`${report.tide.direction === 'rising' ? 'Rising' : 'Falling'}${next ? ` · ${next.type === 'high' ? 'High' : 'Low'} ${crTime(next.at, '12h')}` : ''}`}
              />
              <Row label="WIND" value={`${report.windKmh} km/h ${report.windFrom} · ${report.windKind}`} />
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
