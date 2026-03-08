// authService.ts

import { signIn, signUp, getCurrentUser, signOut } from 'aws-amplify/auth';

export const authService = {
  async signup(username: string, password: string) {
    return signUp({
      username,
      password,
    });
  },

  async login(username: string, password: string) {
    return signIn({
      username,
      password,
    });
  },

  async getUser() {
    return getCurrentUser();
  },

  async logout() {
    return signOut();
  },
};
