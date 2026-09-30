import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { cronAuthorized } from '@/lib/cron';
import { getAppToken, getUserToken, getLiveStream, createClip, waitForClip, downloadClip } from '@/lib/twitch';
import { analyzeBuffer, recordClipScore } from '@/lib/thumb-pipeline';

export const maxDuration = 300;

// Samples the day: cuts a clip, scores its action and stores it. Nothing is uploaded here;
// best-wave picks the day's winner in the afternoon.
export async function GET(request: NextRequest) {
  if (!cronAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const appToken = await getAppToken();
    if (!(await getLiveStream(appToken))) return NextResponse.json({ status: 'skipped', reason: 'Twitch stream is not live' });

    const at = Date.now();
    const clipId = await createClip(await getUserToken());
    const clip = await waitForClip(appToken, clipId);
    const analysis = analyzeBuffer(await downloadClip(clipId));
    await connectDB();
    await recordClipScore({ clipId, clipUrl: clip.url, source: 'score', analysis, at });
    return NextResponse.json({ status: 'completed', clipId, best: analysis.best });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ score-clip:', message);
    return NextResponse.json({ status: 'failed', error: message }, { status: 500 });
  }
}
