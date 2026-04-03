import { Redirect, Stack } from 'expo-router';
import { useIsAuthenticated } from '@features/auth/store';

export default function AuthLayout() {
  const isAuthenticated = useIsAuthenticated();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}
