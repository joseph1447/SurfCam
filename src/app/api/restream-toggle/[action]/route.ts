import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getRestreamAccessToken, RestreamMcp } from '@/lib/restream';

const CRON_SECRET = process.env.CRON_SECRET;

// YouTube channels to toggle: malpaisurfcam + joseph quesada (Twitch stays on for Shorts)
const CHANNEL_IDS = (process.env.RESTREAM_CHANNEL_IDS || '17321915,16098113')
  .split(',')
  .map((id) => Number(id.trim()))
  .filter(Boolean);

interface RestreamEvent {
  id: string;
  title: string;
  description: string;
}

async function sendFailureAlert(action: string, detail: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
  });
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: process.env.NOTIFICATION_EMAIL || process.env.GMAIL_USER,
    subject: `⚠️ SurfCam: falló el ${action === 'on' ? 'encendido' : 'apagado'} de la transmisión`,
    text: `El cron /api/restream-toggle/${action} falló:\n\n${detail}\n\nRevisar el token OAuth en la colección restreamauth.`,
  });
}

async function toggle(action: 'on' | 'off') {
  const mcp = new RestreamMcp(await getRestreamAccessToken());
  await mcp.connect();

  const { events } = await mcp.call<{ events: RestreamEvent[] }>('list_user_events', {
    status: 'in_progress',
  });
  const event = events[0];
  if (!event) return null;

  const { destinations } = await mcp.call<{ destinations: { channelId: number }[] }>(
    'list_event_destinations',
    { eventId: event.id }
  );
  const connected = new Set(destinations.map((d) => d.channelId));

  const results = [];
  for (const channelId of CHANNEL_IDS) {
    if ((action === 'on') === connected.has(channelId)) {
      results.push({ channelId, skipped: true });
      continue;
    }
    if (action === 'off') {
      await mcp.call('toggle_event_channel_off', { eventId: event.id, channelId });
    } else {
      await mcp.call('toggle_event_channel_on', {
        eventId: event.id,
        channelId,
        payload: {
          platform: 'YouTube',
          title: event.title,
          description: event.description,
          privacy: 'public',
        },
      });
    }
    results.push({ channelId, ok: true });
  }
  return { eventId: event.id, results };
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

  try {
    const outcome = await toggle(action);
    if (!outcome) {
      const message = 'No in-progress Restream event (camera not sending?)';
      await sendFailureAlert(action, message).catch(() => {});
      return NextResponse.json({ success: false, action, message }, { status: 409 });
    }

    console.log(`[restream-toggle] ${action}:`, outcome);
    return NextResponse.json({ success: true, action, ...outcome });
  } catch (error) {
    console.error('[restream-toggle] Error:', error);
    await sendFailureAlert(action, String(error)).catch((e) =>
      console.error('[restream-toggle] Alert email failed:', e)
    );
    return NextResponse.json(
      { error: 'Failed to toggle Restream destinations' },
      { status: 500 }
    );
  }
}
