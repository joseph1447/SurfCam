import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import MagicLinkToken from '@/models/MagicLinkToken';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.query;
  if (!token || typeof token !== 'string') return res.status(400).send('Token inválido');

  await dbConnect();

  const magicToken = await MagicLinkToken.findOne({ token, used: false });
  if (!magicToken || magicToken.expiresAt < new Date()) {
    return res.status(400).send('El enlace ha expirado o ya fue usado.');
  }

  // Marcar el token como usado
  magicToken.used = true;
  await magicToken.save();

  // Buscar o crear el usuario
  let user = await User.findOne({ email: magicToken.email });
  if (!user) {
    user = await User.create({ email: magicToken.email, accessType: 'free' });
  }

  // Aquí puedes crear una cookie de sesión, JWT, o redirigir al frontend con un token
  // Por simplicidad, redirigimos al home con el email como query (ajusta según tu lógica real)
  res.redirect(`/${'?email=' + encodeURIComponent(user.email)}`);
}
