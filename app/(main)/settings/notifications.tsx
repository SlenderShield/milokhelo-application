import { View, Text, StyleSheet, Switch, ScrollView, Alert } from 'react-native';
import { useState } from 'react';

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  matchReminders: boolean;
  tournamentUpdates: boolean;
  chatMessages: boolean;
  teamInvites: boolean;
}

export default function NotificationsScreen() {
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    matchReminders: true,
    tournamentUpdates: true,
    chatMessages: true,
    teamInvites: true,
  });

  const handleToggle = (key: keyof NotificationSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    
    // In a real app, you would save these settings to the backend
    // For now, just show a success message
    Alert.alert('Settings Updated', `${key} ${newSettings[key] ? 'enabled' : 'disabled'}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>
        
        <View style={styles.item}>
          <View style={styles.itemText}>
            <Text style={styles.itemLabel}>Push Notifications</Text>
            <Text style={styles.itemDescription}>
              Receive push notifications on your device
            </Text>
          </View>
          <Switch
            value={settings.pushNotifications}
            onValueChange={() => handleToggle('pushNotifications')}
            trackColor={{ false: '#ddd', true: '#bb86fc' }}
            thumbColor={settings.pushNotifications ? '#6200ee' : '#f4f3f4'}
          />
        </View>

        <View style={styles.item}>
          <View style={styles.itemText}>
            <Text style={styles.itemLabel}>Email Notifications</Text>
            <Text style={styles.itemDescription}>
              Receive updates via email
            </Text>
          </View>
          <Switch
            value={settings.emailNotifications}
            onValueChange={() => handleToggle('emailNotifications')}
            trackColor={{ false: '#ddd', true: '#bb86fc' }}
            thumbColor={settings.emailNotifications ? '#6200ee' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity</Text>
        
        <View style={styles.item}>
          <View style={styles.itemText}>
            <Text style={styles.itemLabel}>Match Reminders</Text>
            <Text style={styles.itemDescription}>
              Get notified before your scheduled matches
            </Text>
          </View>
          <Switch
            value={settings.matchReminders}
            onValueChange={() => handleToggle('matchReminders')}
            trackColor={{ false: '#ddd', true: '#bb86fc' }}
            thumbColor={settings.matchReminders ? '#6200ee' : '#f4f3f4'}
          />
        </View>

        <View style={styles.item}>
          <View style={styles.itemText}>
            <Text style={styles.itemLabel}>Tournament Updates</Text>
            <Text style={styles.itemDescription}>
              Stay informed about tournament progress
            </Text>
          </View>
          <Switch
            value={settings.tournamentUpdates}
            onValueChange={() => handleToggle('tournamentUpdates')}
            trackColor={{ false: '#ddd', true: '#bb86fc' }}
            thumbColor={settings.tournamentUpdates ? '#6200ee' : '#f4f3f4'}
          />
        </View>

        <View style={styles.item}>
          <View style={styles.itemText}>
            <Text style={styles.itemLabel}>Chat Messages</Text>
            <Text style={styles.itemDescription}>
              Get notified of new chat messages
            </Text>
          </View>
          <Switch
            value={settings.chatMessages}
            onValueChange={() => handleToggle('chatMessages')}
            trackColor={{ false: '#ddd', true: '#bb86fc' }}
            thumbColor={settings.chatMessages ? '#6200ee' : '#f4f3f4'}
          />
        </View>

        <View style={styles.item}>
          <View style={styles.itemText}>
            <Text style={styles.itemLabel}>Team Invites</Text>
            <Text style={styles.itemDescription}>
              Be notified when invited to join a team
            </Text>
          </View>
          <Switch
            value={settings.teamInvites}
            onValueChange={() => handleToggle('teamInvites')}
            trackColor={{ false: '#ddd', true: '#bb86fc' }}
            thumbColor={settings.teamInvites ? '#6200ee' : '#f4f3f4'}
          />
        </View>
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
  itemText: {
    flex: 1,
    marginRight: 12,
  },
  itemLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#999',
  },
});
