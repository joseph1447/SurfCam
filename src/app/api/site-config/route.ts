import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SiteConfig from '@/models/SiteConfig';

// GET público - Obtener configuración específica (sin autenticación)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Se requiere el parámetro key' },
        { status: 400 }
      );
    }

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
      isDefault: false
    });
  } catch (error) {
    console.error('Error fetching site config:', error);
    return NextResponse.json(
      { error: 'Error al obtener la configuración' },
      { status: 500 }
    );
  }
}
