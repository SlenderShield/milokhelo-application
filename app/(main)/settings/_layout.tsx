import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Settings',
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: 'Notification Settings',
        }}
      />
      <Stack.Screen
        name="privacy"
        options={{
          title: 'Privacy Settings',
        }}
      />
      <Stack.Screen
        name="account"
        options={{
          title: 'Account Management',
        }}
      />
    </Stack>
  );
}
