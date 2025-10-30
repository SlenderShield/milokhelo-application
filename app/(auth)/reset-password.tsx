import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useResetPassword, useValidateResetToken } from '@/src/api/hooks';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  // Validate token
  const {
    data: tokenValid,
    isLoading: validating,
    error: tokenError,
  } = useValidateResetToken(token || '');

  const resetPassword = useResetPassword();

  useEffect(() => {
    if (tokenError) {
      Alert.alert('Invalid Token', 'This password reset link is invalid or has expired.', [
        {
          text: 'OK',
          onPress: () => router.replace('/forgot-password'),
        },
      ]);
    }
  }, [tokenError]);

  const validatePassword = (pass: string) => {
    if (!pass) {
      setPasswordError('Password is required');
      return false;
    }
    if (pass.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (pass: string, confirm: string) => {
    if (!confirm) {
      setConfirmError('Please confirm your password');
      return false;
    }
    if (pass !== confirm) {
      setConfirmError('Passwords do not match');
      return false;
    }
    setConfirmError('');
    return true;
  };

  const handleSubmit = async () => {
    const isPasswordValid = validatePassword(password);
    const isConfirmValid = validateConfirmPassword(password, confirmPassword);

    if (!isPasswordValid || !isConfirmValid) {
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Invalid reset token');
      return;
    }

    try {
      await resetPassword.mutateAsync({
        token,
        data: {
          password,
          confirmPassword: confirmPassword,
        },
      });

      Alert.alert('Success', 'Your password has been reset successfully.', [
        {
          text: 'OK',
          onPress: () => router.replace('/login'),
        },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to reset password');
    }
  };

  // Loading state while validating token
  if (validating) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Validating reset link...</Text>
      </View>
    );
  }

  // Invalid token
  if (tokenError || !tokenValid) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>❌</Text>
        <Text style={styles.errorTitle}>Invalid Link</Text>
        <Text style={styles.errorMessage}>This password reset link is invalid or has expired.</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/forgot-password')}
        >
          <Text style={styles.primaryButtonText}>Request New Link</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Please enter your new password below.</Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={[styles.input, passwordError ? styles.inputError : null]}
              placeholder="Enter new password"
              value={password}
              onChangeText={text => {
                setPassword(text);
                setPasswordError('');
              }}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!resetPassword.isPending}
            />
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : (
              <Text style={styles.hintText}>Minimum 8 characters</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={[styles.input, confirmError ? styles.inputError : null]}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                setConfirmError('');
              }}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!resetPassword.isPending}
            />
            {confirmError ? <Text style={styles.errorText}>{confirmError}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, resetPassword.isPending && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={resetPassword.isPending}
          >
            {resetPassword.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Reset Password</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.replace('/login')}
            disabled={resetPassword.isPending}
          >
            <Text style={styles.cancelButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  hintText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  submitButton: {
    height: 52,
    backgroundColor: '#6200ee',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  cancelButton: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6200ee',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  primaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: '#6200ee',
    borderRadius: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
