import { API_BASE_URL } from './api.config';
import { useAuthStore } from '@/store/useAuthStore';
import { CommentItem } from '@/components/route/RouteCommentsModal';

export interface BackendComment {
  id: number;
  text: string;
  userId: number;
  routeId?: number | null;
  spotId?: number | null;
  parentId?: number | null;
  likesCount: number;
  createdAt: string;
  user?: {
    id: number;
    name: string | null;
    email: string;
    avatar: string | null;
  };
}

export class CommentService {
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

  static formatComment(c: BackendComment): CommentItem {
    const authUser = useAuthStore.getState().user;
    const isCurrentUser = authUser ? String(authUser.id) === String(c.userId) : false;

    return {
      id: String(c.id),
      user: {
        id: String(c.user?.id || c.userId),
        name: c.user?.name || 'Explorer',
        username: c.user?.name ? c.user.name.toLowerCase().replace(/\s+/g, '_') : 'explorer',
        avatar:
          c.user?.avatar ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        isVerified: true,
        isCurrentUser,
      },
      text: c.text,
      timeAgo: 'Recently',
      likesCount: c.likesCount || 0,
      isLiked: false,
      replies: [],
    };
  }

  static async getRouteComments(routeId: string | number): Promise<CommentItem[]> {
    try {
      const numericId = typeof routeId === 'string' ? parseInt(routeId.replace(/\D/g, ''), 10) || 1 : routeId;
      const response = await fetch(`${API_BASE_URL}/comments/route/${numericId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch route comments: HTTP ${response.status}`);
      }

      const result = await response.json();
      if (Array.isArray(result.data)) {
        return result.data.map(this.formatComment);
      }
      return [];
    } catch (err) {
      console.warn(`[CommentService] Error fetching comments for route ${routeId}:`, err);
      return [];
    }
  }

  static async getSpotComments(spotId: string | number): Promise<CommentItem[]> {
    try {
      const numericId = typeof spotId === 'string' ? parseInt(spotId.replace(/\D/g, ''), 10) || 1 : spotId;
      const response = await fetch(`${API_BASE_URL}/comments/spot/${numericId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch spot comments: HTTP ${response.status}`);
      }

      const result = await response.json();
      if (Array.isArray(result.data)) {
        return result.data.map(this.formatComment);
      }
      return [];
    } catch (err) {
      console.warn(`[CommentService] Error fetching comments for spot ${spotId}:`, err);
      return [];
    }
  }

  static async createComment(payload: {
    text: string;
    routeId?: string | number;
    spotId?: string | number;
    parentId?: string | number;
  }): Promise<CommentItem> {
    const numericRouteId = payload.routeId
      ? typeof payload.routeId === 'string'
        ? parseInt(payload.routeId.replace(/\D/g, ''), 10) || undefined
        : payload.routeId
      : undefined;

    const numericSpotId = payload.spotId
      ? typeof payload.spotId === 'string'
        ? parseInt(payload.spotId.replace(/\D/g, ''), 10) || undefined
        : payload.spotId
      : undefined;

    const body = {
      text: payload.text.trim(),
      ...(numericRouteId ? { routeId: numericRouteId } : {}),
      ...(numericSpotId ? { spotId: numericSpotId } : {}),
      ...(payload.parentId ? { parentId: Number(payload.parentId) } : {}),
    };

    const response = await fetch(`${API_BASE_URL}/comments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errRes = await response.json().catch(() => ({}));
      throw new Error(errRes.message || `Failed to post comment: HTTP ${response.status}`);
    }

    const result = await response.json();
    return this.formatComment(result.data);
  }

  static async likeComment(id: string | number): Promise<{ likesCount: number; isLiked: boolean }> {
    const numericId = typeof id === 'string' ? parseInt(id.replace(/\D/g, ''), 10) || 1 : id;
    const response = await fetch(`${API_BASE_URL}/comments/${numericId}/like`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to like comment: HTTP ${response.status}`);
    }

    const result = await response.json();
    return {
      likesCount: result.data?.likesCount ?? 0,
      isLiked: true,
    };
  }

  static async deleteComment(id: string | number): Promise<boolean> {
    const numericId = typeof id === 'string' ? parseInt(id.replace(/\D/g, ''), 10) || 1 : id;
    const response = await fetch(`${API_BASE_URL}/comments/${numericId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return response.ok;
  }
}

