import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SelectField, type SelectFieldOption } from '@components/SelectField';
import { CreateInventoryInputSchema } from '../schemas';
import type { CreateInventoryInput } from '../schemas';

// TODO(PR2): add UNIQUE-mode support (itemType, serviceTag, serialNumber, assignedToUserId).
// Current MVP only covers BULK items to keep the form flow simple.

export interface ItemFormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<CreateInventoryInput>;
  categories: ReadonlyArray<SelectFieldOption>;
  warehouses: ReadonlyArray<SelectFieldOption>;
  suppliers: ReadonlyArray<SelectFieldOption>;
  onSubmit: (values: CreateInventoryInput) => void;
  onCancel: () => void;
  submitting?: boolean;
}

interface FormState {
  name: string;
  description: string;
  sku: string;
  barcode: string;
  category: string | null;
  warehouseId: string | null;
  supplierId: string | null;
  quantity: string;
  minQuantity: string;
  price: string;
  expirationDate: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

function buildInitialState(initial?: Partial<CreateInventoryInput>): FormState {
  return {
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    sku: initial?.sku ?? '',
    barcode: initial?.barcode ?? '',
    category: initial?.category ?? null,
    warehouseId: initial?.warehouseId ?? null,
    supplierId: initial?.supplierId ?? null,
    quantity: initial?.quantity !== undefined ? String(initial.quantity) : '',
    minQuantity: initial?.minQuantity !== undefined ? String(initial.minQuantity) : '',
    price: initial?.price !== undefined ? String(initial.price) : '',
    expirationDate: initial?.expirationDate ?? '',
  };
}

function parseNumeric(raw: string): number | undefined {
  if (raw.trim() === '') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : NaN;
}

function buildPayload(state: FormState): CreateInventoryInput {
  const payload: Record<string, unknown> = {
    name: state.name.trim(),
    quantity: parseNumeric(state.quantity) as number,
    category: state.category ?? '',
    warehouseId: state.warehouseId ?? '',
  };

  if (state.description.trim()) payload.description = state.description.trim();
  if (state.sku.trim()) payload.sku = state.sku.trim();
  if (state.barcode.trim()) payload.barcode = state.barcode.trim();
  if (state.supplierId) payload.supplierId = state.supplierId;
  if (state.minQuantity.trim()) payload.minQuantity = parseNumeric(state.minQuantity);
  if (state.price.trim()) payload.price = parseNumeric(state.price);
  if (state.expirationDate.trim()) payload.expirationDate = state.expirationDate.trim();

  return payload as CreateInventoryInput;
}

export function ItemForm({
  mode,
  initialValues,
  categories,
  warehouses,
  suppliers,
  onSubmit,
  onCancel,
  submitting,
}: ItemFormProps) {
  const { t } = useTranslation();
  const [state, setState] = useState<FormState>(() => buildInitialState(initialValues));
  const [errors, setErrors] = useState<FieldErrors>({});

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = () => {
    const payload = buildPayload(state);
    const result = CreateInventoryInputSchema.safeParse(payload);

    if (!result.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0];
        if (typeof path === 'string' && !(path in nextErrors)) {
          nextErrors[path as keyof FormState] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onSubmit(result.data);
  };

  const submitLabel = t(
    mode === 'create' ? 'inventory.form.create' : 'inventory.form.save',
    { defaultValue: mode === 'create' ? 'Create' : 'Save' },
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-surface"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name */}
        <View>
          <Text className="text-on-surface-muted font-sans text-xs mb-1">
            {t('inventory.form.name', { defaultValue: 'Name' })} *
          </Text>
          <TextInput
            testID="item-form-name"
            className={`bg-surface-variant rounded-xl px-4 py-3 text-foreground font-sans text-sm ${
              errors.name ? 'border border-status-error' : ''
            }`}
            value={state.name}
            onChangeText={(v) => set('name', v)}
            placeholder={t('inventory.form.namePlaceholder', { defaultValue: 'Item name' })}
            placeholderTextColor="#475569"
          />
          {errors.name && (
            <Text className="text-status-error font-sans text-xs mt-1">{errors.name}</Text>
          )}
        </View>

        {/* Description */}
        <View>
          <Text className="text-on-surface-muted font-sans text-xs mb-1">
            {t('inventory.form.description', { defaultValue: 'Description' })}
          </Text>
          <TextInput
            testID="item-form-description"
            className="bg-surface-variant rounded-xl px-4 py-3 text-foreground font-sans text-sm"
            value={state.description}
            onChangeText={(v) => set('description', v)}
            placeholder={t('inventory.form.descriptionPlaceholder', { defaultValue: 'Optional' })}
            placeholderTextColor="#475569"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Category */}
        <SelectField
          label={t('inventory.form.category', { defaultValue: 'Category' })}
          placeholder={t('inventory.form.selectOption', { defaultValue: 'Select' })}
          value={state.category}
          options={categories}
          onChange={(id) => set('category', id)}
          required
          searchable
          error={errors.category}
          triggerTestID="item-form-category-trigger"
          searchPlaceholder={t('inventory.form.search', { defaultValue: 'Search' })}
          emptyLabel={t('inventory.form.noOptions', { defaultValue: 'No options' })}
          closeLabel={t('common.close', { defaultValue: 'Close' })}
        />

        {/* Warehouse */}
        <SelectField
          label={t('inventory.form.warehouse', { defaultValue: 'Warehouse' })}
          placeholder={t('inventory.form.selectOption', { defaultValue: 'Select' })}
          value={state.warehouseId}
          options={warehouses}
          onChange={(id) => set('warehouseId', id)}
          required
          searchable
          error={errors.warehouseId}
          triggerTestID="item-form-warehouse-trigger"
          searchPlaceholder={t('inventory.form.search', { defaultValue: 'Search' })}
          emptyLabel={t('inventory.form.noOptions', { defaultValue: 'No options' })}
          closeLabel={t('common.close', { defaultValue: 'Close' })}
        />

        {/* Supplier */}
        <SelectField
          label={t('inventory.form.supplier', { defaultValue: 'Supplier' })}
          placeholder={t('inventory.form.selectOption', { defaultValue: 'Select' })}
          value={state.supplierId}
          options={suppliers}
          onChange={(id) => set('supplierId', id)}
          searchable
          error={errors.supplierId}
          triggerTestID="item-form-supplier-trigger"
          searchPlaceholder={t('inventory.form.search', { defaultValue: 'Search' })}
          emptyLabel={t('inventory.form.noOptions', { defaultValue: 'No options' })}
          closeLabel={t('common.close', { defaultValue: 'Close' })}
        />

        {/* Quantity + Min Quantity row */}
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-on-surface-muted font-sans text-xs mb-1">
              {t('inventory.form.quantity', { defaultValue: 'Quantity' })} *
            </Text>
            <TextInput
              testID="item-form-quantity"
              className={`bg-surface-variant rounded-xl px-4 py-3 text-foreground font-sans text-sm ${
                errors.quantity ? 'border border-status-error' : ''
              }`}
              value={state.quantity}
              onChangeText={(v) => set('quantity', v)}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#475569"
            />
            {errors.quantity && (
              <Text className="text-status-error font-sans text-xs mt-1">{errors.quantity}</Text>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-on-surface-muted font-sans text-xs mb-1">
              {t('inventory.form.minQuantity', { defaultValue: 'Min' })}
            </Text>
            <TextInput
              testID="item-form-min-quantity"
              className="bg-surface-variant rounded-xl px-4 py-3 text-foreground font-sans text-sm"
              value={state.minQuantity}
              onChangeText={(v) => set('minQuantity', v)}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#475569"
            />
          </View>
        </View>

        {/* SKU + Barcode row */}
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-on-surface-muted font-sans text-xs mb-1">
              {t('inventory.form.sku', { defaultValue: 'SKU' })}
            </Text>
            <TextInput
              testID="item-form-sku"
              className="bg-surface-variant rounded-xl px-4 py-3 text-foreground font-sans text-sm"
              value={state.sku}
              onChangeText={(v) => set('sku', v)}
              placeholder="—"
              placeholderTextColor="#475569"
              autoCapitalize="characters"
            />
          </View>
          <View className="flex-1">
            <Text className="text-on-surface-muted font-sans text-xs mb-1">
              {t('inventory.form.barcode', { defaultValue: 'Barcode' })}
            </Text>
            <TextInput
              testID="item-form-barcode"
              className="bg-surface-variant rounded-xl px-4 py-3 text-foreground font-sans text-sm"
              value={state.barcode}
              onChangeText={(v) => set('barcode', v)}
              placeholder="—"
              placeholderTextColor="#475569"
            />
          </View>
        </View>

        {/* Price */}
        <View>
          <Text className="text-on-surface-muted font-sans text-xs mb-1">
            {t('inventory.form.price', { defaultValue: 'Price' })}
          </Text>
          <TextInput
            testID="item-form-price"
            className="bg-surface-variant rounded-xl px-4 py-3 text-foreground font-sans text-sm"
            value={state.price}
            onChangeText={(v) => set('price', v)}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor="#475569"
          />
        </View>

        {/* Expiration Date */}
        <View>
          <Text className="text-on-surface-muted font-sans text-xs mb-1">
            {t('inventory.form.expirationDate', { defaultValue: 'Expiration date' })}
          </Text>
          <TextInput
            testID="item-form-expiration-date"
            className="bg-surface-variant rounded-xl px-4 py-3 text-foreground font-sans text-sm"
            value={state.expirationDate}
            onChangeText={(v) => set('expirationDate', v)}
            placeholder={t('inventory.form.dateHint', { defaultValue: 'YYYY-MM-DD' })}
            placeholderTextColor="#475569"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Buttons */}
        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity
            testID="item-form-cancel"
            className="flex-1 py-3 rounded-xl bg-surface-variant items-center"
            activeOpacity={0.75}
            onPress={onCancel}
            disabled={submitting}
          >
            <Text className="text-on-surface-muted font-sans-medium text-sm">
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="item-form-submit"
            className={`flex-1 py-3 rounded-xl items-center ${
              submitting ? 'bg-surface-variant' : 'bg-primary'
            }`}
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-sans-semibold text-sm">{submitLabel}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
