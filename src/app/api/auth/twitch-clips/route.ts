import { NextRequest, NextResponse } from 'next/server';

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXTAUTH_URL
  ? `${process.env.NEXTAUTH_URL}/api/auth/twitch-clips`
  : 'http://localhost:9002/api/auth/twitch-clips';

// Scopes needed for creating clips
const SCOPES = ['clips:edit'].join(' ');

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
      const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: TWITCH_CLIENT_ID,
          client_secret: TWITCH_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: REDIRECT_URI,
        }),
      });

      const tokens = await tokenResponse.json();

      if (tokens.error) {
        return NextResponse.json({
          success: false,
          error: tokens.message || tokens.error
        }, { status: 400 });
      }

      // Return the tokens in a user-friendly HTML page
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Twitch OAuth Success</title>
          <style>
            body { font-family: system-ui; padding: 40px; background: #0f172a; color: #e2e8f0; }
            .container { max-width: 600px; margin: 0 auto; }
            h1 { color: #a855f7; }
            .token-box {
              background: #1e293b;
              padding: 20px;
              border-radius: 8px;
              word-break: break-all;
              margin: 20px 0;
            }
            .label { color: #94a3b8; margin-bottom: 8px; }
            .value { color: #a855f7; font-family: monospace; font-size: 12px; }
            .warning { color: #fbbf24; margin-top: 20px; }
            .info { color: #22d3ee; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Twitch OAuth Successful!</h1>
            <p>Add these tokens to your <code>.env</code> file:</p>

            <div class="token-box">
              <div class="label">TWITCH_USER_ACCESS_TOKEN=</div>
              <div class="value">${tokens.access_token}</div>
            </div>

            <div class="token-box">
              <div class="label">TWITCH_USER_REFRESH_TOKEN=</div>
              <div class="value">${tokens.refresh_token}</div>
            </div>

            <p class="info">Token expires in: ${tokens.expires_in} seconds (~${Math.round(tokens.expires_in / 3600)} hours)</p>
            <p class="info">Scopes: ${tokens.scope?.join(', ') || 'clips:edit'}</p>

            <p class="warning">⚠️ The access token expires. The system will auto-refresh it using the refresh token.</p>
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
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
    return NextResponse.json({
      success: false,
      error: 'Twitch OAuth credentials not configured'
    }, { status: 500 });
  }

  const authUrl = new URL('https://id.twitch.tv/oauth2/authorize');
  authUrl.searchParams.set('client_id', TWITCH_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', SCOPES);

  return NextResponse.json({
    success: true,
    message: 'Visit this URL to authorize Twitch clip creation:',
    authUrl: authUrl.toString(),
    redirectUri: REDIRECT_URI,
  });
}
