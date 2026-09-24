// Santa Teresa surf conditions from Open-Meteo (free, no key; attribution required).
//
// Tides come from the marine model's sea level. Checked on 2026-09-23 against the Santa
// Teresa table (El Carmen station, 2 km away) over 32 highs/lows: the model runs a steady
// ~33 min early, and its MSL metres map onto the table's feet as 4.086 * m + 2.277. With
// both corrections the error was 2 min / 0.09 ft median, 6 min / 0.27 ft max.

const LAT = 9.64;
const LON = -85.17;
const TZ = 'America/Costa_Rica';
const TIDE_OFFSET_S = 33 * 60;
const toFeet = (m: number) => 4.086 * m + 2.277;

// Santa Teresa faces the open Pacific to the WSW, so wind out of the ENE blows offshore.
const OFFSHORE_FROM_DEG = 60;

export interface TideExtreme {
  at: number; // epoch ms
  type: 'high' | 'low';
  heightFt: number;
}

export interface TideSeries {
  points: { at: number; heightFt: number }[];
  extremes: TideExtreme[];
}

export type WindKind = 'light' | 'offshore' | 'onshore' | 'cross-shore';

export interface SurfReport {
  swellFt: number;
  swellPeriodS: number;
  swellFrom: string;
  swellFromDeg: number;
  windKmh: number;
  windFrom: string;
  windFromDeg: number;
  windKind: WindKind;
  waterTempC: number | null;
  tide: {
    direction: 'rising' | 'falling';
    heightFt: number;
    next: TideExtreme | null;
  };
}

// Everything the home page's conditions panel draws for one Costa Rica calendar day.
export interface DayOutlook {
  date: string;
  generatedAt: number;
  now: SurfReport;
  tide: TideSeries;
  // Turns from yesterday through tomorrow, so the live cycle (last turn → next turn) is
  // known even when it crosses midnight.
  cycle: TideExtreme[];
  wind: { at: number; kmh: number; fromDeg: number; kind: WindKind }[];
  sun: { sunrise: number; sunset: number };
}

async function getJson(url: string) {
  const res = await fetch(url, { next: { revalidate: 1800 } } as RequestInit);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}: ${await res.text()}`);
  return res.json();
}

// start/end are Costa Rica calendar dates (YYYY-MM-DD), inclusive.
export async function getTides(startDate: string, endDate: string): Promise<TideSeries> {
  const j = await getJson(
    `https://marine-api.open-meteo.com/v1/marine?latitude=${LAT}&longitude=${LON}` +
      `&minutely_15=sea_level_height_msl&timeformat=unixtime&timezone=${TZ}` +
      `&start_date=${startDate}&end_date=${endDate}`,
  );
  const time: number[] = j.minutely_15.time;
  const level: (number | null)[] = j.minutely_15.sea_level_height_msl;

  const points = time
    .map((t, i) => ({ at: (t + TIDE_OFFSET_S) * 1000, m: level[i] }))
    .filter((p): p is { at: number; m: number } => p.m != null);

  const extremes: TideExtreme[] = [];
  for (let i = 1; i < points.length - 1; i++) {
    const [a, b, c] = [points[i - 1].m, points[i].m, points[i + 1].m];
    const isHigh = b >= a && b > c;
    const isLow = b <= a && b < c;
    if (!isHigh && !isLow) continue;
    // Parabola through the three samples puts the turn between 15-min steps.
    const shift = (a - c) / (2 * (a - 2 * b + c));
    const ext: TideExtreme = {
      at: points[i].at + shift * 15 * 60_000,
      type: isHigh ? 'high' : 'low',
      heightFt: round1(toFeet(b - ((a - c) * shift) / 4)),
    };
    // Model wiggles near slack water can report two turns of the same kind; keep the stronger.
    const prev = extremes.at(-1);
    if (prev?.type === ext.type) {
      const stronger = ext.type === 'high' ? ext.heightFt > prev.heightFt : ext.heightFt < prev.heightFt;
      if (stronger) extremes[extremes.length - 1] = ext;
      continue;
    }
    extremes.push(ext);
  }

  return { points: points.map((p) => ({ at: p.at, heightFt: toFeet(p.m) })), extremes };
}

export function tideAt(series: TideSeries, at: number) {
  const i = series.points.findIndex((p) => p.at > at);
  const [before, after] = [series.points[i - 1], series.points[i]];
  if (!before || !after) throw new Error('Time outside tide series');
  const heightFt = before.heightFt + ((after.heightFt - before.heightFt) * (at - before.at)) / (after.at - before.at);
  const next = series.extremes.find((e) => e.at > at) ?? null;
  // Heading for the next turn: comparing neighbouring 15-min samples flips early near a
  // turn, which read as "Rising · Low 6:40 PM" minutes before the low.
  const rising = next ? next.type === 'high' : after.heightFt >= before.heightFt;
  return {
    heightFt: round1(heightFt),
    direction: rising ? ('rising' as const) : ('falling' as const),
    next,
  };
}

// Today and tomorrow, hourly, in Costa Rica time. Both callers use these exact URLs, so
// they share Next's data cache.
async function getHourly() {
  const [marine, weather] = await Promise.all([
    getJson(
      `https://marine-api.open-meteo.com/v1/marine?latitude=${LAT}&longitude=${LON}` +
        `&hourly=swell_wave_height,swell_wave_period,swell_wave_direction,sea_surface_temperature` +
        `&timeformat=unixtime&timezone=${TZ}&forecast_days=2`,
    ),
    getJson(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
        `&hourly=wind_speed_10m,wind_direction_10m&daily=sunrise,sunset` +
        `&timeformat=unixtime&timezone=${TZ}&forecast_days=2`,
    ),
  ]);
  return { marine: marine.hourly, weather: weather.hourly, daily: weather.daily };
}

type Hourly = Awaited<ReturnType<typeof getHourly>>;

function reportAt({ marine, weather }: Hourly, tides: TideSeries, at: number): SurfReport {
  const hour = (times: number[]) =>
    times.reduce((best, t, i) => (Math.abs(t * 1000 - at) < Math.abs(times[best] * 1000 - at) ? i : best), 0);
  const m = hour(marine.time);
  const w = hour(weather.time);
  const swellDeg: number = marine.swell_wave_direction[m];
  const windDeg: number = weather.wind_direction_10m[w];
  const water: number | null = marine.sea_surface_temperature[m];

  return {
    swellFt: round1(marine.swell_wave_height[m] * 3.281),
    swellPeriodS: Math.round(marine.swell_wave_period[m]),
    swellFrom: compass(swellDeg),
    swellFromDeg: Math.round(swellDeg),
    windKmh: Math.round(weather.wind_speed_10m[w]),
    windFrom: compass(windDeg),
    windFromDeg: Math.round(windDeg),
    windKind: windKind(windDeg, weather.wind_speed_10m[w]),
    waterTempC: water == null ? null : round1(water),
    tide: tideAt(tides, at),
  };
}

export async function getSurfReport(at = Date.now()): Promise<SurfReport> {
  const [hourly, tides] = await Promise.all([getHourly(), getTides(crDate(at), crDate(at + 86_400_000))]);
  return reportAt(hourly, tides, at);
}

export async function getDayOutlook(at = Date.now()): Promise<DayOutlook> {
  const date = crDate(at);
  // A day of padding each side so turns near midnight are still detected.
  const [hourly, tides] = await Promise.all([
    getHourly(),
    getTides(crDate(at - 86_400_000), crDate(at + 86_400_000)),
  ]);
  const start = Date.parse(`${date}T00:00:00-06:00`);
  const end = start + 86_400_000;
  const today = (t: number) => t >= start && t <= end;

  return {
    date,
    generatedAt: at,
    now: reportAt(hourly, tides, at),
    tide: {
      points: tides.points.filter((p) => today(p.at)).map((p) => ({ at: p.at, heightFt: round1(p.heightFt) })),
      extremes: tides.extremes.filter((e) => today(e.at)),
    },
    cycle: tides.extremes,
    wind: hourly.weather.time
      .map((t: number, i: number) => ({
        at: t * 1000,
        kmh: Math.round(hourly.weather.wind_speed_10m[i]),
        fromDeg: Math.round(hourly.weather.wind_direction_10m[i]),
        kind: windKind(hourly.weather.wind_direction_10m[i], hourly.weather.wind_speed_10m[i]),
      }))
      .filter((w: { at: number }) => w.at >= start && w.at < end),
    sun: { sunrise: hourly.daily.sunrise[0] * 1000, sunset: hourly.daily.sunset[0] * 1000 },
  };
}

// Under ~6 km/h the surface stays glassy whichever way it blows.
function windKind(fromDeg: number, kmh: number): WindKind {
  if (kmh < 6) return 'light';
  const off = Math.abs(((fromDeg - OFFSHORE_FROM_DEG + 540) % 360) - 180);
  if (off <= 45) return 'offshore';
  if (off >= 135) return 'onshore';
  return 'cross-shore';
}

function compass(deg: number) {
  const points = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return points[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16];
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function crDate(at: number) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(at); // YYYY-MM-DD
}

export function crTime(at: number, style: '24h' | '12h' = '24h') {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    hour: style === '24h' ? '2-digit' : 'numeric',
    minute: '2-digit',
    hourCycle: style === '24h' ? 'h23' : 'h12',
  }).format(at);
}
