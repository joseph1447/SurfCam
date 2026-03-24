import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID!;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET!;
const YOUTUBE_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN!;
const CHANNEL_ID = process.env.NEXT_PUBLIC_YT_CHANNEL_ID || 'UCa4397KS7YBwp7pkA8B5J6g';

// Simple in-memory cache: 5 minutes
let cache: { videoId: string | null; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export const revalidate = 300; // Next.js cache: 5 min

export async function GET() {
  // Return cached result if still fresh
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json({ videoId: cache.videoId, cached: true });
  }

  try {
    const auth = new google.auth.OAuth2(YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET);
    auth.setCredentials({ refresh_token: YOUTUBE_REFRESH_TOKEN });

    const youtube = google.youtube({ version: 'v3', auth });

    const res = await youtube.search.list({
      part: ['id', 'snippet'],
      channelId: CHANNEL_ID,
      eventType: 'live',
      type: ['video'],
      maxResults: 1,
    });

    const items = res.data.items;
    const videoId = items && items.length > 0 ? (items[0].id?.videoId ?? null) : null;

    cache = { videoId, timestamp: Date.now() };

    return NextResponse.json({ videoId, live: !!videoId });
  } catch (error) {
    console.error('[youtube-live] Error fetching live stream:', error);
    // Return cached value even if stale on error
    if (cache) {
      return NextResponse.json({ videoId: cache.videoId, cached: true, stale: true });
    }
    return NextResponse.json({ videoId: null, error: 'Failed to fetch live stream' }, { status: 200 });
  }
}
