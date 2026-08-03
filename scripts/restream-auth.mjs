// One-time helper: obtains a Restream refresh token via OAuth2 authorization code flow.
// Usage: node scripts/restream-auth.mjs <CLIENT_ID> <CLIENT_SECRET>
// Requires http://localhost:4545/callback registered as redirect URI in the Restream app.

import http from 'node:http';
import crypto from 'node:crypto';
import { exec } from 'node:child_process';

const [clientId, clientSecret] = [
  process.argv[2] || process.env.RESTREAM_CLIENT_ID,
  process.argv[3] || process.env.RESTREAM_CLIENT_SECRET,
];

if (!clientId || !clientSecret) {
  console.error('Usage: node scripts/restream-auth.mjs <CLIENT_ID> <CLIENT_SECRET>');
  process.exit(1);
}

const PORT = 4545;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const state = crypto.randomBytes(16).toString('hex');
const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

const authUrl =
  `https://api.restream.io/login?response_type=code` +
  `&client_id=${clientId}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&state=${state}`;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname !== '/callback') {
    res.writeHead(404).end();
    return;
  }

  const code = url.searchParams.get('code');
  const returnedState = url.searchParams.get('state');

  if (!code || returnedState !== state) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Missing code or state mismatch. Check the terminal.');
    console.error('Callback error:', url.search);
    server.close();
    return;
  }

  try {
    const tokenRes = await fetch('https://api.restream.io/oauth/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code,
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(JSON.stringify(tokens));

    console.log('\n=== TOKENS ===');
    console.log('ACCESS TOKEN :', tokens.accessToken || tokens.access_token);
    console.log('REFRESH TOKEN:', tokens.refreshToken || tokens.refresh_token);
    console.log('EXPIRES IN   :', tokens.expiresIn || tokens.expires_in, 'seconds');

    const accessToken = tokens.accessToken || tokens.access_token;
    const channelsRes = await fetch('https://api.restream.io/v2/user/channel/all', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const channels = await channelsRes.json();

    console.log('\n=== CHANNELS ===');
    for (const ch of channels) {
      console.log(`id=${ch.id}  active=${ch.active}  ${ch.displayName}  (${ch.url})`);
    }

    console.log('\nGuarda el REFRESH TOKEN en Vercel como RESTREAM_REFRESH_TOKEN.');

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h2>Listo ✔</h2><p>Tokens obtenidos. Revisa la terminal y cierra esta pestaña.</p>');
  } catch (err) {
    console.error('Token exchange failed:', err.message);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Token exchange failed. Check the terminal.');
  } finally {
    server.close();
  }
});

server.listen(PORT, () => {
  console.log(`Escuchando en ${REDIRECT_URI}`);
  console.log('\nAbriendo el navegador para autorizar...\n' + authUrl + '\n');
  exec(`start "" "${authUrl.replace(/&/g, '^&')}"`);
});
