import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ITEMS = [
  { labelKey: 'operations.transfers', icon: '⇌', route: '/(operations)/transfers' as const },
  { labelKey: 'operations.loans',     icon: '⊟', route: '/(operations)/loans'     as const },
  { labelKey: 'operations.movements', icon: '↕', route: '/(operations)/movements/new' as const },
] as const;

export default function OperationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top + 8 }}>
      <View className="px-5 mb-6">
        <Text className="text-foreground font-sans-bold text-2xl">{t('operations.title')}</Text>
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
            <Text className="text-foreground font-sans-medium text-base">{t(item.labelKey)}</Text>
            <Text className="text-on-surface-muted ml-auto">›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
