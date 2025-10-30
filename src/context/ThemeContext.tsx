/**
 * Theme Context for MiloKhelo
 * 
 * Provides theme state management and persistence
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeMode, lightTheme, darkTheme } from '../theme/theme';

const THEME_STORAGE_KEY = '@milokhelo_theme_mode';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isReady, setIsReady] = useState(false);

  // Load saved theme preference
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('[ThemeContext] Error loading theme:', error);
    } finally {
      setIsReady(true);
    }
  };

  // Save theme preference
  const saveThemePreference = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('[ThemeContext] Error saving theme:', error);
    }
  };

  // Set theme mode
  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    saveThemePreference(mode);
  };

  // Toggle between light and dark
  const toggleTheme = () => {
    const newMode = themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark')
      ? 'light'
      : 'dark';
    setThemeMode(newMode);
  };

  // Determine active theme
  const getActiveTheme = (): Theme => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themeMode === 'dark' ? darkTheme : lightTheme;
  };

  const theme = getActiveTheme();
  const isDarkMode = theme.mode === 'dark';

  const value: ThemeContextType = {
    theme,
    themeMode,
    setThemeMode,
    toggleTheme,
    isDarkMode,
  };

  // Don't render children until theme is loaded
  if (!isReady) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to use theme in components
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Hook to get theme colors
 */
export function useThemeColors() {
  const { theme } = useTheme();
  return theme.colors;
}

/**
 * Hook to get theme spacing
 */
export function useThemeSpacing() {
  const { theme } = useTheme();
  return theme.spacing;
}

/**
 * Hook to get theme typography
 */
export function useThemeTypography() {
  const { theme } = useTheme();
  return theme.typography;
}
