import { API_BASE_URL } from './api.config';
import { Spot } from '@/data/mockData';
import { useAuthStore } from '@/store/useAuthStore';

export interface BackendSpot {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  image: string | null;
  location: string | null;
  latitude: number;
  longitude: number;
  category: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string | null;
    email?: string;
  };
}

export class SpotService {
  /**
   * Helper to format a backend spot into frontend Spot entity
   */
  static formatSpot(backendSpot: BackendSpot): Spot {
    const imageUrl =
      backendSpot.image ||
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';

    return {
      id: String(backendSpot.id),
      name: backendSpot.name,
      title: backendSpot.name,
      description: backendSpot.description || '',
      aboutDescription: backendSpot.description || '',
      category: backendSpot.category || 'Spot',
      tags: [backendSpot.category || 'Spot'],
      location: backendSpot.location || 'Munnar, Idukki',
      image: imageUrl,
      heroPhotos: [imageUrl],
      spotPhotos: [imageUrl],
      latitude: Number(backendSpot.latitude),
      longitude: Number(backendSpot.longitude),
      routeCount: 1,
      creator: backendSpot.user
        ? {
            id: String(backendSpot.user.id),
            name: backendSpot.user.name || 'Explorer',
            username: (backendSpot.user.name || 'explorer').toLowerCase().replace(/\s+/g, '_'),
            avatar:
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          }
        : undefined,
    };
  }

  /**
   * Fetch all spots from the backend API
   */
  static async getAllSpots(): Promise<Spot[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/spots`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch spots: HTTP ${response.status}`);
      }

      const result = await response.json();
      if (Array.isArray(result.data)) {
        return result.data.map((s: BackendSpot) => this.formatSpot(s));
      }
      return [];
    } catch (err) {
      console.warn('[SpotService] Error fetching spots from backend:', err);
      throw err;
    }
  }

  /**
   * Fetch a single spot by ID
   */
  static async getSpotById(id: string | number): Promise<Spot> {
    try {
      const response = await fetch(`${API_BASE_URL}/spots/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch spot: HTTP ${response.status}`);
      }

      const result = await response.json();
      return this.formatSpot(result.data);
    } catch (err) {
      console.warn(`[SpotService] Error fetching spot ${id} from backend:`, err);
      throw err;
    }
  }

  /**
   * Create a new spot in the backend
   */
  static async createSpot(spotData: {
    name: string;
    category?: string;
    location?: string;
    description?: string;
    image?: string;
    latitude?: number;
    longitude?: number;
    userId?: number;
  }): Promise<Spot> {
    const trimmedName = spotData.name?.trim();
    if (!trimmedName) {
      throw new Error('Spot name is required and cannot be empty.');
    }

    const authState = useAuthStore.getState();
    const activeUserId = spotData.userId || (authState.user?.id ? Number(authState.user.id) : undefined);
    const token = authState.token;

    const payload = {
      name: trimmedName,
      category: spotData.category?.trim() || 'Nature & Mountains',
      location: spotData.location?.trim() || 'Munnar, Kerala',
      description: spotData.description?.trim() || trimmedName,
      image: spotData.image || null,
      latitude: spotData.latitude !== undefined && !isNaN(Number(spotData.latitude)) ? Number(spotData.latitude) : 10.0889,
      longitude: spotData.longitude !== undefined && !isNaN(Number(spotData.longitude)) ? Number(spotData.longitude) : 77.0595,
      ...(activeUserId ? { userId: activeUserId } : {}),
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/spots`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
    } catch (networkErr: any) {
      console.warn('[SpotService] Network error creating spot:', networkErr);
      throw new Error('Unable to connect to the server. Please check your internet connection.');
    }

    if (!response.ok) {
      let errorMessage = 'Failed to create spot';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = `Server error (${response.status}: ${response.statusText})`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return this.formatSpot(result.data);
  }

  /**
   * Delete a spot in the backend by ID
   */
  static async deleteSpot(id: string | number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/spots/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.ok;
    } catch (err) {
      console.warn(`[SpotService] Error deleting spot ${id}:`, err);
      return false;
    }
  }
}
