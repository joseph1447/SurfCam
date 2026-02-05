import { NextRequest, NextResponse } from 'next/server';

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!;
const TWITCH_BROADCASTER_ID = process.env.TWITCH_BROADCASTER_ID!;
const TWITCH_USER_ACCESS_TOKEN = process.env.TWITCH_USER_ACCESS_TOKEN!;
const TWITCH_USER_REFRESH_TOKEN = process.env.TWITCH_USER_REFRESH_TOKEN!;
const CRON_SECRET = process.env.CRON_SECRET;

// Store refreshed token in memory (for serverless, consider using a database)
let currentAccessToken = TWITCH_USER_ACCESS_TOKEN;

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TwitchStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
}

interface TwitchClip {
  id: string;
  edit_url: string;
}

interface TwitchClipInfo {
  id: string;
  url: string;
  embed_url: string;
  broadcaster_id: string;
  broadcaster_name: string;
  creator_id: string;
  creator_name: string;
  video_id: string;
  game_id: string;
  language: string;
  title: string;
  view_count: number;
  created_at: string;
  thumbnail_url: string;
  duration: number;
}

// Get Twitch App Access Token (Client Credentials) - for read-only operations
async function getTwitchAppToken(): Promise<string> {
  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: TWITCH_CLIENT_ID,
      client_secret: TWITCH_CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get Twitch token: ${response.status}`);
  }

  const data: TwitchTokenResponse = await response.json();
  return data.access_token;
}

// Refresh user access token
async function refreshUserToken(): Promise<string> {
  console.log('🔄 Refreshing Twitch user token...');

  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: TWITCH_CLIENT_ID,
      client_secret: TWITCH_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: TWITCH_USER_REFRESH_TOKEN,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Token refresh error:', errorText);
    throw new Error(`Failed to refresh Twitch token: ${response.status}`);
  }

  const data = await response.json();
  currentAccessToken = data.access_token;
  console.log('✅ Token refreshed successfully');
  return data.access_token;
}

// Get valid user token (refresh if needed)
async function getValidUserToken(): Promise<string> {
  // Validate current token
  const validateResponse = await fetch('https://id.twitch.tv/oauth2/validate', {
    headers: {
      'Authorization': `OAuth ${currentAccessToken}`,
    },
  });

  if (validateResponse.ok) {
    return currentAccessToken;
  }

  // Token invalid, try to refresh
  return refreshUserToken();
}

// Check if stream is live
async function isStreamLive(token: string): Promise<TwitchStream | null> {
  const response = await fetch(
    `https://api.twitch.tv/helix/streams?user_id=${TWITCH_BROADCASTER_ID}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Client-Id': TWITCH_CLIENT_ID,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to check stream: ${response.status}`);
  }

  const data = await response.json();
  return data.data?.[0] || null;
}

// Create a clip (requires user token with clips:edit scope)
async function createClip(userToken: string): Promise<TwitchClip | null> {
  const response = await fetch(
    `https://api.twitch.tv/helix/clips?broadcaster_id=${TWITCH_BROADCASTER_ID}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Client-Id': TWITCH_CLIENT_ID,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create clip error:', errorText);

    // If 401, try refreshing token and retry once
    if (response.status === 401) {
      console.log('🔄 Token expired, refreshing and retrying...');
      const newToken = await refreshUserToken();
      const retryResponse = await fetch(
        `https://api.twitch.tv/helix/clips?broadcaster_id=${TWITCH_BROADCASTER_ID}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${newToken}`,
            'Client-Id': TWITCH_CLIENT_ID,
          },
        }
      );

      if (!retryResponse.ok) {
        const retryError = await retryResponse.text();
        console.error('Create clip retry error:', retryError);
        throw new Error(`Failed to create clip after token refresh: ${retryResponse.status}`);
      }

      const retryData = await retryResponse.json();
      return retryData.data?.[0] || null;
    }

    throw new Error(`Failed to create clip: ${response.status}`);
  }

  const data = await response.json();
  return data.data?.[0] || null;
}

// Get clip info (after processing)
async function getClipInfo(token: string, clipId: string): Promise<TwitchClipInfo | null> {
  const response = await fetch(
    `https://api.twitch.tv/helix/clips?id=${clipId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Client-Id': TWITCH_CLIENT_ID,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get clip info: ${response.status}`);
  }

  const data = await response.json();
  return data.data?.[0] || null;
}

// Convert thumbnail URL to video URL
function getVideoUrlFromThumbnail(thumbnailUrl: string): string {
  // thumbnail_url: https://clips-media-assets2.twitch.tv/xxx-preview-480x272.jpg
  // video_url: https://clips-media-assets2.twitch.tv/xxx.mp4
  return thumbnailUrl.replace(/-preview-\d+x\d+\.jpg$/, '.mp4');
}

// Wait helper
function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function GET(request: NextRequest) {
  // Allow localhost requests without auth (for testing)
  const host = request.headers.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

  // Verify cron secret for security (if set and not localhost)
  if (!isLocalhost) {
    const authHeader = request.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      // Also check Vercel cron header
      const cronHeader = request.headers.get('x-vercel-cron');
      if (!cronHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
  }

  // Validate environment
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET || !TWITCH_BROADCASTER_ID || !TWITCH_USER_ACCESS_TOKEN) {
    return NextResponse.json({
      success: false,
      error: 'Missing Twitch configuration',
      missing: {
        TWITCH_CLIENT_ID: !TWITCH_CLIENT_ID,
        TWITCH_CLIENT_SECRET: !TWITCH_CLIENT_SECRET,
        TWITCH_BROADCASTER_ID: !TWITCH_BROADCASTER_ID,
        TWITCH_USER_ACCESS_TOKEN: !TWITCH_USER_ACCESS_TOKEN,
      },
      hint: !TWITCH_USER_ACCESS_TOKEN ? 'Visit /api/auth/twitch-clips to get user tokens' : undefined,
    }, { status: 500 });
  }

  try {
    console.log('🎬 Starting clip creation process...');

    // Step 1: Get Twitch app token (for read-only operations)
    const appToken = await getTwitchAppToken();
    console.log('✅ Got Twitch app token');

    // Step 2: Check if stream is live
    const stream = await isStreamLive(appToken);
    if (!stream) {
      console.log('⏸️ Stream is not live, skipping clip creation');
      return NextResponse.json({
        success: false,
        reason: 'Stream is not live',
        timestamp: new Date().toISOString(),
      });
    }
    console.log(`✅ Stream is live: ${stream.title}`);

    // Step 3: Get valid user token and create clip
    const userToken = await getValidUserToken();
    console.log('✅ Got valid user token');

    const clip = await createClip(userToken);
    if (!clip) {
      throw new Error('Failed to create clip - no clip ID returned');
    }
    console.log(`✅ Clip created: ${clip.id}`);

    // Step 4: Wait for Twitch to process the clip (15-20 seconds)
    console.log('⏳ Waiting for clip to process...');
    await wait(18000); // 18 seconds

    // Step 5: Get clip info with download URL
    const clipInfo = await getClipInfo(appToken, clip.id);
    if (!clipInfo) {
      throw new Error('Failed to get clip info after processing');
    }
    console.log(`✅ Got clip info: ${clipInfo.title}`);

    // Step 6: Get video download URL
    const videoUrl = getVideoUrlFromThumbnail(clipInfo.thumbnail_url);
    console.log(`✅ Video URL: ${videoUrl}`);

    // Step 7: Trigger YouTube upload
    const uploadUrl = new URL('/api/upload-youtube', request.url);
    const uploadResponse = await fetch(uploadUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(CRON_SECRET && { 'Authorization': `Bearer ${CRON_SECRET}` }),
      },
      body: JSON.stringify({
        videoUrl,
        clipId: clipInfo.id,
        title: clipInfo.title,
        duration: clipInfo.duration,
        createdAt: clipInfo.created_at,
        thumbnailUrl: clipInfo.thumbnail_url,
        twitchUrl: clipInfo.url,
      }),
    });

    const uploadResult = await uploadResponse.json();

    // Step 8: Send email notification (regardless of YouTube result)
    let emailResult = null;
    try {
      console.log('📧 Sending email notification...');
      const emailUrl = new URL('/api/send-clip-notification', request.url);
      const emailResponse = await fetch(emailUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(CRON_SECRET && { 'Authorization': `Bearer ${CRON_SECRET}` }),
        },
        body: JSON.stringify({
          videoUrl,
          clipTitle: clipInfo.title,
          clipUrl: clipInfo.url,
          youtubeUrl: uploadResponse.ok ? uploadResult.youtubeUrl : undefined,
          youtubeError: !uploadResponse.ok ? uploadResult.error : undefined,
        }),
      });
      emailResult = await emailResponse.json();
      if (emailResult.success) {
        console.log('✅ Email notification sent');
      } else {
        console.log('⚠️ Email notification failed:', emailResult.error);
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError);
    }

    if (!uploadResponse.ok) {
      console.error('YouTube upload failed:', uploadResult);
      return NextResponse.json({
        success: false,
        step: 'youtube_upload',
        error: uploadResult.error,
        clip: {
          id: clipInfo.id,
          title: clipInfo.title,
          url: clipInfo.url,
          videoUrl,
        },
        email: emailResult,
        timestamp: new Date().toISOString(),
      });
    }

    console.log('🎉 Successfully created clip and uploaded to YouTube!');

    return NextResponse.json({
      success: true,
      clip: {
        id: clipInfo.id,
        title: clipInfo.title,
        url: clipInfo.url,
        duration: clipInfo.duration,
        videoUrl,
      },
      youtube: uploadResult,
      email: emailResult,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in create-clip:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
