# Cognito Token-Based Authentication System

This document explains how to use the AWS Cognito token-based authentication system implemented in your Ally app.

## Overview

Your app now properly handles AWS Cognito authentication and returns ID, access, and refresh tokens upon successful authentication. These tokens are automatically used to authorize subsequent requests to your backend services and other AWS resources.

## How It Works

### 1. **Authentication Flow**
```
User Sign In → AWS Cognito → Returns Tokens → Stored in AuthContext → Available for API calls
```

### 2. **Token Types**
- **ID Token**: Contains user identity information (JWT)
- **Access Token**: Used to authorize API requests (JWT)
- **Refresh Token**: Used to get new tokens when they expire

### 3. **Automatic Token Management**
- Tokens are automatically extracted after sign-in
- Expiration is monitored
- Automatic refresh when needed
- Secure storage in memory

## Usage Examples

### **Making Authenticated API Calls**

```typescript
import { authenticatedApiCall, getUserProfile, createItem } from '../api';

// Simple authenticated GET request
const profile = await getUserProfile();

// Authenticated POST request
const newItem = await createItem({ name: 'New Item' });

// Generic authenticated API call
const data = await authenticatedApiCall('GET', '/v1/protected-endpoint');
```

### **Using Tokens in Components**

```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { tokens, isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Text>Please sign in</Text>;
  }
  
  // Access token information
  console.log('User ID:', user?.sub);
  console.log('Access Token:', tokens?.accessToken);
  
  return <Text>Welcome, {user?.email}!</Text>;
}
```

### **Manual Token Validation**

```typescript
import { ensureValidTokens, validateAndGetUser } from '../utils/tokenManager';

// Check if tokens are valid
const tokens = await ensureValidTokens();
if (tokens) {
  // Tokens are valid, use them
  const headers = createAuthHeaders(tokens);
}

// Get user info from tokens
const userInfo = await validateAndGetUser();
if (userInfo) {
  console.log('User:', userInfo.user);
  console.log('Tokens:', userInfo.tokens);
}
```

## API Functions Available

### **Core Authentication Functions**
- `signIn(username, password)` - Sign in user
- `signUp(username, password, email)` - Create new account
- `confirmSignUp(username, code)` - Verify account
- `signOut()` - Sign out user
- `refreshTokens()` - Manually refresh tokens

### **API Authorization Functions**
- `authenticatedApiCall(method, path, body)` - Generic authenticated API call
- `getAuthHeaders()` - Get authorization headers
- `requireAuth()` - Ensure user is authenticated
- `listItems()`, `createItem()`, `updateItem()`, `deleteItem()` - Example API functions

### **Token Management Functions**
- `getCurrentTokens()` - Get current tokens
- `areTokensValid(tokens)` - Check token validity
- `createAuthHeaders(tokens)` - Create auth headers
- `decodeToken(token)` - Decode JWT token

## Backend Integration

### **Authorization Headers**
Your backend will receive these headers with each authenticated request:

```
Authorization: Bearer <access_token>
Content-Type: application/json
X-User-ID: <user_id>
```

### **Token Validation on Backend**
Your backend should validate the JWT access token:

```javascript
// Example Node.js/Express validation
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`
});

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, {
      audience: clientId,
      issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
      algorithms: ['RS256']
    }, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
}
```

## Security Features

### **Automatic Token Refresh**
- Tokens are automatically refreshed when they expire
- 5-minute buffer before expiration to prevent API failures
- Seamless user experience

### **Secure Token Storage**
- Tokens are stored in memory (not persistent storage)
- Automatically cleared on sign out
- No sensitive data in local storage

### **Error Handling**
- Graceful fallback when tokens are invalid
- Automatic redirect to login when authentication fails
- Comprehensive error logging

## Debugging and Monitoring

### **Token Display Component**
Use the `TokenDisplay` component to monitor token status:

```typescript
import { TokenDisplay } from '../components/TokenDisplay';

// Add to your settings or debug screen
<TokenDisplay />
```

### **Console Logging**
Enable detailed logging by checking the console:
- Token extraction
- API call headers
- Token validation
- Error messages

## Common Use Cases

### **1. Protected Routes**
```typescript
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return children;
}
```

### **2. API Error Handling**
```typescript
try {
  const data = await authenticatedApiCall('GET', '/v1/protected-data');
  // Handle success
} catch (error) {
  if (error.message === 'No valid authentication tokens available') {
    // Redirect to login
    navigation.navigate('Login');
  } else {
    // Handle other API errors
    console.error('API Error:', error);
  }
}
```

### **3. Conditional Rendering**
```typescript
function MyComponent() {
  const { isAuthenticated, tokens } = useAuth();
  
  return (
    <View>
      {isAuthenticated && tokens ? (
        <Text>Welcome back! Your session expires in {tokens.expiresAt}</Text>
      ) : (
        <Text>Please sign in to continue</Text>
      )}
    </View>
  );
}
```

## Troubleshooting

### **Common Issues**

1. **"No valid authentication tokens available"**
   - User needs to sign in again
   - Tokens may have expired
   - Check network connectivity

2. **"Authentication required"**
   - User is not signed in
   - Redirect to login screen

3. **Token refresh failures**
   - Check AWS Cognito configuration
   - Verify user pool settings
   - Check network connectivity

### **Debug Steps**

1. Check console logs for token extraction
2. Verify AWS Cognito configuration
3. Test with `TokenDisplay` component
4. Check network requests in browser dev tools
5. Verify backend token validation

## Configuration

### **AWS Cognito Setup**
Ensure your Cognito User Pool is configured with:
- JWT token expiration (default: 1 hour)
- Refresh token rotation enabled
- Proper app client settings

### **Environment Variables**
```bash
# Your aws-exports.js should contain:
aws_user_pools_id: "your-user-pool-id"
aws_user_pools_web_client_id: "your-client-id"
aws_cognito_region: "your-region"
```

## Best Practices

1. **Always use `authenticatedApiCall`** for protected endpoints
2. **Handle authentication errors gracefully** in your UI
3. **Implement proper loading states** during authentication
4. **Use the `requireAuth` function** for critical operations
5. **Monitor token expiration** in your components
6. **Implement proper error boundaries** for authentication failures

## Support

For issues or questions:
1. Check console logs for detailed error messages
2. Verify AWS Cognito configuration
3. Test with the `TokenDisplay` component
4. Review this documentation
5. Check AWS Amplify documentation for updates
