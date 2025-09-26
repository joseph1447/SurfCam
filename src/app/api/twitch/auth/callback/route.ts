import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  
  // Get the current origin from the request
  const origin = request.headers.get('origin') || request.headers.get('host');
  const baseUrl = origin ? `https://${origin}` : (process.env.NEXTAUTH_URL || 'http://localhost:3000');

  console.log('🔧 Twitch Callback: Processing authentication');
  console.log('🔧 Twitch Callback: Environment check:', {
    NEXT_PUBLIC_TWITCH_CLIENT_ID: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID ? 'SET' : 'NOT SET',
    TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET ? 'SET' : 'NOT SET',
    BASE_URL: baseUrl
  });

  if (error) {
    console.error('🔧 Twitch Callback: Auth error:', error);
    return NextResponse.redirect(`${baseUrl}?error=auth_failed`);
  }

  if (!code) {
    console.error('🔧 Twitch Callback: No code received');
    return NextResponse.redirect(`${baseUrl}?error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
        client_secret: process.env.TWITCH_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${baseUrl}/api/twitch/auth/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token } = tokenData;

    // Get user info
    const userResponse = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Client-Id': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userData = await userResponse.json();
    const user = userData.data[0];

    console.log('🔧 Twitch Callback: Authentication successful for user:', user.display_name);

    // Create a response that sets the token in localStorage via JavaScript
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Autenticación exitosa</title>
        </head>
        <body>
          <script>
            // Store tokens in localStorage
            localStorage.setItem('twitch_access_token', '${access_token}');
            localStorage.setItem('twitch_refresh_token', '${refresh_token}');
            localStorage.setItem('twitch_user', JSON.stringify(${JSON.stringify(user)}));
            
            // Redirect to main page
            window.location.href = '${baseUrl}';
          </script>
          <p>Autenticación exitosa. Redirigiendo...</p>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('🔧 Twitch Callback: Error:', error);
    return NextResponse.redirect(`${baseUrl}?error=auth_failed`);
  }
}