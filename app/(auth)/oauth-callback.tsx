import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { handleOAuthRedirect, exchangeOAuthCode, type OAuthProvider } from '@/src/services/oauth';
import { useAuth } from '@/src/context/AuthContext';

/**
 * OAuth Callback Screen
 * Handles the OAuth redirect and token exchange
 */
export default function OAuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { login } = useAuth();

  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Authenticating...');

  useEffect(() => {
    processOAuthCallback();
  }, []);

  const processOAuthCallback = async () => {
    try {
      // Get the full URL
      const url = await Linking.getInitialURL();
      
      if (!url) {
        // Fallback: try to reconstruct from params
        const code = params.code as string;
        const error = params.error as string;
        const provider = params.provider as OAuthProvider;

        if (error) {
          setStatus('error');
          setMessage(getErrorMessage(error));
          return;
        }

        if (!code || !provider) {
          setStatus('error');
          setMessage('Invalid OAuth response. Missing code or provider.');
          return;
        }

        await exchangeCodeAndLogin(provider, code);
        return;
      }

      // Parse the OAuth redirect URL
      const result = await handleOAuthRedirect(url);

      if (result.error) {
        setStatus('error');
        setMessage(getErrorMessage(result.error));
        return;
      }

      if (!result.code || !result.provider) {
        setStatus('error');
        setMessage('Invalid OAuth response. Please try again.');
        return;
      }

      // Exchange code for token
      await exchangeCodeAndLogin(result.provider, result.code);
    } catch (error) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    }
  };

  const exchangeCodeAndLogin = async (provider: OAuthProvider, code: string) => {
    try {
      setMessage(`Completing ${provider} sign in...`);

      // TODO: Replace with your actual backend URL
      const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

      // Exchange code for access token via backend
      const result = await exchangeOAuthCode(provider, code, backendUrl);

      if (!result.success || !result.token) {
        setStatus('error');
        setMessage(result.error || 'Failed to authenticate. Please try again.');
        return;
      }

      // Login with the received token
      if (login) {
        await login(result.token);
      }

      setStatus('success');
      setMessage('Successfully signed in!');

      // Navigate to main app after short delay
      setTimeout(() => {
        router.replace('/(main)/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Token exchange error:', error);
      setStatus('error');
      setMessage(
        error instanceof Error ? error.message : 'Failed to complete authentication'
      );
    }
  };

  const handleRetry = () => {
    router.replace('/(auth)/login');
  };

  const handleCancel = () => {
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {status === 'processing' && (
          <>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.message}>{message}</Text>
            <Text style={styles.hint}>This may take a few seconds...</Text>
          </>
        )}

        {status === 'success' && (
          <>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✓</Text>
            </View>
            <Text style={styles.successMessage}>{message}</Text>
            <Text style={styles.hint}>Redirecting to your dashboard...</Text>
          </>
        )}

        {status === 'error' && (
          <>
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>✕</Text>
            </View>
            <Text style={styles.errorMessage}>Authentication Failed</Text>
            <Text style={styles.errorDetails}>{message}</Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetry}
                accessibilityLabel="Try again"
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                accessibilityLabel="Cancel"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

/**
 * Get user-friendly error message
 */
function getErrorMessage(error: string): string {
  const errorMessages: Record<string, string> = {
    access_denied: 'You cancelled the sign in process.',
    invalid_request: 'Invalid authentication request. Please try again.',
    unauthorized_client: 'App is not authorized. Please contact support.',
    server_error: 'Server error occurred. Please try again later.',
    temporarily_unavailable: 'Service temporarily unavailable. Please try again later.',
  };

  return errorMessages[error] || error;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  hint: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIconText: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  successMessage: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIconText: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  errorMessage: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 300,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 12,
  },
  retryButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#10B981',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    width: '100%',
    height: 52,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});
