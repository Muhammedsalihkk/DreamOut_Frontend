import { create } from 'zustand';
import { Spot, User, MOCK_USER_PROFILE } from '@/data/mockData';

export interface CreatedMoment {
  id: string;
  type: 'photo' | 'video' | 'note';
  mediaUri?: string;
  noteText?: string;
  caption: string;
  spot?: Spot | { id: string; name: string; location: string };
  route?: { id: string; title: string; placesCount?: number; distance?: string };
  visibility: 'Public' | 'Followers' | 'Private';
  addToStory: boolean;
  shareToExplore: boolean;
  tags: string[];
  filterName?: string;
  user: User;
  createdAt: string;
  timeAgo: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
}

export interface ActiveJourneyContext {
  routeId: string;
  routeTitle: string;
  spotId: string;
  spotName: string;
  spotLocation: string;
  journeyName: string;
}

interface MomentStoreState {
  moments: CreatedMoment[];
  activeJourney: ActiveJourneyContext | null;
  setActiveJourney: (journey: ActiveJourneyContext | null) => void;
  addMoment: (momentData: Omit<CreatedMoment, 'id' | 'user' | 'createdAt' | 'timeAgo' | 'likesCount' | 'commentsCount'>) => CreatedMoment;
  getMomentById: (id: string) => CreatedMoment | undefined;
}

// Pre-seeded moments for realistic demonstration
const INITIAL_MOMENTS: CreatedMoment[] = [
  {
    id: 'm-1',
    type: 'photo',
    mediaUri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80',
    caption: 'The sunrise at Kolukkumalai was absolutely magical! Cloud blanket over the valley.',
    spot: {
      id: 'spot-1',
      name: 'Kolukkumalai View Point',
      location: 'Munnar, Idukki',
    },
    route: {
      id: 'r1',
      title: 'Munnar Peak Trail',
      placesCount: 7,
      distance: '12 km',
    },
    visibility: 'Public',
    addToStory: true,
    shareToExplore: true,
    tags: ['Sunrise', 'Mountains', 'Munnar', 'DreamOut'],
    user: {
      id: MOCK_USER_PROFILE.id,
      name: MOCK_USER_PROFILE.name,
      username: MOCK_USER_PROFILE.username,
      avatar: MOCK_USER_PROFILE.avatar,
    },
    createdAt: new Date().toISOString(),
    timeAgo: '2 minutes ago',
    likesCount: 12,
    commentsCount: 3,
  },
  {
    id: 'm-2',
    type: 'note',
    noteText: 'The sound of the waterfall made this one of my favorite stops along the Munnar Peak Trail.',
    caption: 'Pure serenity at Attukal Waterfalls. Highly recommend visiting early morning.',
    spot: {
      id: 'spot-2',
      name: 'Attukal Waterfalls',
      location: 'Munnar, Idukki',
    },
    route: {
      id: 'r1',
      title: 'Munnar Peak Trail',
      placesCount: 7,
      distance: '12 km',
    },
    visibility: 'Public',
    addToStory: false,
    shareToExplore: true,
    tags: ['Waterfall', 'Nature', 'Munnar'],
    user: {
      id: MOCK_USER_PROFILE.id,
      name: MOCK_USER_PROFILE.name,
      username: MOCK_USER_PROFILE.username,
      avatar: MOCK_USER_PROFILE.avatar,
    },
    createdAt: new Date().toISOString(),
    timeAgo: '1 hour ago',
    likesCount: 24,
    commentsCount: 5,
  },
];

export const useMomentStore = create<MomentStoreState>((set, get) => ({
  moments: INITIAL_MOMENTS,
  activeJourney: {
    routeId: 'r1',
    routeTitle: 'Munnar Peak Trail',
    spotId: 'spot-2',
    spotName: 'Attukal Waterfalls',
    spotLocation: 'Munnar, Idukki',
    journeyName: 'Munnar Peak Exploration',
  },

  setActiveJourney: (journey) => set({ activeJourney: journey }),

  addMoment: (input) => {
    const newMomentId = `moment-${Date.now()}`;
    const newMoment: CreatedMoment = {
      ...input,
      id: newMomentId,
      user: {
        id: MOCK_USER_PROFILE.id,
        name: MOCK_USER_PROFILE.name,
        username: MOCK_USER_PROFILE.username,
        avatar: MOCK_USER_PROFILE.avatar,
      },
      createdAt: new Date().toISOString(),
      timeAgo: 'Just now',
      likesCount: 1,
      commentsCount: 0,
    };

    set((state) => ({
      moments: [newMoment, ...state.moments],
    }));

    return newMoment;
  },

  getMomentById: (id) => {
    return get().moments.find((m) => m.id === id);
  },
}));
