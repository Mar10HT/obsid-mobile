import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loansApi } from '@features/loans/api';
import type { Loan, LoanFilterTab, LoanStatus } from '@features/loans/types';
import { usePermission } from '@hooks/use-permission';
import { PERMISSIONS } from '@constants/permissions';
import { FilterTabBar } from '@components/FilterTabBar';
import { QrDisplayModal } from '@components/QrDisplayModal';
import { formatShortDate } from '@/utils/format-date';

// --- helpers ---

const STATUS_COLORS: Record<string, { text: string; bg: string }> = {
  PENDING:        { text: '#f59e0b', bg: '#2d2010' },
  SENT:           { text: '#3b82f6', bg: '#0f1e2d' },
  RECEIVED:       { text: '#10b981', bg: '#0f2920' },
  RETURN_PENDING: { text: '#8b5cf6', bg: '#1a1028' },
  RETURNED:       { text: '#64748b', bg: '#1a1a1a' },
  OVERDUE:        { text: '#ef4444', bg: '#2d1515' },
  CANCELLED:      { text: '#475569', bg: '#1a1a1a' },
};

const FILTER_TABS: LoanFilterTab[] = ['PENDING', 'ACTIVE', 'RETURN_PENDING'];

function isOverdue(loan: Loan): boolean {
  return (
    (loan.status === 'SENT' || loan.status === 'RECEIVED') &&
    new Date(loan.dueDate) < new Date()
  );
}

// --- QR Modal (loan-specific data fetching) ---

type QrModalState = { loanId: string; type: 'send' | 'return'; dataUrl?: string } | null;

function LoanQrModal({ state, onClose }: { state: QrModalState; onClose: () => void }) {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['loan-qr', state?.loanId, state?.type],
    queryFn: () => loansApi.getQr(state!.loanId, state!.type),
    enabled: !!state && !state.dataUrl,
  });

  const qrUrl = state?.dataUrl ?? data?.qrCodeDataUrl;
  const title = state?.type === 'send'
    ? t('loans.qrModal.sendTitle')
    : t('loans.qrModal.returnTitle');

  return (
    <QrDisplayModal
      visible={!!state}
      title={title}
      instruction={t('loans.qrModal.instruction')}
      closeLabel={t('loans.qrModal.close')}
      qrUrl={qrUrl}
      isLoading={isLoading}
      onClose={onClose}
    />
  );
}

// --- Loan Card ---

function LoanCard({
  loan,
  onSend,
  onViewSendQr,
  onInitiateReturn,
  onViewReturnQr,
  isActioning,
}: {
  loan: Loan;
  onSend: (id: string) => void;
  onViewSendQr: (id: string) => void;
  onInitiateReturn: (id: string) => void;
  onViewReturnQr: (id: string) => void;
  isActioning: boolean;
}) {
  const { t } = useTranslation();
  const canManage = usePermission(PERMISSIONS.LOANS_MANAGE);
  const statusStyle = STATUS_COLORS[loan.status] ?? STATUS_COLORS.CANCELLED;
  const overdue = isOverdue(loan);

  return (
    <View className="bg-surface-variant rounded-xl mx-5 mb-3 overflow-hidden">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Text className="text-foreground font-sans-semibold text-sm flex-1 mr-3" numberOfLines={1}>
          {loan.inventoryItem.name}
        </Text>
        <View style={{ backgroundColor: statusStyle.bg }} className="px-2 py-0.5 rounded">
          <Text style={{ color: statusStyle.text }} className="font-sans text-xs">
            {t(`loans.status.${loan.status}`)}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View className="px-4 pb-2 gap-0.5">
        <Text className="text-on-surface-muted font-sans text-xs">
          {loan.sourceWarehouse.name} → {loan.destinationWarehouse.name} · ×{loan.quantity}
        </Text>
        <Text
          className="font-sans text-xs"
          style={{ color: overdue ? '#ef4444' : '#64748b' }}
        >
          {overdue ? t('loans.overdue') : t('loans.dueDate', { date: formatShortDate(loan.dueDate) })}
        </Text>
      </View>

      {/* Actions */}
      {loan.status === 'PENDING' && canManage && (
        <TouchableOpacity
          className="mx-4 mb-4 mt-1 bg-primary rounded-lg py-2.5 items-center"
          activeOpacity={0.8}
          disabled={isActioning}
          onPress={() => onSend(loan.id)}
        >
          {isActioning
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text className="text-white font-sans-semibold text-sm">{t('loans.actions.send')}</Text>
          }
        </TouchableOpacity>
      )}

      {loan.status === 'SENT' && (
        <TouchableOpacity
          className="mx-4 mb-4 mt-1 bg-surface rounded-lg border border-border py-2.5 items-center"
          activeOpacity={0.8}
          onPress={() => onViewSendQr(loan.id)}
        >
          <Text className="text-on-surface-variant font-sans-semibold text-sm">
            {t('loans.actions.viewSendQr')}
          </Text>
        </TouchableOpacity>
      )}

      {loan.status === 'RECEIVED' && canManage && (
        <TouchableOpacity
          className="mx-4 mb-4 mt-1 bg-surface rounded-lg border border-primary py-2.5 items-center"
          activeOpacity={0.8}
          disabled={isActioning}
          onPress={() => onInitiateReturn(loan.id)}
        >
          {isActioning
            ? <ActivityIndicator color="#4d7c6f" size="small" />
            : <Text className="text-primary font-sans-semibold text-sm">{t('loans.actions.initiateReturn')}</Text>
          }
        </TouchableOpacity>
      )}

      {loan.status === 'RETURN_PENDING' && (
        <TouchableOpacity
          className="mx-4 mb-4 mt-1 bg-surface rounded-lg border border-border py-2.5 items-center"
          activeOpacity={0.8}
          onPress={() => onViewReturnQr(loan.id)}
        >
          <Text className="text-on-surface-variant font-sans-semibold text-sm">
            {t('loans.actions.viewReturnQr')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// --- Main Screen ---

export default function LoansScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<LoanFilterTab>('PENDING');
  const [qrModal, setQrModal] = useState<{ loanId: string; type: 'send' | 'return'; dataUrl?: string } | null>(null);
  const [actioningIds, setActioningIds] = useState<Set<string>>(new Set());

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['loans', activeTab],
    queryFn: () =>
      activeTab === 'ACTIVE'
        ? loansApi.getActive()
        : loansApi.getList(activeTab as LoanStatus),
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['loans'] });
  }, [queryClient]);

  const sendMutation = useMutation({
    mutationFn: (id: string) => loansApi.send(id),
    onMutate: (id) => setActioningIds((prev) => new Set([...prev, id])),
    onSuccess: (result, id) => {
      invalidate();
      setActioningIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      if (result.qrCodeDataUrl) {
        setQrModal({ loanId: result.id, type: 'send', dataUrl: result.qrCodeDataUrl });
      }
    },
    onError: (err, id) => {
      setActioningIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      Alert.alert(t('loans.actionError'), err instanceof Error ? err.message : '');
    },
  });

  const returnMutation = useMutation({
    mutationFn: (id: string) => loansApi.initiateReturn(id),
    onMutate: (id) => setActioningIds((prev) => new Set([...prev, id])),
    onSuccess: (result, id) => {
      invalidate();
      setActioningIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      if (result.qrCodeDataUrl) {
        setQrModal({ loanId: result.id, type: 'return', dataUrl: result.qrCodeDataUrl });
      }
    },
    onError: (err, id) => {
      setActioningIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      Alert.alert(t('loans.actionError'), err instanceof Error ? err.message : '');
    },
  });

  const loans = data?.data ?? [];

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top + 8 }}>
      <View className="px-5 mb-4">
        <Text className="text-foreground font-sans-bold text-2xl">{t('loans.title')}</Text>
      </View>

      <FilterTabBar
        tabs={FILTER_TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
        label={(tab) => t(`loans.tabs.${tab}`)}
      />

      {isError && (
        <Text className="text-status-error font-sans text-sm text-center px-5 mb-4">
          {t('loans.loadError')}
        </Text>
      )}

      <FlatList
        data={loans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LoanCard
            loan={item}
            onSend={(id) => sendMutation.mutate(id)}
            onViewSendQr={(id) => setQrModal({ loanId: id, type: 'send' })}
            onInitiateReturn={(id) => returnMutation.mutate(id)}
            onViewReturnQr={(id) => setQrModal({ loanId: id, type: 'return' })}
            isActioning={actioningIds.has(item.id)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor="#4d7c6f" />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-12">
              <Text className="text-on-surface-muted font-sans text-sm">{t('loans.empty')}</Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      <LoanQrModal state={qrModal} onClose={() => setQrModal(null)} />
    </View>
  );
}
