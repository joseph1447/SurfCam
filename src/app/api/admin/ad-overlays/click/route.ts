import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AdOverlay from '@/models/AdOverlay';

// POST - Track click on overlay
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { overlayId } = body;

    if (!overlayId) {
      return NextResponse.json(
        { error: 'Missing overlayId' },
        { status: 400 }
      );
    }

    // Increment click count
    const overlay = await AdOverlay.findByIdAndUpdate(
      overlayId,
      { $inc: { clickCount: 1 } },
      { new: true }
    );

    if (!overlay) {
      return NextResponse.json(
        { error: 'Overlay not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, clickCount: overlay.clickCount });
  } catch (error) {
    console.error('Error tracking click:', error);
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  }
}
