import { fetchAuthSession } from 'aws-amplify/auth';

export interface CognitoTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface TokenPayload {
  sub: string; // User ID
  email: string;
  email_verified: boolean;
  exp: number; // Expiration timestamp
  iat: number; // Issued at timestamp
  [key: string]: any; // Other claims
}

/**
 * Extract and decode JWT token payload
 */
export const decodeToken = (token: string): TokenPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Get current Cognito session and extract tokens
 */
export const getCurrentTokens = async (): Promise<CognitoTokens | null> => {
  try {
    const session = await fetchAuthSession();
    
    if (!session.tokens) {
      console.warn('No tokens found in session');
      return null;
    }

    const idToken = session.tokens.idToken?.toString();
    const accessToken = session.tokens.accessToken?.toString();
    // Note: refreshToken may not be available in AWS Amplify v6
    const refreshToken = (session.tokens as any).refreshToken?.toString() || '';

    if (!idToken || !accessToken) {
      console.warn('Missing required tokens');
      return null;
    }

    // Decode ID token to get expiration
    const idTokenPayload = decodeToken(idToken);
    const expiresAt = idTokenPayload?.exp ? idTokenPayload.exp * 1000 : Date.now() + 3600000;

    return {
      idToken,
      accessToken,
      refreshToken: refreshToken || '',
      expiresAt
    };
  } catch (error) {
    console.error('Error getting current tokens:', error);
    return null;
  }
};

/**
 * Check if tokens are valid (not expired)
 */
export const areTokensValid = (tokens: CognitoTokens): boolean => {
  // Add 5 minute buffer before expiration
  const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  return tokens.expiresAt > (Date.now() + bufferTime);
};

/**
 * Get user information from ID token
 */
export const getUserFromToken = (tokens: CognitoTokens): TokenPayload | null => {
  return decodeToken(tokens.idToken);
};

/**
 * Create authorization headers for API calls
 */
export const createAuthHeaders = (tokens: CognitoTokens): Record<string, string> => {
  return {
    'Authorization': `Bearer ${tokens.accessToken}`,
    'Content-Type': 'application/json',
    'X-User-ID': getUserFromToken(tokens)?.sub || '',
  };
};

/**
 * Validate token and return user info if valid
 */
export const validateAndGetUser = async (): Promise<{ tokens: CognitoTokens; user: TokenPayload } | null> => {
  try {
    const tokens = await getCurrentTokens();
    
    if (!tokens) {
      return null;
    }

    if (!areTokensValid(tokens)) {
      console.warn('Tokens are expired or will expire soon');
      return null;
    }

    const user = getUserFromToken(tokens);
    if (!user) {
      console.warn('Could not decode user information from token');
      return null;
    }

    return { tokens, user };
  } catch (error) {
    console.error('Error validating tokens:', error);
    return null;
  }
};

/**
 * Refresh tokens if needed and return valid tokens
 */
export const ensureValidTokens = async (): Promise<CognitoTokens | null> => {
  try {
    const tokens = await getCurrentTokens();
    
    if (!tokens) {
      return null;
    }

    if (areTokensValid(tokens)) {
      return tokens;
    }

    // Tokens are expired, try to get fresh ones
    console.log('Tokens expired, attempting to refresh...');
    const freshTokens = await getCurrentTokens();
    
    if (freshTokens && areTokensValid(freshTokens)) {
      return freshTokens;
    }

    return null;
  } catch (error) {
    console.error('Error ensuring valid tokens:', error);
    return null;
  }
};
