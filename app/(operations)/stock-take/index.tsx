import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Modal, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { stockTakeApi } from '@features/stock-take/api';
import { movementsApi } from '@features/movements/api';
import { usePermission } from '@hooks/use-permission';
import { PERMISSIONS } from '@constants/permissions';
import type { StockTakeListItem } from '@features/stock-take/types';
import type { Warehouse } from '@features/movements/types';

function statusStyle(status: string): { color: string; bg: string } {
  switch (status) {
    case 'IN_PROGRESS': return { color: '#f59e0b', bg: '#2d2010' };
    case 'COMPLETED':   return { color: '#10b981', bg: '#0f2920' };
    default:            return { color: '#94a3b8', bg: '#1e293b' };
  }
}

function StockTakeCard({
  item,
  t,
  onPress,
}: {
  item: StockTakeListItem;
  t: (key: string, opts?: object) => string;
  onPress: () => void;
}) {
  const style = statusStyle(item.status);
  const date = new Date(item.createdAt).toLocaleDateString();

  return (
    <TouchableOpacity
      className="mx-4 mb-3 bg-surface-variant rounded-xl p-4"
      activeOpacity={0.75}
      onPress={onPress}
    >
      <View className="flex-row items-start justify-between mb-2">
        <Text className="text-foreground font-sans-medium text-sm flex-1 mr-3">
          {item.warehouse.name}
        </Text>
        <View style={{ backgroundColor: style.bg }} className="px-2 py-0.5 rounded">
          <Text style={{ color: style.color }} className="font-sans text-xs">
            {t(`stockTake.status.${item.status}`)}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center gap-4">
        <Text className="text-on-surface-muted font-sans text-xs">
          {t('stockTake.items', { count: item._count.items })}
        </Text>
        <Text className="text-on-surface-muted font-sans text-xs">·</Text>
        <Text className="text-on-surface-muted font-sans text-xs">{date}</Text>
        {item.status === 'IN_PROGRESS' && (
          <Text className="text-accent font-sans-medium text-xs ml-auto">
            {t('stockTake.tapToCount')} ›
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

function CreateModal({
  visible,
  onClose,
  warehouses,
  onCreate,
  isCreating,
  t,
}: {
  visible: boolean;
  onClose: () => void;
  warehouses: Warehouse[];
  onCreate: (warehouseId: string) => void;
  isCreating: boolean;
  t: (key: string) => string;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onShow={() => setSelected(null)}
    >
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-surface rounded-t-3xl p-6">
          <Text className="text-foreground font-sans-bold text-lg mb-4">
            {t('stockTake.create')}
          </Text>
          <Text className="text-on-surface-muted font-sans text-sm mb-3">
            {t('stockTake.selectWarehouse')}
          </Text>
          <View className="gap-2 mb-6">
            {warehouses.map((w) => (
              <TouchableOpacity
                key={w.id}
                className={`px-4 py-3 rounded-xl ${
                  selected === w.id ? 'bg-accent' : 'bg-surface-variant'
                }`}
                activeOpacity={0.75}
                onPress={() => setSelected(w.id)}
              >
                <Text
                  className={`font-sans-medium text-sm ${
                    selected === w.id ? 'text-white' : 'text-foreground'
                  }`}
                >
                  {w.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl bg-surface-variant items-center"
              activeOpacity={0.75}
              onPress={onClose}
            >
              <Text className="text-on-surface-muted font-sans-medium text-sm">
                {t('stockTake.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl items-center ${
                selected && !isCreating ? 'bg-accent' : 'bg-surface-variant'
              }`}
              activeOpacity={0.75}
              onPress={() => selected && onCreate(selected)}
              disabled={!selected || isCreating}
            >
              <Text className="text-white font-sans-medium text-sm">
                {isCreating ? t('common.loading') : t('stockTake.start')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function StockTakeListScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const canCreate = usePermission(PERMISSIONS.STOCKTAKE_CREATE);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isError, isFetching, refetch } = useQuery({
    queryKey: ['stock-takes'],
    queryFn: () => stockTakeApi.getList(),
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => movementsApi.getWarehouses(),
    enabled: showCreate,
  });

  const createMutation = useMutation({
    mutationFn: (warehouseId: string) => stockTakeApi.create(warehouseId),
    onSuccess: (newSt) => {
      queryClient.invalidateQueries({ queryKey: ['stock-takes'] });
      setShowCreate(false);
      router.push(`/(operations)/stock-take/${newSt.id}`);
    },
    onError: () => Alert.alert(t('stockTake.createError')),
  });

  const items = data?.data ?? [];

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top + 8 }}>
      <View className="flex-row items-center px-5 mb-4">
        <Text className="text-foreground font-sans-bold text-2xl flex-1">
          {t('stockTake.title')}
        </Text>
        {canCreate && (
          <TouchableOpacity
            className="bg-accent px-4 py-2 rounded-xl"
            activeOpacity={0.75}
            onPress={() => setShowCreate(true)}
          >
            <Text className="text-white font-sans-medium text-sm">+ {t('stockTake.new')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {isError && (
        <View className="px-5 py-3">
          <Text className="text-status-error font-sans text-sm text-center">
            {t('stockTake.loadError')}
          </Text>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StockTakeCard
            item={item}
            t={t}
            onPress={() => router.push(`/(operations)/stock-take/${item.id}`)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor="#4d7c6f" />
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-on-surface-muted font-sans text-sm">
              {t('stockTake.empty')}
            </Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 16 }} />}
        showsVerticalScrollIndicator={false}
      />

      <CreateModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        warehouses={warehouses}
        onCreate={(id) => createMutation.mutate(id)}
        isCreating={createMutation.isPending}
        t={t}
      />
    </View>
  );
}
