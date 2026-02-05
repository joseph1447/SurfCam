import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lessonType, people, days, pricePerPerson, totalPrice, savings, customerEmail, customerName } = body;

    // Configurar el transporter con Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // Email para el administrador
    const adminMailOptions = {
      from: process.env.GMAIL_USER,
      to: 'josephquesada92@gmail.com',
      subject: `Nueva Cotización de Clases de Surf - ${lessonType === 'private' ? 'Privada' : 'Grupal'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #06B6D4;">Nueva Cotización de Clases de Surf</h2>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Detalles de la Cotización:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Cliente:</td>
                <td style="padding: 8px 0;">${customerName || 'No proporcionado'}</td>
              </tr>
              ${customerEmail ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Email del cliente:</td>
                <td style="padding: 8px 0;">${customerEmail}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Tipo de clase:</td>
                <td style="padding: 8px 0;">${lessonType === 'private' ? 'Privada' : 'Grupal'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Número de personas:</td>
                <td style="padding: 8px 0;">${people}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Número de días:</td>
                <td style="padding: 8px 0;">${days}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Precio por persona/día:</td>
                <td style="padding: 8px 0;">$${pricePerPerson}</td>
              </tr>
              ${savings > 0 ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #10B981;">Ahorro por paquete:</td>
                <td style="padding: 8px 0; color: #10B981;">$${savings}</td>
              </tr>
              ` : ''}
              <tr style="background-color: #06B6D4; color: white;">
                <td style="padding: 12px 8px; font-weight: bold; font-size: 18px;">TOTAL:</td>
                <td style="padding: 12px 8px; font-weight: bold; font-size: 18px;">$${totalPrice} USD</td>
              </tr>
            </table>
          </div>

          <p style="color: #666; font-size: 14px;">
            Responde a este cliente lo antes posible para confirmar disponibilidad.
          </p>
        </div>
      `,
    };

    // Email de confirmación para el cliente (opcional)
    let customerMailOptions = null;
    if (customerEmail) {
      customerMailOptions = {
        from: process.env.GMAIL_USER,
        to: customerEmail,
        subject: 'Cotización Recibida - Clases de Surf Santa Teresa',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #06B6D4;">¡Gracias por tu interés!</h2>

            <p>Hola${customerName ? ` ${customerName}` : ''},</p>

            <p>Hemos recibido tu solicitud de cotización para clases de surf. Aquí está el resumen:</p>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Tipo de clase:</td>
                  <td style="padding: 8px 0;">${lessonType === 'private' ? 'Privada' : 'Grupal'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Personas:</td>
                  <td style="padding: 8px 0;">${people}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Días:</td>
                  <td style="padding: 8px 0;">${days}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Precio por persona/día:</td>
                  <td style="padding: 8px 0;">$${pricePerPerson}</td>
                </tr>
                ${savings > 0 ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #10B981;">Ahorro:</td>
                  <td style="padding: 8px 0; color: #10B981;">$${savings}</td>
                </tr>
                ` : ''}
                <tr style="background-color: #06B6D4; color: white;">
                  <td style="padding: 12px 8px; font-weight: bold; font-size: 18px;">TOTAL:</td>
                  <td style="padding: 12px 8px; font-weight: bold; font-size: 18px;">$${totalPrice} USD</td>
                </tr>
              </table>
            </div>

            <p>Te responderemos pronto para confirmar disponibilidad y coordinar los detalles.</p>

            <p style="color: #666; font-size: 14px;">
              <strong>Contacto:</strong><br>
              WhatsApp: +506 8316-1976<br>
              Email: josephquesada92@gmail.com
            </p>

            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Santa Teresa Surf Cam - Clases de Surf<br>
              Santa Teresa, Costa Rica
            </p>
          </div>
        `,
      };
    }

    // Enviar email al administrador
    await transporter.sendMail(adminMailOptions);

    // Enviar email de confirmación al cliente si proporcionó email
    if (customerMailOptions) {
      await transporter.sendMail(customerMailOptions);
    }

    return NextResponse.json({
      success: true,
      message: 'Cotización enviada correctamente'
    });

  } catch (error) {
    console.error('Error sending quote email:', error);
    return NextResponse.json(
      {
        error: 'Error al enviar la cotización',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
