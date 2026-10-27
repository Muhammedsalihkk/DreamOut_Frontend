import { create } from 'zustand';
import {
  Spot,
  DetailedRoute,
  RoutePlace,
  RouteHighlight,
  MOCK_USER_PROFILE,
} from '@/data/mockData';
import { SpotService } from '@/services/spot.service';
import { RouteService } from '@/services/route.service';
import { useAuthStore } from '@/store/useAuthStore';

export interface CreateRouteInput {
  title: string;
  coverImage: string;
  shortDescription: string;
  category: string;
  difficulty: string;
  visibility: 'Public' | 'Followers' | 'Private';
  places: Spot[];
  highlights?: string[];
}

interface RouteStoreState {
  spots: Spot[];
  routes: DetailedRoute[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  fetchFromBackend: () => Promise<void>;
  addSpot: (spotData: Omit<Spot, 'id'>) => Promise<Spot>;
  deleteSpot: (id: string) => Promise<boolean>;
  addRoute: (input: CreateRouteInput) => Promise<DetailedRoute>;
  updateRoute: (id: string, input: Partial<CreateRouteInput>) => Promise<DetailedRoute>;
  deleteRoute: (id: string) => Promise<boolean>;
  getRouteById: (id: string) => DetailedRoute | undefined;
  getSpotById: (id: string) => Spot | undefined;
}

export const useRouteStore = create<RouteStoreState>((set, get) => ({
  spots: [],
  routes: [],
  isLoading: false,
  error: null,
  isInitialized: false,

  fetchFromBackend: async () => {
    set({ isLoading: true, error: null });
    try {
      const [backendSpots, backendRoutes] = await Promise.allSettled([
        SpotService.getAllSpots(),
        RouteService.getAllRoutes(),
      ]);

      const updatedState: Partial<RouteStoreState> = {
        isLoading: false,
        isInitialized: true,
      };

      if (backendSpots.status === 'fulfilled') {
        // Show spots ONLY from backend
        updatedState.spots = backendSpots.value;
      } else {
        console.warn('[useRouteStore] Failed to fetch backend spots:', backendSpots.reason);
        updatedState.spots = [];
      }

      if (backendRoutes.status === 'fulfilled') {
        // Show routes ONLY from backend
        updatedState.routes = backendRoutes.value;
      } else {
        console.warn('[useRouteStore] Failed to fetch backend routes:', backendRoutes.reason);
        updatedState.routes = [];
      }

      set(updatedState as RouteStoreState);
    } catch (err: any) {
      console.warn('[useRouteStore] Backend sync fallback active:', err?.message || err);
      set({ isLoading: false, isInitialized: true, error: err?.message || 'Sync failed' });
    }
  },

  addSpot: async (spotData) => {
    const authUser = useAuthStore.getState().user;
    const persistedSpot = await SpotService.createSpot({
      name: spotData.name,
      category: spotData.category,
      location: spotData.location,
      description: spotData.description,
      image: spotData.image,
      latitude: spotData.latitude,
      longitude: spotData.longitude,
      userId: authUser?.id ? Number(authUser.id) : undefined,
    });

    const fullSpot: Spot = {
      ...persistedSpot,
      title: persistedSpot.name,
      tags: [persistedSpot.category || 'Nature', 'Spot'],
      creator: persistedSpot.creator || (authUser ? {
        id: String(authUser.id),
        name: authUser.name || 'Explorer',
        username: (authUser.name || 'explorer').toLowerCase().replace(/\s+/g, '_'),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      } : {
        id: MOCK_USER_PROFILE.id,
        name: MOCK_USER_PROFILE.name,
        username: MOCK_USER_PROFILE.username,
        avatar: MOCK_USER_PROFILE.avatar,
      }),
      routeCount: 1,
    };

    set((state) => ({
      spots: [fullSpot, ...state.spots.filter((s) => s.id !== fullSpot.id)],
    }));

    return fullSpot;
  },

  deleteSpot: async (id: string) => {
    const success = await SpotService.deleteSpot(id);
    if (success) {
      set((state) => ({
        spots: state.spots.filter((s) => s.id !== id),
      }));
    }
    return success;
  },

  addRoute: async (input) => {
    const formattedPlaces: RoutePlace[] = input.places.map((spot, index) => {
      const dist = index === 0 ? '0 km' : `${(index * 1.8 + Math.random() * 0.5).toFixed(1)} km`;
      return {
        id: `p-${spot.id}-${index + 1}`,
        spotId: spot.id,
        order: index + 1,
        name: spot.name || spot.title || 'Spot',
        category: spot.category || 'Viewpoint',
        location: spot.location || 'Munnar, Idukki',
        distanceFromStart: dist,
        image: spot.image,
      };
    });

    const totalPlacesCount = formattedPlaces.length;
    const estimatedDistanceKm = Math.max(3, Math.round(totalPlacesCount * 1.8));
    const estimatedDurationHours = `${Math.max(2, Math.round(totalPlacesCount * 0.7))}–${Math.max(3, Math.round(totalPlacesCount * 1.1))} hours`;

    const highlights: string[] = (input.highlights && input.highlights.length > 0
      ? input.highlights
      : ['Scenic Viewpoints', 'Nature Trails', 'Tea Gardens']
    ).map((h) => (typeof h === 'string' ? h : (h as any).title || 'Scenic Highlight'));

    const persistedRoute = await RouteService.createRoute({
      title: input.title,
      coverImage: input.coverImage,
      shortDescription: input.shortDescription,
      description: input.shortDescription,
      location: formattedPlaces[0]?.location || 'Munnar, Idukki',
      category: input.category || 'Nature',
      difficulty: input.difficulty,
      visibility: input.visibility,
      distance: `${estimatedDistanceKm} km`,
      duration: estimatedDurationHours,
      places: formattedPlaces,
      highlights,
    });

    set((state) => ({
      routes: [persistedRoute, ...state.routes.filter((r) => r.id !== persistedRoute.id)],
    }));

    return persistedRoute;
  },

  updateRoute: async (id, input) => {
    const updated = await RouteService.updateRoute(id, {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.coverImage !== undefined && { coverImage: input.coverImage }),
      ...(input.shortDescription !== undefined && { shortDescription: input.shortDescription, description: input.shortDescription }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.difficulty !== undefined && { difficulty: input.difficulty }),
      ...(input.visibility !== undefined && { visibility: input.visibility }),
      ...(input.places !== undefined && { places: input.places }),
      ...(input.highlights !== undefined && { highlights: input.highlights }),
    });

    set((state) => ({
      routes: state.routes.map((r) => (r.id === String(id) ? updated : r)),
    }));

    return updated;
  },

  deleteRoute: async (id: string) => {
    const success = await RouteService.deleteRoute(id);
    if (success) {
      set((state) => ({
        routes: state.routes.filter((r) => String(r.id) !== String(id)),
      }));
    }
    return success;
  },

  getRouteById: (id) => {
    return get().routes.find((r) => String(r.id) === String(id));
  },

  getSpotById: (id) => {
    return get().spots.find((s) => String(s.id) === String(id));
  },
}));

// Initialize store from backend on app boot
useRouteStore.getState().fetchFromBackend();
