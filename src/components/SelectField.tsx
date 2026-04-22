import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ListRenderItem,
} from 'react-native';

export interface SelectFieldOption {
  id: string;
  label: string;
}

export interface SelectFieldProps {
  label: string;
  placeholder: string;
  value: string | null;
  options: ReadonlyArray<SelectFieldOption>;
  onChange: (id: string) => void;
  required?: boolean;
  error?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyLabel?: string;
  closeLabel?: string;
  triggerTestID?: string;
}

export function SelectField({
  label,
  placeholder,
  value,
  options,
  onChange,
  required,
  error,
  searchable,
  searchPlaceholder,
  emptyLabel,
  closeLabel,
  triggerTestID,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selected = useMemo(
    () => options.find((o) => o.id === value) ?? null,
    [options, value],
  );

  const filtered = useMemo(() => {
    if (!searchable || search.trim() === '') return options;
    const q = search.trim().toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search, searchable]);

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
    setSearch('');
  };

  const handleClose = () => {
    setOpen(false);
    setSearch('');
  };

  const renderItem: ListRenderItem<SelectFieldOption> = ({ item }) => {
    const isSelected = item.id === value;
    return (
      <TouchableOpacity
        className={`px-4 py-3 border-b border-surface-variant ${
          isSelected ? 'bg-surface-variant' : ''
        }`}
        activeOpacity={0.7}
        onPress={() => handleSelect(item.id)}
      >
        <Text
          className={`font-sans text-sm ${
            isSelected ? 'text-primary font-sans-semibold' : 'text-foreground'
          }`}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <Text className="text-on-surface-muted font-sans text-xs mb-1">
        {label}
        {required ? ' *' : ''}
      </Text>

      <TouchableOpacity
        testID={triggerTestID ?? 'select-field-trigger'}
        className={`bg-surface-variant rounded-xl px-4 py-3 flex-row items-center justify-between ${
          error ? 'border border-status-error' : ''
        }`}
        activeOpacity={0.75}
        onPress={() => setOpen(true)}
      >
        <Text
          className={`font-sans text-sm flex-1 ${
            selected ? 'text-foreground' : 'text-on-surface-muted'
          }`}
          numberOfLines={1}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Text className="text-on-surface-muted ml-2">›</Text>
      </TouchableOpacity>

      {error && (
        <Text className="text-status-error font-sans text-xs mt-1">{error}</Text>
      )}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-surface rounded-t-3xl max-h-[80%]">
            <View className="px-5 pt-5 pb-3 flex-row items-center justify-between">
              <Text className="text-foreground font-sans-bold text-lg">{label}</Text>
              <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
                <Text className="text-on-surface-muted font-sans text-sm">
                  {closeLabel ?? 'Close'}
                </Text>
              </TouchableOpacity>
            </View>

            {searchable && (
              <View className="px-5 pb-3">
                <TextInput
                  testID="select-field-search"
                  className="bg-surface-variant rounded-xl px-4 py-3 text-foreground font-sans text-sm"
                  value={search}
                  onChangeText={setSearch}
                  placeholder={searchPlaceholder ?? 'Search'}
                  placeholderTextColor="#475569"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}

            {filtered.length === 0 ? (
              <View className="px-5 py-8 items-center">
                <Text className="text-on-surface-muted font-sans text-sm">
                  {emptyLabel ?? 'No options'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                keyboardShouldPersistTaps="handled"
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
