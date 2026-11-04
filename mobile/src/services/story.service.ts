import { API_BASE_URL } from './api.config';
import { useAuthStore } from '@/store/useAuthStore';
import { Story } from '@/data/mockData';

export class StoryService {
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

  static formatStory(item: any): Story {
    const authUser = useAuthStore.getState().user;
    const isUserStory = authUser ? String(authUser.id) === String(item.userId) : false;

    return {
      id: String(item.id),
      title: item.user?.name ? item.user.name.split(' ')[0] : 'Story',
      image:
        item.mediaUrl ||
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
      isUserStory,
      hasUnseen: true,
      timeAgo: 'Recently',
      user: {
        id: String(item.user?.id || item.userId || '1'),
        name: item.user?.name || 'Explorer',
        username: item.user?.name ? item.user.name.toLowerCase().replace(/\s+/g, '_') : 'explorer',
        avatar:
          item.user?.avatar ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      },
      segments: [
        {
          id: `seg-${item.id}`,
          type: item.mediaType === 'video' ? 'video' : 'image',
          mediaUri:
            item.mediaUrl ||
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
          duration: item.duration || 5,
          caption: item.caption || '',
          location: 'Munnar, Kerala',
          timeAgo: 'Recently',
        },
      ],
    };
  }

  /**
   * Fetch all active stories from backend
   */
  static async getStories(): Promise<Story[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/stories`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stories: HTTP ${response.status}`);
      }

      const result = await response.json();
      if (Array.isArray(result.data)) {
        return result.data.map(this.formatStory);
      }
      return [];
    } catch (err) {
      console.warn('[StoryService] Error fetching stories:', err);
      return [];
    }
  }

  /**
   * Fetch a single story by ID
   */
  static async getStoryById(id: string | number): Promise<Story | null> {
    try {
      const numericId = typeof id === 'string' ? parseInt(id.replace(/\D/g, ''), 10) || 1 : id;
      const response = await fetch(`${API_BASE_URL}/stories/${numericId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch story: HTTP ${response.status}`);
      }

      const result = await response.json();
      return result.data ? this.formatStory(result.data) : null;
    } catch (err) {
      console.warn(`[StoryService] Error fetching story ${id}:`, err);
      return null;
    }
  }

  /**
   * Create a new story
   */
  static async createStory(payload: {
    mediaUrl: string;
    mediaType?: 'image' | 'video';
    caption?: string;
    duration?: number;
  }): Promise<Story> {
    const response = await fetch(`${API_BASE_URL}/stories`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        mediaUrl: payload.mediaUrl,
        mediaType: payload.mediaType || 'image',
        caption: payload.caption || '',
        duration: payload.duration || 5,
      }),
    });

    if (!response.ok) {
      const errRes = await response.json().catch(() => ({}));
      throw new Error(errRes.message || `Failed to create story: HTTP ${response.status}`);
    }

    const result = await response.json();
    return this.formatStory(result.data);
  }

  /**
   * Delete a story
   */
  static async deleteStory(id: string | number): Promise<boolean> {
    const numericId = typeof id === 'string' ? parseInt(id.replace(/\D/g, ''), 10) || 1 : id;
    const response = await fetch(`${API_BASE_URL}/stories/${numericId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return response.ok;
  }
}

