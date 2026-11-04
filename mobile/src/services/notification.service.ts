import { API_BASE_URL } from './api.config';
import { useAuthStore } from '@/store/useAuthStore';
import { NotificationItem, NotificationFilterType } from '@/data/mockData';

export class NotificationService {
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

  private static formatNotification(item: any): NotificationItem {
    return {
      id: String(item.id),
      type: item.type || 'system',
      category: (item.category as any) || 'System',
      title: item.title || 'Notification',
      body: item.body || item.message || '',
      timeAgo: 'Recently',
      dateGroup: 'Today',
      isUnread: item.isRead === false,
      targetType: (item.targetType as any) || 'system',
      targetId: item.targetId ? String(item.targetId) : undefined,
      user: item.sender
        ? {
            id: String(item.sender.id),
            name: item.sender.name || 'DreamOut Explorer',
            username: item.sender.name ? item.sender.name.toLowerCase().replace(/\s+/g, '_') : 'dreamout',
            avatar:
              item.sender.avatar ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            isVerified: true,
          }
        : undefined,
    };
  }

  /**
   * Fetch user notifications with optional category filter
   */
  static async getNotifications(category?: NotificationFilterType): Promise<NotificationItem[]> {
    try {
      const url =
        category && category !== 'All'
          ? `${API_BASE_URL}/notifications?category=${encodeURIComponent(category)}`
          : `${API_BASE_URL}/notifications`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: HTTP ${response.status}`);
      }

      const result = await response.json();
      if (Array.isArray(result.data)) {
        return result.data.map(this.formatNotification);
      }
      return [];
    } catch (err) {
      console.warn('[NotificationService] Error fetching notifications:', err);
      return [];
    }
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(id: string | number): Promise<boolean> {
    try {
      const numericId = typeof id === 'string' ? parseInt(id.replace(/\D/g, ''), 10) || 1 : id;
      const response = await fetch(`${API_BASE_URL}/notifications/${numericId}/read`, {
        method: 'PATCH',
        headers: this.getHeaders(),
      });

      return response.ok;
    } catch (err) {
      console.warn(`[NotificationService] Error marking notification ${id} as read:`, err);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: this.getHeaders(),
      });

      return response.ok;
    } catch (err) {
      console.warn('[NotificationService] Error marking all notifications as read:', err);
      return false;
    }
  }
}

