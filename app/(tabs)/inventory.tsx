import { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDebounce } from '@hooks/use-debounce';
import { inventoryApi } from '@features/inventory/api';
import type { InventoryItem } from '@features/inventory/types';

function stockStatus(item: InventoryItem): { label: string; color: string; bg: string } {
  if (item.quantity === 0) {
    return { label: 'Sin stock', color: '#ef4444', bg: '#2d1515' };
  }
  if (item.quantity <= item.minStock) {
    return { label: 'Stock bajo', color: '#f59e0b', bg: '#2d2010' };
  }
  return { label: 'En stock', color: '#10b981', bg: '#0f2920' };
}

function ItemRow({ item }: { item: InventoryItem }) {
  const status = stockStatus(item);

  return (
    <View className="flex-row items-center justify-between px-4 py-3.5 border-b border-surface-variant">
      <View className="flex-1 mr-4">
        <Text className="text-foreground font-sans-medium text-sm" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-on-surface-muted font-mono text-xs mt-0.5">
          SKU-{item.sku} · {item.warehouseName}
        </Text>
      </View>
      <View className="flex-row items-center gap-3">
        <Text className="text-foreground font-sans-bold text-base w-8 text-right">
          {item.quantity}
        </Text>
        <View style={{ backgroundColor: status.bg }} className="px-2 py-0.5 rounded">
          <Text style={{ color: status.color }} className="font-sans text-xs">
            {status.label}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['inventory', debouncedSearch],
    queryFn: () => inventoryApi.getItems({ search: debouncedSearch || undefined }),
  });

  const items = data ?? [];

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top + 8 }}>
      {/* Header */}
      <View className="px-5 mb-4">
        <Text className="text-foreground font-sans-bold text-2xl mb-3">Inventario</Text>
        <View className="flex-row items-center bg-surface-variant rounded-xl px-4 gap-3">
          <Text className="text-on-surface-muted text-base">⌕</Text>
          <TextInput
            className="flex-1 py-3 text-foreground font-sans text-sm"
            placeholder="Buscar producto, SKU..."
            placeholderTextColor="#475569"
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
              <Text className="text-on-surface-muted text-base">✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isError && (
        <View className="px-5 py-3">
          <Text className="text-status-error font-sans text-sm text-center">
            Error al cargar inventario
          </Text>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ItemRow item={item} />}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor="#4d7c6f" />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-12">
              <Text className="text-on-surface-muted font-sans text-sm">
                {search ? 'Sin resultados' : 'Inventario vacío'}
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
