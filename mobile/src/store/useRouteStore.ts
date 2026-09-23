import { create } from 'zustand';
import { Spot, DetailedRoute, RoutePlace, RouteHighlight, MOCK_DETAILED_ROUTE, MOCK_ALL_EXPLORE_SPOTS, MOCK_USER_PROFILE } from '@/data/mockData';

// Preset Spots for Munnar & other regions matching prompt specs
export const INITIAL_SPOTS: Spot[] = [
  {
    id: 'spot-1',
    name: 'Kolukkumalai View Point',
    title: 'Kolukkumalai View Point',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    category: 'Viewpoint',
    tags: ['Viewpoint', 'Mountains'],
    location: 'Munnar, Idukki',
    description: 'The highest tea estate in the world offering breathtaking sunrise views above the cloud line.',
    routeCount: 12,
  },
  {
    id: 'spot-2',
    name: 'Attukal Waterfalls',
    title: 'Attukal Waterfalls',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    category: 'Waterfall',
    tags: ['Waterfall', 'Nature'],
    location: 'Munnar, Idukki',
    description: 'A roaring waterfall surrounded by rolling hills and dense green forests between Munnar and Pallivasal.',
    routeCount: 9,
  },
  {
    id: 'spot-3',
    name: 'Tea Gardens Trail',
    title: 'Tea Gardens Trail',
    image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80',
    category: 'Tea Garden',
    tags: ['Tea Garden', 'Trekking'],
    location: 'Munnar, Idukki',
    description: 'Vast emerald green tea plantations with walking paths cutting through organic tea bushes.',
    routeCount: 15,
  },
  {
    id: 'spot-4',
    name: 'Echo Point',
    title: 'Echo Point',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    category: 'Viewpoint',
    tags: ['Viewpoint', 'Lake'],
    location: 'Munnar, Idukki',
    description: 'Picturesque spot where voices echo back natural acoustics across the misty mountain lake.',
    routeCount: 11,
  },
  {
    id: 'spot-5',
    name: 'Top Station',
    title: 'Top Station',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    category: 'Viewpoint',
    tags: ['Viewpoint', 'Sunrise'],
    location: 'Munnar, Idukki',
    description: 'Highest point in Munnar on the Kerala-Tamil Nadu border offering panoramic valley vistas.',
    routeCount: 14,
  },
  {
    id: 'spot-6',
    name: 'Mattupetty Dam',
    title: 'Mattupetty Dam',
    image: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=800&q=80',
    category: 'Lake',
    tags: ['Lake', 'Nature'],
    location: 'Munnar, Idukki',
    description: 'Serene storage reservoir nestled in the hills of Munnar, popular for boating and elephant sightings.',
    routeCount: 8,
  },
  {
    id: 'spot-7',
    name: 'Forest Walk',
    title: 'Forest Walk',
    image: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=800&q=80',
    category: 'Nature',
    tags: ['Nature', 'Trail'],
    location: 'Munnar, Idukki',
    description: 'Peaceful shaded trail beneath eucalyptus trees and high altitude mountain vegetation.',
    routeCount: 7,
  },
  {
    id: 'spot-8',
    name: 'Sunset Rock',
    title: 'Sunset Rock',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    category: 'Viewpoint',
    tags: ['Viewpoint', 'Sunset'],
    location: 'Munnar, Idukki',
    description: 'Dramatic granite cliff edge where travelers gather to watch golden mountain sunsets.',
    routeCount: 8,
  },
  ...MOCK_ALL_EXPLORE_SPOTS,
];

// Deduplicate initial spots by ID
const UNIQUE_INITIAL_SPOTS = Array.from(
  new Map(INITIAL_SPOTS.map((spot) => [spot.id, spot])).values()
);

interface CreateRouteInput {
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
  addSpot: (spotData: Omit<Spot, 'id'>) => Spot;
  addRoute: (input: CreateRouteInput) => DetailedRoute;
  getRouteById: (id: string) => DetailedRoute | undefined;
  getSpotById: (id: string) => Spot | undefined;
}

export const useRouteStore = create<RouteStoreState>((set, get) => ({
  spots: UNIQUE_INITIAL_SPOTS,
  routes: [MOCK_DETAILED_ROUTE],

  addSpot: (spotData) => {
    const newSpotId = `spot-created-${Date.now()}`;
    const newSpot: Spot = {
      id: newSpotId,
      name: spotData.name,
      title: spotData.name,
      image: spotData.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      category: spotData.category || 'Nature',
      tags: [spotData.category || 'Nature', 'Spot'],
      location: spotData.location || 'Munnar, Idukki',
      description: spotData.description || spotData.name,
      creator: {
        id: MOCK_USER_PROFILE.id,
        name: MOCK_USER_PROFILE.name,
        username: MOCK_USER_PROFILE.username,
        avatar: MOCK_USER_PROFILE.avatar,
      },
      routeCount: 1,
    };

    set((state) => ({
      spots: [newSpot, ...state.spots],
    }));

    return newSpot;
  },

  addRoute: (input) => {
    const newRouteId = `route-created-${Date.now()}`;
    const formattedPlaces: RoutePlace[] = input.places.map((spot, index) => {
      const dist = index === 0 ? '0 km' : `${(index * 1.8 + Math.random() * 0.5).toFixed(1)} km`;
      return {
        id: `p-${newRouteId}-${index + 1}`,
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

    const highlights: RouteHighlight[] = (input.highlights && input.highlights.length > 0
      ? input.highlights
      : ['Scenic Viewpoints', 'Nature Trails', 'Tea Gardens']
    ).map((title, idx) => ({
      id: `h-${newRouteId}-${idx + 1}`,
      title,
      description: `Highlight section of ${input.title}`,
      longDescription: `Experience the breathtaking ${title.toLowerCase()} along the ${input.title} route.`,
      image: input.coverImage,
      relatedSpots: formattedPlaces.slice(0, 3),
      photos: [input.coverImage],
    }));

    const newRoute: DetailedRoute = {
      id: newRouteId,
      title: input.title,
      coverImage: input.coverImage || 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80',
      shortDescription: input.shortDescription,
      description: input.shortDescription,
      location: formattedPlaces[0]?.location || 'Munnar, Idukki',
      placeCount: totalPlacesCount,
      distance: `${estimatedDistanceKm} km`,
      duration: estimatedDurationHours,
      category: input.category,
      difficulty: input.difficulty,
      visibility: input.visibility,
      creator: {
        id: MOCK_USER_PROFILE.id,
        name: MOCK_USER_PROFILE.name,
        username: MOCK_USER_PROFILE.username,
        avatar: MOCK_USER_PROFILE.avatar,
        isVerified: true,
        routeCount: MOCK_USER_PROFILE.routeCount + 1,
      },
      likesCount: 1,
      commentsCount: 0,
      exploredCount: 0,
      postedTimeAgo: 'Just now',
      imageCount: input.places.length + 1,
      highlights,
      places: formattedPlaces,
      photos: [input.coverImage, ...input.places.map((p) => p.image)],
      exploredPeople: [],
      explorerExperiences: [],
      experiences: [],
    };

    set((state) => ({
      routes: [newRoute, ...state.routes],
    }));

    return newRoute;
  },

  getRouteById: (id) => {
    return get().routes.find((r) => r.id === id);
  },

  getSpotById: (id) => {
    return get().spots.find((s) => s.id === id);
  },
}));
