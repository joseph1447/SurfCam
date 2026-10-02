// Publishes a finished Short as an Instagram Reel on @eltrillo_santateresa via the
// Instagram Login API (no Facebook Page involved). Meta pulls the MP4 from a public URL,
// so the file goes to Vercel Blob first.
import { put, del } from '@vercel/blob';
import connectDB from '@/lib/mongodb';
import SiteConfig from '@/models/SiteConfig';

const IG = 'https://graph.instagram.com/v21.0';
const TOKEN_KEY = 'instagram_access_token';

// The token is a 60-day Instagram Login token. We refresh it on every publish once it's
// over a week old; the refreshed value lives in SiteConfig so the Vercel env only has to
// be right once.
async function token(): Promise<string> {
  await connectDB();
  const saved = await SiteConfig.findOne({ key: TOKEN_KEY });
  const current = saved?.value || process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  if (!current) throw new Error('INSTAGRAM_ACCESS_TOKEN not configured');
  const ageDays = saved ? (Date.now() - saved.updatedAt.getTime()) / 86_400_000 : Infinity;
  if (ageDays < 7) return current;

  const r = (await fetch(`${IG}/refresh_access_token?grant_type=ig_refresh_token&access_token=${current}`).then((x) => x.json())) as {
    access_token?: string; expires_in?: number; error?: { message: string };
  };
  // A failed refresh isn't fatal while the current token still works.
  if (!r.access_token) {
    console.warn('⚠️ IG token refresh failed:', r.error?.message);
    return current;
  }
  await SiteConfig.findOneAndUpdate(
    { key: TOKEN_KEY },
    { key: TOKEN_KEY, value: r.access_token, description: `Instagram Login token, expires ${new Date(Date.now() + (r.expires_in ?? 0) * 1000).toISOString().slice(0, 10)}` },
    { upsert: true },
  );
  return r.access_token;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface ReelResult {
  mediaId: string;
  permalink: string;
}

export async function publishReel(opts: {
  video: Buffer;
  caption: string;
  thumbnailOffsetMs?: number;
  name: string;
}): Promise<ReelResult> {
  const t = await token();
  const userId = process.env.INSTAGRAM_USER_ID?.trim();
  if (!userId) throw new Error('INSTAGRAM_USER_ID not configured');

  // Public, unguessable URL; deleted once Instagram has ingested it.
  const blob = await put(`reels/${opts.name}.mp4`, opts.video, { access: 'public', contentType: 'video/mp4', addRandomSuffix: true });
  try {
    const create = (await fetch(`${IG}/${userId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        media_type: 'REELS',
        video_url: blob.url,
        caption: opts.caption.slice(0, 2200),
        share_to_feed: 'true',
        ...(opts.thumbnailOffsetMs != null ? { thumb_offset: String(opts.thumbnailOffsetMs) } : {}),
        access_token: t,
      }),
    }).then((r) => r.json())) as { id?: string; error?: { message: string } };
    if (!create.id) throw new Error(`IG create container: ${create.error?.message ?? 'no id'}`);

    // Video containers take a while (Meta transcodes); poll up to ~4 minutes.
    let status = 'IN_PROGRESS';
    for (let i = 0; i < 48 && status !== 'FINISHED'; i++) {
      await sleep(5_000);
      const s = (await fetch(`${IG}/${create.id}?fields=status_code,status&access_token=${t}`).then((r) => r.json())) as { status_code?: string; status?: string };
      status = s.status_code ?? status;
      if (status === 'ERROR' || status === 'EXPIRED') throw new Error(`IG container ${status}: ${s.status ?? ''}`);
    }
    if (status !== 'FINISHED') throw new Error(`IG container not ready (last status ${status})`);

    const pub = (await fetch(`${IG}/${userId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ creation_id: create.id, access_token: t }),
    }).then((r) => r.json())) as { id?: string; error?: { message: string } };
    if (!pub.id) throw new Error(`IG publish: ${pub.error?.message ?? 'no id'}`);

    const perm = (await fetch(`${IG}/${pub.id}?fields=permalink&access_token=${t}`).then((r) => r.json())) as { permalink?: string };
    return { mediaId: pub.id, permalink: perm.permalink ?? `https://www.instagram.com/reel/${pub.id}/` };
  } finally {
    await del(blob.url).catch(() => undefined);
  }
}
