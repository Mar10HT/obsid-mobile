import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { movementsApi } from '@features/movements/api';
import { inventoryApi } from '@features/inventory/api';
import { useDebounce } from '@hooks/use-debounce';
import { usePermission } from '@hooks/use-permission';
import { PERMISSIONS } from '@constants/permissions';
import type { TransactionType, MovementItem } from '@features/movements/types';

// --- Item search row ---

function ItemSearchRow({
  onAdd,
  warehouseId,
}: {
  onAdd: (item: MovementItem) => void;
  warehouseId: string;
}) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [qty, setQty] = useState('1');
  const debouncedSearch = useDebounce(search, 300);

  const { data } = useQuery({
    queryKey: ['inventory-search', debouncedSearch, warehouseId],
    queryFn: () =>
      inventoryApi.getItems({ search: debouncedSearch || undefined, warehouseId }),
    enabled: debouncedSearch.length > 1,
  });

  const results = data ?? [];

  return (
    <View className="gap-3">
      <View className="flex-row gap-2">
        <View className="flex-1 flex-row items-center bg-surface-variant rounded-xl px-3 gap-2">
          <Text className="text-on-surface-muted">⌕</Text>
          <TextInput
            className="flex-1 py-3 text-foreground font-sans text-sm"
            placeholder={t('movements.searchItem')}
            placeholderTextColor="#475569"
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
        <View className="bg-surface-variant rounded-xl px-3 justify-center w-20">
          <TextInput
            className="text-foreground font-sans text-sm text-center py-3"
            placeholder={t('movements.quantity')}
            placeholderTextColor="#475569"
            value={qty}
            onChangeText={setQty}
            keyboardType="numeric"
          />
        </View>
      </View>

      {results.length > 0 && search.length > 1 && (
        <View className="bg-surface-variant rounded-xl overflow-hidden">
          {results.slice(0, 5).map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              className={`flex-row items-center justify-between px-4 py-3 ${idx > 0 ? 'border-t border-surface' : ''}`}
              activeOpacity={0.7}
              onPress={() => {
                const parsedQty = Math.max(1, parseInt(qty, 10) || 1);
                onAdd({ inventoryItemId: item.id, name: item.name, quantity: parsedQty });
                setSearch('');
                setQty('1');
              }}
            >
              <View className="flex-1">
                <Text className="text-foreground font-sans-medium text-sm" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="text-on-surface-muted font-mono text-xs">SKU-{item.sku}</Text>
              </View>
              <Text className="text-primary font-sans-semibold text-sm ml-3">
                {t('movements.addItem')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// --- Main Screen ---

export default function NewMovementScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [type, setType] = useState<TransactionType>('IN');
  const [warehouseId, setWarehouseId] = useState<string | null>(null);
  const [items, setItems] = useState<MovementItem[]>([]);
  const [notes, setNotes] = useState('');

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => movementsApi.getWarehouses(),
  });

  const mutation = useMutation({
    mutationFn: () => {
      if (!warehouseId) throw new Error('No warehouse selected');
      return movementsApi.create({
        type,
        sourceWarehouseId: type === 'OUT' ? warehouseId : undefined,
        destinationWarehouseId: type === 'IN' ? warehouseId : undefined,
        date: new Date().toISOString(),
        notes: notes.trim() || undefined,
        items: items.map(({ inventoryItemId, quantity }) => ({ inventoryItemId, quantity })),
      });
    },
    onSuccess: () => {
      Alert.alert(t('movements.success'), '', [{ text: 'OK', onPress: () => router.back() }]);
    },
    onError: (err) => {
      Alert.alert(t('movements.error'), err instanceof Error ? err.message : '');
    },
  });

  const handleAdd = (item: MovementItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.inventoryItemId === item.inventoryItemId);
      if (existing) {
        return prev.map((i) =>
          i.inventoryItemId === item.inventoryItemId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        );
      }
      return [...prev, item];
    });
  };

  const handleRemove = (inventoryItemId: string) => {
    setItems((prev) => prev.filter((i) => i.inventoryItemId !== inventoryItemId));
  };

  const canCreate = usePermission(PERMISSIONS.TRANSACTIONS_CREATE);
  const canSubmit = !!warehouseId && items.length > 0 && !mutation.isPending && canCreate;

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 40, gap: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View className="px-5">
        <Text className="text-foreground font-sans-bold text-2xl">{t('movements.title')}</Text>
      </View>

      {/* Type selector */}
      <View className="px-5 gap-2">
        <Text className="text-on-surface-muted font-sans-semibold text-xs uppercase tracking-widest">
          {t('movements.typeLabel')}
        </Text>
        <View className="flex-row gap-3">
          {(['IN', 'OUT'] as TransactionType[]).map((tp) => (
            <TouchableOpacity
              key={tp}
              className={`flex-1 py-3 rounded-xl items-center ${type === tp ? 'bg-primary' : 'bg-surface-variant'}`}
              activeOpacity={0.75}
              onPress={() => { setType(tp); setWarehouseId(null); setItems([]); }}
            >
              <Text className={`font-sans-semibold text-sm ${type === tp ? 'text-white' : 'text-on-surface-muted'}`}>
                {t(`movements.types.${tp}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Warehouse selector */}
      <View className="px-5 gap-2">
        <Text className="text-on-surface-muted font-sans-semibold text-xs uppercase tracking-widest">
          {t('movements.warehouseLabel')}
        </Text>
        {warehouses.length === 0 ? (
          <Text className="text-on-surface-muted font-sans text-sm">{t('movements.noWarehouses')}</Text>
        ) : (
          <View className="gap-2">
            {warehouses.map((wh) => (
              <TouchableOpacity
                key={wh.id}
                className={`flex-row items-center px-4 py-3 rounded-xl ${warehouseId === wh.id ? 'bg-primary' : 'bg-surface-variant'}`}
                activeOpacity={0.75}
                onPress={() => { setWarehouseId(wh.id); setItems([]); }}
              >
                <Text className={`font-sans-medium text-sm flex-1 ${warehouseId === wh.id ? 'text-white' : 'text-foreground'}`}>
                  {wh.name}
                </Text>
                {warehouseId === wh.id && (
                  <Text className="text-white text-base">✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Item search — only when warehouse selected */}
      {warehouseId && (
        <View className="px-5 gap-2">
          <Text className="text-on-surface-muted font-sans-semibold text-xs uppercase tracking-widest">
            {t('movements.itemsLabel')}
          </Text>
          <ItemSearchRow onAdd={handleAdd} warehouseId={warehouseId} />

          {/* Added items list */}
          {items.length > 0 && (
            <View className="bg-surface-variant rounded-xl overflow-hidden mt-2">
              {items.map((item, idx) => (
                <View
                  key={item.inventoryItemId}
                  className={`flex-row items-center px-4 py-3 ${idx > 0 ? 'border-t border-surface' : ''}`}
                >
                  <View className="flex-1">
                    <Text className="text-foreground font-sans-medium text-sm" numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                  <Text className="text-on-surface-muted font-sans text-sm mx-4">×{item.quantity}</Text>
                  <TouchableOpacity onPress={() => handleRemove(item.inventoryItemId)} activeOpacity={0.7}>
                    <Text className="text-status-error text-lg">✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Notes */}
      <View className="px-5 gap-2">
        <Text className="text-on-surface-muted font-sans-semibold text-xs uppercase tracking-widest">
          {t('movements.notesLabel')}
        </Text>
        <TextInput
          className="bg-surface-variant rounded-xl px-4 py-3 text-foreground font-sans text-sm"
          placeholder={t('movements.notesPlaceholder')}
          placeholderTextColor="#475569"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Submit */}
      <View className="px-5">
        <TouchableOpacity
          className={`py-4 rounded-xl items-center ${canSubmit ? 'bg-primary' : 'bg-surface-variant'}`}
          activeOpacity={0.8}
          disabled={!canSubmit}
          onPress={() => mutation.mutate()}
        >
          {mutation.isPending
            ? <ActivityIndicator color="#fff" />
            : (
              <Text className={`font-sans-semibold text-base ${canSubmit ? 'text-white' : 'text-on-surface-muted'}`}>
                {t('movements.submit')}
              </Text>
            )
          }
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
