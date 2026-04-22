import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ItemForm } from '@features/inventory/components/ItemForm';
import { inventoryApi } from '@features/inventory/api';
import { warehousesApi } from '@features/warehouses/api';
import { categoriesApi } from '@features/categories/api';
import { suppliersApi } from '@features/suppliers/api';
import type { CreateInventoryInput, InventoryItemDetail } from '@features/inventory/schemas';

function toInitialValues(item: InventoryItemDetail): Partial<CreateInventoryInput> {
  return {
    name: item.name,
    description: item.description ?? undefined,
    sku: item.sku ?? undefined,
    barcode: item.barcode ?? undefined,
    category: item.category?.name ?? undefined,
    warehouseId: item.warehouseId,
    supplierId: item.supplierId ?? undefined,
    quantity: item.quantity,
    minQuantity: item.minQuantity ?? undefined,
    price: item.price ?? undefined,
    expirationDate: item.expirationDate ?? undefined,
  };
}

export default function EditInventoryItemScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();

  const itemQuery = useQuery({
    queryKey: ['inventory', 'detail', id],
    queryFn: () => inventoryApi.getById(id!),
    enabled: !!id,
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehousesApi.getAll(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => suppliersApi.getAll(),
  });

  const warehouseOptions = warehouses.map((w) => ({ id: w.id, label: w.name }));
  const categoryOptions = categories.map((c) => ({ id: c.name, label: c.name }));
  const supplierOptions = suppliers.map((s) => ({ id: s.id, label: s.name }));

  const mutation = useMutation({
    mutationFn: (input: CreateInventoryInput) => inventoryApi.update(id!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'detail', id] });
      Alert.alert(t('inventory.messages.updateSuccess'), '', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (err) => {
      Alert.alert(
        t('inventory.messages.updateError'),
        err instanceof Error ? err.message : '',
      );
    },
  });

  if (itemQuery.isLoading) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator color="#4d7c6f" />
      </View>
    );
  }

  if (itemQuery.isError || !itemQuery.data) {
    return (
      <View className="flex-1 bg-surface items-center justify-center px-5">
        <Text className="text-status-error font-sans text-sm text-center">
          {t('inventory.loadError')}
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('inventory.form.editTitle') }} />
      <ItemForm
        mode="edit"
        initialValues={toInitialValues(itemQuery.data)}
        categories={categoryOptions}
        warehouses={warehouseOptions}
        suppliers={supplierOptions}
        onSubmit={(values) => mutation.mutate(values)}
        onCancel={() => router.back()}
        submitting={mutation.isPending}
      />
    </>
  );
}
