import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { alertsApi } from '@features/alerts/api';
import type { Alert, AlertType } from '@features/alerts/types';

type Tab = AlertType | 'ALL';

const TABS: Tab[] = ['ALL', 'LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRING_SOON'];

function alertStyle(type: AlertType): { color: string; bg: string } {
  switch (type) {
    case 'OUT_OF_STOCK':
      return { color: '#ef4444', bg: '#2d1515' };
    case 'LOW_STOCK':
      return { color: '#f59e0b', bg: '#2d2010' };
    case 'EXPIRING_SOON':
      return { color: '#a855f7', bg: '#1f1230' };
  }
}

function AlertCard({ alert, t }: { alert: Alert; t: (key: string) => string }) {
  const style = alertStyle(alert.type);
  const daysAgo = Math.floor(
    (Date.now() - new Date(alert.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <View className="mx-4 mb-3 bg-surface-variant rounded-xl p-4">
      <View className="flex-row items-start justify-between mb-2">
        <Text className="text-foreground font-sans-medium text-sm flex-1 mr-3" numberOfLines={2}>
          {alert.item.name}
        </Text>
        <View style={{ backgroundColor: style.bg }} className="px-2 py-0.5 rounded">
          <Text style={{ color: style.color }} className="font-sans text-xs">
            {t(`alerts.types.${alert.type}`)}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-3">
        <Text className="text-on-surface-muted font-mono text-xs">
          SKU-{alert.item.sku}
        </Text>
        <Text className="text-on-surface-muted font-sans text-xs">·</Text>
        <Text className="text-on-surface-muted font-sans text-xs">
          {alert.item.warehouse.name}
        </Text>
      </View>

      <View className="flex-row items-center mt-2 gap-4">
        <Text className="text-on-surface-muted font-sans text-xs">
          {t('alerts.qty')}: <Text className="text-foreground font-sans-bold">{alert.currentQty}</Text>
          {alert.threshold > 0 && (
            <Text className="text-on-surface-muted"> / {t('alerts.min')} {alert.threshold}</Text>
          )}
        </Text>
        <Text className="text-on-surface-muted font-sans text-xs ml-auto">
          {daysAgo === 0
            ? t('alerts.today')
            : t('alerts.daysAgo', { count: daysAgo })}
        </Text>
      </View>
    </View>
  );
}

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('ALL');

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['alerts-active'],
    queryFn: () => alertsApi.getActive(),
  });

  const allAlerts = data?.data ?? [];
  const filtered =
    activeTab === 'ALL'
      ? allAlerts
      : allAlerts.filter((a) => a.type === activeTab);

  const countFor = (tab: Tab) =>
    tab === 'ALL'
      ? allAlerts.length
      : allAlerts.filter((a) => a.type === tab).length;

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top + 8 }}>
      <View className="px-5 mb-4">
        <Text className="text-foreground font-sans-bold text-2xl">
          {t('alerts.title')}
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 mb-4 gap-2">
        {TABS.map((tab) => {
          const count = countFor(tab);
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.75}
              className={`flex-1 items-center py-2 rounded-lg ${
                isActive ? 'bg-accent' : 'bg-surface-variant'
              }`}
            >
              <Text
                className={`font-sans-medium text-xs ${
                  isActive ? 'text-white' : 'text-on-surface-muted'
                }`}
                numberOfLines={1}
              >
                {t(`alerts.tabs.${tab}`)}
              </Text>
              {count > 0 && (
                <Text
                  className={`font-sans-bold text-xs mt-0.5 ${
                    isActive ? 'text-white' : 'text-foreground'
                  }`}
                >
                  {count}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {isError && (
        <View className="px-5 py-3">
          <Text className="text-status-error font-sans text-sm text-center">
            {t('alerts.loadError')}
          </Text>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AlertCard alert={item} t={t} />}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            tintColor="#4d7c6f"
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-12">
              <Text className="text-on-surface-muted font-sans text-sm">
                {t('alerts.empty')}
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={<View style={{ height: 16 }} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
