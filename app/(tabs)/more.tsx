import { View, Text, TouchableOpacity } from 'react-native';
import { useAuthStore, useUser } from '@features/auth/store';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MoreScreen() {
  const { logout } = useAuthStore();
  const user = useUser();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <View className="flex-1 bg-surface px-6" style={{ paddingTop: insets.top + 8 }}>
      <Text className="text-2xl font-sans-bold text-foreground mb-6">{t('more.title')}</Text>

      {/* Profile card */}
      {user && (
        <View className="bg-surface-variant rounded-card px-4 py-4 flex-row items-center gap-4">
          <View className="w-12 h-12 rounded-full bg-primary items-center justify-center">
            <Text className="text-white font-sans-bold text-base">{initials}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-foreground font-sans-semibold text-base" numberOfLines={1}>
              {user.name}
            </Text>
            <Text className="text-on-surface-muted font-sans text-xs mt-0.5" numberOfLines={1}>
              {user.email}
            </Text>
            <View className="mt-1.5 self-start bg-primary-container rounded px-2 py-0.5">
              <Text className="text-primary-on-container font-sans text-xs">{user.role}</Text>
            </View>
          </View>
        </View>
      )}

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
