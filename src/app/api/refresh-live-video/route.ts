import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import connectDB from '@/lib/mongodb';
import SiteConfig from '@/models/SiteConfig';

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID!;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET!;
const YOUTUBE_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN!;
const CHANNEL_ID = process.env.NEXT_PUBLIC_YT_CHANNEL_ID || 'UCa4397KS7YBwp7pkA8B5J6g';
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Verify cron secret if configured
  if (CRON_SECRET) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
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

    if (videoId) {
      await connectDB();

      await SiteConfig.findOneAndUpdate(
        { key: 'youtube_video_id' },
        {
          key: 'youtube_video_id',
          value: videoId,
          description: `Auto-updated live video ID (${new Date().toISOString()})`,
        },
        { upsert: true, new: true }
      );

      console.log(`[refresh-live-video] Updated youtube_video_id to: ${videoId}`);

      return NextResponse.json({
        success: true,
        videoId,
        updated: true,
        message: `Live video found and saved: ${videoId}`,
      });
    }

    console.log('[refresh-live-video] No live stream found, keeping current video ID');

    return NextResponse.json({
      success: true,
      videoId: null,
      updated: false,
      message: 'No live stream active, keeping current video ID',
    });
  } catch (error) {
    console.error('[refresh-live-video] Error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh live video ID' },
      { status: 500 }
    );
  }
}
