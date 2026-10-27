import { create } from 'zustand';
import { BackendJourney, BackendJourneyMoment, JourneyService } from '@/services/journey.service';
import { CloudinaryService } from '@/services/cloudinary.service';

interface JourneyStoreState {
  activeJourney: BackendJourney | null;
  userJourneys: BackendJourney[];
  isLoading: boolean;
  isSavingMoment: boolean;
  error: string | null;

  startOrResumeJourney: (routeId: string | number) => Promise<BackendJourney>;
  loadJourney: (journeyId: string | number) => Promise<BackendJourney>;
  updateStepProgress: (currentSpotIndex: number, exploredSpots: number[]) => Promise<void>;
  captureAndSaveMoment: (momentData: {
    spotId?: string;
    spotName?: string;
    type: 'photo' | 'video' | 'note';
    mediaUri?: string | null;
    caption?: string;
    visibility?: string;
  }) => Promise<BackendJourneyMoment>;
  completeJourney: (totalDuration?: string) => Promise<BackendJourney>;
  loadUserJourneys: () => Promise<BackendJourney[]>;
}

export const useJourneyStore = create<JourneyStoreState>((set, get) => ({
  activeJourney: null,
  userJourneys: [],
  isLoading: false,
  isSavingMoment: false,
  error: null,

  startOrResumeJourney: async (routeId) => {
    set({ isLoading: true, error: null });
    try {
      const journey = await JourneyService.startJourney(routeId);
      set({ activeJourney: journey, isLoading: false });
      return journey;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Failed to start journey' });
      throw err;
    }
  },

  loadJourney: async (journeyId) => {
    set({ isLoading: true, error: null });
    try {
      const journey = await JourneyService.getJourneyById(journeyId);
      set({ activeJourney: journey, isLoading: false });
      return journey;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Failed to load journey' });
      throw err;
    }
  },

  updateStepProgress: async (currentSpotIndex, exploredSpots) => {
    const active = get().activeJourney;
    if (!active) return;

    // Optimistically update
    set({
      activeJourney: {
        ...active,
        currentSpotIndex,
        exploredSpots,
      },
    });

    try {
      const updated = await JourneyService.updateProgress(active.id, currentSpotIndex, exploredSpots);
      set({ activeJourney: updated });
    } catch (err: any) {
      console.warn('[useJourneyStore] Failed to sync progress to backend:', err);
    }
  },

  captureAndSaveMoment: async (data) => {
    const active = get().activeJourney;
    if (!active) {
      throw new Error('No active journey to attach moment to');
    }

    set({ isSavingMoment: true });
    let finalMediaUrl = data.mediaUri || null;

    if (
      data.mediaUri &&
      (data.mediaUri.startsWith('file:') ||
        data.mediaUri.startsWith('blob:') ||
        data.mediaUri.startsWith('data:') ||
        data.mediaUri.startsWith('content:'))
    ) {
      try {
        const uploadResult = await CloudinaryService.uploadImage(
          { uri: data.mediaUri },
          { folder: 'dreamout/moments' }
        );
        finalMediaUrl = uploadResult.secure_url;
      } catch (uploadErr) {
        console.warn('[useJourneyStore] Cloudinary upload warning:', uploadErr);
      }
    }

    try {
      const newMoment = await JourneyService.addMoment(active.id, {
        spotId: data.spotId,
        spotName: data.spotName,
        type: data.type,
        mediaUrl: finalMediaUrl,
        caption: data.caption,
        visibility: data.visibility || 'public',
      });

      // Update activeJourney with new moment
      set({
        isSavingMoment: false,
        activeJourney: {
          ...active,
          moments: [...(active.moments || []), newMoment],
        },
      });

      return newMoment;
    } catch (err: any) {
      set({ isSavingMoment: false });
      console.warn('[useJourneyStore] Failed to save moment to backend:', err);
      throw err;
    }
  },

  completeJourney: async (totalDuration) => {
    const active = get().activeJourney;
    if (!active) {
      throw new Error('No active journey to complete');
    }

    set({ isLoading: true });
    try {
      const completed = await JourneyService.completeJourney(active.id, totalDuration);
      set({ activeJourney: completed, isLoading: false });
      return completed;
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  loadUserJourneys: async () => {
    set({ isLoading: true });
    try {
      const journeys = await JourneyService.getUserJourneys();
      set({ userJourneys: journeys, isLoading: false });
      return journeys;
    } catch (err: any) {
      set({ isLoading: false });
      return [];
    }
  },
}));
