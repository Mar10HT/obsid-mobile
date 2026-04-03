import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { transfersApi } from '@features/transfers/api';
import type { TransferRequest, FilterTab } from '@features/transfers/types';
import { usePermission } from '@hooks/use-permission';
import { PERMISSIONS } from '@constants/permissions';

// --- helpers ---

const STATUS_COLORS: Record<string, { text: string; bg: string }> = {
  PENDING:   { text: '#f59e0b', bg: '#2d2010' },
  APPROVED:  { text: '#3b82f6', bg: '#0f1e2d' },
  SENT:      { text: '#8b5cf6', bg: '#1a1028' },
  RECEIVED:  { text: '#10b981', bg: '#0f2920' },
  COMPLETED: { text: '#10b981', bg: '#0f2920' },
  REJECTED:  { text: '#ef4444', bg: '#2d1515' },
  CANCELLED: { text: '#64748b', bg: '#1a1a1a' },
};

const FILTER_TABS: FilterTab[] = ['PENDING', 'APPROVED', 'SENT'];

function timeAgo(iso: string, t: (k: string, o?: object) => string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return t('dashboard.timeAgo.minutes', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('dashboard.timeAgo.hours', { count: hours });
  return t('dashboard.timeAgo.days', { count: Math.floor(hours / 24) });
}

// --- QR Modal ---

function QrModal({
  transferId,
  visible,
  onClose,
}: {
  transferId: string | null;
  visible: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['transfer-qr', transferId],
    queryFn: () => transfersApi.getQr(transferId!),
    enabled: visible && !!transferId,
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/80 items-center justify-center px-6">
        <View className="bg-surface-variant rounded-2xl p-6 w-full items-center gap-4">
          <Text className="text-foreground font-sans-bold text-lg">{t('transfers.qrModal.title')}</Text>
          <Text className="text-on-surface-muted font-sans text-xs text-center">
            {t('transfers.qrModal.instruction')}
          </Text>

          {isLoading && <ActivityIndicator color="#4d7c6f" />}
          {data?.qrCodeDataUrl && (
            <Image
              source={{ uri: data.qrCodeDataUrl }}
              style={{ width: 220, height: 220 }}
              resizeMode="contain"
            />
          )}

          <TouchableOpacity
            className="bg-primary rounded-xl px-6 py-3 w-full items-center mt-2"
            activeOpacity={0.8}
            onPress={onClose}
          >
            <Text className="text-white font-sans-semibold">{t('transfers.qrModal.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// --- Transfer Card ---

function TransferCard({
  transfer,
  onApprove,
  onSend,
  onViewQr,
  isActioning,
}: {
  transfer: TransferRequest;
  onApprove: (id: string) => void;
  onSend: (id: string) => void;
  onViewQr: (id: string) => void;
  isActioning: boolean;
}) {
  const { t } = useTranslation();
  const canManage = usePermission(PERMISSIONS.TRANSFERS_MANAGE);
  const statusStyle = STATUS_COLORS[transfer.status] ?? STATUS_COLORS.CANCELLED;
  const itemCount = transfer.items.reduce((sum, i) => sum + i.quantity, 0);
  const itemNames = transfer.items
    .slice(0, 2)
    .map((i) => i.inventoryItem.name)
    .join(', ');
  const hasMore = transfer.items.length > 2;

  return (
    <View className="bg-surface-variant rounded-xl mx-5 mb-3 overflow-hidden">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Text className="text-foreground font-sans-semibold text-sm flex-1 mr-3" numberOfLines={1}>
          {transfer.sourceWarehouse.name} → {transfer.destinationWarehouse.name}
        </Text>
        <View style={{ backgroundColor: statusStyle.bg }} className="px-2 py-0.5 rounded">
          <Text style={{ color: statusStyle.text }} className="font-sans text-xs">
            {t(`transfers.status.${transfer.status}`)}
          </Text>
        </View>
      </View>

      {/* Items */}
      <View className="px-4 pb-2">
        <Text className="text-on-surface-muted font-sans text-xs" numberOfLines={1}>
          {itemNames}{hasMore ? `, +${transfer.items.length - 2}` : ''} · {t('transfers.items', { count: itemCount })}
        </Text>
        <Text className="text-on-surface-muted font-sans text-xs mt-0.5">
          {timeAgo(transfer.createdAt, t)}
        </Text>
      </View>

      {/* Actions */}
      {transfer.status === 'PENDING' && canManage && (
        <TouchableOpacity
          className="mx-4 mb-4 mt-1 bg-primary rounded-lg py-2.5 items-center"
          activeOpacity={0.8}
          disabled={isActioning}
          onPress={() => onApprove(transfer.id)}
        >
          {isActioning
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text className="text-white font-sans-semibold text-sm">{t('transfers.actions.approve')}</Text>
          }
        </TouchableOpacity>
      )}

      {transfer.status === 'APPROVED' && canManage && (
        <TouchableOpacity
          className="mx-4 mb-4 mt-1 bg-surface rounded-lg border border-primary py-2.5 items-center"
          activeOpacity={0.8}
          disabled={isActioning}
          onPress={() => onSend(transfer.id)}
        >
          {isActioning
            ? <ActivityIndicator color="#4d7c6f" size="small" />
            : <Text className="text-primary font-sans-semibold text-sm">{t('transfers.actions.send')}</Text>
          }
        </TouchableOpacity>
      )}

      {transfer.status === 'SENT' && (
        <TouchableOpacity
          className="mx-4 mb-4 mt-1 bg-surface rounded-lg border border-border py-2.5 items-center flex-row justify-center gap-2"
          activeOpacity={0.8}
          onPress={() => onViewQr(transfer.id)}
        >
          <Text className="text-on-surface-variant text-base">⬡</Text>
          <Text className="text-on-surface-variant font-sans-semibold text-sm">{t('transfers.actions.viewQr')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// --- Main Screen ---

export default function TransfersScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<FilterTab>('PENDING');
  const [qrTransferId, setQrTransferId] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['transfers', activeTab],
    queryFn: () => transfersApi.getList(activeTab),
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['transfers'] });
  }, [queryClient]);

  const approveMutation = useMutation({
    mutationFn: (id: string) => transfersApi.approve(id),
    onMutate: (id) => setActioningId(id),
    onSuccess: () => { invalidate(); setActioningId(null); },
    onError: (err) => {
      setActioningId(null);
      Alert.alert(t('transfers.actionError'), err instanceof Error ? err.message : '');
    },
  });

  const sendMutation = useMutation({
    mutationFn: (id: string) => transfersApi.send(id),
    onMutate: (id) => setActioningId(id),
    onSuccess: (result) => {
      invalidate();
      setActioningId(null);
      // Show QR immediately after sending
      if (result.qrCodeDataUrl) {
        setQrTransferId(result.id);
      }
    },
    onError: (err) => {
      setActioningId(null);
      Alert.alert(t('transfers.actionError'), err instanceof Error ? err.message : '');
    },
  });

  const transfers = data?.data ?? [];

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top + 8 }}>
      {/* Header */}
      <View className="px-5 mb-4">
        <Text className="text-foreground font-sans-bold text-2xl">{t('transfers.title')}</Text>
      </View>

      {/* Filter tabs */}
      <View className="flex-row px-5 mb-4 gap-2">
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full ${activeTab === tab ? 'bg-primary' : 'bg-surface-variant'}`}
            activeOpacity={0.7}
          >
            <Text
              className={`font-sans-semibold text-xs ${activeTab === tab ? 'text-white' : 'text-on-surface-muted'}`}
            >
              {t(`transfers.tabs.${tab}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isError && (
        <Text className="text-status-error font-sans text-sm text-center px-5 mb-4">
          {t('transfers.loadError')}
        </Text>
      )}

      <FlatList
        data={transfers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransferCard
            transfer={item}
            onApprove={(id) => approveMutation.mutate(id)}
            onSend={(id) => sendMutation.mutate(id)}
            onViewQr={(id) => setQrTransferId(id)}
            isActioning={actioningId === item.id}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor="#4d7c6f" />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-12">
              <Text className="text-on-surface-muted font-sans text-sm">{t('transfers.empty')}</Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      <QrModal
        transferId={qrTransferId}
        visible={!!qrTransferId}
        onClose={() => setQrTransferId(null)}
      />
    </View>
  );
}
