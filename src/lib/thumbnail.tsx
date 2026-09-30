import { ImageResponse } from 'next/og';
import { execFileSync } from 'child_process';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { Readable } from 'stream';
import { ffmpegPath, youtubeClient } from '@/lib/shorts';
import type { ClipAnalysis, Crop } from '@/lib/frames';
import { cleanSurface as clean, surfaceWord, type SurfReport } from '@/lib/conditions';

export const TW = 1280;
export const TH = 720;

// A: tight crop + conditions text. B: tight crop + emotional line. C: medium shot + a big
// number. BEST: the daily best-wave Short.
export type ThumbStyle = 'A' | 'B' | 'C' | 'BEST';
export const ROTATING_STYLES: ThumbStyle[] = ['A', 'B', 'C'];

export interface ThumbText {
  headline: string;
  sub?: string;
}

const meters = (r: SurfReport) => Math.round((r.swellFt / 3.281) * 10) / 10;
// Always one decimal ("1.0 M", not "1 M") so it reads as a measurement.
const m1 = (r: SurfReport) => meters(r).toFixed(1);

function crHour(at: number) {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Costa_Rica', hour: 'numeric', hourCycle: 'h23' }).format(at));
}

// Every line is gated on the forecast (no "pumping" on a flat day), 3-4 words max.
export function thumbText(style: ThumbStyle, r: SurfReport | null, at: number): ThumbText {
  if (style === 'BEST') return { headline: 'MEJOR OLA DEL DÍA', sub: r ? `${m1(r)} M · ${surfaceWord(r)}` : undefined };
  if (!r) return { headline: 'SURF EN VIVO' };
  const m = meters(r);
  if (style === 'A') return { headline: `${m1(r)} M ${surfaceWord(r)}` };
  if (style === 'C') return { headline: `${m1(r)} M`, sub: `${r.swellPeriodS} S · ${surfaceWord(r)}` };

  if (m >= 2 && r.swellPeriodS >= 12 && clean(r)) return { headline: '¡ESTÁ BOMBEANDO!' };
  if (m >= 1 && r.swellPeriodS >= 11 && (r.windKind === 'light' || r.windKind === 'offshore') && crHour(at) < 8) {
    return { headline: 'PERFECTO AL AMANECER' };
  }
  if (m >= 1.5 && clean(r)) return { headline: '¡BUENAS OLAS HOY!' };
  if (m < 0.8 && clean(r)) return { headline: 'PEQUEÑO PERO LIMPIO' };
  if (!clean(r)) return { headline: m >= 1.2 ? 'GRANDE PERO PICADO' : 'HOY CON VIENTO' };
  return { headline: 'HAY OLAS HOY' };
}

// Long headlines break into two even lines ("MEJOR OLA / DEL DÍA") instead of leaving
// one orphan word on the second.
function balance(headline: string): string[] {
  if (headline.length <= 13) return [headline];
  const words = headline.split(' ');
  let best = [headline];
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ');
    const b = words.slice(i).join(' ');
    const diff = Math.abs(a.length - b.length);
    if (diff < bestDiff) [best, bestDiff] = [[a, b], diff];
  }
  return best;
}

const asset = (...p: string[]) => join(process.cwd(), 'assets', ...p);
const LOGO = () => `data:image/jpeg;base64,${readFileSync(asset('brand', 'channel-logo.jpg')).toString('base64')}`;

// Shorts shelves (channel tab, search, home) show a 9:16 image, and YouTube centre-crops a
// landscape thumbnail into it, text and all. So Shorts get a portrait thumbnail; the
// 24/7 broadcast keeps the landscape one.
export type Orientation = 'landscape' | 'portrait';
const SIZE: Record<Orientation, { w: number; h: number }> = { landscape: { w: TW, h: TH }, portrait: { w: 720, h: 1280 } };

async function renderOverlay(style: ThumbStyle, text: ThumbText, textRight: boolean, orientation: Orientation): Promise<Buffer> {
  const { w: W, h: H } = SIZE[orientation];
  const portrait = orientation === 'portrait';
  const yellow = style === 'B' || style === 'BEST';
  const big = style === 'C';
  // Portrait is narrower, so every headline wraps and the sizes come down a notch.
  const lines = big && !portrait ? [text.headline] : balance(text.headline);
  const headlineStyle = {
    fontFamily: 'Anton',
    fontSize: portrait ? (big ? 200 : lines.length > 1 ? 104 : 118) : big ? 230 : lines.length > 1 ? 112 : 128,
    lineHeight: 0.95,
    color: yellow ? '#FFD60A' : '#FFFFFF',
    WebkitTextStroke: `${big ? 12 : 9}px #000000`,
    textShadow: '0 8px 24px rgba(0,0,0,0.55)',
    textAlign: textRight && !portrait ? ('right' as const) : ('left' as const),
    maxWidth: portrait ? 660 : big ? 760 : 720,
  };
  const tagSize = portrait ? 26 : 34;
  const logoSize = portrait ? 64 : 78;

  const image = new ImageResponse(
    (
      <div style={{ width: W, height: H, display: 'flex', position: 'relative' }}>
        {/* Fixed brand corner, the same on every thumbnail */}
        <div style={{ position: 'absolute', top: 30, left: 32, display: 'flex', alignItems: 'center' }}>
          <img src={LOGO()} width={logoSize} height={logoSize} style={{ borderRadius: logoSize / 2, border: '4px solid #FFFFFF' }} />
          <div style={{ marginLeft: 14, display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.72)', borderRadius: 10, padding: '8px 16px' }}>
            <div style={{ width: 16, height: 16, borderRadius: 8, background: '#FF2D2D', marginRight: 12 }} />
            <div style={{ fontFamily: 'Anton', fontSize: tagSize, color: '#FFFFFF', letterSpacing: 1 }}>SANTA TERESA • EN VIVO</div>
          </div>
        </div>

        {/* Landscape: headline on the side away from the break, bottom-right free for the
            duration badge. Portrait: under the brand tag, over open water, so the break and
            the whitewater lower down stay visible in the shelf. */}
        <div
          style={{
            position: 'absolute',
            ...(portrait ? { top: 130, left: 32 } : { top: 138, ...(textRight ? { right: 40 } : { left: 36 }) }),
            display: 'flex',
            flexDirection: 'column',
            alignItems: textRight && !portrait ? 'flex-end' : 'flex-start',
          }}
        >
          {lines.map((line) => (
            <div key={line} style={headlineStyle}>
              {line}
            </div>
          ))}
          {text.sub && (
            <div style={{ marginTop: 10, fontFamily: 'Anton', fontSize: portrait ? (big ? 72 : 56) : big ? 84 : 64, color: '#FFFFFF', WebkitTextStroke: '6px #000000', textShadow: '0 6px 18px rgba(0,0,0,0.55)' }}>
              {text.sub}
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [{ name: 'Anton', data: readFileSync(asset('fonts', 'Anton-Regular.ttf')), weight: 400, style: 'normal' }],
    },
  );
  return Buffer.from(await image.arrayBuffer());
}

// Grade: +25% saturation, contrast and clarity, cooler shadows / warmer highlights (the
// teal-and-sun look), then the text layer. Lands around 150-400 KB, far under the 2 MB cap.
export async function renderThumbnail(opts: {
  clip: Buffer;
  analysis: ClipAnalysis;
  style: ThumbStyle;
  text: ThumbText;
  orientation?: Orientation;
}): Promise<Buffer> {
  const { clip, analysis, style, text, orientation = 'landscape' } = opts;
  const { w: outW, h: outH } = SIZE[orientation];
  const crop: Crop = orientation === 'portrait' ? analysis.portraitCrop : style === 'C' ? analysis.mediumCrop : analysis.zoomCrop;
  const t = analysis.best?.t ?? 0;
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const clipPath = join(tmpdir(), `thumb-clip-${stamp}.mp4`);
  const overlayPath = join(tmpdir(), `thumb-overlay-${stamp}.png`);
  const outPath = join(tmpdir(), `thumb-${stamp}.jpg`);
  try {
    writeFileSync(clipPath, clip);
    writeFileSync(overlayPath, await renderOverlay(style, text, analysis.foamX < 0.5, orientation));
    const grade =
      `crop=iw*${crop.w.toFixed(4)}:ih*${crop.h.toFixed(4)}:iw*${crop.x.toFixed(4)}:ih*${crop.y.toFixed(4)},` +
      `scale=${outW}:${outH}:flags=lanczos,` +
      'eq=saturation=1.25:contrast=1.12:gamma=1.03,' +
      'colorbalance=rs=-0.06:gs=0.02:bs=0.07:rm=-0.03:gm=0.02:bm=0.04:rh=0.07:gh=0.03:bh=-0.04,' +
      'unsharp=7:7:0.8:7:7:0';
    execFileSync(ffmpegPath(), [
      '-hide_banner', '-loglevel', 'error',
      '-ss', t.toFixed(2), '-i', clipPath,
      '-i', overlayPath,
      '-filter_complex', `[0:v]${grade}[bg];[bg][1:v]overlay=0:0`,
      '-frames:v', '1', '-q:v', '3',
      '-y', outPath,
    ], { timeout: 60_000, stdio: 'pipe' });
    const jpg = readFileSync(outPath);
    if (jpg.length > 2 * 1024 * 1024) throw new Error(`Thumbnail too large: ${jpg.length} bytes`);
    return jpg;
  } finally {
    for (const p of [clipPath, overlayPath, outPath]) if (existsSync(p)) unlinkSync(p);
  }
}

export async function setThumbnail(videoId: string, jpg: Buffer) {
  await youtubeClient().thumbnails.set({
    videoId,
    media: { mimeType: 'image/jpeg', body: Readable.from(jpg) },
  });
}
