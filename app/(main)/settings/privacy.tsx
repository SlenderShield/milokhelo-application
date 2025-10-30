import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  allowTeamInvites: boolean;
  allowFriendRequests: boolean;
}

export default function PrivacyScreen() {
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowTeamInvites: true,
    allowFriendRequests: true,
  });

  const handleToggle = (key: keyof PrivacySettings) => {
    if (key === 'profileVisibility') return; // Handled separately
    
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    Alert.alert('Settings Updated', `Privacy settings updated`);
  };

  const handleVisibilityChange = (value: 'public' | 'friends' | 'private') => {
    setSettings({ ...settings, profileVisibility: value });
    Alert.alert('Settings Updated', `Profile visibility set to ${value}`);
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your data export request has been submitted. You will receive an email with a download link within 24 hours.',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // In a real app, call useDeactivateAccount hook
            Alert.alert('Account Deletion', 'Account deletion functionality will be implemented.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Visibility</Text>
        
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioItem}
            onPress={() => handleVisibilityChange('public')}
          >
            <View style={styles.radio}>
              {settings.profileVisibility === 'public' && (
                <View style={styles.radioSelected} />
              )}
            </View>
            <View style={styles.radioText}>
              <Text style={styles.radioLabel}>Public</Text>
              <Text style={styles.radioDescription}>
                Anyone can see your profile
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioItem}
            onPress={() => handleVisibilityChange('friends')}
          >
            <View style={styles.radio}>
              {settings.profileVisibility === 'friends' && (
                <View style={styles.radioSelected} />
              )}
            </View>
            <View style={styles.radioText}>
              <Text style={styles.radioLabel}>Friends Only</Text>
              <Text style={styles.radioDescription}>
                Only your friends can see your profile
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioItem}
            onPress={() => handleVisibilityChange('private')}
          >
            <View style={styles.radio}>
              {settings.profileVisibility === 'private' && (
                <View style={styles.radioSelected} />
              )}
            </View>
            <View style={styles.radioText}>
              <Text style={styles.radioLabel}>Private</Text>
              <Text style={styles.radioDescription}>
                Only you can see your profile
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        <View style={styles.item}>
          <View style={styles.itemText}>
            <Text style={styles.itemLabel}>Show Email</Text>
            <Text style={styles.itemDescription}>
              Display your email on your profile
            </Text>
          </View>
          <Switch
            value={settings.showEmail}
            onValueChange={() => handleToggle('showEmail')}
            trackColor={{ false: '#ddd', true: '#bb86fc' }}
            thumbColor={settings.showEmail ? '#6200ee' : '#f4f3f4'}
          />
        </View>

        <View style={styles.item}>
          <View style={styles.itemText}>
            <Text style={styles.itemLabel}>Show Phone</Text>
            <Text style={styles.itemDescription}>
              Display your phone number on your profile
            </Text>
          </View>
          <Switch
            value={settings.showPhone}
            onValueChange={() => handleToggle('showPhone')}
            trackColor={{ false: '#ddd', true: '#bb86fc' }}
            thumbColor={settings.showPhone ? '#6200ee' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interactions</Text>
        
        <View style={styles.item}>
          <View style={styles.itemText}>
            <Text style={styles.itemLabel}>Allow Team Invites</Text>
            <Text style={styles.itemDescription}>
              Let others invite you to join their teams
            </Text>
          </View>
          <Switch
            value={settings.allowTeamInvites}
            onValueChange={() => handleToggle('allowTeamInvites')}
            trackColor={{ false: '#ddd', true: '#bb86fc' }}
            thumbColor={settings.allowTeamInvites ? '#6200ee' : '#f4f3f4'}
          />
        </View>

        <View style={styles.item}>
          <View style={styles.itemText}>
            <Text style={styles.itemLabel}>Allow Friend Requests</Text>
            <Text style={styles.itemDescription}>
              Let others send you friend requests
            </Text>
          </View>
          <Switch
            value={settings.allowFriendRequests}
            onValueChange={() => handleToggle('allowFriendRequests')}
            trackColor={{ false: '#ddd', true: '#bb86fc' }}
            thumbColor={settings.allowFriendRequests ? '#6200ee' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity style={styles.actionItem} onPress={handleExportData}>
          <Text style={styles.actionLabel}>Export My Data</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={handleDeleteAccount}>
          <Text style={[styles.actionLabel, styles.actionLabelDanger]}>
            Delete Account
          </Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
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
  radioGroup: {
    paddingVertical: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6200ee',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6200ee',
  },
  radioText: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  radioDescription: {
    fontSize: 14,
    color: '#999',
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
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  actionLabel: {
    fontSize: 16,
    color: '#6200ee',
  },
  actionLabelDanger: {
    color: '#F44336',
  },
  arrow: {
    fontSize: 24,
    color: '#999',
  },
});
