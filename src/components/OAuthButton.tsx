import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';

export type OAuthProvider = 'google' | 'facebook' | 'apple';

export interface OAuthButtonProps {
  provider: OAuthProvider;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

/**
 * OAuth Provider Button Component
 * Styled buttons for social login providers
 */
export function OAuthButton({
  provider,
  onPress,
  disabled = false,
  loading = false,
  style,
  fullWidth = true,
}: OAuthButtonProps) {
  const config = getProviderConfig(provider);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        fullWidth && styles.buttonFullWidth,
        { backgroundColor: config.backgroundColor },
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityLabel={`Sign in with ${config.name}`}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={config.textColor} />
      ) : (
        <>
          <Text style={styles.icon}>{config.icon}</Text>
          <Text style={[styles.text, { color: config.textColor }]}>
            Continue with {config.name}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

/**
 * OAuth Buttons Group
 * Display multiple OAuth options
 */
export interface OAuthButtonsGroupProps {
  onGooglePress?: () => void;
  onFacebookPress?: () => void;
  onApplePress?: () => void;
  loadingProvider?: OAuthProvider | null;
  disabled?: boolean;
  showApple?: boolean;
  style?: ViewStyle;
}

export function OAuthButtonsGroup({
  onGooglePress,
  onFacebookPress,
  onApplePress,
  loadingProvider = null,
  disabled = false,
  showApple = true,
  style,
}: OAuthButtonsGroupProps) {
  return (
    <View style={[styles.group, style]}>
      {onGooglePress && (
        <OAuthButton
          provider="google"
          onPress={onGooglePress}
          disabled={disabled}
          loading={loadingProvider === 'google'}
        />
      )}

      {onFacebookPress && (
        <OAuthButton
          provider="facebook"
          onPress={onFacebookPress}
          disabled={disabled}
          loading={loadingProvider === 'facebook'}
        />
      )}

      {showApple && onApplePress && (
        <OAuthButton
          provider="apple"
          onPress={onApplePress}
          disabled={disabled}
          loading={loadingProvider === 'apple'}
        />
      )}
    </View>
  );
}

/**
 * OAuth Divider
 * "Or continue with" divider for login screens
 */
export function OAuthDivider({ text = 'Or continue with' }: { text?: string }) {
  return (
    <View style={styles.dividerContainer}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>{text}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

/**
 * Get provider configuration
 */
function getProviderConfig(provider: OAuthProvider) {
  const configs = {
    google: {
      name: 'Google',
      icon: '🔵', // Google "G" logo emoji placeholder
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
      borderColor: '#DADCE0',
    },
    facebook: {
      name: 'Facebook',
      icon: '📘', // Facebook logo emoji placeholder
      backgroundColor: '#1877F2',
      textColor: '#FFFFFF',
      borderColor: '#1877F2',
    },
    apple: {
      name: 'Apple',
      icon: '🍎', // Apple logo emoji placeholder
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
      borderColor: '#000000',
    },
  };

  return configs[provider];
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DADCE0',
    minHeight: 52,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  group: {
    width: '100%',
    gap: 12,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});
