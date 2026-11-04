import { create } from 'zustand';
import { AuthService, User, LoginPayload, RegisterPayload } from '../services/auth.service';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  updateUserAvatar: (avatarUrl: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (payload: LoginPayload): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const data = await AuthService.login(payload);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'An unexpected error occurred during login.',
      });
      return false;
    }
  },

  register: async (payload: RegisterPayload): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const data = await AuthService.register(payload);
      set({
        user: data.user,
        token: data.token || null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'An unexpected error occurred during registration.',
      });
      return false;
    }
  },

  updateUserAvatar: async (avatarUrl: string): Promise<boolean> => {
    const currentUser = get().user;
    if (!currentUser) return false;

    set({
      user: {
        ...currentUser,
        avatar: avatarUrl,
      },
    });

    try {
      await AuthService.updateUser(currentUser.id, { avatar: avatarUrl });
      return true;
    } catch (err) {
      console.warn('[useAuthStore] Failed to update avatar in backend:', err);
      return false;
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
