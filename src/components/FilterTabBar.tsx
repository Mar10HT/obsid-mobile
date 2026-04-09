import { View, Text, TouchableOpacity } from 'react-native';

interface FilterTabBarProps<T extends string> {
  tabs: T[];
  activeTab: T;
  onChange: (tab: T) => void;
  label: (tab: T) => string;
}

export function FilterTabBar<T extends string>({
  tabs,
  activeTab,
  onChange,
  label,
}: FilterTabBarProps<T>) {
  return (
    <View className="flex-row px-5 mb-4 gap-2">
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => onChange(tab)}
          className={`px-4 py-2 rounded-full ${activeTab === tab ? 'bg-primary' : 'bg-surface-variant'}`}
          activeOpacity={0.7}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === tab }}
        >
          <Text
            className={`font-sans-semibold text-xs ${activeTab === tab ? 'text-white' : 'text-on-surface-muted'}`}
          >
            {label(tab)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
