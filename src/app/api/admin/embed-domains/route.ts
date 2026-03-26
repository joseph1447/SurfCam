import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import EmbedDomain from '@/models/EmbedDomain';
import { checkAdminAuth } from '@/lib/adminAuth';

// GET - List all embed domains
export async function GET(request: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(request);
    if (!authCheck.authenticated) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();
    const domains = await EmbedDomain.find({}).sort({ createdAt: -1 });
    return NextResponse.json(domains);
  } catch (error) {
    console.error('Error fetching embed domains:', error);
    return NextResponse.json({ error: 'Error al obtener dominios' }, { status: 500 });
  }
}

// POST - Create a new embed domain
export async function POST(request: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(request);
    if (!authCheck.authenticated) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { domain, label } = body;

    if (!domain || !label) {
      return NextResponse.json({ error: 'Se requieren domain y label' }, { status: 400 });
    }

    // Normalize domain: remove protocol, trailing slash, www prefix optionally
    const normalizedDomain = domain
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '')
      .toLowerCase()
      .trim();

    if (!normalizedDomain) {
      return NextResponse.json({ error: 'Dominio inválido' }, { status: 400 });
    }

    await connectDB();

    const existing = await EmbedDomain.findOne({ domain: normalizedDomain });
    if (existing) {
      return NextResponse.json({ error: 'Este dominio ya está registrado' }, { status: 409 });
    }

    const embedDomain = await EmbedDomain.create({
      domain: normalizedDomain,
      label: label.trim(),
      isActive: true
    });

    return NextResponse.json({ success: true, domain: embedDomain });
  } catch (error) {
    console.error('Error creating embed domain:', error);
    return NextResponse.json({ error: 'Error al crear dominio' }, { status: 500 });
  }
}

// PUT - Update an embed domain (toggle active, update label)
export async function PUT(request: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(request);
    if (!authCheck.authenticated) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, label, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Se requiere el ID' }, { status: 400 });
    }

    await connectDB();

    const updateData: Record<string, unknown> = {};
    if (label !== undefined) updateData.label = label.trim();
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await EmbedDomain.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return NextResponse.json({ error: 'Dominio no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, domain: updated });
  } catch (error) {
    console.error('Error updating embed domain:', error);
    return NextResponse.json({ error: 'Error al actualizar dominio' }, { status: 500 });
  }
}

// DELETE - Remove an embed domain
export async function DELETE(request: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(request);
    if (!authCheck.authenticated) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Se requiere el ID' }, { status: 400 });
    }

    await connectDB();

    const result = await EmbedDomain.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ error: 'Dominio no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Dominio eliminado' });
  } catch (error) {
    console.error('Error deleting embed domain:', error);
    return NextResponse.json({ error: 'Error al eliminar dominio' }, { status: 500 });
  }
}
