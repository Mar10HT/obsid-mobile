import { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  StyleSheet,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scannerApi } from '@features/scanner/api';
import type { QrPayload, ScanState } from '@features/scanner/types';

// --- helpers ---

function parseQrPayload(raw: string): QrPayload | null {
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.type === 'string' &&
      typeof parsed.id === 'string' &&
      typeof parsed.code === 'string' &&
      ['LOAN_SEND', 'LOAN_RETURN', 'TRANSFER'].includes(parsed.type)
    ) {
      return parsed as QrPayload;
    }
    return null;
  } catch {
    return null;
  }
}

// --- sub-components ---

function PermissionDenied() {
  const { t } = useTranslation();
  return (
    <View style={StyleSheet.absoluteFill} className="bg-surface items-center justify-center px-8 gap-4">
      <Text className="text-4xl">📷</Text>
      <Text className="text-foreground font-sans-bold text-lg text-center">
        {t('scan.permissionTitle')}
      </Text>
      <Text className="text-on-surface-muted font-sans text-sm text-center">
        {t('scan.permissionMessage')}
      </Text>
      <TouchableOpacity
        className="bg-primary rounded-xl px-6 py-3 mt-2"
        activeOpacity={0.8}
        onPress={() => Linking.openSettings()}
      >
        <Text className="text-white font-sans-semibold">{t('scan.permissionButton')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function ScanFrame() {
  const CORNER = 22;
  const BORDER = 3;
  const COLOR = '#4d7c6f';
  const cornerStyle = { width: CORNER, height: CORNER, borderColor: COLOR, borderWidth: BORDER };
  return (
    <View style={{ width: 240, height: 240, position: 'relative' }}>
      {/* Corners */}
      <View style={[cornerStyle, { position: 'absolute', top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 }]} />
      <View style={[cornerStyle, { position: 'absolute', top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 }]} />
      <View style={[cornerStyle, { position: 'absolute', bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 }]} />
      <View style={[cornerStyle, { position: 'absolute', bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 }]} />
      {/* Scan line */}
      <View style={{ position: 'absolute', top: '50%', left: 16, right: 16, height: 1.5, backgroundColor: COLOR, opacity: 0.7 }} />
    </View>
  );
}

function ResultOverlay({ state, onReset }: { state: ScanState; onReset: () => void }) {
  const { t } = useTranslation();

  if (state.status === 'processing') {
    return (
      <View style={StyleSheet.absoluteFill} className="bg-black/70 items-center justify-center gap-4">
        <ActivityIndicator size="large" color="#4d7c6f" />
        <Text className="text-white font-sans-medium text-base">{t('scan.processing')}</Text>
      </View>
    );
  }

  if (state.status === 'success') {
    const successLabel = t(`scan.successTypes.${state.payload.type}`, { defaultValue: t('scan.title') });
    return (
      <View style={StyleSheet.absoluteFill} className="bg-black/75 items-center justify-center px-8 gap-4">
        <View className="w-16 h-16 rounded-full bg-status-success items-center justify-center">
          <Text className="text-white text-3xl">✓</Text>
        </View>
        <Text className="text-white font-sans-bold text-xl text-center">{successLabel}</Text>
        {state.response.itemName && (
          <Text className="text-white/70 font-sans text-sm text-center">{state.response.itemName}</Text>
        )}
        {state.response.message && (
          <Text className="text-white/60 font-sans text-xs text-center">{state.response.message}</Text>
        )}
        <TouchableOpacity
          className="bg-primary rounded-xl px-6 py-3 mt-2"
          activeOpacity={0.8}
          onPress={onReset}
        >
          <Text className="text-white font-sans-semibold">{t('scan.scanAgain')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <View style={StyleSheet.absoluteFill} className="bg-black/75 items-center justify-center px-8 gap-4">
        <View className="w-16 h-16 rounded-full bg-status-error items-center justify-center">
          <Text className="text-white text-3xl">✕</Text>
        </View>
        <Text className="text-white font-sans-bold text-xl text-center">{t('scan.error')}</Text>
        <Text className="text-white/70 font-sans text-sm text-center">{state.message}</Text>
        <TouchableOpacity
          className="bg-surface-variant rounded-xl px-6 py-3 mt-2"
          activeOpacity={0.8}
          onPress={onReset}
        >
          <Text className="text-white font-sans-semibold">{t('scan.scanAgain')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

// --- main screen ---

export default function ScanScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>({ status: 'idle' });
  const isProcessing = useRef(false);

  const handleBarCodeScanned = useCallback(async ({ data }: { data: string }) => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    const payload = parseQrPayload(data);
    if (!payload) {
      setScanState({ status: 'error', message: t('scan.invalidQr') });
      isProcessing.current = false;
      return;
    }

    setScanState({ status: 'processing' });
    try {
      const response =
        payload.type === 'TRANSFER'
          ? await scannerApi.scanTransfer(payload)
          : await scannerApi.scanLoan(payload);

      setScanState({ status: 'success', payload, response });
    } catch (err) {
      const message = err instanceof Error ? err.message : t('scan.error');
      setScanState({ status: 'error', message });
    }
  }, [t]);

  const handleReset = useCallback(() => {
    setScanState({ status: 'idle' });
    isProcessing.current = false;
  }, []);

  // Permission not yet determined — request on mount
  if (!permission) {
    return <View className="flex-1 bg-surface" />;
  }

  if (!permission.granted) {
    if (permission.canAskAgain) {
      requestPermission();
    }
    return <PermissionDenied />;
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={scanState.status === 'idle' ? handleBarCodeScanned : undefined}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      {/* Dark vignette overlay to focus on frame */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View className="flex-1 bg-black/40" />
        <View className="flex-row">
          <View className="flex-1 bg-black/40" />
          <View style={{ width: 240, height: 240 }} />
          <View className="flex-1 bg-black/40" />
        </View>
        <View className="flex-1 bg-black/40" />
      </View>

      {/* Scan frame centered */}
      <View style={StyleSheet.absoluteFill} className="items-center justify-center" pointerEvents="none">
        <ScanFrame />
      </View>

      {/* Instruction text at bottom */}
      {scanState.status === 'idle' && (
        <View
          style={{ position: 'absolute', bottom: insets.bottom + 48, left: 0, right: 0 }}
          className="items-center px-8 gap-1"
          pointerEvents="none"
        >
          <Text className="text-white font-sans-semibold text-base text-center">
            {t('scan.instruction')}
          </Text>
          <Text className="text-white/60 font-sans text-sm text-center">
            {t('scan.instructionSub')}
          </Text>
        </View>
      )}

      {/* Result overlay (processing / success / error) */}
      <ResultOverlay state={scanState} onReset={handleReset} />
    </View>
  );
}
