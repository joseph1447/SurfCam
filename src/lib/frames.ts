// Picks the frame and crop a thumbnail is cut from. Works on a 160x90 RGB copy of the
// clip at 2 fps: small enough to score in plain JS, and the downscale averages away the
// sun glints that cover the open water (1-3px at 1440p) while whitewater, which comes in
// patches, stays bright. Surfers are a few pixels at this distance, so there's no person
// detection: a model couldn't see them and wouldn't fit the function bundle anyway.

import { execFileSync } from 'child_process';
import { writeFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { ffmpegPath } from '@/lib/shorts';

const W = 160;
const H = 90;
export const FPS = 2;

// Cam overlays a crop must stay clear of (fractions of the frame): the sponsor watermark
// bottom-left and the timestamp top-right.
const WATERMARK = { x0: 0, x1: 0.45, y0: 0.86, y1: 1 };
const TIMESTAMP = { x0: 0.74, x1: 1, y0: 0, y1: 0.1 };
// Waves break near shore, in the lower half of the water; foam out past it counts less.
const SURF_ZONE_Y = 0.45;

export interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
  zoom: number;
}

export interface FrameScore {
  t: number;
  score: number;
  foamPct: number;
  sharp: number;
  bright: number;
  contrast: number;
  sat: number;
  rejected?: 'dark' | 'night' | 'flat' | 'blurry';
}

export interface ClipAnalysis {
  frames: FrameScore[];
  best: FrameScore | null;
  // For the best frame: a tight crop on the action (styles A/B) and a wider one (style C).
  zoomCrop: Crop;
  mediumCrop: Crop;
  // 9:16 window on the action, for Shorts: YouTube's Shorts shelves show thumbnails
  // vertically and would centre-crop a 16:9 one, text and all.
  portraitCrop: Crop;
  // Where the foam sits across the zoom crop, 0 = left edge; text goes on the other side.
  foamX: number;
}

function inBox(fx: number, fy: number, b: typeof WATERMARK) {
  return fx >= b.x0 && fx < b.x1 && fy >= b.y0 && fy < b.y1;
}

function readFrames(path: string): Buffer[] {
  const raw = execFileSync(ffmpegPath(), [
    '-hide_banner', '-loglevel', 'error',
    '-i', path,
    '-vf', `fps=${FPS},scale=${W}:${H}:flags=area`,
    '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1',
  ], { maxBuffer: 256 * 1024 * 1024, timeout: 120_000 });
  const size = W * H * 3;
  return Array.from({ length: Math.floor(raw.length / size) }, (_, i) => raw.subarray(i * size, (i + 1) * size));
}

interface FrameMaps {
  foam: Float32Array; // weighted foam per pixel
  veg: Uint8Array;
}

function measure(frame: Buffer) {
  const Y = new Float32Array(W * H);
  const S = new Float32Array(W * H);
  const veg = new Uint8Array(W * H);
  const sea = new Uint8Array(W * H);
  let sumY = 0, sumY2 = 0, sumS = 0;
  let seaN = 0, seaY = 0, seaY2 = 0;

  for (let i = 0; i < W * H; i++) {
    const r = frame[i * 3], g = frame[i * 3 + 1], b = frame[i * 3 + 2];
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const s = max ? (max - min) / max : 0;
    Y[i] = y;
    S[i] = s;
    sumY += y;
    sumY2 += y * y;
    sumS += s;
    const fx = (i % W) / W, fy = Math.floor(i / W) / H;
    veg[i] = g > r + 6 && g >= b && y < 165 ? 1 : 0;
    if (!veg[i] && !inBox(fx, fy, WATERMARK) && !inBox(fx, fy, TIMESTAMP)) {
      sea[i] = 1;
      seaN++;
      seaY += y;
      seaY2 += y * y;
    }
  }

  const n = W * H;
  const bright = sumY / n;
  const contrast = Math.sqrt(Math.max(0, sumY2 / n - bright * bright));
  const seaMean = seaN ? seaY / seaN : 0;
  const seaStd = seaN ? Math.sqrt(Math.max(0, seaY2 / seaN - seaMean * seaMean)) : 0;

  // Foam: bright, colourless, and backed by bright neighbours (lone glints aren't).
  const hi = Math.max(175, seaMean + 1.6 * seaStd);
  const support = seaMean + 1.0 * seaStd;
  const foam = new Float32Array(n);
  let foamW = 0;
  let lap = 0, lapN = 0;
  for (let yy = 1; yy < H - 1; yy++) {
    for (let xx = 1; xx < W - 1; xx++) {
      const i = yy * W + xx;
      if (!sea[i]) continue;
      const l = 4 * Y[i] - Y[i - 1] - Y[i + 1] - Y[i - W] - Y[i + W];
      lap += l * l;
      lapN++;
      if (Y[i] > hi && S[i] < 0.25) {
        const nb = +(Y[i - 1] > support) + +(Y[i + 1] > support) + +(Y[i - W] > support) + +(Y[i + W] > support);
        if (nb >= 2) {
          const w = yy / H >= SURF_ZONE_Y ? 1 : 0.4;
          foam[i] = w;
          foamW += w;
        }
      }
    }
  }

  return {
    bright,
    contrast,
    sat: sumS / n,
    sharp: lapN ? lap / lapN : 0,
    foamPct: seaN ? (100 * foamW) / seaN : 0,
    maps: { foam, veg } as FrameMaps,
  };
}

// Highest zoom whose best window still holds most of the foam, never touching the cam's
// overlays. Crops keep the 16:9 frame shape, so w and h share the same fraction.
function chooseCrop(maps: FrameMaps, zooms: number[]): { crop: Crop; foamX: number } {
  const integral = (src: ArrayLike<number>) => {
    const I = new Float64Array((W + 1) * (H + 1));
    for (let y = 0; y < H; y++) {
      let row = 0;
      for (let x = 0; x < W; x++) {
        row += src[y * W + x];
        I[(y + 1) * (W + 1) + x + 1] = I[y * (W + 1) + x + 1] + row;
      }
    }
    return I;
  };
  const F = integral(maps.foam);
  const V = integral(maps.veg);
  const sum = (I: Float64Array, x: number, y: number, w: number, h: number) =>
    I[(y + h) * (W + 1) + x + w] - I[y * (W + 1) + x + w] - I[(y + h) * (W + 1) + x] + I[y * (W + 1) + x];
  const total = sum(F, 0, 0, W, H);

  const clear = (x: number, y: number, w: number, h: number) =>
    ![WATERMARK, TIMESTAMP].some(
      (b) => x / W < b.x1 && (x + w) / W > b.x0 && y / H < b.y1 && (y + h) / H > b.y0,
    );

  let fallback: { crop: Crop; foamX: number } | null = null;
  for (const zoom of zooms) {
    const w = Math.round(W / zoom);
    const h = Math.round(H / zoom);
    let best: { x: number; y: number; foam: number; veg: number } | null = null;
    for (let y = 0; y + h <= H; y++) {
      for (let x = 0; x + w <= W; x += 2) {
        if (!clear(x, y, w, h)) continue;
        const foam = sum(F, x, y, w, h);
        const veg = sum(V, x, y, w, h) / (w * h);
        if (veg > 0.5) continue;
        if (!best || foam > best.foam || (foam === best.foam && veg < best.veg)) best = { x, y, foam, veg };
      }
    }
    if (!best) continue;
    let fx = 0;
    for (let yy = best.y; yy < best.y + h; yy++) for (let xx = best.x; xx < best.x + w; xx++) fx += maps.foam[yy * W + xx] * (xx - best.x);
    const pick = {
      crop: { x: best.x / W, y: best.y / H, w: w / W, h: h / H, zoom },
      foamX: best.foam ? fx / best.foam / w : 0.5,
    };
    fallback ??= pick;
    if (!total || best.foam / total >= 0.7) return pick;
    fallback = pick;
  }
  return fallback ?? { crop: { x: 0.1, y: 0.12, w: 0.74, h: 0.74, zoom: 1.35 }, foamX: 0.5 };
}

// Tallest 9:16 window that fits between the timestamp band and the watermark band, slid
// sideways to hold the most foam. At 1440p it's ~340x1100 px, still sharp for a thumbnail.
function choosePortrait(maps: FrameMaps): Crop {
  const y0 = Math.ceil(TIMESTAMP.y1 * H);
  const h = Math.floor(WATERMARK.y0 * H) - y0;
  // The analysis grid has the source's 16:9 shape, so a 9:16 window in source pixels is
  // h * 9/16 wide here too.
  const winW = Math.max(1, Math.round((h * 9) / 16));
  let bestX = 0, bestFoam = -1;
  for (let x = 0; x + winW <= W; x++) {
    let foam = 0;
    for (let yy = y0; yy < y0 + h; yy++) for (let xx = x; xx < x + winW; xx++) foam += maps.foam[yy * W + xx];
    if (foam > bestFoam) [bestX, bestFoam] = [x, foam];
  }
  return { x: bestX / W, y: y0 / H, w: winW / W, h: h / H, zoom: 1 / (h / H) };
}

export function analyzeClip(path: string): ClipAnalysis {
  const frames = readFrames(path);
  const measured = frames.map((f, i) => ({ t: i / FPS, ...measure(f) }));
  const sharps = measured.map((m) => m.sharp).sort((a, b) => a - b);
  const medianSharp = sharps[sharps.length >> 1] || 1;

  const scored: (FrameScore & { maps: FrameMaps })[] = measured.map((m) => {
    let rejected: FrameScore['rejected'];
    if (m.bright < 60) rejected = 'dark';
    else if (m.sat < 0.035) rejected = 'night'; // IR mode: the cam goes grey after sunset
    else if (m.contrast < 14) rejected = 'flat'; // fog or rain on the lens
    else if (m.sharp < 0.45 * medianSharp) rejected = 'blurry';
    const score =
      2 * m.foamPct + 3 * Math.min(m.sharp / medianSharp, 2) + 2 * Math.min(m.contrast / 40, 1.5) + (m.bright >= 90 && m.bright <= 190 ? 1 : 0);
    return { t: m.t, score: Math.round(score * 100) / 100, foamPct: Math.round(m.foamPct * 100) / 100, sharp: Math.round(m.sharp), bright: Math.round(m.bright), contrast: Math.round(m.contrast), sat: Math.round(m.sat * 1000) / 1000, rejected, maps: m.maps };
  });

  const usable = scored.filter((f) => !f.rejected);
  const best = usable.reduce<(typeof usable)[number] | null>((a, f) => (!a || f.score > a.score ? f : a), null);
  const maps = best?.maps ?? scored[0]?.maps;
  const zoom = maps ? chooseCrop(maps, [1.8, 1.6, 1.45, 1.35]) : { crop: { x: 0.1, y: 0.12, w: 0.74, h: 0.74, zoom: 1.35 }, foamX: 0.5 };
  const medium = maps ? chooseCrop(maps, [1.35]) : zoom;
  const portrait = maps ? choosePortrait(maps) : { x: 0.35, y: 0.1, w: 0.2375, h: 0.76, zoom: 1.3 };

  const strip = ({ maps: _maps, ...f }: (typeof scored)[number]) => f;
  return { frames: scored.map(strip), best: best ? strip(best) : null, zoomCrop: zoom.crop, mediumCrop: medium.crop, portraitCrop: portrait, foamX: zoom.foamX };
}

// How much sunset colour one frame holds, for picking the evening Short's moment. warmPct is
// the share of pixels with a red/orange/pink hue: the pink glow of 2026-10-03 read 90%, grey
// dusks 0-8%. satPct is plain saturation; it falls to ~0 once the cam switches to IR.
// Reads from a temp file, not stdin: ffmpeg quits after the first frame, and the unread rest
// of a piped input fails the spawn (EOF on Windows, EPIPE on Linux).
export function frameColor(image: Buffer): { warmPct: number; satPct: number } {
  const path = join(tmpdir(), `frame-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.ts`);
  let raw: Buffer;
  try {
    writeFileSync(path, image);
    raw = execFileSync(ffmpegPath(), [
      '-hide_banner', '-loglevel', 'error', '-i', path, '-frames:v', '1',
      '-vf', `scale=${W}:${H}:flags=area`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1',
    ], { timeout: 20_000 });
  } finally {
    if (existsSync(path)) unlinkSync(path);
  }
  if (raw.length < W * H * 3) throw new Error('No frame decoded');

  let warm = 0, sat = 0;
  for (let i = 0; i < W * H; i++) {
    const r = raw[i * 3], g = raw[i * 3 + 1], b = raw[i * 3 + 2];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const s = max ? (max - min) / max : 0;
    sat += s;
    if (s <= 0.08 || max <= 60) continue;
    const d = max - min;
    let hue = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    hue = (hue * 60 + 360) % 360;
    if (hue < 50 || hue > 300) warm++;
  }
  const n = W * H;
  return { warmPct: Math.round((1000 * warm) / n) / 10, satPct: Math.round((1000 * sat) / n) / 10 };
}
