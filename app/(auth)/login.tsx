import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { OAuthButtonsGroup, OAuthDivider } from '@/src/components/OAuthButton';
import { initiateGoogleOAuth, initiateFacebookOAuth, initiateAppleOAuth, type OAuthProvider } from '@/src/services/oauth';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOAuthLoading] = useState<OAuthProvider | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      router.replace('/(main)/dashboard');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    setOAuthLoading(provider);
    
    try {
      let result;
      
      switch (provider) {
        case 'google':
          result = await initiateGoogleOAuth();
          break;
        case 'facebook':
          result = await initiateFacebookOAuth();
          break;
        case 'apple':
          result = await initiateAppleOAuth();
          break;
        default:
          throw new Error('Unknown provider');
      }

      if (result.type === 'cancel') {
        // User cancelled, no need to show error
        return;
      }

      if (result.type === 'error') {
        Alert.alert('Authentication Error', result.error || 'Failed to sign in');
        return;
      }

      // Success case is handled by the OAuth callback screen
      // The user will be redirected there automatically
    } catch (error) {
      console.error(`${provider} OAuth error:`, error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setOAuthLoading(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Login to MiloKhelo</Text>

      {/* OAuth Buttons */}
      <OAuthButtonsGroup
        onGooglePress={() => handleOAuthLogin('google')}
        onFacebookPress={() => handleOAuthLogin('facebook')}
        onApplePress={Platform.OS === 'ios' ? () => handleOAuthLogin('apple') : undefined}
        loadingProvider={oauthLoading}
        disabled={isLoading || oauthLoading !== null}
        showApple={Platform.OS === 'ios'}
      />

      <OAuthDivider text="Or continue with email" />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!isLoading && oauthLoading === null}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading && oauthLoading === null}
      />

      <TouchableOpacity
        style={[styles.button, (isLoading || oauthLoading !== null) && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading || oauthLoading !== null}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
        <Text style={styles.link}>Forgot Password?</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.link}>Register</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#6200ee',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    color: '#6200ee',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#666',
  },
});
