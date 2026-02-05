import User from '@/models/User';
import connectDB from '@/lib/mongodb';

export interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  email?: string;
  created_at: string;
}

export class TwitchAuthService {
  /**
   * Get Twitch user information from Twitch API
   */
  static async getTwitchUserInfo(accessToken: string): Promise<TwitchUser | null> {
    try {
      const response = await fetch('https://api.twitch.tv/helix/users', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Client-Id': process.env.TWITCH_CLIENT_ID || '',
        },
      });

      if (!response.ok) {
        throw new Error(`Twitch API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data?.[0] || null;
    } catch (error) {
      console.error('Error fetching Twitch user info:', error);
      return null;
    }
  }

  /**
   * Create or update user based on Twitch authentication
   */
  static async createOrUpdateUserFromTwitch(twitchUser: TwitchUser) {
    try {
      await connectDB();

      // Check if user already exists by Twitch ID or email
      const existingUser = await User.findOne({
        $or: [
          { twitchId: twitchUser.id },
          { email: twitchUser.email || `${twitchUser.login}@twitch.local` }
        ]
      });

      const userData: any = {
        twitchId: twitchUser.id,
        username: twitchUser.display_name,
        email: twitchUser.email || `${twitchUser.login}@twitch.local`,
        profileImage: twitchUser.profile_image_url,
        accessType: 'premium', // Twitch users get premium access
        lastLogin: new Date(),
        twitchData: {
          login: twitchUser.login,
          displayName: twitchUser.display_name,
          type: twitchUser.type,
          broadcasterType: twitchUser.broadcaster_type,
          description: twitchUser.description,
          profileImageUrl: twitchUser.profile_image_url,
          offlineImageUrl: twitchUser.offline_image_url,
          viewCount: twitchUser.view_count,
          createdAt: twitchUser.created_at,
        },
      };

      if (existingUser) {
        // Update existing user
        Object.assign(existingUser, userData);
        await existingUser.save();
        return existingUser;
      } else {
        // Create new user
        const newUser = new User(userData);
        await newUser.save();
        return newUser;
      }
    } catch (error) {
      console.error('Error creating/updating user from Twitch:', error);
      return null;
    }
  }

  /**
   * Handle Twitch authentication callback
   */
  static async handleTwitchAuth(accessToken: string) {
    try {
      const twitchUser = await this.getTwitchUserInfo(accessToken);
      if (!twitchUser) {
        return null;
      }

      return await this.createOrUpdateUserFromTwitch(twitchUser);
    } catch (error) {
      console.error('Error handling Twitch auth:', error);
      return null;
    }
  }

  /**
   * Check if user is following the channel
   */
  static async isFollowingChannel(userId: string, channelId: string, accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://api.twitch.tv/helix/channels/followers?user_id=${userId}&broadcaster_id=${channelId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Client-Id': process.env.TWITCH_CLIENT_ID || '',
          },
        }
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.data && data.data.length > 0;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  }

  /**
   * Get user's subscription status
   */
  static async getSubscriptionStatus(userId: string, channelId: string, accessToken: string): Promise<any> {
    try {
      const response = await fetch(
        `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${channelId}&user_id=${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Client-Id': process.env.TWITCH_CLIENT_ID || '',
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.data?.[0] || null;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return null;
    }
  }
}



