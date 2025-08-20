import type { NextApiRequest, NextApiResponse } from 'next';
import { OAuth2Client } from 'google-auth-library';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'postmessage'
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { code } = req.body;
  if (!code) return res.status(400).json({ message: 'Missing Google auth code' });

  try {
    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) throw new Error('No ID token returned from Google');
    // Now verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) throw new Error('Invalid Google ID token');

    await dbConnect();
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        email: payload.email,
        username: payload.name,
        accessType: 'free',
        googleId: payload.sub,
        picture: payload.picture,
      });
      console.log('Created new user from Google:', user.email);
    } else {
      user.googleId = payload.sub;
      user.picture = payload.picture;
      user.username = user.username || payload.name;
      await user.save();
      console.log('Updated existing user from Google:', user.email);
    }

    // You can generate your own JWT/session here if needed
    res.status(200).json({ user });
  } catch (err: any) {
    console.error('Google login error:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}
