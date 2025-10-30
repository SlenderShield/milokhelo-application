import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { OAuthButtonsGroup, OAuthDivider } from '@/src/components/OAuthButton';
import { initiateGoogleOAuth, initiateFacebookOAuth, initiateAppleOAuth, type OAuthProvider } from '@/src/services/oauth';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOAuthLoading] = useState<OAuthProvider | null>(null);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register({ name, email, password });
      Alert.alert('Success', 'Registration successful! Please login.');
      router.replace('/(auth)/login');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthRegister = async (provider: OAuthProvider) => {
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
        return;
      }

      if (result.type === 'error') {
        Alert.alert('Authentication Error', result.error || 'Failed to sign up');
        return;
      }
    } catch (error) {
      console.error(`${provider} OAuth error:`, error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to sign up');
    } finally {
      setOAuthLoading(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      {/* OAuth Buttons */}
      <OAuthButtonsGroup
        onGooglePress={() => handleOAuthRegister('google')}
        onFacebookPress={() => handleOAuthRegister('facebook')}
        onApplePress={Platform.OS === 'ios' ? () => handleOAuthRegister('apple') : undefined}
        loadingProvider={oauthLoading}
        disabled={isLoading || oauthLoading !== null}
        showApple={Platform.OS === 'ios'}
      />

      <OAuthDivider text="Or register with email" />

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        editable={!isLoading && oauthLoading === null}
      />

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

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        editable={!isLoading && oauthLoading === null}
      />

      <TouchableOpacity
        style={[styles.button, (isLoading || oauthLoading !== null) && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={isLoading || oauthLoading !== null}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Registering...' : 'Register'}
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.link}>Login</Text>
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
