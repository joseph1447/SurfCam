import { NextRequest, NextResponse } from 'next/server';

const CRON_SECRET = process.env.CRON_SECRET;
const REFRESH_TOKEN = process.env.RESTREAM_WEB_REFRESH_TOKEN!;
const REFRESH_XSRF = process.env.RESTREAM_WEB_REFRESH_XSRF!;

// YouTube channels to toggle: malpaisurfcam + joseph quesada (Twitch excluded)
const CHANNEL_IDS = (process.env.RESTREAM_CHANNEL_IDS || '17321915,16098113')
  .split(',')
  .map((id) => Number(id.trim()))
  .filter(Boolean);

const WEB_BACKEND = 'https://website-backend.restream.io';
const EVENTS_BACKEND = 'https://backend.events.restream.io';

interface WebSession {
  accessToken: string;
  xsrf: string; // url-encoded xsrfToken from the access JWT
  userId: number;
}

// Mint a fresh 5-min access token from the long-lived web refresh token.
async function getWebSession(): Promise<WebSession> {
  const res = await fetch(`${WEB_BACKEND}/v2/public/refresh/refreshAccessToken`, {
    method: 'GET',
    headers: {
      Cookie: `refreshToken=${REFRESH_TOKEN}; refreshXsrfToken=${REFRESH_XSRF}`,
      'x-xsrf-rtoken': REFRESH_XSRF,
      Origin: 'https://app.restream.io',
    },
  });

  if (!res.ok) {
    throw new Error(`Web token refresh failed: HTTP ${res.status}`);
  }

  const setCookies = res.headers.getSetCookie?.() ?? [];
  const accessToken = setCookies
    .find((c) => c.startsWith('accessToken='))
    ?.split(';')[0]
    ?.slice('accessToken='.length);

  if (!accessToken) {
    throw new Error('No accessToken cookie in refresh response');
  }

  const payload = JSON.parse(
    Buffer.from(accessToken.split('.')[1], 'base64').toString('utf8')
  );

  return {
    accessToken,
    xsrf: encodeURIComponent(payload.xsrfToken),
    userId: payload.user.id,
  };
}

function authHeaders(s: WebSession): Record<string, string> {
  return {
    Cookie: `accessToken=${s.accessToken}; accessXsrfToken=${s.xsrf}`,
    'x-axsrf-token': s.xsrf,
    Origin: 'https://app.restream.io',
  };
}

// The live stream runs as an "event"; find the one whose session is still open.
async function getActiveEventId(s: WebSession): Promise<string | null> {
  const res = await fetch(
    `${WEB_BACKEND}/v2/api/stream-analytics/streaming-sessions?userId=${s.userId}`,
    { headers: authHeaders(s) }
  );
  if (!res.ok) throw new Error(`streaming-sessions failed: HTTP ${res.status}`);

  const body = await res.json();
  const active = (body.data ?? []).find((sess: { till: number }) => sess.till === 0);
  return active?.eventId ?? null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  if (CRON_SECRET) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const { action } = await params;
  if (action !== 'on' && action !== 'off') {
    return NextResponse.json(
      { error: 'Action must be "on" or "off"' },
      { status: 400 }
    );
  }

  const verb = action === 'on' ? 'enable' : 'disable';

  try {
    const session = await getWebSession();
    const eventId = await getActiveEventId(session);

    if (!eventId) {
      return NextResponse.json(
        {
          success: false,
          action,
          message: 'No active streaming session found (camera not sending?)',
        },
        { status: 409 }
      );
    }

    const results = await Promise.all(
      CHANNEL_IDS.map(async (channelId) => {
        const res = await fetch(
          `${EVENTS_BACKEND}/events/${eventId}/channels/${channelId}/${verb}`,
          {
            method: 'POST',
            headers: { ...authHeaders(session), 'Content-Type': 'application/json' },
            body: '{}',
          }
        );
        return { channelId, ok: res.ok, status: res.status };
      })
    );

    const failed = results.filter((r) => !r.ok);
    console.log(`[restream-toggle] ${verb} on event ${eventId}:`, results);

    return NextResponse.json(
      { success: failed.length === 0, action, eventId, results },
      { status: failed.length === 0 ? 200 : 502 }
    );
  } catch (error) {
    console.error('[restream-toggle] Error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle Restream destinations' },
      { status: 500 }
    );
  }
}
