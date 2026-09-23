import { NextRequest, NextResponse } from 'next/server';
import { getTides, tideAt, crDate, crTime } from '@/lib/conditions';

const DAYS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

// ?date=YYYY-MM-DD (Costa Rica calendar day), defaults to today.
export async function GET(req: NextRequest) {
  const now = Date.now();
  const date = req.nextUrl.searchParams.get('date') ?? crDate(now);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ success: false, error: 'date must be YYYY-MM-DD' }, { status: 400 });
  }

  // Pad a day each side so turns near midnight are still detected.
  const noon = Date.parse(`${date}T12:00:00-06:00`);
  try {
    const series = await getTides(crDate(noon - 86_400_000), crDate(noon + 86_400_000));
    const tides = series.extremes
      .filter((e) => crDate(e.at) === date)
      .map((e) => ({ time: crTime(e.at), height: e.heightFt, type: e.type }));

    const isToday = date === crDate(now);
    const current = isToday ? tideAt(series, now) : null;
    const nextOfType = (type: 'high' | 'low') => {
      const e = series.extremes.find((x) => x.type === type && x.at > now && crDate(x.at) === date);
      return e ? { time: crTime(e.at), height: e.heightFt } : null;
    };

    return NextResponse.json({
      success: true,
      data: {
        todayData: { date, dayOfWeek: DAYS[new Date(noon).getUTCDay()], tides },
        currentHeight: current?.heightFt ?? null,
        currentDirection: current?.direction ?? 'stable',
        nextHighTide: isToday ? nextOfType('high') : null,
        nextLowTide: isToday ? nextOfType('low') : null,
      },
      source: 'open-meteo',
    });
  } catch (error) {
    console.error('[tide-data]', error);
    return NextResponse.json({ success: false, error: 'No se pudieron cargar las mareas' }, { status: 502 });
  }
}
