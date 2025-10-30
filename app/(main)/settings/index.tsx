import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';

const SETTINGS_SECTIONS = [
  {
    title: 'Preferences',
    items: [
      { id: 'notifications', label: 'Notifications', icon: '🔔' },
      { id: 'privacy', label: 'Privacy', icon: '🔒' },
    ],
  },
  {
    title: 'Account',
    items: [{ id: 'account', label: 'Account Management', icon: '⚙️' }],
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { isDarkMode, toggleTheme, themeMode, setThemeMode } = useTheme();

  const handlePress = (itemId: string) => {
    router.push(`/settings/${itemId}` as any);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Appearance Section with Dark Mode Toggle */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <Text style={styles.itemIcon}>🌓</Text>
            <View>
              <Text style={styles.itemLabel}>Dark Mode</Text>
              <Text style={styles.itemSubtext}>
                {themeMode === 'system' ? 'System default' : themeMode === 'dark' ? 'On' : 'Off'}
              </Text>
            </View>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#ccc', true: '#6200ee' }}
            thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {SETTINGS_SECTIONS.map(section => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.item}
              onPress={() => handlePress(item.id)}
            >
              <View style={styles.itemLeft}>
                <Text style={styles.itemIcon}>{item.icon}</Text>
                <Text style={styles.itemLabel}>{item.label}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>MiloKhelo v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  itemLabel: {
    fontSize: 16,
    color: '#333',
  },
  itemSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: '#999',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
});
