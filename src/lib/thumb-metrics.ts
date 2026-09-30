// Pulls performance for every tracked video. Views and watch % come from the Analytics API;
// thumbnail impressions and CTR only exist in the Reporting API's daily reach report
// (channel_reach_basic_a1), which needs the yt-analytics.readonly scope.
import SiteConfig from '@/models/SiteConfig';
import ThumbnailTest from '@/models/ThumbnailTest';
import { youtubeAuth } from '@/lib/shorts';

const REPORTING = 'https://youtubereporting.googleapis.com/v1';
const CURSOR_KEY = 'reach_report_cursor';
const JOB_KEY = 'reach_report_job';

async function token() {
  const { token } = await youtubeAuth().getAccessToken();
  if (!token) throw new Error('No YouTube access token');
  return token;
}

async function api(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, headers: { Authorization: `Bearer ${await token()}`, ...(init?.headers ?? {}) } });
  const text = await res.text();
  if (!res.ok) throw Object.assign(new Error(`${res.status} ${text.slice(0, 200)}`), { status: res.status });
  return text;
}

async function setConfig(key: string, value: string, description: string) {
  await SiteConfig.findOneAndUpdate({ key }, { key, value, description }, { upsert: true });
}

export async function refreshViews(videoIds: string[], startDate: string, endDate: string) {
  let updated = 0;
  for (let i = 0; i < videoIds.length; i += 150) {
    const ids = videoIds.slice(i, i + 150);
    const url =
      `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=${startDate}&endDate=${endDate}` +
      `&metrics=views,averageViewPercentage&dimensions=video&filters=video==${ids.join(',')}`;
    const data = JSON.parse(await api(url));
    for (const [videoId, views, avg] of (data.rows ?? []) as [string, number, number][]) {
      await ThumbnailTest.updateOne({ videoId }, { views, avgViewPct: Math.round(avg * 10) / 10, metricsAt: new Date() });
      updated++;
    }
  }
  return updated;
}

async function reachJob(): Promise<string> {
  const saved = (await SiteConfig.findOne({ key: JOB_KEY }))?.value;
  if (saved) return saved;
  const types = JSON.parse(await api(`${REPORTING}/reportTypes`)).reportTypes ?? [];
  const type = types.find((t: { id: string }) => t.id === 'channel_reach_basic_a1') ?? types.find((t: { id: string }) => t.id.startsWith('channel_reach'));
  if (!type) throw new Error('No channel reach report type available for this channel');
  const jobs = JSON.parse(await api(`${REPORTING}/jobs`)).jobs ?? [];
  const job =
    jobs.find((j: { reportTypeId: string }) => j.reportTypeId === type.id) ??
    JSON.parse(await api(`${REPORTING}/jobs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reportTypeId: type.id, name: 'surfcam-thumbnail-reach' }) }));
  await setConfig(JOB_KEY, job.id, `YouTube Reporting job for ${type.id}`);
  return job.id;
}

// Each daily CSV is split by country/subscribed/traffic; fold it to one number per video/day.
function parseReach(csv: string) {
  const [header, ...lines] = csv.trim().split(/\r?\n/);
  const cols = header.split(',');
  const at = (name: string) => cols.indexOf(name);
  const [iDate, iVideo, iImp, iCtr] = ['date', 'video_id', 'video_thumbnail_impressions', 'video_thumbnail_impressions_ctr'].map(at);
  if ([iDate, iVideo, iImp, iCtr].some((i) => i < 0)) throw new Error(`Unexpected reach columns: ${header}`);
  const agg = new Map<string, { date: string; videoId: string; impressions: number; clicks: number }>();
  for (const line of lines) {
    const c = line.split(',');
    const d = c[iDate];
    const date = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
    const key = `${c[iVideo]}|${date}`;
    const imp = Number(c[iImp]) || 0;
    const row = agg.get(key) ?? { date, videoId: c[iVideo], impressions: 0, clicks: 0 };
    row.impressions += imp;
    row.clicks += imp * (Number(c[iCtr]) || 0);
    agg.set(key, row);
  }
  return [...agg.values()];
}

export async function refreshReach(): Promise<{ status: string; reports?: number; rows?: number }> {
  let jobId: string;
  try {
    jobId = await reachJob();
  } catch (err) {
    if ((err as { status?: number }).status === 403) return { status: 'needs-reauth (yt-analytics.readonly scope missing)' };
    throw err;
  }
  const cursor = (await SiteConfig.findOne({ key: CURSOR_KEY }))?.value;
  const list = JSON.parse(await api(`${REPORTING}/jobs/${jobId}/reports${cursor ? `?createdAfter=${encodeURIComponent(cursor)}` : ''}`));
  const reports: { createTime: string; downloadUrl: string }[] = (list.reports ?? []).sort((a: { createTime: string }, b: { createTime: string }) => a.createTime.localeCompare(b.createTime));
  if (!reports.length) return { status: 'no new reports (the first ones arrive ~48h after the job is created)' };

  const tracked = new Set((await ThumbnailTest.find({}, { videoId: 1 })).map((t) => t.videoId));
  const touched = new Set<string>();
  let rows = 0;
  for (const report of reports) {
    for (const r of parseReach(await api(report.downloadUrl))) {
      if (!tracked.has(r.videoId) || !r.impressions) continue;
      await ThumbnailTest.updateOne({ videoId: r.videoId }, { $set: { [`daily.${r.date}`]: { impressions: r.impressions, ctr: r.clicks / r.impressions } } });
      touched.add(r.videoId);
      rows++;
    }
    await setConfig(CURSOR_KEY, report.createTime, 'Last processed YouTube reach report');
  }

  // Totals from the per-day map, so re-processing a report never double counts.
  for (const test of await ThumbnailTest.find({ videoId: { $in: [...touched] } })) {
    let impressions = 0, clicks = 0;
    for (const d of test.daily.values()) {
      impressions += d.impressions;
      clicks += d.impressions * d.ctr;
    }
    if (impressions) await ThumbnailTest.updateOne({ _id: test._id }, { impressions, ctr: clicks / impressions, metricsAt: new Date() });
  }
  return { status: 'ok', reports: reports.length, rows };
}
