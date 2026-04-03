import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@features/auth/store';

export default function MoreScreen() {
  const { logout } = useAuthStore();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-surface px-6" style={{ paddingTop: insets.top + 8 }}>
      <Text className="text-2xl font-sans-bold text-foreground mb-8">{t('more.title')}</Text>

      <View className="gap-2">
        <TouchableOpacity
          className="bg-surface-variant border border-border rounded-card px-4 py-4"
          onPress={() => router.push('/(operations)/transfers')}
          activeOpacity={0.7}
        >
          <Text className="text-foreground font-sans-medium">{t('more.transfers')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-surface-variant border border-border rounded-card px-4 py-4"
          onPress={() => router.push('/(operations)/loans')}
          activeOpacity={0.7}
        >
          <Text className="text-foreground font-sans-medium">{t('more.loans')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-surface-variant border border-border rounded-card px-4 py-4"
          onPress={() => router.push('/(operations)/movements/new')}
          activeOpacity={0.7}
        >
          <Text className="text-foreground font-sans-medium">{t('more.movements')}</Text>
        </TouchableOpacity>
      </View>

      <View className="mt-auto mb-8">
        <TouchableOpacity
          className="border border-error-border rounded-card px-4 py-4 items-center"
          onPress={logout}
          activeOpacity={0.7}
        >
          <Text className="text-error font-sans-medium">{t('more.logout')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
