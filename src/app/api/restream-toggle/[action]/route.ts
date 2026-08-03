import { NextRequest, NextResponse } from 'next/server';

const RESTREAM_CLIENT_ID = process.env.RESTREAM_CLIENT_ID!;
const RESTREAM_CLIENT_SECRET = process.env.RESTREAM_CLIENT_SECRET!;
const RESTREAM_REFRESH_TOKEN = process.env.RESTREAM_REFRESH_TOKEN!;
const CRON_SECRET = process.env.CRON_SECRET;

// YouTube channels: malpaisurfcam + joseph quesada
const CHANNEL_IDS = (process.env.RESTREAM_CHANNEL_IDS || '17321915,16098113')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);

async function getAccessToken(): Promise<string> {
  const basicAuth = Buffer.from(
    `${RESTREAM_CLIENT_ID}:${RESTREAM_CLIENT_SECRET}`
  ).toString('base64');

  const res = await fetch('https://api.restream.io/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: RESTREAM_REFRESH_TOKEN,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Token refresh failed: ${JSON.stringify(data)}`);
  }
  return data.access_token;
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

  const active = action === 'on';

  try {
    const accessToken = await getAccessToken();

    const results = await Promise.all(
      CHANNEL_IDS.map(async (id) => {
        const res = await fetch(
          `https://api.restream.io/v2/user/channel/${id}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ active }),
          }
        );
        return { channelId: id, ok: res.ok, status: res.status };
      })
    );

    const failed = results.filter((r) => !r.ok);
    console.log(`[restream-toggle] Set channels ${action}:`, results);

    return NextResponse.json(
      {
        success: failed.length === 0,
        action,
        results,
      },
      { status: failed.length === 0 ? 200 : 502 }
    );
  } catch (error) {
    console.error('[restream-toggle] Error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle Restream channels' },
      { status: 500 }
    );
  }
}
