import { API_BASE_URL } from './api.config';
import { useAuthStore } from '@/store/useAuthStore';
import { ConnectionUser } from '@/data/mockData';

export interface ConnectionStats {
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

export class ConnectionService {
  private static getHeaders(): Record<string, string> {
    const token = useAuthStore.getState().token;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private static formatUser(user: any): ConnectionUser {
    return {
      id: String(user.id),
      name: user.name || 'Explorer',
      username: user.name ? user.name.toLowerCase().replace(/\s+/g, '_') : 'explorer',
      avatar:
        user.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
      bio: user.bio || 'Wanderer exploring hills and viewpoints.',
      location: 'Munnar, Kerala',
      routeCount: 4,
      followersCount: 128,
      followingCount: 94,
      isFollowing: !!user.isFollowing,
      followsYou: !!user.followsYou,
    };
  }

  /**
   * Get followers of a specific user
   */
  static async getFollowers(userId: string | number): Promise<ConnectionUser[]> {
    try {
      const numericId = typeof userId === 'string' ? parseInt(userId.replace(/\D/g, ''), 10) || 1 : userId;
      const response = await fetch(`${API_BASE_URL}/connections/followers/${numericId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch followers: HTTP ${response.status}`);
      }

      const result = await response.json();
      if (Array.isArray(result.data)) {
        return result.data.map(this.formatUser);
      }
      return [];
    } catch (err) {
      console.warn(`[ConnectionService] Error fetching followers for user ${userId}:`, err);
      return [];
    }
  }

  /**
   * Get users that a specific user is following
   */
  static async getFollowing(userId: string | number): Promise<ConnectionUser[]> {
    try {
      const numericId = typeof userId === 'string' ? parseInt(userId.replace(/\D/g, ''), 10) || 1 : userId;
      const response = await fetch(`${API_BASE_URL}/connections/following/${numericId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch following: HTTP ${response.status}`);
      }

      const result = await response.json();
      if (Array.isArray(result.data)) {
        return result.data.map(this.formatUser);
      }
      return [];
    } catch (err) {
      console.warn(`[ConnectionService] Error fetching following for user ${userId}:`, err);
      return [];
    }
  }

  /**
   * Follow or unfollow a user
   */
  static async toggleFollow(targetUserId: string | number): Promise<{ isFollowing: boolean }> {
    try {
      const numericId = typeof targetUserId === 'string' ? parseInt(targetUserId.replace(/\D/g, ''), 10) || 1 : targetUserId;
      const response = await fetch(`${API_BASE_URL}/connections/follow/${numericId}`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle follow: HTTP ${response.status}`);
      }

      const result = await response.json();
      return { isFollowing: !!result.data?.isFollowing };
    } catch (err) {
      console.warn(`[ConnectionService] Error toggling follow for target ${targetUserId}:`, err);
      return { isFollowing: false };
    }
  }

  /**
   * Get stats (followers count, following count, isFollowing) for a user
   */
  static async getStats(userId: string | number): Promise<ConnectionStats> {
    try {
      const numericId = typeof userId === 'string' ? parseInt(userId.replace(/\D/g, ''), 10) || 1 : userId;
      const response = await fetch(`${API_BASE_URL}/connections/stats/${numericId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: HTTP ${response.status}`);
      }

      const result = await response.json();
      return {
        followersCount: result.data?.followersCount ?? 0,
        followingCount: result.data?.followingCount ?? 0,
        isFollowing: !!result.data?.isFollowing,
      };
    } catch (err) {
      console.warn(`[ConnectionService] Error fetching stats for user ${userId}:`, err);
      return { followersCount: 0, followingCount: 0, isFollowing: false };
    }
  }
}

