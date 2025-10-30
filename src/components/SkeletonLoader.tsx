import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle, StyleProp } from 'react-native';

/**
 * Skeleton Loader Component
 *
 * Provides animated skeleton placeholders for loading states.
 * Supports different shapes and sizes for various content types.
 */

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Base Skeleton component with shimmer animation
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height: height as any,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

/**
 * Skeleton for circular avatar/profile images
 */
export const SkeletonAvatar: React.FC<{ size?: number }> = ({ size = 50 }) => {
  return <Skeleton width={size} height={size} borderRadius={size / 2} />;
};

/**
 * Skeleton for text lines
 */
export const SkeletonText: React.FC<{
  lines?: number;
  width?: number | string;
  lastLineWidth?: number | string;
}> = ({ lines = 1, width = '100%', lastLineWidth = '70%' }) => {
  return (
    <View style={styles.textContainer}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? lastLineWidth : width}
          height={16}
          style={styles.textLine}
        />
      ))}
    </View>
  );
};

/**
 * Skeleton for rectangular images/cards
 */
export const SkeletonImage: React.FC<{
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
}> = ({ width = '100%', height = 200, borderRadius = 8 }) => {
  return <Skeleton width={width} height={height} borderRadius={borderRadius} />;
};

/**
 * Skeleton for a card with image and text
 */
export const SkeletonCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <SkeletonImage height={150} />
      <View style={styles.cardContent}>
        <SkeletonText lines={1} width="80%" />
        <SkeletonText lines={2} width="100%" lastLineWidth="60%" />
      </View>
    </View>
  );
};

/**
 * Skeleton for a list item with avatar and text
 */
export const SkeletonListItem: React.FC = () => {
  return (
    <View style={styles.listItem}>
      <SkeletonAvatar size={50} />
      <View style={styles.listItemContent}>
        <SkeletonText lines={1} width="70%" />
        <SkeletonText lines={1} width="50%" />
      </View>
    </View>
  );
};

/**
 * Skeleton for a team/match card
 */
export const SkeletonTeamCard: React.FC = () => {
  return (
    <View style={styles.teamCard}>
      <View style={styles.teamCardHeader}>
        <SkeletonAvatar size={60} />
        <View style={styles.teamCardHeaderText}>
          <SkeletonText lines={1} width="80%" />
          <SkeletonText lines={1} width="60%" />
        </View>
      </View>
      <View style={styles.teamCardBody}>
        <SkeletonText lines={3} />
      </View>
    </View>
  );
};

/**
 * Skeleton for a tournament card
 */
export const SkeletonTournamentCard: React.FC = () => {
  return (
    <View style={styles.tournamentCard}>
      <SkeletonImage height={120} borderRadius={8} />
      <View style={styles.tournamentCardContent}>
        <SkeletonText lines={1} width="90%" />
        <SkeletonText lines={1} width="70%" />
        <View style={styles.tournamentCardFooter}>
          <Skeleton width={80} height={24} borderRadius={12} />
          <Skeleton width={60} height={24} borderRadius={12} />
        </View>
      </View>
    </View>
  );
};

/**
 * Skeleton for a venue card with map preview
 */
export const SkeletonVenueCard: React.FC = () => {
  return (
    <View style={styles.venueCard}>
      <SkeletonImage height={140} borderRadius={8} />
      <View style={styles.venueCardContent}>
        <SkeletonText lines={1} width="85%" />
        <SkeletonText lines={2} width="100%" lastLineWidth="70%" />
        <View style={styles.venueCardFooter}>
          <Skeleton width={100} height={20} />
          <Skeleton width={60} height={20} />
        </View>
      </View>
    </View>
  );
};

/**
 * Skeleton for match card showing teams
 */
export const SkeletonMatchCard: React.FC = () => {
  return (
    <View style={styles.matchCard}>
      <View style={styles.matchCardHeader}>
        <SkeletonText lines={1} width="60%" />
        <Skeleton width={80} height={24} borderRadius={12} />
      </View>
      <View style={styles.matchCardTeams}>
        <View style={styles.matchCardTeam}>
          <SkeletonAvatar size={40} />
          <SkeletonText lines={1} width={100} />
        </View>
        <SkeletonText lines={1} width={40} />
        <View style={styles.matchCardTeam}>
          <SkeletonAvatar size={40} />
          <SkeletonText lines={1} width={100} />
        </View>
      </View>
      <View style={styles.matchCardFooter}>
        <SkeletonText lines={1} width="70%" />
      </View>
    </View>
  );
};

/**
 * Skeleton for profile header
 */
export const SkeletonProfileHeader: React.FC = () => {
  return (
    <View style={styles.profileHeader}>
      <SkeletonAvatar size={100} />
      <View style={styles.profileHeaderText}>
        <SkeletonText lines={1} width="60%" />
        <SkeletonText lines={1} width="80%" />
        <SkeletonText lines={1} width="50%" />
      </View>
      <View style={styles.profileHeaderStats}>
        <View style={styles.profileStat}>
          <Skeleton width={50} height={30} />
          <SkeletonText lines={1} width={60} />
        </View>
        <View style={styles.profileStat}>
          <Skeleton width={50} height={30} />
          <SkeletonText lines={1} width={60} />
        </View>
        <View style={styles.profileStat}>
          <Skeleton width={50} height={30} />
          <SkeletonText lines={1} width={60} />
        </View>
      </View>
    </View>
  );
};

/**
 * Skeleton for chat message
 */
export const SkeletonChatMessage: React.FC<{ isOwn?: boolean }> = ({ isOwn = false }) => {
  return (
    <View style={[styles.chatMessage, isOwn ? styles.chatMessageOwn : styles.chatMessageOther]}>
      {!isOwn && <SkeletonAvatar size={30} />}
      <View style={styles.chatMessageContent}>
        <SkeletonText lines={2} width="100%" lastLineWidth="60%" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E1E9EE',
  },
  textContainer: {
    width: '100%',
  },
  textLine: {
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E9EE',
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  teamCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  teamCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamCardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  teamCardBody: {
    marginTop: 8,
  },
  tournamentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tournamentCardContent: {
    padding: 16,
  },
  tournamentCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  venueCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  venueCardContent: {
    padding: 16,
  },
  venueCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  matchCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  matchCardTeams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchCardTeam: {
    alignItems: 'center',
    flex: 1,
  },
  matchCardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E1E9EE',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  profileHeaderText: {
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
  },
  profileHeaderStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 24,
  },
  profileStat: {
    alignItems: 'center',
  },
  chatMessage: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  chatMessageOwn: {
    justifyContent: 'flex-end',
  },
  chatMessageOther: {
    justifyContent: 'flex-start',
  },
  chatMessageContent: {
    maxWidth: '70%',
    padding: 12,
    backgroundColor: '#E1E9EE',
    borderRadius: 16,
    marginLeft: 8,
  },
});
