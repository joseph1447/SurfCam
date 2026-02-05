import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const GMAIL_USER = process.env.GMAIL_USER!;
const GMAIL_PASS = process.env.GMAIL_PASS!;
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || process.env.GMAIL_USER!;
const CRON_SECRET = process.env.CRON_SECRET;

interface NotificationData {
  videoUrl: string;
  clipTitle: string;
  clipUrl: string;
  youtubeUrl?: string;
  youtubeError?: string;
}

async function sendEmailNotification(data: NotificationData): Promise<{ success: boolean; error?: string }> {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASS,
    },
  });

  const timestamp = new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 24px; }
        h1 { color: #22d3ee; margin-bottom: 16px; }
        .link-box { background: #0f172a; padding: 12px; border-radius: 8px; margin: 12px 0; }
        .link-box a { color: #22d3ee; text-decoration: none; }
        .link-box a:hover { text-decoration: underline; }
        .label { color: #94a3b8; font-size: 12px; margin-bottom: 4px; }
        .error { color: #f87171; }
        .success { color: #4ade80; }
        .timestamp { color: #64748b; font-size: 12px; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🌊 Nuevo Clip de Santa Teresa Surf!</h1>
        <p><strong>${data.clipTitle}</strong></p>

        <div class="link-box">
          <div class="label">🎬 Twitch Clip</div>
          <a href="${data.clipUrl}">${data.clipUrl}</a>
        </div>

        <div class="link-box">
          <div class="label">📥 Video Directo (MP4)</div>
          <a href="${data.videoUrl}">Descargar Video</a>
        </div>

        ${data.youtubeUrl ? `
        <div class="link-box">
          <div class="label success">▶️ YouTube Short</div>
          <a href="${data.youtubeUrl}">${data.youtubeUrl}</a>
        </div>
        ` : ''}

        ${data.youtubeError ? `
        <div class="link-box">
          <div class="label error">⚠️ Error de YouTube</div>
          <span class="error">${data.youtubeError}</span>
        </div>
        ` : ''}

        <p class="timestamp">📅 ${timestamp}</p>
      </div>
    </body>
    </html>
  `;

  const textContent = `
🌊 Nuevo Clip de Santa Teresa Surf!

📹 ${data.clipTitle}

🎬 Twitch: ${data.clipUrl}
📥 Video: ${data.videoUrl}
${data.youtubeUrl ? `▶️ YouTube: ${data.youtubeUrl}` : ''}
${data.youtubeError ? `⚠️ YouTube error: ${data.youtubeError}` : ''}

🕐 ${timestamp}
  `.trim();

  try {
    await transporter.sendMail({
      from: `"Santa Teresa Surf Cam" <${GMAIL_USER}>`,
      to: NOTIFICATION_EMAIL,
      subject: `🌊 Nuevo Clip: ${data.clipTitle}`,
      text: textContent,
      html: htmlContent,
    });

    console.log(`✅ Email notification sent to ${NOTIFICATION_EMAIL}`);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function POST(request: NextRequest) {
  // Allow localhost requests without auth
  const host = request.headers.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

  if (!isLocalhost) {
    const authHeader = request.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Validate environment
  if (!GMAIL_USER || !GMAIL_PASS) {
    return NextResponse.json({
      success: false,
      error: 'Missing email configuration (GMAIL_USER, GMAIL_PASS)',
    }, { status: 500 });
  }

  try {
    const data: NotificationData = await request.json();

    if (!data.videoUrl || !data.clipTitle || !data.clipUrl) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: videoUrl, clipTitle, clipUrl'
      }, { status: 400 });
    }

    const result = await sendEmailNotification(data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
