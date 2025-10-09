import { NextRequest, NextResponse } from 'next/server';
import { TwitchAuthService } from '@/services/TwitchAuthService';

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Access token is required' },
        { status: 400 }
      );
    }

    const user = await TwitchAuthService.handleTwitchAuth(accessToken);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Failed to authenticate with Twitch' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        accessType: user.accessType,
        twitchData: user.twitchData,
      }
    });
  } catch (error) {
    console.error('Twitch auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}



