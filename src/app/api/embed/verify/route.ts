import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import EmbedDomain from '@/models/EmbedDomain';

// In-memory cache for allowed domains (refreshed every 2 minutes)
let domainsCache: { domains: string[]; timestamp: number } | null = null;
const CACHE_TTL = 2 * 60 * 1000;

async function getAllowedDomains(): Promise<string[]> {
  if (domainsCache && Date.now() - domainsCache.timestamp < CACHE_TTL) {
    return domainsCache.domains;
  }

  await connectDB();
  const activeDomains = await EmbedDomain.find({ isActive: true }).select('domain');
  const domains = activeDomains.map((d) => d.domain);

  domainsCache = { domains, timestamp: Date.now() };
  return domains;
}

function isDomainAllowed(origin: string, allowedDomains: string[]): boolean {
  try {
    const url = new URL(origin);
    const hostname = url.hostname.toLowerCase();

    return allowedDomains.some((allowed) => {
      // Exact match: "www.malpaisurfcam.com" matches "www.malpaisurfcam.com"
      if (hostname === allowed) return true;
      // Subdomain match: "blog.malpaisurfcam.com" matches "malpaisurfcam.com"
      if (hostname.endsWith('.' + allowed)) return true;
      return false;
    });
  } catch {
    return false;
  }
}

// GET - Verify if a domain is allowed to embed
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.searchParams.get('origin');

  if (!origin) {
    return NextResponse.json({ allowed: false, error: 'Origin required' }, { status: 400 });
  }

  try {
    const allowedDomains = await getAllowedDomains();
    const allowed = isDomainAllowed(origin, allowedDomains);

    return NextResponse.json({ allowed });
  } catch (error) {
    console.error('Error verifying embed domain:', error);
    return NextResponse.json({ allowed: false, error: 'Verification failed' }, { status: 500 });
  }
}
