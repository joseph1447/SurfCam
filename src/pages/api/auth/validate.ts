import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import MagicLinkToken from '@/models/MagicLinkToken';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ message: 'Email y código requeridos' });

  await dbConnect();

  const magicToken = await MagicLinkToken.findOne({ email, code, used: false });
  if (!magicToken || magicToken.expiresAt < new Date()) {
    return res.status(400).json({ message: 'El código es inválido o ha expirado.' });
  }

  // Marcar el código como usado
  magicToken.used = true;
  await magicToken.save();

  // Buscar o crear el usuario
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email, accessType: 'free' });
  }

  // Devuelve el usuario para que el frontend lo use
  res.status(200).json({ success: true, user });
}
