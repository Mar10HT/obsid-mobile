import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TABS = [
  { name: 'index',      label: 'INICIO', icon: '⌂',   isFab: false },
  { name: 'inventory',  label: 'STOCK',  icon: '≡',   isFab: false },
  { name: 'scan',       label: null,     icon: 'QR',  isFab: true  },
  { name: 'operations', label: 'OPER.',  icon: '⇌',   isFab: false },
  { name: 'more',       label: 'MÁS',   icon: '···', isFab: false },
] as const;

const ACTIVE   = '#4d7c6f';
const INACTIVE = '#475569';
const FAB_RING = '#1a2e2a';

export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingBottom: insets.bottom, backgroundColor: '#0f0f0f' }}>
      {/* Top separator */}
      <View style={{ height: 1, backgroundColor: '#1e2a27' }} />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          height: 64,
          paddingHorizontal: 8,
        }}
      >
        {TABS.map((tab) => {
          const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
          const isActive = state.index === routeIndex;
          const tint = isActive ? ACTIVE : INACTIVE;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: state.routes[routeIndex]?.key,
              canPreventDefault: true,
            });
            if (!isActive && !event.defaultPrevented) {
              navigation.navigate(tab.name);
            }
          };

          if (tab.isFab) {
            return (
              <TouchableOpacity
                key={tab.name}
                onPress={onPress}
                activeOpacity={0.8}
                style={{ width: 72, alignItems: 'center', justifyContent: 'center' }}
              >
                <View
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 29,
                    backgroundColor: FAB_RING,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 23,
                      backgroundColor: ACTIVE,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: '#ffffff',
                        fontSize: 13,
                        fontFamily: 'Outfit_700Bold',
                        letterSpacing: 1,
                      }}
                    >
                      QR
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={onPress}
              activeOpacity={0.7}
              style={{ width: 68, alignItems: 'center', justifyContent: 'center', gap: 4 }}
            >
              <Text style={{ fontSize: tab.icon === '···' ? 16 : 20, color: tint, lineHeight: 24 }}>
                {tab.icon}
              </Text>
              {tab.label && (
                <Text
                  style={{
                    fontSize: 9,
                    fontFamily: 'Outfit_600SemiBold',
                    color: tint,
                    letterSpacing: 1,
                  }}
                >
                  {tab.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
