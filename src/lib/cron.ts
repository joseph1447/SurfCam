import type { NextRequest } from 'next/server';

// Vercel cron (x-vercel-cron) or a manual call with the cron secret; localhost is open for
// testing, same as the existing cron routes.
export function cronAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const host = request.headers.get('host') || '';
  if (host.includes('localhost') || host.includes('127.0.0.1') || !secret) return true;
  return request.headers.get('authorization') === `Bearer ${secret}` || request.headers.get('x-vercel-cron') !== null;
}
