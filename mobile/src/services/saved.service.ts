import { API_BASE_URL } from './api.config';
import { useAuthStore } from '@/store/useAuthStore';
import { RouteService } from './route.service';
import { SpotService } from './spot.service';
import { Route, Spot } from '@/data/mockData';
import { CreatedMoment } from '@/store/useMomentStore';

export interface SavedResponseData {
  routes: Route[];
  spots: Spot[];
  moments: CreatedMoment[];
  savedRouteIds: string[];
  savedSpotIds: string[];
  savedMomentIds: string[];
}

export class SavedService {
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

  /**
   * Fetch all saved routes, spots, and moments for the authenticated user
   */
  static async getUserSaved(): Promise<SavedResponseData> {
    try {
      const response = await fetch(`${API_BASE_URL}/saved`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch saved items: HTTP ${response.status}`);
      }

      const result = await response.json();
      const raw = result.data || {};

      const routes = Array.isArray(raw.routes) ? raw.routes.map(RouteService.formatRoute) : [];
      const spots = Array.isArray(raw.spots) ? raw.spots.map(SpotService.formatSpot) : [];
      const moments = Array.isArray(raw.moments) ? raw.moments : [];

      const savedRouteIds = Array.isArray(raw.savedRouteIds)
        ? raw.savedRouteIds.map(String)
        : routes.map((r: Route) => String(r.id));
      const savedSpotIds = Array.isArray(raw.savedSpotIds)
        ? raw.savedSpotIds.map(String)
        : spots.map((s: Spot) => String(s.id));
      const savedMomentIds = Array.isArray(raw.savedMomentIds)
        ? raw.savedMomentIds.map(String)
        : moments.map((m: CreatedMoment) => String(m.id));

      return {
        routes,
        spots,
        moments,
        savedRouteIds,
        savedSpotIds,
        savedMomentIds,
      };
    } catch (err) {
      console.warn('[SavedService] Error fetching saved items:', err);
      return {
        routes: [],
        spots: [],
        moments: [],
        savedRouteIds: [],
        savedSpotIds: [],
        savedMomentIds: [],
      };
    }
  }

  /**
   * Toggle save/bookmark on a route
   */
  static async toggleSaveRoute(routeId: string | number): Promise<{ isSaved: boolean }> {
    try {
      const numericId = typeof routeId === 'string' ? parseInt(routeId.replace(/\D/g, ''), 10) || 1 : routeId;
      const response = await fetch(`${API_BASE_URL}/saved/route/${numericId}`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle route bookmark: HTTP ${response.status}`);
      }

      const result = await response.json();
      return { isSaved: !!result.data?.isSaved };
    } catch (err) {
      console.warn('[SavedService] Error toggling route save:', err);
      return { isSaved: false };
    }
  }

  /**
   * Toggle save/bookmark on a spot
   */
  static async toggleSaveSpot(spotId: string | number): Promise<{ isSaved: boolean }> {
    try {
      const numericId = typeof spotId === 'string' ? parseInt(spotId.replace(/\D/g, ''), 10) || 1 : spotId;
      const response = await fetch(`${API_BASE_URL}/saved/spot/${numericId}`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle spot bookmark: HTTP ${response.status}`);
      }

      const result = await response.json();
      return { isSaved: !!result.data?.isSaved };
    } catch (err) {
      console.warn('[SavedService] Error toggling spot save:', err);
      return { isSaved: false };
    }
  }

  /**
   * Toggle save/bookmark on a moment
   */
  static async toggleSaveMoment(momentId: string | number): Promise<{ isSaved: boolean }> {
    try {
      const numericId = typeof momentId === 'string' ? parseInt(momentId.replace(/\D/g, ''), 10) || 1 : momentId;
      const response = await fetch(`${API_BASE_URL}/saved/moment/${numericId}`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle moment bookmark: HTTP ${response.status}`);
      }

      const result = await response.json();
      return { isSaved: !!result.data?.isSaved };
    } catch (err) {
      console.warn('[SavedService] Error toggling moment save:', err);
      return { isSaved: false };
    }
  }
}

