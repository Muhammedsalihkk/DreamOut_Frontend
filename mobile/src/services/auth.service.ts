import { API_BASE_URL } from './api.config';

export interface User {
  id: number;
  email: string;
  name: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  email: string;
  name?: string;
  password?: string;
}

export class AuthService {
  static async login(payload: LoginPayload): Promise<AuthResponse> {
    const url = `${API_BASE_URL}/auth/login`;
    let response: Response;

    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (networkError) {
      throw new Error('Unable to connect to backend server. Please ensure server is running.');
    }

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || 'Login failed. Please check your credentials.');
    }

    return result.data;
  }

  static async register(payload: RegisterPayload): Promise<{ user: User; token?: string }> {
    const url = `${API_BASE_URL}/auth/register`;
    let response: Response;

    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (networkError) {
      throw new Error('Unable to connect to backend server. Please ensure server is running.');
    }

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || 'Registration failed. Please try again.');
    }

    const userData: User = result.data;

    // After registration, auto-login to obtain auth token
    if (payload.password) {
      try {
        const authRes = await this.login({
          email: payload.email,
          password: payload.password,
        });
        return authRes;
      } catch {
        // Fallback if auto-login after registration fails
        return { user: userData };
      }
    }

    return { user: userData };
  }
}
