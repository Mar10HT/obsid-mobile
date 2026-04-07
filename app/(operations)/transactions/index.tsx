import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiFetch } from '@features/auth/client';
import { API_ENDPOINTS } from '@constants/api';
import type { RawTransaction } from '@features/inventory/types';

const TX_ICON: Record<string, string> = {
  IN: '↓',
  OUT: '↑',
  TRANSFER: '⇌',
  LOAN: '⊟',
  RETURN: '↩',
};

const TX_COLOR: Record<string, { color: string; bg: string }> = {
  IN:       { color: '#10b981', bg: '#0f2920' },
  OUT:      { color: '#ef4444', bg: '#2d1515' },
  TRANSFER: { color: '#3b82f6', bg: '#0f1e2d' },
  LOAN:     { color: '#f59e0b', bg: '#2d2010' },
  RETURN:   { color: '#a855f7', bg: '#1f1230' },
};

interface PageResponse {
  data: RawTransaction[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

function fetchPage(page: number): Promise<PageResponse> {
  return apiFetch<PageResponse>(`${API_ENDPOINTS.transactions}?page=${page}&limit=20`);
}

function formatDate(iso: string, t: (key: string, opts?: object) => string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 60) return t('dashboard.timeAgo.minutes_other', { count: diffMin });
  if (diffH < 24) return t('dashboard.timeAgo.hours_other', { count: diffH });
  return t('dashboard.timeAgo.days_other', { count: diffD });
}

function TxRow({ tx, t }: { tx: RawTransaction; t: (key: string, opts?: object) => string }) {
  const style = TX_COLOR[tx.type] ?? { color: '#94a3b8', bg: '#1e293b' };
  const icon = TX_ICON[tx.type] ?? '·';
  const itemName = tx.items[0]?.inventoryItem?.name ?? '—';
  const qty = tx.items.reduce((s, i) => s + i.quantity, 0);
  const warehouse = tx.sourceWarehouse?.name ?? tx.destinationWarehouse?.name ?? '—';

  return (
    <View className="flex-row items-center px-4 py-3 border-b border-surface-variant gap-3">
      <View
        style={{ backgroundColor: style.bg }}
        className="w-9 h-9 rounded-lg items-center justify-center"
      >
        <Text style={{ color: style.color }} className="font-sans-bold text-base">
          {icon}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-foreground font-sans-medium text-sm" numberOfLines={1}>
          {itemName}
        </Text>
        <Text className="text-on-surface-muted font-sans text-xs mt-0.5">
          {warehouse} · {tx.user?.name ?? tx.user?.email ?? '—'}
        </Text>
      </View>
      <View className="items-end">
        <Text style={{ color: style.color }} className="font-sans-bold text-sm">
          {tx.type === 'OUT' ? '-' : '+'}{qty}
        </Text>
        <Text className="text-on-surface-muted font-mono text-xs mt-0.5">
          {formatDate(tx.date, t)}
        </Text>
      </View>
    </View>
  );
}

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const { data, isError, isFetchingNextPage, fetchNextPage, hasNextPage, refetch, isFetching } =
    useInfiniteQuery({
      queryKey: ['transactions-history'],
      queryFn: ({ pageParam }) => fetchPage(pageParam as number),
      initialPageParam: 1,
      getNextPageParam: (last) =>
        last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
    });

  const rows = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top + 8 }}>
      <View className="px-5 mb-4">
        <Text className="text-foreground font-sans-bold text-2xl">
          {t('transactions.title')}
        </Text>
        {data && (
          <Text className="text-on-surface-muted font-sans text-xs mt-1">
            {t('transactions.total', { count: data.pages[0]?.meta.total ?? 0 })}
          </Text>
        )}
      </View>

      {isError && (
        <View className="px-5 py-3">
          <Text className="text-status-error font-sans text-sm text-center">
            {t('transactions.loadError')}
          </Text>
        </View>
      )}

      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TxRow tx={item} t={t} />}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isFetchingNextPage}
            onRefresh={refetch}
            tintColor="#4d7c6f"
          />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-on-surface-muted font-sans text-sm">
              {t('transactions.empty')}
            </Text>
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4 items-center">
              <Text className="text-on-surface-muted font-sans text-xs">
                {t('common.loading')}
              </Text>
            </View>
          ) : (
            <View style={{ height: 16 }} />
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
