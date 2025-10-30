import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import {
  SkeletonCard,
  SkeletonListItem,
  SkeletonTeamCard,
  SkeletonTournamentCard,
  SkeletonVenueCard,
  SkeletonMatchCard,
  SkeletonProfileHeader,
  SkeletonChatMessage,
} from './SkeletonLoader';

/**
 * Loading State Component
 *
 * Provides consistent loading states across the application.
 * Supports different loading types: spinner, skeleton, and custom content.
 */

interface LoadingStateProps {
  /**
   * Type of loading indicator to show
   * - 'spinner': Shows a simple spinning loader
   * - 'skeleton': Shows skeleton placeholders
   * - 'inline': Small inline spinner for buttons/actions
   */
  type?: 'spinner' | 'skeleton' | 'inline';

  /**
   * Optional loading message to display
   */
  message?: string;

  /**
   * Number of skeleton items to show (for skeleton type)
   */
  count?: number;

  /**
   * Skeleton variant to use
   */
  skeletonType?: 'card' | 'list' | 'team' | 'tournament' | 'venue' | 'match' | 'profile' | 'chat';

  /**
   * Custom style for the container
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Spinner color
   */
  color?: string;

  /**
   * Spinner size
   */
  size?: 'small' | 'large';
}

/**
 * Main LoadingState component
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'spinner',
  message,
  count = 3,
  skeletonType = 'card',
  style,
  color = '#007AFF',
  size = 'large',
}) => {
  if (type === 'inline') {
    return <ActivityIndicator size="small" color={color} style={[styles.inline, style]} />;
  }

  if (type === 'skeleton') {
    return (
      <View style={[styles.skeletonContainer, style]}>
        {Array.from({ length: count }).map((_, index) => (
          <React.Fragment key={index}>{renderSkeletonByType(skeletonType)}</React.Fragment>
        ))}
      </View>
    );
  }

  // Default spinner type
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

/**
 * Helper function to render skeleton by type
 */
const renderSkeletonByType = (type: LoadingStateProps['skeletonType']) => {
  switch (type) {
    case 'list':
      return <SkeletonListItem />;
    case 'team':
      return <SkeletonTeamCard />;
    case 'tournament':
      return <SkeletonTournamentCard />;
    case 'venue':
      return <SkeletonVenueCard />;
    case 'match':
      return <SkeletonMatchCard />;
    case 'profile':
      return <SkeletonProfileHeader />;
    case 'chat':
      return (
        <>
          <SkeletonChatMessage isOwn={false} />
          <SkeletonChatMessage isOwn={true} />
          <SkeletonChatMessage isOwn={false} />
        </>
      );
    case 'card':
    default:
      return <SkeletonCard />;
  }
};

/**
 * Specialized loading states for common scenarios
 */

export const ListLoadingState: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return <LoadingState type="skeleton" skeletonType="list" count={count} />;
};

export const TeamsLoadingState: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return <LoadingState type="skeleton" skeletonType="team" count={count} />;
};

export const TournamentsLoadingState: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return <LoadingState type="skeleton" skeletonType="tournament" count={count} />;
};

export const VenuesLoadingState: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return <LoadingState type="skeleton" skeletonType="venue" count={count} />;
};

export const MatchesLoadingState: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return <LoadingState type="skeleton" skeletonType="match" count={count} />;
};

export const ProfileLoadingState: React.FC = () => {
  return <LoadingState type="skeleton" skeletonType="profile" count={1} />;
};

export const ChatLoadingState: React.FC = () => {
  return <LoadingState type="skeleton" skeletonType="chat" count={1} />;
};

/**
 * Button loading state (inline spinner)
 */
export const ButtonLoadingState: React.FC<{ color?: string }> = ({ color = '#fff' }) => {
  return <LoadingState type="inline" color={color} />;
};

/**
 * Full screen loading overlay
 */
export const FullScreenLoadingState: React.FC<{
  message?: string;
  transparent?: boolean;
}> = ({ message, transparent = false }) => {
  return (
    <View style={[styles.fullScreen, transparent && styles.fullScreenTransparent]}>
      <ActivityIndicator size="large" color="#007AFF" />
      {message && <Text style={styles.fullScreenMessage}>{message}</Text>}
    </View>
  );
};

/**
 * Empty state component (for when data is loaded but empty)
 */
export const EmptyState: React.FC<{
  icon?: string;
  title: string;
  message?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}> = ({ icon = '📭', title, message, action }) => {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>{icon}</Text>
      <Text style={styles.emptyStateTitle}>{title}</Text>
      {message && <Text style={styles.emptyStateMessage}>{message}</Text>}
      {action && (
        <View style={styles.emptyStateAction}>
          <Text style={styles.emptyStateActionText} onPress={action.onPress}>
            {action.label}
          </Text>
        </View>
      )}
    </View>
  );
};

/**
 * Error state component
 */
export const ErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
}> = ({ title = 'Something went wrong', message, onRetry }) => {
  return (
    <View style={styles.errorState}>
      <Text style={styles.errorStateIcon}>⚠️</Text>
      <Text style={styles.errorStateTitle}>{title}</Text>
      <Text style={styles.errorStateMessage}>{message}</Text>
      {onRetry && (
        <View style={styles.errorStateAction}>
          <Text style={styles.errorStateActionText} onPress={onRetry}>
            Try Again
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  inline: {
    marginHorizontal: 8,
  },
  skeletonContainer: {
    flex: 1,
    padding: 16,
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 9999,
  },
  fullScreenTransparent: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  fullScreenMessage: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateAction: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#d32f2f',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorStateMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorStateAction: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorStateActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
