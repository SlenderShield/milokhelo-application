/**
 * Theme System for MiloKhelo
 *
 * Provides light and dark color schemes with consistent design tokens
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Colors {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Background colors
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceVariant: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;

  // Border colors
  border: string;
  borderLight: string;

  // Status colors
  success: string;
  error: string;
  warning: string;
  info: string;

  // Component-specific colors
  card: string;
  cardShadow: string;
  input: string;
  inputBackground: string;
  placeholder: string;

  // Overlay colors
  overlay: string;
  backdrop: string;

  // Other
  white: string;
  black: string;
}

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface Typography {
  fontSizeXs: number;
  fontSizeSm: number;
  fontSizeMd: number;
  fontSizeLg: number;
  fontSizeXl: number;
  fontSizeXxl: number;
  fontWeightRegular: '400';
  fontWeightMedium: '500';
  fontWeightSemiBold: '600';
  fontWeightBold: '700';
}

export interface BorderRadius {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  round: number;
}

export interface Theme {
  mode: 'light' | 'dark';
  colors: Colors;
  spacing: Spacing;
  typography: Typography;
  borderRadius: BorderRadius;
}

// Light theme colors
const lightColors: Colors = {
  // Primary colors
  primary: '#6200ee',
  primaryLight: '#9d46ff',
  primaryDark: '#0a00b6',

  // Background colors
  background: '#f5f5f5',
  backgroundSecondary: '#ffffff',
  surface: '#ffffff',
  surfaceVariant: '#fafafa',

  // Text colors
  text: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textDisabled: '#cccccc',

  // Border colors
  border: '#e0e0e0',
  borderLight: '#f0f0f0',

  // Status colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',

  // Component-specific colors
  card: '#ffffff',
  cardShadow: 'rgba(0, 0, 0, 0.1)',
  input: '#333333',
  inputBackground: '#f9f9f9',
  placeholder: '#999999',

  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  backdrop: 'rgba(0, 0, 0, 0.3)',

  // Other
  white: '#ffffff',
  black: '#000000',
};

// Dark theme colors
const darkColors: Colors = {
  // Primary colors
  primary: '#BB86FC',
  primaryLight: '#E7B9FF',
  primaryDark: '#8858C8',

  // Background colors
  background: '#121212',
  backgroundSecondary: '#1E1E1E',
  surface: '#1E1E1E',
  surfaceVariant: '#2C2C2C',

  // Text colors
  text: '#E1E1E1',
  textSecondary: '#B3B3B3',
  textTertiary: '#808080',
  textDisabled: '#4D4D4D',

  // Border colors
  border: '#2C2C2C',
  borderLight: '#3D3D3D',

  // Status colors
  success: '#66BB6A',
  error: '#EF5350',
  warning: '#FFA726',
  info: '#42A5F5',

  // Component-specific colors
  card: '#1E1E1E',
  cardShadow: 'rgba(0, 0, 0, 0.5)',
  input: '#E1E1E1',
  inputBackground: '#2C2C2C',
  placeholder: '#808080',

  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  backdrop: 'rgba(0, 0, 0, 0.5)',

  // Other
  white: '#ffffff',
  black: '#000000',
};

// Spacing tokens
const spacing: Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography tokens
const typography: Typography = {
  fontSizeXs: 11,
  fontSizeSm: 13,
  fontSizeMd: 16,
  fontSizeLg: 18,
  fontSizeXl: 24,
  fontSizeXxl: 32,
  fontWeightRegular: '400',
  fontWeightMedium: '500',
  fontWeightSemiBold: '600',
  fontWeightBold: '700',
};

// Border radius tokens
const borderRadius: BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
};

// Light theme
export const lightTheme: Theme = {
  mode: 'light',
  colors: lightColors,
  spacing,
  typography,
  borderRadius,
};

// Dark theme
export const darkTheme: Theme = {
  mode: 'dark',
  colors: darkColors,
  spacing,
  typography,
  borderRadius,
};

// Export default theme
export const defaultTheme = lightTheme;
