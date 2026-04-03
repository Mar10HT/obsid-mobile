import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ITEMS = [
  { label: 'Transferencias', icon: '⇌', route: '/(operations)/transfers' as const },
  { label: 'Préstamos',      icon: '⊟', route: '/(operations)/loans'     as const },
  { label: 'Movimientos',    icon: '↕', route: '/(operations)/movements/new' as const },
] as const;

export default function OperationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top + 8 }}>
      <View className="px-5 mb-6">
        <Text className="text-foreground font-sans-bold text-2xl">Operaciones</Text>
      </View>
      <View className="px-5 gap-3">
        {ITEMS.map((item) => (
          <TouchableOpacity
            key={item.route}
            className="flex-row items-center bg-surface-variant rounded-xl px-4 py-4 gap-4"
            activeOpacity={0.75}
            onPress={() => router.push(item.route)}
          >
            <Text className="text-foreground text-2xl">{item.icon}</Text>
            <Text className="text-foreground font-sans-medium text-base">{item.label}</Text>
            <Text className="text-on-surface-muted ml-auto">›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
