import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { stockTakeApi } from '@features/stock-take/api';
import { usePermission } from '@hooks/use-permission';
import { PERMISSIONS } from '@constants/permissions';
import type { StockTakeItem } from '@features/stock-take/types';

function CountModal({
  item,
  visible,
  onClose,
  onSave,
  isSaving,
  t,
}: {
  item: StockTakeItem | null;
  visible: boolean;
  onClose: () => void;
  onSave: (qty: number) => void;
  isSaving: boolean;
  t: (key: string, opts?: object) => string;
}) {
  const [qty, setQty] = useState(item?.countedQty?.toString() ?? '');

  if (!item) return null;

  const handleOpen = () => setQty(item.countedQty?.toString() ?? '');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      onShow={handleOpen}
    >
      <View className="flex-1 justify-center items-center bg-black/70 px-6">
        <View className="bg-surface rounded-2xl p-6 w-full">
          <Text className="text-foreground font-sans-bold text-base mb-1" numberOfLines={2}>
            {item.item.name}
          </Text>
          <Text className="text-on-surface-muted font-mono text-xs mb-4">
            SKU-{item.item.sku}
          </Text>
          <Text className="text-on-surface-muted font-sans text-xs mb-1">
            {t('stockTake.expected')}: <Text className="text-foreground font-sans-bold">{item.expectedQty}</Text>
          </Text>
          <Text className="text-on-surface-muted font-sans text-xs mb-4">
            {t('stockTake.countedQty')}
          </Text>
          <TextInput
            className="bg-surface-variant rounded-xl px-4 py-3 text-foreground font-sans-bold text-2xl text-center mb-4"
            keyboardType="numeric"
            value={qty}
            onChangeText={setQty}
            selectTextOnFocus
            autoFocus
          />
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
                !isSaving ? 'bg-accent' : 'bg-surface-variant'
              }`}
              activeOpacity={0.75}
              onPress={() => {
                const n = parseInt(qty, 10);
                if (!isNaN(n) && n >= 0) onSave(n);
              }}
              disabled={isSaving}
            >
              <Text className="text-white font-sans-medium text-sm">
                {isSaving ? t('common.loading') : t('stockTake.save')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ItemRow({
  item,
  onPress,
  t,
}: {
  item: StockTakeItem;
  onPress: () => void;
  t: (key: string) => string;
}) {
  const counted = item.countedQty !== null;
  const variance = item.variance ?? 0;

  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3.5 border-b border-surface-variant"
      activeOpacity={0.75}
      onPress={onPress}
    >
      {/* Count indicator */}
      <View
        className={`w-2 h-8 rounded-full mr-3 ${counted ? 'bg-accent' : 'bg-surface-variant'}`}
      />
      <View className="flex-1 mr-3">
        <Text className="text-foreground font-sans-medium text-sm" numberOfLines={1}>
          {item.item.name}
        </Text>
        <Text className="text-on-surface-muted font-mono text-xs mt-0.5">
          SKU-{item.item.sku}
        </Text>
      </View>
      <View className="items-end">
        {counted ? (
          <>
            <Text className="text-foreground font-sans-bold text-sm">
              {item.countedQty}
            </Text>
            <Text
              className={`font-mono text-xs mt-0.5 ${
                variance === 0
                  ? 'text-on-surface-muted'
                  : variance > 0
                  ? 'text-status-success'
                  : 'text-status-error'
              }`}
            >
              {variance > 0 ? `+${variance}` : variance === 0 ? '=' : `${variance}`}
            </Text>
          </>
        ) : (
          <Text className="text-on-surface-muted font-sans text-xs">
            {t('stockTake.pending')} ({item.expectedQty})
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function StockTakeDetailScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const canManage = usePermission(PERMISSIONS.STOCKTAKE_MANAGE);

  const [selectedItem, setSelectedItem] = useState<StockTakeItem | null>(null);

  const { data, isError, isFetching, refetch } = useQuery({
    queryKey: ['stock-take', id],
    queryFn: () => stockTakeApi.getOne(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, qty }: { itemId: string; qty: number }) =>
      stockTakeApi.updateItem(id, itemId, qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-take', id] });
      setSelectedItem(null);
    },
    onError: () => Alert.alert(t('stockTake.saveError')),
  });

  const completeMutation = useMutation({
    mutationFn: (applyChanges: boolean) => stockTakeApi.complete(id, applyChanges),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-takes'] });
      router.back();
    },
    onError: () => Alert.alert(t('stockTake.completeError')),
  });

  const handleComplete = () => {
    Alert.alert(
      t('stockTake.completeTitle'),
      t('stockTake.completeMessage'),
      [
        { text: t('stockTake.completeNoApply'), onPress: () => completeMutation.mutate(false) },
        { text: t('stockTake.completeApply'), style: 'default', onPress: () => completeMutation.mutate(true) },
        { text: t('stockTake.cancel'), style: 'cancel' },
      ],
    );
  };

  const items = data?.items ?? [];
  const countedCount = items.filter((i) => i.countedQty !== null).length;
  const isInProgress = data?.status === 'IN_PROGRESS';
  const allCounted = countedCount === items.length;

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top + 8 }}>
      {/* Header */}
      <View className="px-5 mb-2">
        <Text className="text-foreground font-sans-bold text-2xl" numberOfLines={1}>
          {data?.warehouse.name ?? '—'}
        </Text>
        <Text className="text-on-surface-muted font-sans text-xs mt-1">
          {t('stockTake.progress', { counted: countedCount, total: items.length })}
        </Text>
      </View>

      {/* Progress bar */}
      {items.length > 0 && (
        <View className="mx-5 h-1.5 bg-surface-variant rounded-full mb-4 overflow-hidden">
          <View
            className="h-full bg-accent rounded-full"
            style={{ width: `${(countedCount / items.length) * 100}%` }}
          />
        </View>
      )}

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
          <ItemRow
            item={item}
            t={t}
            onPress={() => isInProgress && setSelectedItem(item)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor="#4d7c6f" />
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-on-surface-muted font-sans text-sm">
              {t('common.loading')}
            </Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 80 }} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Complete button */}
      {isInProgress && canManage && (
        <View className="absolute bottom-6 left-5 right-5">
          <TouchableOpacity
            className={`py-4 rounded-xl items-center ${
              allCounted && !completeMutation.isPending ? 'bg-accent' : 'bg-surface-variant'
            }`}
            activeOpacity={0.75}
            onPress={handleComplete}
            disabled={!allCounted || completeMutation.isPending}
          >
            <Text className="text-white font-sans-bold text-base">
              {completeMutation.isPending
                ? t('common.loading')
                : allCounted
                ? t('stockTake.complete')
                : t('stockTake.completeDisabled', { remaining: items.length - countedCount })}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <CountModal
        item={selectedItem}
        visible={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onSave={(qty) =>
          selectedItem && updateMutation.mutate({ itemId: selectedItem.itemId, qty })
        }
        isSaving={updateMutation.isPending}
        t={t}
      />
    </View>
  );
}
