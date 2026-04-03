import { Redirect, Tabs } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useIsAuthenticated, useAuthStore } from '@features/auth/store';
import TabBar from '@components/TabBar';

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
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="inventory" />
      <Tabs.Screen name="scan" />
      <Tabs.Screen name="operations" />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}
