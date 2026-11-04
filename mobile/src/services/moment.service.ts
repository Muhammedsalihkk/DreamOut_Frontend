import { API_BASE_URL } from './api.config';
import { useAuthStore } from '@/store/useAuthStore';
import { CreatedMoment } from '@/store/useMomentStore';

export class MomentService {
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

  private static formatMoment(m: any): CreatedMoment {
    return {
      id: String(m.id),
      type: m.type || 'photo',
      mediaUri: m.mediaUri,
      noteText: m.noteText,
      caption: m.caption || '',
      visibility: m.visibility || 'Public',
      addToStory: false,
      shareToExplore: true,
      tags: Array.isArray(m.tags) ? m.tags : [],
      likesCount: m.likesCount || 0,
      commentsCount: m.commentsCount || 0,
      createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString(),
      timeAgo: 'Recently',
      user: {
        id: String(m.user?.id || m.userId || '1'),
        name: m.user?.name || 'Explorer',
        username: m.user?.name ? m.user.name.toLowerCase().replace(/\s+/g, '_') : 'explorer',
        avatar:
          m.user?.avatar ||
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      },
    };
  }

  /**
   * Fetch all public moments from backend
   */
  static async getMoments(): Promise<CreatedMoment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/moments`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch moments: HTTP ${response.status}`);
      }

      const result = await response.json();
      if (Array.isArray(result.data)) {
        return result.data.map(this.formatMoment);
      }
      return [];
    } catch (err) {
      console.warn('[MomentService] Error fetching moments:', err);
      return [];
    }
  }

  /**
   * Create a new moment in backend
   */
  static async createMoment(momentData: {
    type: 'photo' | 'video' | 'note';
    mediaUri?: string;
    noteText?: string;
    caption: string;
    visibility: 'Public' | 'Followers' | 'Private';
    tags?: string[];
    routeId?: string | number;
    spotId?: string | number;
    addToStory?: boolean;
  }): Promise<CreatedMoment> {
    const numericRouteId = momentData.routeId
      ? typeof momentData.routeId === 'string'
        ? parseInt(momentData.routeId.replace(/\D/g, ''), 10) || undefined
        : momentData.routeId
      : undefined;

    const numericSpotId = momentData.spotId
      ? typeof momentData.spotId === 'string'
        ? parseInt(momentData.spotId.replace(/\D/g, ''), 10) || undefined
        : momentData.spotId
      : undefined;

    const body = {
      type: momentData.type,
      mediaUri: momentData.mediaUri || null,
      noteText: momentData.noteText || null,
      caption: momentData.caption,
      visibility: momentData.visibility,
      tags: momentData.tags || [],
      routeId: numericRouteId,
      spotId: numericSpotId,
      addToStory: momentData.addToStory,
    };

    const response = await fetch(`${API_BASE_URL}/moments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errRes = await response.json().catch(() => ({}));
      throw new Error(errRes.message || `Failed to create moment: HTTP ${response.status}`);
    }

    const result = await response.json();
    return this.formatMoment(result.data);
  }

  /**
   * Like a moment
   */
  static async likeMoment(id: string | number): Promise<{ likesCount: number }> {
    const numericId = typeof id === 'string' ? parseInt(id.replace(/\D/g, ''), 10) || 1 : id;
    const response = await fetch(`${API_BASE_URL}/moments/${numericId}/like`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to like moment: HTTP ${response.status}`);
    }

    const result = await response.json();
    return { likesCount: result.data?.likesCount ?? 0 };
  }

  /**
   * Delete a moment
   */
  static async deleteMoment(id: string | number): Promise<boolean> {
    const numericId = typeof id === 'string' ? parseInt(id.replace(/\D/g, ''), 10) || 1 : id;
    const response = await fetch(`${API_BASE_URL}/moments/${numericId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return response.ok;
  }
}

