import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SiteConfig from '@/models/SiteConfig';
import { cronAuthorized } from '@/lib/cron';
import { youtubeClient } from '@/lib/shorts';
import { getDayOutlook } from '@/lib/conditions';
import { chatNow, chatSchedule } from '@/lib/copy';

// Hourly while the live is up (5:30am–6:30pm Costa Rica): a message in the broadcast's chat
// so it never looks abandoned. The day plan goes out at these Costa Rica hours, the
// conditions right now every other hour. ?kind=schedule|now forces one; ?dry=1 only
// returns the text. Quota: 1 (videos.list) + 50 (insert) per post.
const SCHEDULE_HOURS = [5, 9, 13, 16];

export async function GET(request: NextRequest) {
  if (!cronAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const params = request.nextUrl.searchParams;

  try {
    const at = Date.now();
    const crHour = new Date(at - 6 * 3_600_000).getUTCHours();
    const kind = params.get('kind') ?? (SCHEDULE_HOURS.includes(crHour) ? 'schedule' : 'now');
    const outlook = await getDayOutlook(at);
    const text = kind === 'schedule' ? chatSchedule(outlook) : chatNow(outlook, at);
    if (params.get('dry') === '1') return NextResponse.json({ status: 'dry-run', kind, text, length: Array.from(text).length });

    await connectDB();
    // Kept current by refresh-live-video, same as live-thumbnail.
    const videoId = (await SiteConfig.findOne({ key: 'youtube_video_id' }))?.value;
    if (!videoId) return NextResponse.json({ status: 'skipped', reason: 'no youtube_video_id in site config' });

    const yt = youtubeClient();
    const video = (await yt.videos.list({ part: ['liveStreamingDetails'], id: [videoId] })).data.items?.[0];
    const liveChatId = video?.liveStreamingDetails?.activeLiveChatId;
    if (!liveChatId) return NextResponse.json({ status: 'skipped', reason: `video ${videoId} has no active chat` });

    const res = await yt.liveChatMessages.insert({
      part: ['snippet'],
      requestBody: { snippet: { liveChatId, type: 'textMessageEvent', textMessageDetails: { messageText: text } } },
    });
    return NextResponse.json({ status: 'completed', kind, videoId, messageId: res.data.id, text });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ live-chat:', message);
    return NextResponse.json({ status: 'failed', error: message }, { status: 500 });
  }
}
