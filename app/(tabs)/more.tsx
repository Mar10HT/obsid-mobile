import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@features/auth/store';

export default function MoreScreen() {
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View className="flex-1 bg-surface px-6 pt-16">
      <Text className="text-2xl font-sans-bold text-foreground mb-8">Más</Text>

      <View className="gap-2">
        <TouchableOpacity
          className="bg-surface-variant border border-border rounded-card px-4 py-4"
          onPress={() => router.push('/(operations)/transfers')}
          activeOpacity={0.7}
        >
          <Text className="text-foreground font-sans-medium">Transferencias</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-surface-variant border border-border rounded-card px-4 py-4"
          onPress={() => router.push('/(operations)/loans')}
          activeOpacity={0.7}
        >
          <Text className="text-foreground font-sans-medium">Préstamos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-surface-variant border border-border rounded-card px-4 py-4"
          onPress={() => router.push('/(operations)/movements')}
          activeOpacity={0.7}
        >
          <Text className="text-foreground font-sans-medium">Movimientos</Text>
        </TouchableOpacity>
      </View>

      <View className="mt-auto mb-8">
        <TouchableOpacity
          className="border border-error-border rounded-card px-4 py-4 items-center"
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text className="text-error font-sans-medium">Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
