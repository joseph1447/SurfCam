import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';

// Restream's official MCP server is the only OAuth-backed way to connect/disconnect
// a destination on an in-progress event (the REST API refuses it).
const MCP_URL = 'https://mcp.restream.io/mcp';
const TOKEN_URL = 'https://api.restream.io/oauth/token';
const AUTH_DOC_ID = 'mcp-oauth';

interface AuthDoc {
  _id: string;
  clientId: string;
  refreshToken: string;
  refreshTokenExpiresAt?: string;
  updatedAt: Date;
}

async function authCollection() {
  await connectDB();
  return mongoose.connection.db!.collection<AuthDoc>('restreamauth');
}

// The refresh token rotates on every use (expiry slides 6 months), so the new one
// must be persisted before anything else happens.
export async function getRestreamAccessToken(): Promise<string> {
  const col = await authCollection();
  const doc = await col.findOne({ _id: AUTH_DOC_ID });
  if (!doc) throw new Error('No Restream OAuth token in restreamauth collection');

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: doc.refreshToken,
      client_id: doc.clientId,
    }),
  });
  const tok = await res.json();
  if (!res.ok || !tok.access_token) {
    throw new Error(`Restream token refresh failed: HTTP ${res.status} ${JSON.stringify(tok)}`);
  }

  await col.updateOne(
    { _id: AUTH_DOC_ID },
    {
      $set: {
        refreshToken: tok.refresh_token ?? doc.refreshToken,
        refreshTokenExpiresAt: tok.refreshTokenExpiresAt,
        updatedAt: new Date(),
      },
    }
  );

  return tok.access_token;
}

export class RestreamMcp {
  private sessionId: string | null = null;
  private nextId = 1;

  constructor(private accessToken: string) {}

  private async post(body: object) {
    const res = await fetch(MCP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        Authorization: `Bearer ${this.accessToken}`,
        ...(this.sessionId ? { 'mcp-session-id': this.sessionId } : {}),
      },
      body: JSON.stringify({ jsonrpc: '2.0', ...body }),
    });
    this.sessionId ??= res.headers.get('mcp-session-id');
    if (!res.ok) throw new Error(`MCP HTTP ${res.status}: ${await res.text()}`);

    const text = await res.text();
    const data = text
      .split('\n')
      .filter((l) => l.startsWith('data: '))
      .map((l) => JSON.parse(l.slice(6)))
      .pop();
    return data ?? (text.trim() ? JSON.parse(text) : null);
  }

  async connect() {
    await this.post({
      id: this.nextId++,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'surfcam', version: '1' },
      },
    });
    await this.post({ method: 'notifications/initialized', params: {} });
  }

  async call<T>(name: string, args: Record<string, unknown>): Promise<T> {
    const msg = await this.post({
      id: this.nextId++,
      method: 'tools/call',
      params: { name, arguments: args },
    });
    if (msg?.error) throw new Error(`${name}: ${JSON.stringify(msg.error)}`);
    if (msg?.result?.isError) {
      throw new Error(`${name}: ${msg.result.content?.[0]?.text ?? 'tool error'}`);
    }
    return msg.result.structuredContent as T;
  }
}
