import { create } from 'zustand';
import { authService } from '../services/authService';
import { syncEntries } from '../services/syncService';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';

type AuthState = {
  user: any | null;
  loading: boolean;

  checkUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  loading: true,

  checkUser: async () => {
    try {
      const user = await getCurrentUser();

      console.log('User session restored:', user);

      set({ user, loading: false });
    } catch (err) {
      console.log('No logged in user');

      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    await authService.login(email, password);

    const user = await getCurrentUser();

    console.log('Authenticated user:', user);

    set({ user });

    console.log('User logged in — starting sync');

    await syncEntries();
  },

  logout: async () => {
    await authService.logout();
    set({ user: null });
  },
}));
