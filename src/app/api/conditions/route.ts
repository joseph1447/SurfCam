import { NextResponse } from 'next/server';
import { getDayOutlook } from '@/lib/conditions';

// Swell and wind are hourly forecasts, so ten minutes at the edge costs nothing; the
// panel works out the live tide position from the curve on the client.
export async function GET() {
  try {
    return NextResponse.json(await getDayOutlook(), {
      headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800' },
    });
  } catch (error) {
    console.error('[conditions]', error);
    return NextResponse.json({ error: 'Conditions unavailable' }, { status: 502 });
  }
}
