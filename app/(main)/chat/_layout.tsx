import { Stack } from 'expo-router';

export default function ChatLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Chat',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[roomId]"
        options={{
          title: 'Messages',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
