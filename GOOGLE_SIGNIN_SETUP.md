# Google Sign-In Setup Guide for AllyApp

## Overview
This guide will help you set up Google Sign-In with AWS Cognito User Pool using AWS Amplify.

## Prerequisites
- AWS Account with Cognito User Pool
- Google Cloud Console access
- Amplify CLI installed (`npm install -g @aws-amplify/cli`)

## Step 1: Configure Google OAuth

### 1.1 Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     ```
     https://your-cognito-domain.auth.region.amazoncognito.com/oauth2/idpresponse
     exp://localhost:8081
     exp://localhost:19000
     ```

### 1.2 Note Down Credentials
- **Client ID**: `your-google-client-id.apps.googleusercontent.com`
- **Client Secret**: `your-google-client-secret`

## Step 2: Update Amplify Auth Configuration

### 2.1 Run Amplify Update Command
```bash
amplify update auth
```

### 2.2 Configuration Options
When prompted, choose:
- ✅ "Walkthrough all the auth configurations"
- ✅ "Yes" for "Do you want to configure advanced settings?"
- ✅ "Yes" for "Do you want to add social providers?"
- 🔘 Select "Google"
- 📝 Enter your Google Client ID
- 📝 Enter your Google Client Secret
- ✅ Complete the configuration

### 2.3 Push Changes
```bash
amplify push
```

## Step 3: Update Your App Configuration

### 3.1 Check aws-exports.js
After running `amplify push`, you should see a new `aws-exports.js` file with Google configuration.

### 3.2 Verify Configuration
The file should include:
```javascript
{
  "aws_cognito_identity_pool_id": "your-identity-pool-id",
  "aws_user_pools_id": "your-user-pool-id",
  "aws_user_pools_web_client_id": "your-web-client-id",
  "oauth": {
    "domain": "your-domain.auth.region.amazoncognito.com",
    "scope": ["email", "openid", "profile"],
    "redirectSignIn": "exp://localhost:8081",
    "redirectSignOut": "exp://localhost:8081",
    "responseType": "code"
  },
  "federationTarget": "COGNITO_USER_POOLS"
}
```

## Step 4: Test Google Sign-In

### 4.1 Start Your App
```bash
npx expo start
```

### 4.2 Test the Flow
1. Tap "Continue with Google" button
2. You should be redirected to Google's OAuth page
3. Complete authentication
4. Return to your app

## Troubleshooting

### Common Issues

#### 1. "Google Sign-In is not configured"
- Run `amplify push` after configuration
- Check that Google is listed in `socialProviders` in backend-config.json

#### 2. Redirect URI Mismatch
- Ensure redirect URIs in Google Console match your app
- Check that `redirectSignIn` in aws-exports.js is correct

#### 3. CORS Issues
- Verify your Cognito domain is properly configured
- Check that your app's origin is allowed

### Debug Steps
1. Check browser console for errors
2. Verify Cognito User Pool settings
3. Check Google Cloud Console OAuth consent screen
4. Ensure all required APIs are enabled

## Security Considerations

### 1. Client Secret
- Never expose client secret in client-side code
- Use environment variables for sensitive data

### 2. Redirect URIs
- Only allow necessary redirect URIs
- Remove development URIs in production

### 3. OAuth Scopes
- Request only necessary permissions
- Default: `email`, `openid`, `profile`

## Production Deployment

### 1. Update Redirect URIs
Replace development URIs with production ones:
```
https://yourapp.com/auth/callback
https://yourapp.com/signout
```

### 2. Environment Variables
Set production values in your deployment environment

### 3. Testing
Test the complete flow in production environment

## Additional Resources

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [Amplify Auth Documentation](https://docs.amplify.aws/lib/auth/getting-started/q/platform/js/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review AWS CloudWatch logs
3. Check Google Cloud Console logs
4. Consult AWS Amplify community forums
