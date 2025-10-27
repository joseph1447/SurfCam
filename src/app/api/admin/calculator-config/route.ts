import { NextRequest, NextResponse } from 'next/server';
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

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const { isEnabled, buttonText, position } = await request.json();
    
    // Validate input - only validate fields that are provided
    if (isEnabled !== undefined && typeof isEnabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isEnabled debe ser un booleano' },
        { status: 400 }
      );
    }
    
    if (buttonText !== undefined && (typeof buttonText !== 'string' || buttonText.length > 100)) {
      return NextResponse.json(
        { success: false, error: 'buttonText debe ser una cadena de máximo 100 caracteres' },
        { status: 400 }
      );
    }
    
    if (position !== undefined && !['top-right', 'top-left', 'bottom-right', 'bottom-left'].includes(position)) {
      return NextResponse.json(
        { success: false, error: 'Posición inválida' },
        { status: 400 }
      );
    }
    
    let config = await CalculatorConfig.getSingleton();
    
    // Update fields - only update if provided
    if (isEnabled !== undefined) {
      config.isEnabled = isEnabled;
    }
    if (buttonText !== undefined) {
      config.buttonText = buttonText;
    }
    if (position !== undefined) {
      config.position = position;
    }
    
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
