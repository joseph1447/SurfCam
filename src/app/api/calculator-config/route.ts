import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import CalculatorConfig from '@/models/CalculatorConfig';

export async function GET() {
  try {
    await connectDB();
    
    const config = await CalculatorConfig.getSingleton();
    
    return NextResponse.json({
      success: true,
      config: {
        isEnabled: config.isEnabled,
        buttonText: config.buttonText,
        position: config.position
      }
    });
  } catch (error) {
    console.error('Error fetching calculator config:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener configuración' },
      { status: 500 }
    );
  }
}
