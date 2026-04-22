import { Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ItemForm } from '@features/inventory/components/ItemForm';
import { inventoryApi } from '@features/inventory/api';
import { warehousesApi } from '@features/warehouses/api';
import { categoriesApi } from '@features/categories/api';
import { suppliersApi } from '@features/suppliers/api';
import type { CreateInventoryInput } from '@features/inventory/schemas';

export default function NewInventoryItemScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

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
    mutationFn: (input: CreateInventoryInput) => inventoryApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      Alert.alert(t('inventory.messages.createSuccess'), '', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (err) => {
      Alert.alert(
        t('inventory.messages.createError'),
        err instanceof Error ? err.message : '',
      );
    },
  });

  return (
    <>
      <Stack.Screen options={{ title: t('inventory.form.createTitle') }} />
      <ItemForm
        mode="create"
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
