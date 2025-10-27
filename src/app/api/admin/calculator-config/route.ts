import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import CalculatorConfig from '@/models/CalculatorConfig';

export async function GET() {
  try {
    await connectDB();
    
    let config = await CalculatorConfig.findOne();
    
    // If no config exists, create default one
    if (!config) {
      config = new CalculatorConfig({
        isEnabled: true,
        buttonText: '¿Cuál es mi modelo de tabla?',
        position: 'top-right'
      });
      await config.save();
    }
    
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

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const { isEnabled, buttonText, position } = await request.json();
    
    // Validate input
    if (typeof isEnabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isEnabled debe ser un booleano' },
        { status: 400 }
      );
    }
    
    if (buttonText && (typeof buttonText !== 'string' || buttonText.length > 100)) {
      return NextResponse.json(
        { success: false, error: 'buttonText debe ser una cadena de máximo 100 caracteres' },
        { status: 400 }
      );
    }
    
    if (position && !['top-right', 'top-left', 'bottom-right', 'bottom-left'].includes(position)) {
      return NextResponse.json(
        { success: false, error: 'Posición inválida' },
        { status: 400 }
      );
    }
    
    let config = await CalculatorConfig.findOne();
    
    if (!config) {
      config = new CalculatorConfig();
    }
    
    // Update fields
    if (typeof isEnabled === 'boolean') {
      config.isEnabled = isEnabled;
    }
    if (buttonText) {
      config.buttonText = buttonText;
    }
    if (position) {
      config.position = position;
    }
    
    config.updatedAt = new Date();
    await config.save();
    
    return NextResponse.json({
      success: true,
      config: {
        isEnabled: config.isEnabled,
        buttonText: config.buttonText,
        position: config.position
      }
    });
  } catch (error) {
    console.error('Error updating calculator config:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar configuración' },
      { status: 500 }
    );
  }
}
