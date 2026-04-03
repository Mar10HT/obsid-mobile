import { Stack } from 'expo-router';

export default function OperationsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a1a' },
        headerTintColor: '#cbd5e1',
        headerTitleStyle: { fontFamily: 'Outfit_600SemiBold' },
        contentStyle: { backgroundColor: '#0a0a0a' },
      }}
    />
  );
}
