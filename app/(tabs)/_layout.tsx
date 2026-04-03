import { Redirect, Tabs } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useIsAuthenticated, useAuthStore } from '@features/auth/store';
import { authApi } from '@features/auth/api';

export default function TabsLayout() {
  const isAuthenticated = useIsAuthenticated();
  const { refreshPermissions } = useAuthStore();

  // Poll permissions every 60s (mirrors Angular web app behavior)
  useQuery({
    queryKey: ['permissions-poll'],
    queryFn: async () => {
      await refreshPermissions();
      return null;
    },
    refetchInterval: 60_000,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#3a3a3a',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#4d7c6f',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontFamily: 'Outfit_500Medium',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Dashboard' }}
      />
      <Tabs.Screen
        name="inventory"
        options={{ title: 'Inventario' }}
      />
      <Tabs.Screen
        name="scan"
        options={{ title: 'Escanear' }}
      />
      <Tabs.Screen
        name="more"
        options={{ title: 'Más' }}
      />
    </Tabs>
  );
}
