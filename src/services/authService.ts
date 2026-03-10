import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  confirmSignUp,
} from 'aws-amplify/auth';

export const authService = {
  async signup(email: string, password: string) {
    return signUp({
      username: email,
      password,
    });
  },

  async confirmSignup(email: string, code: string) {
    return confirmSignUp({
      username: email,
      confirmationCode: code,
    });
  },

  async login(email: string, password: string) {
    const result = await signIn({
      username: email,
      password,
    });

    console.log('SignIn result:', result);

    if (!result.isSignedIn) {
      throw new Error(result.nextStep?.signInStep);
    }

    return result;
  },

  async currentUser() {
    return getCurrentUser();
  },

  async logout() {
    return signOut();
  },
};
