import { View, Text } from 'react-native';
import { useUser } from '@features/auth/store';

// Placeholder — Fase 2 implementará el dashboard completo
export default function DashboardScreen() {
  const user = useUser();

  return (
    <View className="flex-1 bg-surface items-center justify-center px-6">
      <Text className="text-2xl font-sans-bold text-foreground mb-2">
        Dashboard
      </Text>
      <Text className="text-sm font-sans text-on-surface-variant text-center">
        Bienvenido, {user?.name ?? 'usuario'}
      </Text>
    </View>
  );
}
