import { NextRequest, NextResponse } from 'next/server';

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID!;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXTAUTH_URL
  ? `${process.env.NEXTAUTH_URL}/api/auth/youtube`
  : 'http://localhost:9002/api/auth/youtube';

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube',
].join(' ');

// GET: Generate OAuth URL or handle callback
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Handle OAuth error
  if (error) {
    return NextResponse.json({
      success: false,
      error: `OAuth error: ${error}`
    }, { status: 400 });
  }

  // Handle OAuth callback with code
  if (code) {
    try {
      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: YOUTUBE_CLIENT_ID,
          client_secret: YOUTUBE_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });

      const tokens = await tokenResponse.json();

      if (tokens.error) {
        return NextResponse.json({
          success: false,
          error: tokens.error_description || tokens.error
        }, { status: 400 });
      }

      // Return the refresh token in a user-friendly HTML page
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>YouTube OAuth Success</title>
          <style>
            body { font-family: system-ui; padding: 40px; background: #0f172a; color: #e2e8f0; }
            .container { max-width: 600px; margin: 0 auto; }
            h1 { color: #22d3ee; }
            .token-box {
              background: #1e293b;
              padding: 20px;
              border-radius: 8px;
              word-break: break-all;
              margin: 20px 0;
            }
            .label { color: #94a3b8; margin-bottom: 8px; }
            .value { color: #22d3ee; font-family: monospace; }
            .warning { color: #fbbf24; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ YouTube OAuth Successful!</h1>
            <p>Add this refresh token to your <code>.env</code> file:</p>

            <div class="token-box">
              <div class="label">YOUTUBE_REFRESH_TOKEN=</div>
              <div class="value">${tokens.refresh_token}</div>
            </div>

            <div class="token-box">
              <div class="label">Access Token (expires in ${tokens.expires_in}s):</div>
              <div class="value">${tokens.access_token}</div>
            </div>

            <p class="warning">⚠️ Keep these tokens secure! Do not share them publicly.</p>
          </div>
        </body>
        </html>
      `;

      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    } catch (err) {
      console.error('Token exchange error:', err);
      return NextResponse.json({
        success: false,
        error: 'Failed to exchange code for tokens'
      }, { status: 500 });
    }
  }

  // No code = generate OAuth URL
  if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET) {
    return NextResponse.json({
      success: false,
      error: 'YouTube OAuth credentials not configured'
    }, { status: 500 });
  }

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', YOUTUBE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', SCOPES);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent'); // Force refresh token

  return NextResponse.json({
    success: true,
    message: 'Visit this URL to authorize YouTube access:',
    authUrl: authUrl.toString(),
    redirectUri: REDIRECT_URI,
  });
}
