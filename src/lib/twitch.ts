// Twitch Helix helpers for the clip → Short pipeline. create-clip/route.ts keeps its own
// older copies; new code should import from here.

const CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!;
const BROADCASTER_ID = process.env.TWITCH_BROADCASTER_ID!;
const USER_REFRESH_TOKEN = process.env.TWITCH_USER_REFRESH_TOKEN!;

export interface TwitchStream {
  id: string;
  user_login: string;
  title: string;
  started_at: string;
  viewer_count: number;
}

export interface TwitchClipInfo {
  id: string;
  url: string;
  title: string;
  duration: number;
  created_at: string;
  thumbnail_url: string;
}

function helixHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, 'Client-Id': CLIENT_ID };
}

async function tokenRequest(body: Record<string, string>): Promise<string> {
  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, ...body }),
  });
  if (!res.ok) throw new Error(`Twitch token request failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.access_token as string;
}

// App token: read-only calls (stream status, clip lookup).
export function getAppToken() {
  return tokenRequest({ grant_type: 'client_credentials' });
}

// User token with clips:edit. The stored access token is long expired, so mint a fresh
// one from the refresh token every run - Twitch keeps the refresh token valid for
// confidential apps, which is why this pipeline has kept working for months.
export function getUserToken() {
  return tokenRequest({ grant_type: 'refresh_token', refresh_token: USER_REFRESH_TOKEN });
}

export async function getLiveStream(appToken: string): Promise<TwitchStream | null> {
  const res = await fetch(`https://api.twitch.tv/helix/streams?user_id=${BROADCASTER_ID}`, {
    headers: helixHeaders(appToken),
  });
  if (!res.ok) throw new Error(`Stream check failed: ${res.status}`);
  const data = await res.json();
  return data.data?.[0] ?? null;
}

export async function createClip(userToken: string): Promise<string> {
  const res = await fetch(`https://api.twitch.tv/helix/clips?broadcaster_id=${BROADCASTER_ID}`, {
    method: 'POST',
    headers: helixHeaders(userToken),
  });
  if (!res.ok) throw new Error(`Create clip failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const id = data.data?.[0]?.id;
  if (!id) throw new Error('Create clip returned no id');
  return id;
}

// Helix returns nothing for a clip until Twitch finishes processing it (~10-20s).
export async function waitForClip(
  appToken: string,
  clipId: string,
  { timeoutMs = 45_000, intervalMs = 3_000 } = {},
): Promise<TwitchClipInfo> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const res = await fetch(`https://api.twitch.tv/helix/clips?id=${clipId}`, {
      headers: helixHeaders(appToken),
    });
    if (!res.ok) throw new Error(`Clip lookup failed: ${res.status}`);
    const data = await res.json();
    const clip = data.data?.[0];
    if (clip) return clip;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Clip ${clipId} not ready after ${timeoutMs / 1000}s`);
}

// Helix lists a clip a few seconds before its MP4 lands on the CDN, so a download right
// after waitForClip can 404 (seen in prod: Helix at ~8s, asset not there yet). Retry on
// exactly the two failures that mean "not ready yet".
export async function downloadClip(
  slug: string,
  { attempts = 6, intervalMs = 3_000 } = {},
): Promise<Buffer> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fetchClipMp4(slug);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const notReadyYet = msg.includes('404') || msg.includes('No video data');
      if (!notReadyYet || attempt >= attempts) throw err;
      console.log(`⏳ Clip asset not ready (attempt ${attempt}/${attempts}): ${msg}`);
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }
}

// Twitch's undocumented GQL endpoint hands out a signed MP4 URL for any public clip.
// Same query the web player uses; the client id is Twitch's own public web client.
async function fetchClipMp4(slug: string): Promise<Buffer> {
  const gqlRes = await fetch('https://gql.twitch.tv/gql', {
    method: 'POST',
    headers: { 'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operationName: 'VideoAccessToken_Clip',
      variables: { slug },
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: '36b89d2507fce29e5ca551df756d27c1cfe079e2609642b4390aa4c35796eb11',
        },
      },
    }),
  });
  if (!gqlRes.ok) throw new Error(`GQL request failed: ${gqlRes.status}`);

  const clip = (await gqlRes.json())?.data?.clip;
  if (!clip?.playbackAccessToken || !clip?.videoQualities?.length) {
    throw new Error('No video data in GQL response');
  }

  const token = encodeURIComponent(clip.playbackAccessToken.value);
  const sig = clip.playbackAccessToken.signature;
  const url = `${clip.videoQualities[0].sourceURL}?sig=${sig}&token=${token}`;

  const videoRes = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Accept: 'video/mp4,video/*,*/*',
    },
  });
  if (!videoRes.ok) throw new Error(`Clip download failed: ${videoRes.status}`);

  const buffer = Buffer.from(await videoRes.arrayBuffer());
  const magic = buffer.subarray(4, 8).toString('ascii');
  if (!['ftyp', 'moov', 'mdat'].includes(magic)) {
    throw new Error(`Downloaded file is not an MP4 (magic: ${magic})`);
  }
  return buffer;
}

// ---- VOD access, for the sunset Short (cut after the fact, not clipped live) ----

export interface Archive {
  id: string;
  createdAt: number;
  durationS: number;
}

export interface VodSegment {
  vodId: string;
  index: number; // media sequence number; consecutive segments differ by 1
  at: number; // wall clock (PROGRAM-DATE-TIME), epoch ms
  offsetS: number; // position in the VOD, for a ?t= link
  durationS: number;
  url: string;
}

// The 24/7 stream is archived in 48h VODs that roll over around 00:08 UTC. The newest one
// is still recording, and its playlist trails live by only ~10 s.
export async function recentArchives(appToken: string, count = 3): Promise<Archive[]> {
  const res = await fetch(`https://api.twitch.tv/helix/videos?user_id=${BROADCASTER_ID}&type=archive&first=${count}`, {
    headers: helixHeaders(appToken),
  });
  if (!res.ok) throw new Error(`Archive lookup failed: ${res.status}`);
  const data = (await res.json()) as { data: { id: string; created_at: string; duration: string }[] };
  return data.data.map((v) => {
    const [, h = '0', m = '0', s = '0'] = v.duration.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/) ?? [];
    return { id: v.id, createdAt: Date.parse(v.created_at), durationS: +h * 3600 + +m * 60 + +s };
  });
}

// Usher only offers these VODs as audio_only, but the source rendition ("chunked", the cam's
// full 2560x1440) sits on the CDN next to the storyboards whose URL GQL hands out.
export async function vodSegments(vodId: string): Promise<VodSegment[]> {
  const gql = await fetch('https://gql.twitch.tv/gql', {
    method: 'POST',
    headers: { 'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko', 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: `{ video(id: "${vodId}") { seekPreviewsURL } }` }),
  }).then((r) => r.json());
  const previews: string | undefined = gql?.data?.video?.seekPreviewsURL;
  if (!previews) throw new Error(`No CDN path for VOD ${vodId}`);
  const base = previews.replace(/\/storyboards\/.*$/, '/chunked/');

  const res = await fetch(`${base}index-dvr.m3u8`);
  if (!res.ok) throw new Error(`VOD ${vodId} playlist: ${res.status}`);
  const segments: VodSegment[] = [];
  let offsetS = 0, at = 0, durationS = 0;
  for (const line of (await res.text()).split('\n').map((l) => l.trim())) {
    if (line.startsWith('#EXT-X-TWITCH-ELAPSED-SECS:')) offsetS = parseFloat(line.split(':')[1]);
    else if (line.startsWith('#EXT-X-PROGRAM-DATE-TIME:')) at = Date.parse(line.slice(25));
    else if (line.startsWith('#EXTINF:')) durationS = parseFloat(line.slice(8));
    else if (line && !line.startsWith('#')) {
      segments.push({ vodId, index: parseInt(line, 10), at, offsetS, durationS, url: base + line });
      offsetS += durationS;
      at += durationS * 1000; // overwritten by the next PROGRAM-DATE-TIME when there is one
    }
  }
  return segments;
}

// Just the head of a segment: its leading I-frame (350-700 KB of ~8 MB at 1440p) is enough
// for one frame. A short read still decodes, with the bottom rows smeared, so leave room.
export async function segmentHead(url: string, bytes = 1_000_000): Promise<Buffer> {
  const res = await fetch(url, { headers: { Range: `bytes=0-${bytes - 1}` } });
  if (!res.ok) throw new Error(`Segment head ${res.status}: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

export async function downloadSegments(urls: string[]): Promise<Buffer> {
  const parts = await Promise.all(
    urls.map(async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Segment ${res.status}: ${url}`);
      return Buffer.from(await res.arrayBuffer());
    }),
  );
  return Buffer.concat(parts); // MPEG-TS segments of one stream concatenate byte for byte
}

export const vodLink = (s: VodSegment) => {
  const t = Math.floor(s.offsetS);
  return `https://www.twitch.tv/videos/${s.vodId}?t=${Math.floor(t / 3600)}h${Math.floor((t % 3600) / 60)}m${t % 60}s`;
};
