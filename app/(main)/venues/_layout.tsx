import { Stack } from 'expo-router';

export default function VenuesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Venues',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Venue Details',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
