import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDebounce } from '@hooks/use-debounce';
import { usePermission } from '@hooks/use-permission';
import { PermissionGate } from '@components/PermissionGate';
import { PERMISSIONS } from '@constants/permissions';
import { inventoryApi } from '@features/inventory/api';
import type { InventoryItem } from '@features/inventory/types';

function stockStatus(item: InventoryItem, t: (key: string) => string): { label: string; color: string; bg: string } {
  if (item.quantity === 0) {
    return { label: t('inventory.status.noStock'), color: '#ef4444', bg: '#2d1515' };
  }
  if (item.quantity <= item.minStock) {
    return { label: t('inventory.status.lowStock'), color: '#f59e0b', bg: '#2d2010' };
  }
  return { label: t('inventory.status.inStock'), color: '#10b981', bg: '#0f2920' };
}

function ItemRow({
  item,
  onMenu,
  showMenu,
}: {
  item: InventoryItem;
  onMenu: (item: InventoryItem) => void;
  showMenu: boolean;
}) {
  const { t } = useTranslation();
  const status = stockStatus(item, t);

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
        {showMenu && (
          <TouchableOpacity
            testID={`inventory-item-menu-${item.id}`}
            onPress={() => onMenu(item)}
            activeOpacity={0.7}
            hitSlop={10}
            className="ml-1 px-1"
          >
            <Text className="text-on-surface-muted text-xl leading-5">⋮</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function ActionSheet({
  item,
  canEdit,
  canDelete,
  onClose,
  onEdit,
  onDelete,
}: {
  item: InventoryItem | null;
  canEdit: boolean;
  canDelete: boolean;
  onClose: () => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}) {
  const { t } = useTranslation();
  const visible = !!item;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        className="flex-1 bg-black/60 justify-end"
        activeOpacity={1}
        onPress={onClose}
      >
        <View className="bg-surface rounded-t-3xl pb-8">
          <View className="px-5 pt-5 pb-3">
            <Text className="text-foreground font-sans-bold text-base" numberOfLines={1}>
              {item?.name}
            </Text>
          </View>
          {canEdit && (
            <TouchableOpacity
              testID="inventory-action-edit"
              className="px-5 py-4 border-t border-surface-variant"
              activeOpacity={0.7}
              onPress={() => item && onEdit(item)}
            >
              <Text className="text-foreground font-sans text-sm">
                {t('inventory.actions.edit')}
              </Text>
            </TouchableOpacity>
          )}
          {canDelete && (
            <TouchableOpacity
              testID="inventory-action-delete"
              className="px-5 py-4 border-t border-surface-variant"
              activeOpacity={0.7}
              onPress={() => item && onDelete(item)}
            >
              <Text className="text-status-error font-sans text-sm">
                {t('inventory.actions.delete')}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className="px-5 py-4 border-t border-surface-variant"
            activeOpacity={0.7}
            onPress={onClose}
          >
            <Text className="text-on-surface-muted font-sans text-sm">
              {t('common.cancel')}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export default function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [menuItem, setMenuItem] = useState<InventoryItem | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const canCreate = usePermission(PERMISSIONS.INVENTORY_CREATE);
  const canEdit = usePermission(PERMISSIONS.INVENTORY_EDIT);
  const canDelete = usePermission(PERMISSIONS.INVENTORY_DELETE);
  const showMenu = canEdit || canDelete;

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['inventory', debouncedSearch],
    queryFn: () => inventoryApi.getItems({ search: debouncedSearch || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => inventoryApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      Alert.alert(t('inventory.messages.deleteSuccess'));
    },
    onError: (err) => {
      Alert.alert(
        t('inventory.messages.deleteError'),
        err instanceof Error ? err.message : '',
      );
    },
  });

  const items = data?.data ?? [];

  const handleDelete = (item: InventoryItem) => {
    setMenuItem(null);
    Alert.alert(
      t('inventory.deleteConfirm.title'),
      t('inventory.deleteConfirm.message'),
      [
        { text: t('inventory.deleteConfirm.cancel'), style: 'cancel' },
        {
          text: t('inventory.deleteConfirm.confirm'),
          style: 'destructive',
          onPress: () => deleteMutation.mutate(item.id),
        },
      ],
    );
  };

  const handleEdit = (item: InventoryItem) => {
    setMenuItem(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push({ pathname: '/(operations)/inventory/[id]/edit' as any, params: { id: item.id } });
  };

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top + 8 }}>
      <View className="px-5 mb-4">
        <Text className="text-foreground font-sans-bold text-2xl mb-3">{t('inventory.title')}</Text>
        <View className="flex-row items-center bg-surface-variant rounded-xl px-4 gap-3">
          <Text className="text-on-surface-muted text-base">⌕</Text>
          <TextInput
            className="flex-1 py-3 text-foreground font-sans text-sm"
            placeholder={t('inventory.searchPlaceholder')}
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
            {t('inventory.loadError')}
          </Text>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemRow item={item} onMenu={setMenuItem} showMenu={showMenu} />
        )}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor="#4d7c6f" />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-12">
              <Text className="text-on-surface-muted font-sans text-sm">
                {search ? t('inventory.noResults') : t('inventory.empty')}
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={<View style={{ height: 96 }} />}
        showsVerticalScrollIndicator={false}
      />

      <PermissionGate permission={PERMISSIONS.INVENTORY_CREATE}>
        {canCreate && (
          <TouchableOpacity
            testID="inventory-fab-new"
            className="absolute right-5 bg-primary rounded-full w-14 h-14 items-center justify-center shadow-lg"
            style={{ bottom: insets.bottom + 20, elevation: 6 }}
            activeOpacity={0.85}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onPress={() => router.push({ pathname: '/(operations)/inventory/new' as any })}
          >
            <Text className="text-white text-3xl leading-8">+</Text>
          </TouchableOpacity>
        )}
      </PermissionGate>

      <ActionSheet
        item={menuItem}
        canEdit={canEdit}
        canDelete={canDelete}
        onClose={() => setMenuItem(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </View>
  );
}
