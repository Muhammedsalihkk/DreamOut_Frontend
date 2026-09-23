export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface StoryRouteRef {
  id: string;
  title: string;
  image: string;
  subtitle?: string;
  placeCount?: number;
}

export interface StorySegment {
  id: string;
  type?: 'image' | 'video';
  mediaUri: string;
  duration?: number;
  title?: string;
  caption?: string;
  location?: string;
  timeAgo?: string;
  route?: StoryRouteRef;
}

export interface Story {
  id: string;
  title: string;
  image: string;
  isUserStory?: boolean;
  hasUnseen?: boolean;
  user?: User;
  timeAgo?: string;
  segments?: StorySegment[];
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isVerified?: boolean;
  routeCount?: number;
}

export interface ExploreUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isVerified?: boolean;
  bio: string;
  routeCount: number;
  followersCount: number;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  location: string;
  followersCount: number;
  followingCount: number;
  routeCount: number;
  spotCount: number;
  isVerified?: boolean;
}

export interface JourneyUpdate {
  id: string;
  user: User;
  actionText: string;
  targetTitle: string;
  image: string;
  timeAgo: string;
  likesCount: number;
  commentsCount: number;
  isCompleted?: boolean;
}

export interface Route {
  id: string;
  title: string;
  image: string;
  creator: User;
  description: string;
  location?: string;
  category?: string;
  likesCount: number;
  commentsCount: number;
  completedCount: number;
  timeAgo: string;
  imageCount: number;
}

export interface RouteHighlight {
  id: string;
  title: string;
  description: string;
  image: string;
  longDescription?: string;
  relatedSpots?: RoutePlace[];
  photos?: string[];
}

export interface RoutePlace {
  id: string;
  order: number;
  name: string;
  distanceFromStart: string;
  image: string;
  category?: string;
  location?: string;
  spotId?: string;
}

export interface ExploredUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isVerified?: boolean;
  momentsCount: number;
  isFollowing?: boolean;
}

export interface CapturedMoment {
  id: string;
  type: 'photo' | 'video' | 'note';
  spotName: string;
  caption?: string;
  mediaUri?: string;
  duration?: string;
  timeAgo?: string;
}

export interface ExplorerExperience {
  id: string;
  routeId: string;
  user: User;
  exploredDateText: string;
  spotName: string;
  note: string;
  mediaType: 'photo' | 'video' | 'collage';
  mediaUri: string;
  type?: 'photo' | 'video' | 'collage' | 'note' | 'snap' | 'story';
  privacy?: string;
  videoDuration?: string;
  likesCount?: number;
  commentsCount?: number;
  completedPlaces?: number;
  totalPlaces?: number;
  momentsCount?: number;
  moments?: JourneyMomentItem[];
}

export interface JourneyMomentItem {
  id: string;
  placeOrder?: number;
  spotName: string;
  exploredTimeText?: string;
  type: 'photo' | 'video' | 'collage' | 'note';
  mediaUri?: string;
  mediaUris?: string[];
  videoDuration?: string;
  duration?: string;
  timeAgo?: string;
  caption: string;
  hashtags?: string[];
  likesCount?: number;
  commentsCount?: number;
}

export interface JourneyDetailsData {
  id: string;
  routeId: string;
  routeTitle: string;
  explorer: User;
  exploredDateText: string;
  placesExploredText: string;
  momentsCapturedCount: number;
  totalDurationText: string;
  photosCount: number;
  videosCount: number;
  notesCount: number;
  moments: JourneyMomentItem[];
}

export interface DetailedRoute {
  id: string;
  title: string;
  coverImage: string;
  shortDescription: string;
  description: string;
  location: string;
  placeCount: number;
  distance: string;
  duration: string;
  creator: User;
  likesCount: number;
  commentsCount: number;
  exploredCount: number;
  postedTimeAgo: string;
  imageCount: number;
  highlights: RouteHighlight[];
  places: RoutePlace[];
  photos: string[];
  exploredPeople: ExploredUser[];
  explorerExperiences: ExplorerExperience[];
  experiences: Experience[];
  category?: string;
  difficulty?: string;
  visibility?: 'Public' | 'Followers' | 'Private';
}

export interface Spot {
  id: string;
  name: string;
  title?: string;
  image: string;
  category: string;
  location: string;
  creator?: User;
  routeCount?: number;
  description?: string;
  aboutDescription?: string;
  rating?: number;
  ratingCount?: number;
  likesCount?: number;
  commentsCount?: number;
  exploredCount?: number;
  tags?: string[];
  heroPhotos?: string[];
  spotPhotos?: string[];
  elevation?: string;
  bestTime?: string;
  distanceText?: string;
  nearbyTown?: string;
  visitorTips?: string[];
  routesContaining?: { id: string; title: string; image: string; placesCount: number; distance: string; duration: string }[];
  nearbySpotsList?: { id: string; name: string; image: string; distanceAway: string; category: string }[];
  stories?: { id: string; name: string; avatar: string }[];
}

export interface Experience {
  id: string;
  routeId: string;
  routeName: string;
  routeImage: string;
  description: string;
  exploredDateText: string;
  completedPlaces: number;
  totalPlaces: number;
  momentsCount: number;
  notesCount: number;
  distanceKm: number;
  imageCount: number;
  originalCreator?: User;
}

/* LOGGED-IN USER PROFILE (Muhammed) */
export const MOCK_USER_PROFILE: UserProfile = {
  id: 'u1',
  name: 'Muhammed',
  username: 'muhammed_kr',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  bio: 'Exploring places, creating routes & collecting memories.',
  location: 'Kerala, India',
  followersCount: 1200,
  followingCount: 245,
  routeCount: 12,
  spotCount: 8,
};

export const MOCK_USER_CREATED_ROUTES: Route[] = [
  {
    id: 'r1',
    title: 'Munnar Peak Trail',
    image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80',
    creator: {
      id: 'u1',
      name: 'Muhammed',
      username: 'muhammed_kr',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
    description: 'A scenic trail through tea gardens, mountains and waterfalls.',
    location: 'Munnar, Kerala',
    category: 'Mountains',
    likesCount: 120,
    commentsCount: 24,
    completedCount: 86,
    timeAgo: '2 weeks ago',
    imageCount: 5,
  },
  {
    id: 'r2',
    title: 'Varkala Coastal Walk',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    creator: {
      id: 'u1',
      name: 'Muhammed',
      username: 'muhammed_kr',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
    description: 'Cliffs, beaches and breathtaking sunsets along the coast.',
    location: 'Varkala, Kerala',
    category: 'Beaches',
    likesCount: 98,
    commentsCount: 16,
    completedCount: 52,
    timeAgo: '3 weeks ago',
    imageCount: 8,
  },
  {
    id: 'r3',
    title: 'Wayanad Explorer',
    image: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=800&q=80',
    creator: {
      id: 'u1',
      name: 'Muhammed',
      username: 'muhammed_kr',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
    description: 'Forests, lakes and hidden gems of Wayanad.',
    location: 'Wayanad, Kerala',
    category: 'Forests',
    likesCount: 76,
    commentsCount: 12,
    completedCount: 41,
    timeAgo: '1 month ago',
    imageCount: 6,
  },
  {
    id: 'r4',
    title: 'Athirappilly Nature Route',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    creator: {
      id: 'u1',
      name: 'Muhammed',
      username: 'muhammed_kr',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
    description: 'Waterfalls, rivers and lush green forest trails.',
    location: 'Athirappilly, Kerala',
    category: 'Waterfalls',
    likesCount: 132,
    commentsCount: 28,
    completedCount: 73,
    timeAgo: '1 month ago',
    imageCount: 4,
  },
];

export const MOCK_USER_CREATED_SPOTS: Spot[] = [
  {
    id: 's1',
    name: 'Top Station Viewpoint',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    category: 'Mountains',
    location: 'Munnar, Kerala',
    creator: {
      id: 'u1',
      name: 'Muhammed',
      username: 'muhammed_travels',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    },
    routeCount: 6,
  },
  {
    id: 's4',
    name: 'Kolukkumalai Sunrise Cliff',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    category: 'Tea Trails',
    location: 'Munnar, Kerala',
    creator: {
      id: 'u1',
      name: 'Muhammed',
      username: 'muhammed_travels',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    },
    routeCount: 9,
  },
];

export const MOCK_USER_EXPERIENCES: Experience[] = [
  {
    id: 'exp1',
    routeId: 'r1',
    routeName: 'Munnar Peak Trail',
    routeImage: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80',
    exploredDateText: 'Explored on 12 Aug 2024',
    description: 'An amazing journey through tea plantations, valleys and misty mountains.',
    completedPlaces: 5,
    totalPlaces: 7,
    momentsCount: 12,
    notesCount: 4,
    distanceKm: 28,
    imageCount: 12,
  },
  {
    id: 'exp2',
    routeId: 'r2',
    routeName: 'Varkala Coastal Walk',
    routeImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    exploredDateText: 'Explored on 2 Aug 2024',
    description: "Cliffs, beaches and some of the most beautiful sunsets I've ever seen.",
    completedPlaces: 6,
    totalPlaces: 6,
    momentsCount: 8,
    notesCount: 3,
    distanceKm: 15,
    imageCount: 8,
  },
  {
    id: 'exp3',
    routeId: 'r4',
    routeName: 'Athirappilly Nature Route',
    routeImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    exploredDateText: 'Explored on 18 Jul 2024',
    description: 'Waterfalls, rivers, and lush green forests. A perfect day in nature.',
    completedPlaces: 4,
    totalPlaces: 5,
    momentsCount: 15,
    notesCount: 6,
    distanceKm: 18,
    imageCount: 15,
  },
  {
    id: 'exp4',
    routeId: 'r3',
    routeName: 'Wayanad Explorer',
    routeImage: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=800&q=80',
    exploredDateText: 'Explored on 5 Jul 2024',
    description: 'Hidden gems, peaceful lakes and breathtaking viewpoints.',
    completedPlaces: 8,
    totalPlaces: 8,
    momentsCount: 10,
    notesCount: 5,
    distanceKm: 32,
    imageCount: 10,
  },
];

/* OTHER USER PUBLIC PROFILE (Arjun Nair) */
export const MOCK_OTHER_USER_PROFILE: UserProfile = {
  id: 'user-2',
  name: 'Arjun Nair',
  username: 'arjun.travels',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  bio: 'Mountains, beaches, hidden gems and stories from the road.',
  location: 'Kochi, Kerala, India',
  followersCount: 4800,
  followingCount: 312,
  routeCount: 28,
  spotCount: 37,
  isVerified: true,
};

export const MOCK_OTHER_USER_ROUTES: Route[] = [
  {
    id: 'ar-r1',
    title: 'Munnar Peak Trail',
    image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80',
    creator: {
      id: 'user-2',
      name: 'Arjun Nair',
      username: 'arjun.travels',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
    },
    description: 'Incredible tea plantation trek across cloud-capped peaks.',
    location: 'Munnar, Kerala',
    category: 'Mountains',
    likesCount: 420,
    commentsCount: 52,
    completedCount: 160,
    timeAgo: '2 weeks ago',
    imageCount: 8,
  },
  {
    id: 'ar-r2',
    title: 'Varkala Coastal Walk',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    creator: {
      id: 'user-2',
      name: 'Arjun Nair',
      username: 'arjun.travels',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
    },
    description: 'Cliffs, beaches and breathtaking sunsets along the coast.',
    location: 'Varkala, Kerala',
    category: 'Beaches',
    likesCount: 310,
    commentsCount: 44,
    completedCount: 98,
    timeAgo: '3 weeks ago',
    imageCount: 12,
  },
  {
    id: 'ar-r3',
    title: 'Wayanad Explorer',
    image: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=800&q=80',
    creator: {
      id: 'user-2',
      name: 'Arjun Nair',
      username: 'arjun.travels',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
    },
    description: 'Forests, lakes and hidden gems of Wayanad.',
    location: 'Wayanad, Kerala',
    category: 'Forests',
    likesCount: 215,
    commentsCount: 29,
    completedCount: 74,
    timeAgo: '1 month ago',
    imageCount: 6,
  },
  {
    id: 'ar-r4',
    title: 'Kudremukh Peak Ridge',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    creator: {
      id: 'user-2',
      name: 'Arjun Nair',
      username: 'arjun.travels',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
    },
    description: 'Green rolling hills and misty cloudscapes in Western Ghats.',
    location: 'Chikkamagaluru, Karnataka',
    category: 'Mountains',
    likesCount: 580,
    commentsCount: 71,
    completedCount: 230,
    timeAgo: '1 month ago',
    imageCount: 15,
  },
];

export const MOCK_OTHER_USER_SPOTS: Spot[] = [
  {
    id: 'ar-s1',
    name: 'Attukal Waterfalls',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    category: 'Waterfalls',
    location: 'Munnar, Kerala',
    creator: {
      id: 'user-2',
      name: 'Arjun Nair',
      username: 'arjun.travels',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
    },
    routeCount: 5,
  },
  {
    id: 'ar-s2',
    name: 'Varkala Cliff Point',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    category: 'Viewpoint',
    location: 'Varkala, Kerala',
    creator: {
      id: 'user-2',
      name: 'Arjun Nair',
      username: 'arjun.travels',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
    },
    routeCount: 3,
  },
  {
    id: 'ar-s3',
    name: 'Edakkal Caves',
    image: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=800&q=80',
    category: 'Heritage',
    location: 'Wayanad, Kerala',
    creator: {
      id: 'user-2',
      name: 'Arjun Nair',
      username: 'arjun.travels',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
    },
    routeCount: 4,
  },
  {
    id: 'ar-s4',
    name: 'Kappad Beach',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    category: 'Beach',
    location: 'Kozhikode, Kerala',
    creator: {
      id: 'user-2',
      name: 'Arjun Nair',
      username: 'arjun.travels',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
    },
    routeCount: 2,
  },
];

export const MOCK_OTHER_USER_EXPERIENCES: Experience[] = [
  {
    id: 'ar-exp1',
    routeId: 'r5',
    routeName: 'Kudremukh Trek',
    routeImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    exploredDateText: 'Explored on 12 May 2024',
    description: 'Challenging ridge walk through cloud forests and mountain streams.',
    completedPlaces: 7,
    totalPlaces: 7,
    momentsCount: 15,
    notesCount: 8,
    distanceKm: 22,
    imageCount: 15,
  },
  {
    id: 'ar-exp2',
    routeId: 'r6',
    routeName: 'Meesapulimala Route',
    routeImage: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80',
    exploredDateText: 'Explored on 3 Mar 2024',
    description: 'Sunrise trek over second highest peak in Western Ghats.',
    completedPlaces: 5,
    totalPlaces: 6,
    momentsCount: 9,
    notesCount: 5,
    distanceKm: 16,
    imageCount: 9,
  },
];

/* EXPLORE PEOPLE DATASET */
export const MOCK_PEOPLE: ExploreUser[] = [
  {
    id: 'user-2',
    name: 'Arjun Nair',
    username: 'arjun.travels',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    isVerified: true,
    bio: 'Mountains, beaches, hidden gems and stories from the road.',
    routeCount: 28,
    followersCount: 4800,
  },
  {
    id: 'user-3',
    name: 'Sara Thomas',
    username: 'saratravels',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    isVerified: true,
    bio: 'Solo traveler & coffee addict exploring South Asia.',
    routeCount: 19,
    followersCount: 3200,
  },
  {
    id: 'user-4',
    name: 'Aisha Rahman',
    username: 'aisha_explores',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    isVerified: true,
    bio: 'Coastal enthusiast, scuba diver & wildlife photographer.',
    routeCount: 34,
    followersCount: 6100,
  },
  {
    id: 'user-5',
    name: 'Rahul Varma',
    username: 'rahul_hikes',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
    isVerified: false,
    bio: 'High altitude Himalayan trekker and trail guide.',
    routeCount: 15,
    followersCount: 2400,
  },
  {
    id: 'user-6',
    name: 'Vivek Menon',
    username: 'vivek_outdoors',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    isVerified: false,
    bio: 'Overland camper & forest trail explorer.',
    routeCount: 22,
    followersCount: 3900,
  },
];

export const MOCK_STORIES: Story[] = [
  {
    id: 's0',
    title: 'Your Story',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    isUserStory: true,
    user: {
      id: 'user-0',
      name: 'Alex Rivera',
      username: 'alex_rivera',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      isVerified: true,
    },
    timeAgo: 'Just now',
    segments: [
      {
        id: 'seg-s0-1',
        type: 'image',
        mediaUri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
        duration: 5,
        title: 'Morning mist in Wayanad',
        caption: 'Starting the early ridge hike before sunrise. Fresh mountain air and absolute silence.',
        location: 'Wayanad, Kerala',
        timeAgo: '10m ago',
        route: {
          id: 'route-1',
          title: 'Wayanad Highland Trek',
          image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80',
          subtitle: '14 km • 5 stops',
        },
      },
    ],
  },
  {
    id: 's1',
    title: 'Nature',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    hasUnseen: true,
    user: {
      id: 'user-1',
      name: 'Ananya Sharma',
      username: 'ananya.hikes',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      isVerified: true,
    },
    timeAgo: '2h ago',
    segments: [
      {
        id: 'seg-s1-1',
        type: 'image',
        mediaUri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85',
        duration: 6,
        title: 'Peak of Chembra Hill',
        caption: 'Reached the heart-shaped lake after a challenging 3-hour climb! Cloud blanket over the valley.',
        location: 'Chembra Peak, Wayanad',
        timeAgo: '2h ago',
        route: {
          id: 'route-chembra',
          title: 'Chembra Peak Expedition',
          image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80',
          subtitle: '9.2 km • 3 view points',
        },
      },
      {
        id: 'seg-s1-2',
        type: 'image',
        mediaUri: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?auto=format&fit=crop&w=1200&q=85',
        duration: 5,
        title: 'Forest Stream Crossing',
        caption: 'Crystal clear spring water along the pine forest trail. Pure serenity.',
        location: 'Meenmutty Trails, Kerala',
        timeAgo: '3h ago',
        route: {
          id: 'route-chembra',
          title: 'Chembra Peak Expedition',
          image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80',
          subtitle: '9.2 km • 3 view points',
        },
      },
    ],
  },
  {
    id: 's2',
    title: 'Routes',
    image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80',
    hasUnseen: true,
    user: {
      id: 'user-2',
      name: 'Arjun Nair',
      username: 'arjun.travels',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      isVerified: true,
    },
    timeAgo: '4h ago',
    segments: [
      {
        id: 'seg-s2-1',
        type: 'image',
        mediaUri: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=85',
        duration: 5,
        title: 'Sunset at Varkala Cliff',
        caption: 'The golden hour light reflecting off the red cliffs of Varkala. Truly unforgettable.',
        location: 'Varkala Beach Cliff, Kerala',
        timeAgo: '4h ago',
        route: {
          id: 'route-varkala',
          title: 'Coastal Kerala Cliff Drive',
          image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=300&q=80',
          subtitle: '28 km • 6 coastal spots',
        },
      },
      {
        id: 'seg-s2-2',
        type: 'image',
        mediaUri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
        duration: 5,
        title: 'Kappil Backwaters',
        caption: 'Where the serene lake meets the roaring ocean road.',
        location: 'Kappil Lake, Kerala',
        timeAgo: '5h ago',
        route: {
          id: 'route-varkala',
          title: 'Coastal Kerala Cliff Drive',
          image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=300&q=80',
          subtitle: '28 km • 6 coastal spots',
        },
      },
    ],
  },
  {
    id: 's3',
    title: 'Spots',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    hasUnseen: true,
    user: {
      id: 'user-3',
      name: 'Rohan Verma',
      username: 'rohan_explores',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
      isVerified: false,
    },
    timeAgo: '6h ago',
    segments: [
      {
        id: 'seg-s3-1',
        type: 'image',
        mediaUri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85',
        duration: 5,
        title: 'Hidden Waterfall Oasis',
        caption: 'Discovered this secluded waterfall deep inside the forest canopy.',
        location: 'Soochipara Falls, Kerala',
        timeAgo: '6h ago',
        route: {
          id: 'route-waterfall',
          title: 'Wayanad Waterfalls Circuit',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80',
          subtitle: '18 km • 4 waterfalls',
        },
      },
    ],
  },
  {
    id: 's4',
    title: 'Travelers',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    hasUnseen: true,
    user: {
      id: 'user-4',
      name: 'Kavya Patel',
      username: 'kavya_wanderer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      isVerified: true,
    },
    timeAgo: '8h ago',
    segments: [
      {
        id: 'seg-s4-1',
        type: 'image',
        mediaUri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=85',
        duration: 5,
        title: 'Campfire under the Stars',
        caption: 'Overnight camping session at 2,000 meters above sea level.',
        location: 'Kolukkumalai Estate',
        timeAgo: '8h ago',
        route: {
          id: 'route-kolukku',
          title: 'Highest Tea Plantation Trail',
          image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
          subtitle: '12 km • Offroad track',
        },
      },
    ],
  },
  {
    id: 's5',
    title: 'Munnar',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    hasUnseen: false,
    user: {
      id: 'user-5',
      name: 'Priya Iyer',
      username: 'priya.mountain',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      isVerified: false,
    },
    timeAgo: '12h ago',
    segments: [
      {
        id: 'seg-s5-1',
        type: 'image',
        mediaUri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
        duration: 5,
        title: 'Rolling Tea Gardens',
        caption: 'Endless green hills covered in morning dew. Munnar is pure magic.',
        location: 'Munnar, Kerala',
        timeAgo: '12h ago',
        route: {
          id: 'route-munnar',
          title: 'Munnar Tea Valley Escape',
          image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80',
          subtitle: '22 km • 8 viewpoints',
        },
      },
    ],
  },
  {
    id: 's6',
    title: 'Varkala',
    image: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=800&q=80',
    hasUnseen: false,
    user: {
      id: 'user-6',
      name: 'Vivek Menon',
      username: 'vivek_outdoors',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      isVerified: false,
    },
    timeAgo: '1d ago',
    segments: [
      {
        id: 'seg-s6-1',
        type: 'image',
        mediaUri: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1200&q=85',
        duration: 5,
        title: 'Black Beach Walk',
        caption: 'Early morning stroll along the dramatic cliffs and quiet waves.',
        location: 'Varkala Black Beach, Kerala',
        timeAgo: '1d ago',
        route: {
          id: 'route-varkala',
          title: 'Coastal Kerala Cliff Drive',
          image: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=300&q=80',
          subtitle: '28 km • 6 coastal spots',
        },
      },
    ],
  },
];

export const getStoryById = (id: string): Story | undefined => {
  return MOCK_STORIES.find((s) => s.id === id);
};

export const MOCK_CATEGORIES: Category[] = [
  { id: 'all', name: 'All', icon: 'compass-outline' },
  { id: 'mountains', name: 'Mountains', icon: 'trail-sign-outline' },
  { id: 'beaches', name: 'Beaches', icon: 'water-outline' },
  { id: 'forests', name: 'Forests', icon: 'leaf-outline' },
  { id: 'waterfalls', name: 'Waterfalls', icon: 'rainy-outline' },
  { id: 'heritage', name: 'Heritage', icon: 'business-outline' },
  { id: 'nearby', name: 'Nearby', icon: 'location-outline' },
];

export const MOCK_JOURNEY_UPDATES: JourneyUpdate[] = [
  {
    id: 'j1',
    user: {
      id: 'user-2',
      name: 'Arjun Nair',
      username: 'arjun.travels',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
    },
    actionText: 'explored route',
    targetTitle: 'Munnar Peak Trail & Tea Estates',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    timeAgo: '2h ago',
    likesCount: 142,
    commentsCount: 18,
    isCompleted: true,
  },
  {
    id: 'j2',
    user: {
      id: 'u2',
      name: 'Aisha Rahman',
      username: 'aisha_explores',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
    },
    actionText: 'captured a moment at',
    targetTitle: 'Varkala Cliff Sunset Spot',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    timeAgo: '5h ago',
    likesCount: 289,
    commentsCount: 34,
    isCompleted: false,
  },
  {
    id: 'j3',
    user: {
      id: 'u3',
      name: 'Rahul Varma',
      username: 'rahul_hikes',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    },
    actionText: 'published a new route',
    targetTitle: 'Wayanad Forest & Waterfall Pass',
    image: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=800&q=80',
    timeAgo: '1d ago',
    likesCount: 512,
    commentsCount: 67,
    isCompleted: true,
  },
];

export const MOCK_ALL_EXPLORE_ROUTES: Route[] = [
  ...MOCK_USER_CREATED_ROUTES,
  ...MOCK_OTHER_USER_ROUTES,
  {
    id: 'r5',
    title: 'Soochipara Waterfall Trek',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    creator: {
      id: 'user-3',
      name: 'Sara Thomas',
      username: 'saratravels',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
    },
    description: 'Triple-tiered waterfall trek through dense tropical rainforest.',
    location: 'Wayanad, Kerala',
    category: 'Waterfalls',
    likesCount: 380,
    commentsCount: 42,
    completedCount: 110,
    timeAgo: '4 days ago',
    imageCount: 9,
  },
  {
    id: 'r6',
    title: 'Chembra Heart Lake Pass',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    creator: {
      id: 'user-4',
      name: 'Aisha Rahman',
      username: 'aisha_explores',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
    },
    description: 'Ascend to the highest peak in Wayanad featuring a natural heart-shaped lake.',
    location: 'Wayanad, Kerala',
    category: 'Mountains',
    likesCount: 640,
    commentsCount: 88,
    completedCount: 290,
    timeAgo: '1 week ago',
    imageCount: 14,
  },
];

export const MOCK_ALL_EXPLORE_SPOTS: Spot[] = [
  ...MOCK_USER_CREATED_SPOTS,
  ...MOCK_OTHER_USER_SPOTS,
  {
    id: 's5',
    name: 'Soochipara Falls',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    category: 'Waterfalls',
    location: 'Wayanad, Kerala',
    creator: {
      id: 'user-3',
      name: 'Sara Thomas',
      username: 'saratravels',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
    },
    routeCount: 4,
  },
  {
    id: 's6',
    name: 'Kolukkumalai Viewpoint',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    category: 'Mountains',
    location: 'Munnar, Kerala',
    creator: {
      id: 'user-4',
      name: 'Aisha Rahman',
      username: 'aisha_explores',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
    },
    routeCount: 8,
  },
];

/* COMPREHENSIVE DETAILED ROUTE DATA (Munnar Peak Trail) */
export const MOCK_DETAILED_ROUTE: DetailedRoute = {
  id: 'r1',
  title: 'Munnar Peak Trail',
  coverImage: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80',
  shortDescription: 'Tea gardens, misty mountains and stunning viewpoints.',
  description: 'A refreshing trail through lush tea gardens, rolling hills and breathtaking viewpoints. Experience the natural beauty of Munnar like never before as you trek across mist-covered peaks and serene mountain streams.',
  location: 'Munnar, Kerala',
  placeCount: 7,
  distance: '12 km',
  duration: '4–6 hours',
  creator: {
    id: 'user-2',
    name: 'Arjun Nair',
    username: 'arjun.travels',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    isVerified: true,
    routeCount: 28,
  },
  likesCount: 342,
  commentsCount: 56,
  exploredCount: 1200,
  postedTimeAgo: '2 weeks ago',
  imageCount: 12,
  highlights: [
    {
      id: 'h1',
      title: 'Tea Gardens',
      description: 'Endless green tea landscapes',
      longDescription: "A beautiful section of the route through Munnar's world-famous tea-covered hills and organic estates.",
      image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80',
      relatedSpots: [
        {
          id: 'p3',
          spotId: 'spot-3',
          order: 3,
          name: 'Tea Gardens Trail',
          category: 'Tea Garden',
          location: 'Munnar, Kerala',
          distanceFromStart: '5.6 km',
          image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=400&q=80',
        },
        {
          id: 'p3b',
          spotId: 'spot-3b',
          order: 4,
          name: 'Lockhart Tea Estate',
          category: 'Tea Estate',
          location: 'Munnar, Kerala',
          distanceFromStart: '7.1 km',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
        },
      ],
      photos: [
        'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      ],
    },
    {
      id: 'h2',
      title: 'Scenic Viewpoints',
      description: 'Breathtaking mountain cloudscapes',
      longDescription: 'Experience panoramic views along the highest altitude ridges in Munnar where misty clouds move beneath your feet.',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      relatedSpots: [
        {
          id: 'p1',
          spotId: 'spot-1',
          order: 1,
          name: 'Kolukkumalai View Point',
          category: 'Mountain Viewpoint',
          location: 'Munnar, Kerala',
          distanceFromStart: '0 km',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
        },
        {
          id: 'p4',
          spotId: 'spot-4',
          order: 4,
          name: 'Echo Point',
          category: 'Viewpoint',
          location: 'Munnar, Kerala',
          distanceFromStart: '7.8 km',
          image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
        },
        {
          id: 'p6',
          spotId: 'spot-6',
          order: 6,
          name: 'Top Station View',
          category: 'Scenic Viewpoint',
          location: 'Munnar, Kerala',
          distanceFromStart: '10.4 km',
          image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
        },
      ],
      photos: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=600&q=80',
      ],
    },
    {
      id: 'h3',
      title: 'Forest Trails',
      description: 'Walk through lush green forests',
      longDescription: 'A serene trek under thick forest canopy filled with fresh mountain air, natural streams, and rare flora.',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      relatedSpots: [
        {
          id: 'p5',
          spotId: 'spot-5',
          order: 5,
          name: 'Forest Walk',
          category: 'Nature Trail',
          location: 'Munnar, Kerala',
          distanceFromStart: '9.1 km',
          image: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=400&q=80',
        },
        {
          id: 'p2',
          spotId: 'spot-2',
          order: 2,
          name: 'Attukal Waterfalls',
          category: 'Waterfall',
          location: 'Munnar, Kerala',
          distanceFromStart: '3.2 km',
          image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
        },
      ],
      photos: [
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=600&q=80',
      ],
    },
    {
      id: 'h4',
      title: 'Misty Valleys',
      description: 'Unforgettable mountain views',
      longDescription: 'A beautiful section of the route where morning clouds and cool mist move gracefully through deep mountain valleys.',
      image: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=800&q=80',
      relatedSpots: [
        {
          id: 'p1',
          spotId: 'spot-1',
          order: 1,
          name: 'Kolukkumalai View Point',
          category: 'Mountain Viewpoint',
          location: 'Munnar, Kerala',
          distanceFromStart: '0 km',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
        },
        {
          id: 'p4',
          spotId: 'spot-4',
          order: 4,
          name: 'Echo Point',
          category: 'Viewpoint',
          location: 'Munnar, Kerala',
          distanceFromStart: '7.8 km',
          image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
        },
        {
          id: 'p7',
          spotId: 'spot-7',
          order: 7,
          name: 'Sunset Rock',
          category: 'Viewpoint',
          location: 'Munnar, Kerala',
          distanceFromStart: '12 km',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
        },
      ],
      photos: [
        'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      ],
    },
  ],
  places: [
    {
      id: 'p1',
      spotId: 'spot-1',
      order: 1,
      name: 'Kolukkumalai View Point',
      category: 'Mountain Viewpoint',
      location: 'Munnar, Kerala',
      distanceFromStart: '0 km',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'p2',
      spotId: 'spot-2',
      order: 2,
      name: 'Attukal Waterfalls',
      category: 'Waterfall',
      location: 'Munnar, Kerala',
      distanceFromStart: '3.2 km',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'p3',
      spotId: 'spot-3',
      order: 3,
      name: 'Tea Gardens Trail',
      category: 'Tea Garden',
      location: 'Munnar, Kerala',
      distanceFromStart: '5.6 km',
      image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'p4',
      spotId: 'spot-4',
      order: 4,
      name: 'Echo Point',
      category: 'Viewpoint',
      location: 'Munnar, Kerala',
      distanceFromStart: '7.8 km',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'p5',
      spotId: 'spot-5',
      order: 5,
      name: 'Forest Walk',
      category: 'Nature Trail',
      location: 'Munnar, Kerala',
      distanceFromStart: '9.1 km',
      image: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'p6',
      spotId: 'spot-6',
      order: 6,
      name: 'Top Station View',
      category: 'Scenic Viewpoint',
      location: 'Munnar, Kerala',
      distanceFromStart: '10.4 km',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'p7',
      spotId: 'spot-7',
      order: 7,
      name: 'Sunset Rock',
      category: 'Viewpoint',
      location: 'Munnar, Kerala',
      distanceFromStart: '12 km',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    },
  ],
  photos: [
    'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  ],
  exploredPeople: [
    {
      id: 'user-3',
      name: 'Sara Thomas',
      username: 'sara.travels',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      isVerified: true,
      momentsCount: 12,
      isFollowing: true,
    },
    {
      id: 'user-6',
      name: 'Vivek Menon',
      username: 'vivek.explores',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      isVerified: true,
      momentsCount: 8,
      isFollowing: false,
    },
    {
      id: 'user-7',
      name: 'Priya Nair',
      username: 'priya.outdoors',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      isVerified: true,
      momentsCount: 15,
      isFollowing: false,
    },
    {
      id: 'user-5',
      name: 'Rahul Varma',
      username: 'rahul_hikes',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
      isVerified: false,
      momentsCount: 6,
      isFollowing: true,
    },
    {
      id: 'user-8',
      name: 'Ananya Roy',
      username: 'ananya_trails',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      isVerified: false,
      momentsCount: 10,
      isFollowing: false,
    },
  ],
  explorerExperiences: [
    {
      id: 'exp-sara-1',
      routeId: 'r1',
      user: {
        id: 'user-3',
        name: 'Sara Thomas',
        username: 'sara.travels',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        isVerified: true,
      },
      exploredDateText: 'Explored 12 May 2026',
      spotName: 'Kolukkumalai View Point',
      note: 'The clouds were literally below us. One of the most beautiful sunsets I have ever seen.',
      mediaType: 'photo',
      mediaUri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      likesCount: 124,
      commentsCount: 18,
      completedPlaces: 7,
      totalPlaces: 7,
      momentsCount: 12,
      privacy: 'public',
      type: 'snap',
      moments: [
        {
          id: 'm1',
          type: 'photo',
          spotName: 'Kolukkumalai View Point',
          caption: 'Sunrise over mist-covered cloud beds.',
          mediaUri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
          timeAgo: '06:15 AM',
        },
        {
          id: 'm2',
          type: 'photo',
          spotName: 'Attukal Waterfalls',
          caption: 'Cascading waters amidst dense green foliage.',
          mediaUri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
          timeAgo: '09:30 AM',
        },
        {
          id: 'm3',
          type: 'note',
          spotName: 'Echo Point',
          caption: 'The echo reverberated across the entire valley! Unforgettable moment.',
          timeAgo: '11:45 AM',
        },
      ],
    },
    {
      id: 'exp-vivek-1',
      routeId: 'r1',
      user: {
        id: 'user-6',
        name: 'Vivek Menon',
        username: 'vivek.explores',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        isVerified: true,
      },
      exploredDateText: 'Explored 4 May 2026',
      spotName: 'Attukal Waterfalls',
      note: 'A refreshing break during the route. Water was ice cold and incredibly clear.',
      mediaType: 'collage',
      mediaUri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      likesCount: 96,
      commentsCount: 12,
      completedPlaces: 5,
      totalPlaces: 7,
      momentsCount: 8,
      privacy: 'public',
      type: 'story',
      moments: [
        {
          id: 'm4',
          type: 'photo',
          spotName: 'Attukal Waterfalls',
          caption: 'Waterfall stream close up.',
          mediaUri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
          timeAgo: '10:15 AM',
        },
        {
          id: 'm5',
          type: 'photo',
          spotName: 'Top Station Viewpoint',
          caption: 'Tea garden slopes stretching into horizon.',
          mediaUri: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80',
          timeAgo: '01:20 PM',
        },
      ],
    },
    {
      id: 'exp-priya-1',
      routeId: 'r1',
      user: {
        id: 'user-7',
        name: 'Priya Nair',
        username: 'priya.outdoors',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        isVerified: true,
      },
      exploredDateText: 'Explored 20 Apr 2026',
      spotName: 'Echo Point',
      note: 'Morning views at Echo Point. Sound travels so clearly across the lake.',
      mediaType: 'video',
      mediaUri: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=800&q=80',
      videoDuration: '0:28',
      likesCount: 78,
      commentsCount: 9,
      completedPlaces: 7,
      totalPlaces: 7,
      momentsCount: 15,
      privacy: 'public',
      type: 'snap',
      moments: [
        {
          id: 'm6',
          type: 'video',
          spotName: 'Echo Point',
          caption: 'Short video clip of mist rolling over Echo Point Lake.',
          mediaUri: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=800&q=80',
          duration: '0:28',
          timeAgo: '07:45 AM',
        },
      ],
    },
  ],
  experiences: [
    {
      id: 'rd-exp1',
      routeId: 'r1',
      routeName: 'Munnar Peak Trail',
      routeImage: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80',
      exploredDateText: 'Explored 12 May 2026',
      description: 'Incredible sunrise trek across tea plantations and misty ridges.',
      completedPlaces: 7,
      totalPlaces: 7,
      momentsCount: 12,
      notesCount: 4,
      distanceKm: 12,
      imageCount: 12,
      originalCreator: {
        id: 'user-3',
        name: 'Sara Thomas',
        username: 'saratravels',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        isVerified: true,
      },
    },
  ],
};

export const MOCK_ROUTES: Route[] = MOCK_USER_CREATED_ROUTES;
export const MOCK_SPOTS: Spot[] = MOCK_USER_CREATED_SPOTS;

export const MOCK_JOURNEY_DETAILS: JourneyDetailsData = {
  id: 'j1',
  routeId: 'r1',
  routeTitle: 'Munnar Peak Trail',
  explorer: {
    id: 'user-3',
    name: 'Sara Thomas',
    username: 'sara.travels',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    isVerified: true,
  },
  exploredDateText: 'Explored 12 May 2026',
  placesExploredText: '7 / 7 Places Explored',
  momentsCapturedCount: 12,
  totalDurationText: '5h 20m',
  photosCount: 10,
  videosCount: 1,
  notesCount: 1,
  moments: [
    {
      id: 'jm1',
      placeOrder: 1,
      spotName: 'Kolukkumalai View Point',
      exploredTimeText: 'Explored at 6:30 AM',
      type: 'photo',
      mediaUri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80',
      mediaUris: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80',
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1080&q=80',
        'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1080&q=80',
      ],
      caption: "The clouds were literally below us. One of the most beautiful sunrises I've ever seen.",
      hashtags: ['#Kolukkumalai', '#SunriseAboveClouds', '#DreamOut', '#Munnar'],
      likesCount: 124,
      commentsCount: 18,
    },
    {
      id: 'jm2',
      placeOrder: 2,
      spotName: 'Attukal Waterfalls',
      exploredTimeText: 'Explored at 9:15 AM',
      type: 'video',
      mediaUri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1080&q=80',
      videoDuration: '0:28',
      caption: 'A refreshing break at the waterfalls. The trek was totally worth it!',
      hashtags: ['#AttukalWaterfalls', '#NatureVibes', '#OutdoorLife'],
      likesCount: 96,
      commentsCount: 12,
    },
    {
      id: 'jm3',
      placeOrder: 3,
      spotName: 'Echo Point',
      exploredTimeText: 'Explored at 11:40 AM',
      type: 'photo',
      mediaUri: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1080&q=80',
      caption: 'Morning views at Echo Point. Peaceful, misty, and magical.',
      hashtags: ['#EchoPoint', '#MistyMountains', '#TravelMoments'],
      likesCount: 78,
      commentsCount: 9,
    },
    {
      id: 'jm4',
      placeOrder: 4,
      spotName: 'Top Station Viewpoint',
      exploredTimeText: 'Explored at 1:15 PM',
      type: 'note',
      caption: 'Stood at the highest altitude ridge in Munnar. Surrounded by rolling green tea plantations and cool mountain breezes as far as the eye can see. Stopped here for 20 minutes just soaking it all in.',
      hashtags: ['#TopStation', '#TeaGardens', '#TravelJournal'],
      likesCount: 45,
      commentsCount: 6,
    },
  ],
};

export const MOCK_DETAILED_SPOT: Spot = {
  id: 'spot-1',
  name: 'Kolukkumalai View Point',
  title: 'Kolukkumalai View Point',
  image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  category: 'Mountain Viewpoint',
  location: 'Munnar, Kerala',
  tags: ['Scenic', 'Popular', 'High Altitude'],
  description: 'A breathtaking viewpoint known for its panoramic views, tea estates and the chance to see clouds below you.',
  aboutDescription: 'Kolukkumalai View Point is known for its panoramic views of the Western Ghats and surrounding tea estates. Perched at 1,830 meters above sea level, it sits amidst the world highest tea plantation. Visitors embark on early morning jeep safaris to witness spectacular cloud inversions and vibrant sunrises.',
  rating: 4.8,
  ratingCount: 324,
  exploredCount: 12400,
  likesCount: 542,
  commentsCount: 68,
  elevation: '1,830 m',
  bestTime: 'October – March',
  distanceText: '35 km from Munnar',
  nearbyTown: 'Suryanelli',
  heroPhotos: [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  ],
  spotPhotos: [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  ],
  routesContaining: [
    {
      id: 'r1',
      title: 'Munnar Peak Trail',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      placesCount: 7,
      distance: '12 km',
      duration: '4–6 hours',
    },
    {
      id: 'r2',
      title: 'Tea Estates Explorer',
      image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=600&q=80',
      placesCount: 5,
      distance: '18 km',
      duration: '5–7 hours',
    },
    {
      id: 'r3',
      title: 'Western Ghats Loop',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
      placesCount: 8,
      distance: '26 km',
      duration: '8–10 hours',
    },
  ],
  nearbySpotsList: [
    {
      id: 'spot-6',
      name: 'Top Station View',
      category: 'Scenic Viewpoint',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
      distanceAway: '12 km away',
    },
    {
      id: 'spot-4',
      name: 'Echo Point',
      category: 'Viewpoint',
      image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=400&q=80',
      distanceAway: '18 km away',
    },
    {
      id: 'spot-2',
      name: 'Attukal Waterfalls',
      category: 'Waterfall',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
      distanceAway: '28 km away',
    },
  ],
  visitorTips: [
    '☀ Best visited early morning for the best views.',
    '🥾 Wear comfortable shoes.',
    '📷 Bring a camera.',
    '🌥 Weather can be cold and misty.',
  ],
  stories: [
    {
      id: 'st1',
      name: 'Anjali',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'st2',
      name: 'Rohit',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'st3',
      name: 'Meera',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'st4',
      name: 'Arjun',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
  ],
  creator: {
    id: 'user-3',
    name: 'Sara Thomas',
    username: 'sara.travels',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    isVerified: true,
  },
};

/* ========================================================================== */
/* NOTIFICATIONS MOCK DATA                                                   */
/* ========================================================================== */

export type NotificationFilterType = 'All' | 'Mentions' | 'Follows' | 'Journey' | 'System';

export type NotificationType =
  | 'like'
  | 'follow'
  | 'journey'
  | 'route_share'
  | 'comment'
  | 'route_invitation'
  | 'story_view'
  | 'spot_discovery'
  | 'system';

export interface NotificationMomentData {
  id: string;
  spotName: string;
  routeName?: string;
  caption: string;
  mediaUri: string;
  likesCount: number;
  user: User;
  timeAgo: string;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  category: 'Mentions' | 'Follows' | 'Journey' | 'System';
  user?: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isVerified?: boolean;
  };
  title: string;
  body?: string;
  targetTitle?: string;
  timeAgo: string;
  dateGroup: 'Today' | 'Yesterday' | string;
  isUnread?: boolean;
  mediaUri?: string;
  thumbnailUri?: string;
  targetType?: 'moment' | 'route' | 'user' | 'spot' | 'story' | 'system';
  targetId?: string;
  momentData?: NotificationMomentData;
}

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  // Today Group
  {
    id: 'n1',
    type: 'like',
    category: 'Mentions',
    user: {
      id: 'user-2',
      name: 'Arjun Nair',
      username: 'arjun.travels',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
    },
    title: 'Arjun Nair liked your moment',
    body: '"Sunrise at Kolukkumalai was unreal!"',
    timeAgo: '2m ago',
    dateGroup: 'Today',
    isUnread: true,
    thumbnailUri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    targetType: 'moment',
    targetId: 'm-kolukkumalai',
    momentData: {
      id: 'm-kolukkumalai',
      spotName: 'Kolukkumalai View Point',
      routeName: 'Munnar Peak Trail',
      caption: 'Sunrise at Kolukkumalai was unreal!',
      mediaUri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
      likesCount: 12,
      user: {
        id: 'user-0',
        name: 'Alex Rivera',
        username: 'alex_rivera',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      },
      timeAgo: '2m ago',
    },
  },
  {
    id: 'n2',
    type: 'follow',
    category: 'Follows',
    user: {
      id: 'user-3',
      name: 'Sara Thomas',
      username: 'sara_trails',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
    },
    title: 'Sara Thomas started following you',
    timeAgo: '12m ago',
    dateGroup: 'Today',
    isUnread: true,
    targetType: 'user',
    targetId: 'user-3',
  },
  {
    id: 'n3',
    type: 'journey',
    category: 'Journey',
    user: {
      id: 'user-5',
      name: 'Priya Iyer',
      username: 'priya.mountain',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    },
    title: 'Your moment was added to Tea Gardens Trail',
    body: 'Munnar Peak Trail',
    timeAgo: '28m ago',
    dateGroup: 'Today',
    isUnread: true,
    thumbnailUri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80',
    targetType: 'route',
    targetId: 'route-munnar',
  },
  {
    id: 'n4',
    type: 'route_share',
    category: 'Journey',
    user: {
      id: 'user-4',
      name: 'Rohit Sharma',
      username: 'rohit_trails',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    },
    title: 'Rohit shared your route',
    body: '"Saving this for my next trip."',
    timeAgo: '1h ago',
    dateGroup: 'Today',
    isUnread: false,
    thumbnailUri: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=300&q=80',
    targetType: 'route',
    targetId: 'route-varkala',
  },
  {
    id: 'n5',
    type: 'comment',
    category: 'Mentions',
    user: {
      id: 'user-6',
      name: 'Meera Krishnan',
      username: 'meera.explore',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    title: 'Meera commented on your moment',
    body: '"What a view! 😍"',
    timeAgo: '1h ago',
    dateGroup: 'Today',
    isUnread: false,
    thumbnailUri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80',
    targetType: 'moment',
    targetId: 'm-chembra',
    momentData: {
      id: 'm-chembra',
      spotName: 'Chembra Heart Lake',
      routeName: 'Chembra Peak Expedition',
      caption: 'What a view! Cloud blanket over the valley 😍',
      mediaUri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      likesCount: 24,
      user: {
        id: 'user-0',
        name: 'Alex Rivera',
        username: 'alex_rivera',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      },
      timeAgo: '1h ago',
    },
  },

  // Yesterday Group
  {
    id: 'n6',
    type: 'route_invitation',
    category: 'Journey',
    user: {
      id: 'user-7',
      name: 'Faisal Khan',
      username: 'faisal_treks',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
    title: 'Faisal invited you to explore a route',
    targetTitle: 'Wayanad Hidden Gems',
    timeAgo: 'Yesterday, 7:24 PM',
    dateGroup: 'Yesterday',
    isUnread: false,
    thumbnailUri: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?auto=format&fit=crop&w=300&q=80',
    targetType: 'route',
    targetId: 'route-chembra',
  },
  {
    id: 'n7',
    type: 'story_view',
    category: 'Journey',
    title: 'Your story got 50+ views',
    body: 'Travelers are loving your Wayanad mist updates!',
    timeAgo: 'Yesterday, 5:18 PM',
    dateGroup: 'Yesterday',
    isUnread: false,
    thumbnailUri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80',
    targetType: 'story',
    targetId: 's0',
  },
  {
    id: 'n8',
    type: 'spot_discovery',
    category: 'Journey',
    title: 'New spot near you',
    targetTitle: 'Kakkayam Dam',
    timeAgo: 'Yesterday, 1:03 PM',
    dateGroup: 'Yesterday',
    isUnread: false,
    thumbnailUri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80',
    targetType: 'spot',
    targetId: 'spot-kakkayam',
  },

  // Older Group
  {
    id: 'n9',
    type: 'system',
    category: 'System',
    title: 'System Update',
    body: 'New features are now available in DreamOut! Explore interactive story views and route invitations.',
    timeAgo: '18 Sep, 10:12 AM',
    dateGroup: '18 Sep 2026',
    isUnread: false,
    targetType: 'system',
  },
];
