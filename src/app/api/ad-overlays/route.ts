import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AdOverlay from '@/models/AdOverlay';

// GET - Fetch all active overlays
export async function GET() {
  try {
    await connectDB();
    
    const now = new Date();
    const overlays = await AdOverlay.find({
      isActive: true,
      startDate: { $lte: now },
      $or: [
        { endDate: { $exists: false } },
        { endDate: { $gte: now } }
      ]
    }).sort({ createdAt: -1 });

    return NextResponse.json(overlays);
  } catch (error) {
    console.error('Error fetching overlays:', error);
    return NextResponse.json(
      { error: 'Failed to fetch overlays' },
      { status: 500 }
    );
  }
}

// POST - Create new overlay (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { logoUrl, text, redirectUrl, position, startDate, endDate } = body;

    // Basic validation
    if (!logoUrl || !text || !redirectUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: logoUrl, text, redirectUrl' },
        { status: 400 }
      );
    }

    const overlay = new AdOverlay({
      logoUrl,
      text,
      redirectUrl,
      position: position || 'bottom-right',
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      isActive: true
    });

    await overlay.save();

    return NextResponse.json(overlay, { status: 201 });
  } catch (error) {
    console.error('Error creating overlay:', error);
    return NextResponse.json(
      { error: 'Failed to create overlay' },
      { status: 500 }
    );
  }
}
