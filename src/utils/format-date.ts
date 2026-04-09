import type { TFunction } from 'i18next';

/**
 * Format an ISO date string as a short, locale-aware date (e.g. "15 Apr").
 */
export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

/**
 * Return a human-readable relative time string ("3 min ago", "2h ago", etc.)
 * using the app's i18n `dashboard.timeAgo.*` keys.
 */
export function timeAgo(iso: string, t: TFunction): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return t('dashboard.timeAgo.minutes', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('dashboard.timeAgo.hours', { count: hours });
  return t('dashboard.timeAgo.days', { count: Math.floor(hours / 24) });
}
