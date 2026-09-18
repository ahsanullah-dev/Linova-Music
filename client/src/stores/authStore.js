import { create } from 'zustand';
import { api } from '../services/api.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('linova_auth_token') || null,
  isAuthenticated: !!localStorage.getItem('linova_auth_token'),
  isLoading: true,

  initialize: async () => {
    const token = localStorage.getItem('linova_auth_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }

    try {
      api.setToken(token);
      const user = await api.getMe();
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      // Only a real rejection of the credential should end the session. A 500,
      // a 502 from a cold-starting backend, or an offline network blip must NOT
      // throw away a token that is still perfectly valid - that was the cause
      // of users being silently logged out.
      const isAuthRejection =
        error.status === 401 ||
        error.code === 'INVALID_TOKEN' ||
        error.code === 'USER_NOT_FOUND' ||
        error.code === 'UNAUTHORIZED';

      if (isAuthRejection) {
        console.warn('[Auth] Stored session rejected by server, signing out.');
        api.setToken(null);
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        return;
      }

      console.warn('[Auth] Could not verify session (transient). Keeping token.', error);
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const result = await api.login({ email, password });
    api.setToken(result.token);
    set({ user: result.user, token: result.token, isAuthenticated: true });
    return result.user;
  },

  register: async (name, email, password) => {
    const result = await api.register({ name, email, password });
    api.setToken(result.token);
    set({ user: result.user, token: result.token, isAuthenticated: true });
    return result.user;
  },

  logout: () => {
    api.setToken(null);
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateProfile: async (data) => {
    const result = await api.updateProfile(data);
    set({ user: result.user });
    return result.user;
  }
}));
