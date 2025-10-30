import { Stack } from 'expo-router';

export default function TournamentsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Tournaments',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Tournament Details',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'Create Tournament',
          headerShown: true,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
