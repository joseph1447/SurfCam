import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID!;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET!;
const YOUTUBE_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN!;
const CHANNEL_ID = process.env.NEXT_PUBLIC_YT_CHANNEL_ID || 'UCa4397KS7YBwp7pkA8B5J6g';

// Cache for 30 minutes
let cache: { data: ShortsData[]; timestamp: number } | null = null;
const CACHE_TTL = 30 * 60 * 1000;

interface ShortsData {
  videoId: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  url: string;
}

export const revalidate = 1800; // 30 min Next.js cache

export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json({ shorts: cache.data, cached: true });
  }

  try {
    const auth = new google.auth.OAuth2(YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET);
    auth.setCredentials({ refresh_token: YOUTUBE_REFRESH_TOKEN });

    const youtube = google.youtube({ version: 'v3', auth });

    // Get the uploads playlist ID from the channel
    const channelRes = await youtube.channels.list({
      part: ['contentDetails'],
      id: [CHANNEL_ID],
    });

    const uploadsPlaylistId =
      channelRes.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      return NextResponse.json({ shorts: [], error: 'No uploads playlist found' });
    }

    // Get recent uploads (shorts are typically < 60s)
    const playlistRes = await youtube.playlistItems.list({
      part: ['snippet', 'contentDetails'],
      playlistId: uploadsPlaylistId,
      maxResults: 12,
    });

    const items = playlistRes.data.items || [];

    // Get video details to filter shorts (duration < 60s)
    const videoIds = items
      .map((item) => item.contentDetails?.videoId)
      .filter(Boolean) as string[];

    if (videoIds.length === 0) {
      return NextResponse.json({ shorts: [] });
    }

    const videosRes = await youtube.videos.list({
      part: ['contentDetails', 'snippet'],
      id: videoIds,
    });

    const shorts: ShortsData[] = (videosRes.data.items || [])
      .filter((video) => {
        // Parse ISO 8601 duration to check if it's a short (< 3 minutes)
        const duration = video.contentDetails?.duration || '';
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return false;
        const hours = parseInt(match[1] || '0');
        const minutes = parseInt(match[2] || '0');
        const seconds = parseInt(match[3] || '0');
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        return totalSeconds <= 180; // 3 minutes or less = likely a surf report short
      })
      .map((video) => ({
        videoId: video.id!,
        title: video.snippet?.title || '',
        thumbnail:
          video.snippet?.thumbnails?.high?.url ||
          video.snippet?.thumbnails?.medium?.url ||
          video.snippet?.thumbnails?.default?.url ||
          '',
        publishedAt: video.snippet?.publishedAt || '',
        url: `https://youtube.com/shorts/${video.id}`,
      }));

    cache = { data: shorts, timestamp: Date.now() };

    return NextResponse.json({ shorts });
  } catch (error) {
    console.error('[recent-shorts] Error:', error);
    if (cache) {
      return NextResponse.json({ shorts: cache.data, cached: true, stale: true });
    }
    return NextResponse.json({ shorts: [], error: 'Failed to fetch' }, { status: 200 });
  }
}
