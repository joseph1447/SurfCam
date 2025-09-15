import { NextRequest } from 'next/server';

// Admin authentication utility
export async function checkAdminAuth(request: NextRequest) {
  const sessionToken = request.cookies.get('admin-session')?.value;

  if (!sessionToken) {
    return { authenticated: false, error: 'No session found' };
  }

  try {
    const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8');
    const [email, timestamp] = decoded.split(':');
    
    // Check if session is not expired (24 hours)
    const sessionTime = parseInt(timestamp);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (now - sessionTime > maxAge) {
      return { authenticated: false, error: 'Session expired' };
    }

    if (email === 'josephquesada92@gmail.com') {
      return { authenticated: true };
    }
  } catch (decodeError) {
    console.error('Session decode error:', decodeError);
  }

  return { authenticated: false, error: 'Invalid session' };
}

// Admin credentials (hardcoded for now)
export const ADMIN_CREDENTIALS = {
  email: 'josephquesada92@gmail.com',
  password: 'surfoQ2194'
};
