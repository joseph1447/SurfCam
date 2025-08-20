import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import MagicLinkToken from '@/models/MagicLinkToken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;
  if (!email || typeof email !== 'string') return res.status(400).json({ message: 'Email requerido' });

  await dbConnect();

  // Generar token único y fecha de expiración (15 minutos)
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // Guardar en la base de datos
  await MagicLinkToken.create({ email, token, expiresAt });

  // Configura tu transport (ejemplo con Gmail)
  const transporterConfig = {
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  };
  console.log('Nodemailer transporter config:', { ...transporterConfig, auth: { user: transporterConfig.auth.user, pass: '***' } });
  const transporter = nodemailer.createTransport(transporterConfig);

  const magicLink = `${process.env.NEXTAUTH_URL}/api/auth/validate?token=${token}`;

  try {
    await transporter.sendMail({
      from: `"SurfCam" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Tu enlace mágico para acceder a SurfCam',
      html: `<p>Haz clic en el siguiente enlace para acceder:</p>
             <a href="${magicLink}">${magicLink}</a>
             <p>Este enlace expirará en 15 minutos.</p>`,
    });
    console.log('Magic link email sent to:', email);
    res.status(200).json({ success: true, message: 'Enlace enviado. Revisa tu correo.' });
  } catch (err: any) {
    console.error('Error sending magic link email:', err);
    res.status(500).json({ message: err.message || 'Error enviando el email' });
  }
}
