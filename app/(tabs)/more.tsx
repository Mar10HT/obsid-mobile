import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore, useUser } from '@features/auth/store';
import { authApi } from '@features/auth/api';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function ChangePasswordModal({
  visible,
  onClose,
  t,
}: {
  visible: boolean;
  onClose: () => void;
  t: (key: string) => string;
}) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');

  const mutation = useMutation({
    mutationFn: () => authApi.changePassword(current, next),
    onSuccess: () => {
      Alert.alert(t('more.changePassword.success'));
      setCurrent('');
      setNext('');
      setConfirm('');
      onClose();
    },
    onError: (err: Error) => {
      Alert.alert(t('more.changePassword.error'), err.message);
    },
  });

  const canSubmit = current.length > 0 && next.length >= 6 && next === confirm;

  const handleClose = () => {
    setCurrent('');
    setNext('');
    setConfirm('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-surface rounded-t-3xl p-6">
          <Text className="text-foreground font-sans-bold text-lg mb-5">
            {t('more.changePassword.title')}
          </Text>

          <Text className="text-on-surface-muted font-sans text-xs mb-1">
            {t('more.changePassword.current')}
          </Text>
          <TextInput
            className="bg-surface-variant rounded-xl px-4 py-3 text-foreground font-sans text-sm mb-4"
            secureTextEntry
            value={current}
            onChangeText={setCurrent}
            placeholder="••••••••"
            placeholderTextColor="#475569"
            autoCapitalize="none"
          />

          <Text className="text-on-surface-muted font-sans text-xs mb-1">
            {t('more.changePassword.new')}
          </Text>
          <TextInput
            className="bg-surface-variant rounded-xl px-4 py-3 text-foreground font-sans text-sm mb-4"
            secureTextEntry
            value={next}
            onChangeText={setNext}
            placeholder="••••••••"
            placeholderTextColor="#475569"
            autoCapitalize="none"
          />

          <Text className="text-on-surface-muted font-sans text-xs mb-1">
            {t('more.changePassword.confirm')}
          </Text>
          <TextInput
            className={`bg-surface-variant rounded-xl px-4 py-3 text-foreground font-sans text-sm mb-1 ${
              confirm.length > 0 && next !== confirm ? 'border border-status-error' : ''
            }`}
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
            placeholder="••••••••"
            placeholderTextColor="#475569"
            autoCapitalize="none"
          />
          {confirm.length > 0 && next !== confirm && (
            <Text className="text-status-error font-sans text-xs mb-3">
              {t('more.changePassword.mismatch')}
            </Text>
          )}

          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl bg-surface-variant items-center"
              activeOpacity={0.75}
              onPress={handleClose}
            >
              <Text className="text-on-surface-muted font-sans-medium text-sm">
                {t('more.changePassword.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl items-center ${
                canSubmit && !mutation.isPending ? 'bg-accent' : 'bg-surface-variant'
              }`}
              activeOpacity={0.75}
              onPress={() => mutation.mutate()}
              disabled={!canSubmit || mutation.isPending}
            >
              <Text className="text-white font-sans-medium text-sm">
                {mutation.isPending ? t('common.loading') : t('more.changePassword.submit')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function MoreScreen() {
  const { logout } = useAuthStore();
  const user = useUser();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <View className="flex-1 bg-surface px-6" style={{ paddingTop: insets.top + 8 }}>
      <Text className="text-2xl font-sans-bold text-foreground mb-6">{t('more.title')}</Text>

      {/* Profile card */}
      {user && (
        <View className="bg-surface-variant rounded-card px-4 py-4 flex-row items-center gap-4 mb-4">
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

      {/* Settings options */}
      <TouchableOpacity
        className="bg-surface-variant rounded-card px-4 py-4 flex-row items-center"
        activeOpacity={0.75}
        onPress={() => setShowChangePassword(true)}
      >
        <Text className="text-foreground font-sans-medium text-sm flex-1">
          {t('more.changePassword.title')}
        </Text>
        <Text className="text-on-surface-muted">›</Text>
      </TouchableOpacity>

      <View className="mt-auto mb-8">
        <TouchableOpacity
          className="border border-error-border rounded-card px-4 py-4 items-center"
          onPress={async () => {
            if (isLoggingOut) return;
            setIsLoggingOut(true);
            await logout();
          }}
          activeOpacity={0.7}
          disabled={isLoggingOut}
        >
          <Text className="text-error font-sans-medium">
            {isLoggingOut ? t('common.loading') : t('more.logout')}
          </Text>
        </TouchableOpacity>
      </View>

      <ChangePasswordModal
        visible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        t={t}
      />
    </View>
  );
}
