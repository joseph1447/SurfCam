import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import MagicLinkToken from '@/models/MagicLinkToken';
import nodemailer from 'nodemailer';

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;
  if (!email || typeof email !== 'string') return res.status(400).json({ message: 'Email requerido' });

  await dbConnect();

  // Generar código único y fecha de expiración (15 minutos)
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // Guardar en la base de datos (puedes borrar códigos previos para el mismo email si quieres)
  await MagicLinkToken.deleteMany({ email });
  await MagicLinkToken.create({ email, code, expiresAt });

  // Configura tu transport (ejemplo con Gmail)
  const transporterConfig = {
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  };
  const transporter = nodemailer.createTransport(transporterConfig);

  await transporter.sendMail({
    from: `"SurfCam" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Tu código de acceso temporal para SurfCam',
    html: `<p>Tu código de acceso es:</p>
           <div style="font-size:2rem;font-weight:bold;letter-spacing:0.2em;margin:16px 0;">${code}</div>
           <p>Ingresa este código en la app. El código expirará en 15 minutos.</p>
           <p>Si no ves este correo, revisa tu carpeta de spam o correo no deseado.</p>`,
  });

  res.status(200).json({ success: true, message: 'Código enviado. Revisa tu correo.' });
}
