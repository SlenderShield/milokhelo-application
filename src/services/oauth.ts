import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { makeRedirectUri } from 'expo-auth-session';

// Complete the auth session for expo-auth-session
WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = 'google' | 'facebook' | 'apple';

export interface OAuthResult {
  type: 'success' | 'cancel' | 'error';
  token?: string;
  error?: string;
  provider: OAuthProvider;
}

/**
 * OAuth Service
 * Handles OAuth authentication flows for social login
 */

// Get the redirect URI for OAuth callbacks
export function getRedirectUri(): string {
  return makeRedirectUri({
    scheme: 'milokhelo',
    path: 'oauth-callback',
  });
}

/**
 * Initiate Google OAuth flow
 */
export async function initiateGoogleOAuth(): Promise<OAuthResult> {
  try {
    const redirectUri = getRedirectUri();
    
    // TODO: Replace with your actual Google OAuth client ID
    const clientId = 'YOUR_GOOGLE_CLIENT_ID';
    
    // Construct Google OAuth URL
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      access_type: 'offline',
      prompt: 'consent',
    })}`;

    console.log('Opening Google OAuth:', authUrl);

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success' && result.url) {
      const { queryParams } = Linking.parse(result.url);
      const code = queryParams?.code as string;

      if (code) {
        return {
          type: 'success',
          token: code,
          provider: 'google',
        };
      }
    }

    return {
      type: result.type === 'cancel' ? 'cancel' : 'error',
      error: 'Failed to get authorization code',
      provider: 'google',
    };
  } catch (error) {
    console.error('Google OAuth error:', error);
    return {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'google',
    };
  }
}

/**
 * Initiate Facebook OAuth flow
 */
export async function initiateFacebookOAuth(): Promise<OAuthResult> {
  try {
    const redirectUri = getRedirectUri();
    
    // TODO: Replace with your actual Facebook App ID
    const appId = 'YOUR_FACEBOOK_APP_ID';
    
    // Construct Facebook OAuth URL
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'public_profile,email',
      state: generateRandomState(),
    })}`;

    console.log('Opening Facebook OAuth:', authUrl);

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success' && result.url) {
      const { queryParams } = Linking.parse(result.url);
      const code = queryParams?.code as string;

      if (code) {
        return {
          type: 'success',
          token: code,
          provider: 'facebook',
        };
      }
    }

    return {
      type: result.type === 'cancel' ? 'cancel' : 'error',
      error: 'Failed to get authorization code',
      provider: 'facebook',
    };
  } catch (error) {
    console.error('Facebook OAuth error:', error);
    return {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'facebook',
    };
  }
}

/**
 * Initiate Apple OAuth flow (iOS only)
 */
export async function initiateAppleOAuth(): Promise<OAuthResult> {
  try {
    // Note: Apple Sign In requires native module (expo-apple-authentication)
    // This is a placeholder for the web-based flow
    
    const redirectUri = getRedirectUri();
    
    // TODO: Replace with your actual Apple Service ID
    const clientId = 'YOUR_APPLE_SERVICE_ID';
    
    // Construct Apple OAuth URL
    const authUrl = `https://appleid.apple.com/auth/authorize?${new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      response_mode: 'form_post',
      scope: 'name email',
      state: generateRandomState(),
    })}`;

    console.log('Opening Apple OAuth:', authUrl);

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success' && result.url) {
      const { queryParams } = Linking.parse(result.url);
      const code = queryParams?.code as string;

      if (code) {
        return {
          type: 'success',
          token: code,
          provider: 'apple',
        };
      }
    }

    return {
      type: result.type === 'cancel' ? 'cancel' : 'error',
      error: 'Failed to get authorization code',
      provider: 'apple',
    };
  } catch (error) {
    console.error('Apple OAuth error:', error);
    return {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'apple',
    };
  }
}

/**
 * Exchange OAuth code for access token via backend
 */
export async function exchangeOAuthCode(
  provider: OAuthProvider,
  code: string,
  backendUrl: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const response = await fetch(`${backendUrl}/auth/oauth/${provider}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Failed to authenticate',
      };
    }

    const data = await response.json();
    return {
      success: true,
      token: data.token || data.access_token,
    };
  } catch (error) {
    console.error('Token exchange error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Generate random state for CSRF protection
 */
function generateRandomState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Handle OAuth redirect (called from the callback screen)
 */
export async function handleOAuthRedirect(url: string): Promise<{
  provider?: OAuthProvider;
  code?: string;
  error?: string;
}> {
  try {
    const { queryParams, path } = Linking.parse(url);
    
    // Extract provider from path or query params
    const pathParts = path?.split('/') || [];
    const provider = pathParts[pathParts.indexOf('oauth-callback') + 1] as OAuthProvider;
    
    const code = queryParams?.code as string;
    const error = queryParams?.error as string;
    
    if (error) {
      return { error };
    }
    
    if (code && provider) {
      return { provider, code };
    }
    
    return { error: 'Invalid OAuth response' };
  } catch (error) {
    console.error('OAuth redirect parsing error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to parse OAuth response',
    };
  }
}
