import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('Twitch auth error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?error=auth_failed`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.TWITCH_CLIENT_ID!,
        client_secret: process.env.TWITCH_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/twitch/auth/callback`,
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
        'Client-Id': process.env.TWITCH_CLIENT_ID!,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userData = await userResponse.json();
    const user = userData.data[0];

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
            window.location.href = '${process.env.NEXTAUTH_URL || 'http://localhost:3000'}';
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
    console.error('Twitch auth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?error=auth_failed`);
  }
}
