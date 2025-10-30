import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

export interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
  borderColor?: string;
  borderWidth?: number;
}

/**
 * Avatar Component
 * Displays user/team avatar with fallback to initials
 */
export function Avatar({
  uri,
  name = '',
  size = 50,
  style,
  textStyle,
  borderColor = '#10b981',
  borderWidth = 2,
}: AvatarProps) {
  const initials = getInitials(name);
  const backgroundColor = getColorFromName(name);

  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth,
    borderColor,
    backgroundColor: uri ? 'transparent' : backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  };

  const fontSize = size * 0.4;

  if (uri) {
    return (
      <View style={[containerStyle, style]}>
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View style={[containerStyle, style]}>
      <Text
        style={[
          styles.initialsText,
          { fontSize },
          textStyle,
        ]}
      >
        {initials}
      </Text>
    </View>
  );
}

/**
 * Get initials from a name
 */
function getInitials(name: string): string {
  if (!name || name.trim().length === 0) {
    return '?';
  }

  const parts = name.trim().split(' ');
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}

/**
 * Generate a consistent color from a string
 * Same name always produces same color
 */
function getColorFromName(name: string): string {
  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#eab308', // yellow
    '#84cc16', // lime
    '#10b981', // green
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#0ea5e9', // sky
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#a855f7', // purple
    '#d946ef', // fuchsia
    '#ec4899', // pink
    '#f43f5e', // rose
  ];

  if (!name || name.trim().length === 0) {
    return '#6b7280'; // gray for empty names
  }

  // Generate hash from name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }

  // Use hash to pick color
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * Avatar Group Component
 * Display multiple avatars in a row with overlap
 */
export interface AvatarGroupProps {
  items: Array<{ uri?: string | null; name?: string }>;
  size?: number;
  maxCount?: number;
  overlap?: number;
  borderColor?: string;
  borderWidth?: number;
  style?: ViewStyle;
}

export function AvatarGroup({
  items,
  size = 40,
  maxCount = 4,
  overlap = 12,
  borderColor = 'white',
  borderWidth = 2,
  style,
}: AvatarGroupProps) {
  const displayItems = items.slice(0, maxCount);
  const remainingCount = items.length - maxCount;

  return (
    <View style={[styles.groupContainer, style]}>
      {displayItems.map((item, index) => (
        <View
          key={index}
          style={{
            marginLeft: index === 0 ? 0 : -overlap,
            zIndex: displayItems.length - index,
          }}
        >
          <Avatar
            uri={item.uri}
            name={item.name}
            size={size}
            borderColor={borderColor}
            borderWidth={borderWidth}
          />
        </View>
      ))}
      
      {remainingCount > 0 && (
        <View
          style={[
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: '#6b7280',
              borderWidth,
              borderColor,
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: -overlap,
              zIndex: 0,
            },
          ]}
        >
          <Text
            style={[
              styles.remainingText,
              { fontSize: size * 0.35 },
            ]}
          >
            +{remainingCount}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  initialsText: {
    color: 'white',
    fontWeight: '700',
  },
  groupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  remainingText: {
    color: 'white',
    fontWeight: '700',
  },
});
