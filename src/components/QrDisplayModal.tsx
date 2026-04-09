import { View, Text, Modal, Image, ActivityIndicator, TouchableOpacity } from 'react-native';

interface QrDisplayModalProps {
  visible: boolean;
  title: string;
  instruction: string;
  closeLabel: string;
  qrUrl: string | undefined;
  isLoading: boolean;
  onClose: () => void;
}

export function QrDisplayModal({
  visible,
  title,
  instruction,
  closeLabel,
  qrUrl,
  isLoading,
  onClose,
}: QrDisplayModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/80 items-center justify-center px-6">
        <View className="bg-surface-variant rounded-2xl p-6 w-full items-center gap-4">
          <Text className="text-foreground font-sans-bold text-lg">{title}</Text>
          <Text className="text-on-surface-muted font-sans text-xs text-center">{instruction}</Text>
          {isLoading && <ActivityIndicator color="#4d7c6f" />}
          {qrUrl && (
            <Image source={{ uri: qrUrl }} style={{ width: 220, height: 220 }} resizeMode="contain" />
          )}
          <TouchableOpacity
            className="bg-primary rounded-xl px-6 py-3 w-full items-center mt-2"
            activeOpacity={0.8}
            onPress={onClose}
          >
            <Text className="text-white font-sans-semibold">{closeLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
