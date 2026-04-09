import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '@features/auth/store';
import { inventoryApi } from '@features/inventory/api';
import type { Transaction } from '@features/inventory/types';
import { timeAgo } from '@/utils/format-date';

const TRANSACTION_COLORS: Record<string, string> = {
  ENTRADA:       '#10b981',
  SALIDA:        '#ef4444',
  TRANSFERENCIA: '#3b82f6',
  PRESTAMO:      '#f59e0b',
  DEVOLUCION:    '#8b5cf6',
};

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <View className="flex-1 bg-surface-variant rounded-xl p-4">
      <Text className="text-on-surface-muted font-sans text-xs mb-1">{label}</Text>
      <Text style={{ color: color ?? '#f1f5f9' }} className="font-sans-bold text-2xl">
        {value}
      </Text>
    </View>
  );
}

function ActivityRow({ tx }: { tx: Transaction }) {
  const { t } = useTranslation();
  const dot = TRANSACTION_COLORS[tx.type] ?? '#64748b';
  const sign = tx.type === 'ENTRADA' || tx.type === 'DEVOLUCION' ? '+' : '-';
  const signColor = sign === '+' ? '#10b981' : '#ef4444';

  const ago = timeAgo(tx.createdAt, t);
  const typeName = t(`dashboard.txTypes.${tx.type}`, { defaultValue: tx.type });

  return (
    <View className="flex-row items-center justify-between bg-surface-variant rounded-xl px-4 py-3">
      <View className="flex-row items-center gap-3 flex-1 mr-3">
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot }} />
        <View className="flex-1">
          <Text className="text-foreground font-sans-medium text-sm" numberOfLines={1}>
            {typeName} — {tx.itemName}
          </Text>
          <Text className="text-on-surface-muted font-sans text-xs mt-0.5">
            {ago} · {tx.warehouseName}
          </Text>
        </View>
      </View>
      <Text style={{ color: signColor }} className="font-sans-semibold text-sm">
        {sign}{tx.quantity}
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const user = useUser();

  const statsQuery = useQuery({
    queryKey: ['inventory-stats'],
    queryFn: () => inventoryApi.getStats(),
  });

  const activityQuery = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => inventoryApi.getRecentTransactions(),
  });

  const isRefreshing = statsQuery.isFetching || activityQuery.isFetching;
  const onRefresh = () => { statsQuery.refetch(); activityQuery.refetch(); };
  const stats = statsQuery.data;
  const activity = activityQuery.data ?? [];

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 24, gap: 24 }}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#4d7c6f" />}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-5">
        <View>
          <Text className="text-on-surface-muted font-sans text-sm">{t('dashboard.greeting')}</Text>
          <Text className="text-foreground font-sans-bold text-2xl">{user?.name ?? '—'}</Text>
        </View>
        <View className="bg-surface-variant rounded-full px-3 py-1.5">
          <Text className="text-on-surface-muted font-sans text-xs">
            {t('dashboard.noWarehouse')}
          </Text>
        </View>
      </View>

      {/* Stats grid */}
      <View className="px-5 flex-row gap-3">
        <StatCard label={t('dashboard.stats.totalItems')} value={stats?.totalItems ?? '—'} />
        <StatCard label={t('dashboard.stats.lowStock')} value={stats?.lowStockCount ?? '—'} color="#f59e0b" />
      </View>
      <View className="px-5 flex-row gap-3">
        <StatCard label={t('dashboard.stats.activeLoans')} value={stats?.activeLoans ?? '—'} color="#3b82f6" />
        {/* Pending transfers card is only shown when a real value is available from the API */}
        {stats?.pendingTransfers !== undefined && (
          <StatCard label={t('dashboard.stats.pending')} value={stats.pendingTransfers} />
        )}
      </View>

      {/* Quick actions */}
      <View className="px-5 gap-3">
        <Text className="text-on-surface-muted font-sans-semibold text-xs tracking-widest uppercase">
          {t('dashboard.quickActions')}
        </Text>
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 bg-primary rounded-xl py-5 items-center gap-2"
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/scan')}
          >
            <Text className="text-white text-2xl">⬡</Text>
            <Text className="text-white font-sans-semibold text-xs">{t('dashboard.scanQr')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-surface-variant rounded-xl py-5 items-center gap-2"
            activeOpacity={0.8}
            onPress={() => router.push('/(operations)/movements/new')}
          >
            <Text className="text-on-surface-variant text-2xl">↕</Text>
            <Text className="text-on-surface-variant font-sans-semibold text-xs">{t('dashboard.movement')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-surface-variant rounded-xl py-5 items-center gap-2"
            activeOpacity={0.8}
            onPress={() => router.push('/(operations)/transfers')}
          >
            <Text className="text-on-surface-variant text-2xl">⇌</Text>
            <Text className="text-on-surface-variant font-sans-semibold text-xs">{t('dashboard.transfers')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent activity */}
      <View className="px-5 gap-3">
        <Text className="text-on-surface-muted font-sans-semibold text-xs tracking-widest uppercase">
          {t('dashboard.recentActivity')}
        </Text>
        {activityQuery.isLoading && (
          <Text className="text-on-surface-muted font-sans text-sm text-center py-4">
            {t('common.loading')}
          </Text>
        )}
        {activityQuery.isError && (
          <Text className="text-status-error font-sans text-sm text-center py-4">
            {t('dashboard.activityError')}
          </Text>
        )}
        {activity.map((tx) => <ActivityRow key={tx.id} tx={tx} />)}
        {!activityQuery.isLoading && activity.length === 0 && (
          <Text className="text-on-surface-muted font-sans text-sm text-center py-4">
            {t('dashboard.noActivity')}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}
