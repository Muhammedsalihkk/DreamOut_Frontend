import { API_BASE_URL } from './api.config';
import { useAuthStore } from '@/store/useAuthStore';

export interface BackendJourneyMoment {
  id: number;
  journeyId: number;
  spotId: string | null;
  spotName: string | null;
  type: string;
  mediaUrl: string | null;
  caption: string | null;
  visibility: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendJourney {
  id: number;
  userId: number;
  routeId: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  currentSpotIndex: number;
  exploredSpots: number[];
  totalDuration: string | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string | null;
    email: string;
  };
  route?: any;
  moments: BackendJourneyMoment[];
}

export class JourneyService {
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

  static async startJourney(routeId: string | number): Promise<BackendJourney> {
    const response = await fetch(`${API_BASE_URL}/journeys/start`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ routeId: Number(routeId) }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to start journey');
    }

    const json = await response.json();
    return json.data;
  }

  static async updateProgress(
    journeyId: string | number,
    currentSpotIndex: number,
    exploredSpots: any[]
  ): Promise<BackendJourney> {
    const response = await fetch(`${API_BASE_URL}/journeys/${journeyId}/progress`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ currentSpotIndex, exploredSpots }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update journey progress');
    }

    const json = await response.json();
    return json.data;
  }

  static async addMoment(
    journeyId: string | number,
    momentData: {
      spotId?: string;
      spotName?: string;
      type: string;
      mediaUrl?: string | null;
      caption?: string | null;
      visibility?: string;
    }
  ): Promise<BackendJourneyMoment> {
    const response = await fetch(`${API_BASE_URL}/journeys/${journeyId}/moments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(momentData),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to record journey moment');
    }

    const json = await response.json();
    return json.data;
  }

  static async completeJourney(
    journeyId: string | number,
    totalDuration?: string
  ): Promise<BackendJourney> {
    const response = await fetch(`${API_BASE_URL}/journeys/${journeyId}/complete`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ totalDuration }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to complete journey');
    }

    const json = await response.json();
    return json.data;
  }

  static async getJourneyById(journeyId: string | number): Promise<BackendJourney> {
    const response = await fetch(`${API_BASE_URL}/journeys/${journeyId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch journey');
    }

    const json = await response.json();
    return json.data;
  }

  static async getUserJourneys(): Promise<BackendJourney[]> {
    const response = await fetch(`${API_BASE_URL}/journeys/user/me`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch user journeys');
    }

    const json = await response.json();
    return json.data || [];
  }
}
