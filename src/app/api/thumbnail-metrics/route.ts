import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import connectDB from '@/lib/mongodb';
import SiteConfig from '@/models/SiteConfig';
import ThumbnailTest, { type ThumbKind } from '@/models/ThumbnailTest';
import { cronAuthorized } from '@/lib/cron';
import { crDate } from '@/lib/conditions';
import { downloadClip } from '@/lib/twitch';
import { refreshReach, refreshViews } from '@/lib/thumb-metrics';
import { MIN_IMPRESSIONS, styleStats } from '@/lib/experiments';
import { thumbnailVideo } from '@/lib/thumb-pipeline';
import { ROTATING_STYLES, type ThumbStyle } from '@/lib/thumbnail';
import type { SurfReport } from '@/lib/conditions';

export const maxDuration = 300;

const DAY = 86_400_000;
const RETHUMB_AFTER = 2 * DAY;
const RETHUMB_BELOW = 0.02;
const RETHUMB_MIN_IMPRESSIONS = 100;
const RETHUMB_PER_RUN = 4; // 50 quota units each

// Daily: views + watch %, reach (impressions/CTR), then swap thumbnails that miss 2% CTR at
// 48h. Mondays (or ?report=1): the weekly email.
export async function GET(request: NextRequest) {
  if (!cronAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const out: Record<string, unknown> = {};
  try {
    await connectDB();
    const now = Date.now();
    const recent = await ThumbnailTest.find({ createdAt: { $gte: new Date(now - 45 * DAY) } }, { videoId: 1, createdAt: 1 });
    if (recent.length) {
      const start = crDate(Math.min(...recent.map((t) => t.createdAt.getTime())));
      out.views = await refreshViews(recent.map((t) => t.videoId), start, crDate(now));
    }
    out.reach = await refreshReach();
    out.rethumbnailed = await rethumbnailLosers(now);

    const monday = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Costa_Rica', weekday: 'short' }).format(now) === 'Mon';
    if (monday || request.nextUrl.searchParams.get('report') === '1') out.report = await weeklyReport(now);
    return NextResponse.json({ status: 'completed', ...out });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ thumbnail-metrics:', message);
    return NextResponse.json({ status: 'failed', error: message, ...out }, { status: 500 });
  }
}

async function rethumbnailLosers(now: number) {
  const losers = await ThumbnailTest.find({
    kind: { $in: ['short', 'best'] },
    generation: 1,
    createdAt: { $lte: new Date(now - RETHUMB_AFTER) },
    impressions: { $gte: RETHUMB_MIN_IMPRESSIONS },
    ctr: { $lt: RETHUMB_BELOW },
  }).limit(RETHUMB_PER_RUN);

  const done = [];
  for (const test of losers) {
    if (!test.clipId) continue;
    // Next style: the best-performing one this video hasn't tried, else the next unused one.
    const stats = await styleStats(test.kind as ThumbKind);
    const tried = new Set(test.history.map((h: { style: string }) => h.style));
    const options = ROTATING_STYLES.filter((s) => !tried.has(s));
    if (!options.length) continue;
    const style = [...options].sort((a, b) => (stats.find((s) => s.style === b)?.ctr ?? 0) - (stats.find((s) => s.style === a)?.ctr ?? 0))[0];
    try {
      const clip = await downloadClip(test.clipId);
      const r = await thumbnailVideo({
        videoId: test.videoId, kind: test.kind as ThumbKind, clipId: test.clipId, clip,
        report: (test.report as SurfReport | null) ?? null, at: test.createdAt.getTime(), title: test.title,
        style: style as ThumbStyle, reason: `ctr ${(100 * (test.ctr ?? 0)).toFixed(1)}% < 2% at 48h`,
      });
      done.push({ videoId: test.videoId, from: test.style, to: style, result: r });
    } catch (err) {
      done.push({ videoId: test.videoId, error: err instanceof Error ? err.message : String(err) });
    }
  }
  return done;
}

const pct = (x: number | null | undefined) => (x == null ? '—' : `${(100 * x).toFixed(2)}%`);

async function weeklyReport(now: number) {
  const week = new Date(now - 7 * DAY);
  const measured = { impressions: { $gte: MIN_IMPRESSIONS } };
  const [styleWeek, styleAll, liveWeek, top, bottom, texts] = await Promise.all([
    styleStats('short', week),
    styleStats('short'),
    styleStats('live', week),
    ThumbnailTest.find({ ...measured, createdAt: { $gte: new Date(now - 30 * DAY) } }).sort({ ctr: -1 }).limit(5),
    ThumbnailTest.find({ ...measured, createdAt: { $gte: new Date(now - 30 * DAY) } }).sort({ ctr: 1 }).limit(5),
    ThumbnailTest.aggregate([
      { $match: { ...measured, kind: { $in: ['short', 'best'] } } },
      { $group: { _id: '$text', videos: { $sum: 1 }, impressions: { $sum: '$impressions' }, clicks: { $sum: { $multiply: ['$impressions', '$ctr'] } } } },
      { $project: { videos: 1, impressions: 1, ctr: { $divide: ['$clicks', '$impressions'] } } },
      { $sort: { ctr: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const styleRows = (rows: typeof styleWeek) =>
    rows.map((s) => `<tr><td>${s.style}</td><td>${s.videos}</td><td>${s.impressions}</td><td><b>${pct(s.ctr)}</b></td></tr>`).join('');
  const videoRows = (rows: typeof top) =>
    rows
      .map((t) => `<tr><td><a href="https://youtu.be/${t.videoId}">${t.title}</a></td><td>${t.style}</td><td>${t.text}</td><td>${t.impressions}</td><td><b>${pct(t.ctr)}</b></td></tr>`)
      .join('');
  const table = (head: string[], body: string) =>
    `<table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:13px"><tr>${head.map((h) => `<th align="left">${h}</th>`).join('')}</tr>${body}</table>`;

  const html = `
    <h2 style="font-family:sans-serif">Miniaturas · semana al ${crDate(now)}</h2>
    <h3 style="font-family:sans-serif">CTR por estilo — Shorts (7 días)</h3>${table(['Estilo', 'Videos', 'Impresiones', 'CTR'], styleRows(styleWeek))}
    <h3 style="font-family:sans-serif">CTR por estilo — Shorts (histórico)</h3>${table(['Estilo', 'Videos', 'Impresiones', 'CTR'], styleRows(styleAll))}
    <h3 style="font-family:sans-serif">CTR por estilo — live (7 días)</h3>${table(['Estilo', 'Días', 'Impresiones', 'CTR'], styleRows(liveWeek))}
    <h3 style="font-family:sans-serif">Top 5 (30 días)</h3>${table(['Video', 'Estilo', 'Texto', 'Impr.', 'CTR'], videoRows(top))}
    <h3 style="font-family:sans-serif">Peores 5 (30 días)</h3>${table(['Video', 'Estilo', 'Texto', 'Impr.', 'CTR'], videoRows(bottom))}
    <h3 style="font-family:sans-serif">Textos que mejor funcionaron</h3>${table(['Texto', 'Videos', 'Impr.', 'CTR'], texts.map((x: { _id: string; videos: number; impressions: number; ctr: number }) => `<tr><td>${x._id}</td><td>${x.videos}</td><td>${x.impressions}</td><td><b>${pct(x.ctr)}</b></td></tr>`).join(''))}
    <p style="font-family:sans-serif;font-size:12px;color:#666">Solo cuentan videos con ${MIN_IMPRESSIONS}+ impresiones. Fuente: YouTube Reporting API (alcance) y Analytics API.</p>`;

  await SiteConfig.findOneAndUpdate(
    { key: 'thumbnail_report' },
    { key: 'thumbnail_report', value: JSON.stringify({ at: now, styleWeek, styleAll, liveWeek }), description: 'Latest weekly thumbnail report' },
    { upsert: true },
  );

  const { GMAIL_USER, GMAIL_PASS } = process.env;
  if (!GMAIL_USER || !GMAIL_PASS) return { emailed: false, reason: 'GMAIL_USER/GMAIL_PASS not set' };
  await nodemailer
    .createTransport({ service: 'gmail', auth: { user: GMAIL_USER, pass: GMAIL_PASS } })
    .sendMail({ from: GMAIL_USER, to: process.env.NOTIFICATION_EMAIL || GMAIL_USER, subject: `📊 Miniaturas SurfCam · semana al ${crDate(now)}`, html });
  return { emailed: true };
}
