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
