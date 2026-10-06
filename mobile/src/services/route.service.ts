import { API_BASE_URL } from './api.config';
import { DetailedRoute, RoutePlace, RouteHighlight, MOCK_USER_PROFILE } from '@/data/mockData';

export interface BackendRoute {
  id: number;
  userId: number;
  title: string;
  coverImage: string | null;
  shortDescription: string | null;
  description: string | null;
  location: string | null;
  category: string;
  difficulty: string;
  visibility: string;
  distance: string | null;
  duration: string | null;
  places: any;
  highlights: any;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string | null;
    email: string;
  };
}

export class RouteService {
  /**
   * Format backend route into frontend DetailedRoute entity
   */
  static formatRoute(backendRoute: BackendRoute): DetailedRoute {
    const rawPlaces = Array.isArray(backendRoute.places) ? backendRoute.places : [];
    const formattedPlaces: RoutePlace[] = rawPlaces.map((p: any, idx: number) => ({
      id: p.id || `p-${backendRoute.id}-${idx + 1}`,
      spotId: String(p.spotId || p.id || idx + 1),
      order: p.order || idx + 1,
      name: p.name || 'Spot',
      category: p.category || 'Viewpoint',
      location: p.location || backendRoute.location || 'Munnar, Idukki',
      distanceFromStart: p.distanceFromStart || (idx === 0 ? '0 km' : `${(idx * 1.8).toFixed(1)} km`),
      image:
        p.image ||
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    }));

    const rawHighlights = Array.isArray(backendRoute.highlights) ? backendRoute.highlights : [];
    const highlights: RouteHighlight[] = rawHighlights.map((h: any, idx: number) => {
      const title = typeof h === 'string' ? h : h.title || 'Scenic Highlight';
      return {
        id: `h-${backendRoute.id}-${idx + 1}`,
        title,
        description: typeof h === 'object' && h.description ? h.description : `Highlight section of ${backendRoute.title}`,
        image:
          backendRoute.coverImage ||
          'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80',
        photos: [backendRoute.coverImage || 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80'],
      };
    });

    const cover =
      backendRoute.coverImage ||
      (formattedPlaces[0] && formattedPlaces[0].image) ||
      'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80';

    return {
      id: String(backendRoute.id),
      title: backendRoute.title,
      coverImage: cover,
      shortDescription: backendRoute.shortDescription || backendRoute.description || '',
      description: backendRoute.description || backendRoute.shortDescription || '',
      location: backendRoute.location || 'Munnar, Idukki',
      placeCount: formattedPlaces.length || 1,
      distance: backendRoute.distance || `${Math.max(3, formattedPlaces.length * 2)} km`,
      duration: backendRoute.duration || `${Math.max(2, Math.round(formattedPlaces.length * 0.8))}–${Math.max(3, Math.round(formattedPlaces.length * 1.2))} hours`,
      category: backendRoute.category,
      difficulty: backendRoute.difficulty,
      visibility: backendRoute.visibility as any,
      creator: {
        id: String(backendRoute.user?.id || backendRoute.userId || MOCK_USER_PROFILE.id),
        name: backendRoute.user?.name || MOCK_USER_PROFILE.name,
        username: backendRoute.user?.name ? backendRoute.user.name.toLowerCase().replace(/\s+/g, '_') : MOCK_USER_PROFILE.username,
        avatar: MOCK_USER_PROFILE.avatar,
        isVerified: true,
        routeCount: MOCK_USER_PROFILE.routeCount,
      },
      likesCount: backendRoute.likesCount ?? 0,
      commentsCount: backendRoute.commentsCount ?? 0,
      exploredCount: Math.round((backendRoute.likesCount || 0) * 0.4),
      postedTimeAgo: 'Recently',
      imageCount: formattedPlaces.length + 1,
      highlights,
      places: formattedPlaces,
      photos: [cover, ...formattedPlaces.map((p) => p.image)],
      exploredPeople: [],
      explorerExperiences: [],
      experiences: [],
    };
  }

  /**
   * Fetch all routes from the backend API
   */
  static async getAllRoutes(): Promise<DetailedRoute[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/routes`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch routes: HTTP ${response.status}`);
      }

      const result = await response.json();
      if (Array.isArray(result.data)) {
        return result.data.map(this.formatRoute);
      }
      return [];
    } catch (err) {
      console.warn('[RouteService] Error fetching routes from backend:', err);
      throw err;
    }
  }

  /**
   * Fetch a single route by ID
   */
  static async getRouteById(id: string | number): Promise<DetailedRoute> {
    try {
      const response = await fetch(`${API_BASE_URL}/routes/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch route: HTTP ${response.status}`);
      }

      const result = await response.json();
      return this.formatRoute(result.data);
    } catch (err) {
      console.warn(`[RouteService] Error fetching route ${id} from backend:`, err);
      throw err;
    }
  }

  /**
   * Create a new route in the backend
   */
  static async createRoute(routeData: {
    title: string;
    coverImage?: string;
    shortDescription?: string;
    description?: string;
    location?: string;
    category: string;
    difficulty?: string;
    visibility?: string;
    distance?: string;
    duration?: string;
    places?: any[];
    highlights?: string[];
  }): Promise<DetailedRoute> {
    try {
      const payload = {
        title: routeData.title.trim(),
        coverImage: routeData.coverImage || null,
        shortDescription: routeData.shortDescription?.trim() || null,
        description: routeData.description?.trim() || routeData.shortDescription?.trim() || null,
        location: routeData.location?.trim() || 'Munnar, Idukki',
        category: routeData.category?.trim() || 'Nature',
        difficulty: routeData.difficulty || 'Moderate',
        visibility: routeData.visibility || 'Public',
        distance: routeData.distance || null,
        duration: routeData.duration || null,
        places: routeData.places || [],
        highlights: routeData.highlights || [],
      };

      const response = await fetch(`${API_BASE_URL}/routes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create route in backend');
      }

      const result = await response.json();
      return this.formatRoute(result.data);
    } catch (err) {
      console.warn('[RouteService] Error creating route in backend:', err);
      throw err;
    }
  }
}
