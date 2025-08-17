import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

export class OAuthHandler {
  private static instance: OAuthHandler;
  private isInitialized = false;

  static getInstance(): OAuthHandler {
    if (!OAuthHandler.instance) {
      OAuthHandler.instance = new OAuthHandler();
    }
    return OAuthHandler.instance;
  }

  initialize() {
    if (this.isInitialized) return;
    
    // Listen for auth events
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          console.log('User signed in via OAuth');
          this.handleSuccessfulSignIn();
          break;
        case 'signedOut':
          console.log('User signed out');
          break;
        case 'tokenRefresh':
          console.log('Token refreshed');
          break;
        case 'signInWithRedirect_failure':
          console.log('Sign-in redirect failed:', payload.data);
          break;
      }
    });

    this.isInitialized = true;
    return unsubscribe;
  }

  private async handleSuccessfulSignIn() {
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      
      console.log('OAuth Sign-In successful:', {
        user: user.username,
        session: session.tokens
      });

      // You can emit a custom event or use a callback here
      // to notify your app that the user is now authenticated
      
    } catch (error) {
      console.error('Error handling successful sign-in:', error);
    }
  }

  // Method to check if user is authenticated after returning from OAuth
  async checkAuthStatus(): Promise<boolean> {
    try {
      const user = await getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }

  // Method to get user attributes after OAuth sign-in
  async getUserInfo() {
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      
      return {
        username: user.username,
        userId: user.userId,
        session: session.tokens
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }
}

export default OAuthHandler.getInstance();
