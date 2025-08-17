import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { signIn, signUp, confirmSignUp, signOut, getCurrentUser, resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string, email: string) => Promise<void>;
  signOut: () => Promise<void>;
  confirmSignUp: (username: string, code: string) => Promise<void>;
  forgotPassword: (username: string) => Promise<void>;
  confirmForgotPassword: (username: string, code: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
    
    // Listen for auth events
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          setIsAuthenticated(true);
          setUser(payload.data);
          break;
        case 'signedOut':
          setIsAuthenticated(false);
          setUser(null);
          break;
        case 'tokenRefresh':
          // Handle token refresh
          break;
      }
    });

    return unsubscribe;
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await getCurrentUser();
      setIsAuthenticated(true);
      setUser(currentUser);
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (username: string, password: string) => {
    try {
      const user = await signIn({ username, password });
      setIsAuthenticated(true);
      setUser(user);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const handleSignUp = async (username: string, password: string, email: string) => {
    try {
      await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const handleConfirmSignUp = async (username: string, code: string) => {
    try {
      await confirmSignUp({ username, confirmationCode: code });
    } catch (error) {
      console.error('Confirm sign up error:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const handleForgotPassword = async (username: string) => {
    try {
      await resetPassword({ username });
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const handleConfirmForgotPassword = async (username: string, code: string, newPassword: string) => {
    try {
      await confirmResetPassword({ username, confirmationCode: code, newPassword });
    } catch (error) {
      console.error('Confirm forgot password error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    confirmSignUp: handleConfirmSignUp,
    forgotPassword: handleForgotPassword,
    confirmForgotPassword: handleConfirmForgotPassword,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
