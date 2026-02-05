import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AdOverlay from '@/models/AdOverlay';

// GET - Fetch all overlays for admin panel
export async function GET() {
  try {
    await connectDB();
    
    const overlays = await AdOverlay.find({}).sort({ createdAt: -1 });

    return NextResponse.json(overlays);
  } catch (error) {
    console.error('Error fetching overlays for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch overlays' },
      { status: 500 }
    );
  }
}

// POST - Create new overlay
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { logoUrl, text, redirectUrl, position, startDate, endDate } = body;

    // Validation
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

// PUT - Update overlay
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, logoUrl, text, redirectUrl, position, isActive, startDate, endDate } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing overlay ID' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (text !== undefined) updateData.text = text;
    if (redirectUrl !== undefined) updateData.redirectUrl = redirectUrl;
    if (position !== undefined) updateData.position = position;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : undefined;

    const overlay = await AdOverlay.findByIdAndUpdate(id, updateData, { new: true });

    if (!overlay) {
      return NextResponse.json(
        { error: 'Overlay not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(overlay);
  } catch (error) {
    console.error('Error updating overlay:', error);
    return NextResponse.json(
      { error: 'Failed to update overlay' },
      { status: 500 }
    );
  }
}

// DELETE - Delete overlay
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing overlay ID' },
        { status: 400 }
      );
    }

    const overlay = await AdOverlay.findByIdAndDelete(id);

    if (!overlay) {
      return NextResponse.json(
        { error: 'Overlay not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting overlay:', error);
    return NextResponse.json(
      { error: 'Failed to delete overlay' },
      { status: 500 }
    );
  }
}
