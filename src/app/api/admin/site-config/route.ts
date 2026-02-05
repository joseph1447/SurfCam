import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SiteConfig from '@/models/SiteConfig';
import { checkAdminAuth } from '@/lib/adminAuth';

// GET - Obtener todas las configuraciones o una específica
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');

    if (key) {
      // Obtener configuración específica
      const config = await SiteConfig.findOne({ key });

      if (!config) {
        // Retornar valores por defecto si no existe
        const defaultValues: Record<string, string> = {
          'youtube_video_id': 'c5y9NOgTZuQ'
        };

        return NextResponse.json({
          key,
          value: defaultValues[key] || '',
          isDefault: true
        });
      }

      return NextResponse.json({
        key: config.key,
        value: config.value,
        description: config.description,
        isDefault: false
      });
    } else {
      // Obtener todas las configuraciones
      const configs = await SiteConfig.find({});

      return NextResponse.json(configs);
    }
  } catch (error) {
    console.error('Error fetching site config:', error);
    return NextResponse.json(
      { error: 'Error al obtener la configuración' },
      { status: 500 }
    );
  }
}

// POST/PUT - Crear o actualizar configuración (requiere autenticación de admin)
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const authCheck = await checkAdminAuth(request);
    if (!authCheck.authenticated) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { key, value, description } = body;

    if (!key || !value) {
      return NextResponse.json(
        { error: 'Se requieren los campos key y value' },
        { status: 400 }
      );
    }

    await connectDB();

    // Actualizar o crear la configuración
    const config = await SiteConfig.findOneAndUpdate(
      { key },
      { key, value, description },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Configuración actualizada correctamente',
      config
    });
  } catch (error) {
    console.error('Error updating site config:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la configuración' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar configuración (requiere autenticación de admin)
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const authCheck = await checkAdminAuth(request);
    if (!authCheck.authenticated) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Se requiere el parámetro key' },
        { status: 400 }
      );
    }

    await connectDB();

    const result = await SiteConfig.findOneAndDelete({ key });

    if (!result) {
      return NextResponse.json(
        { error: 'Configuración no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Configuración eliminada correctamente'
    });
  } catch (error) {
    console.error('Error deleting site config:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la configuración' },
      { status: 500 }
    );
  }
}
