import type { TFunction } from 'i18next';

function isValidDate(d: Date): boolean {
  return !isNaN(d.getTime());
}

/**
 * Format an ISO date string as a short, locale-aware date (e.g. "15 Apr").
 */
export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (!isValidDate(d)) return '—';
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

/**
 * Return a human-readable relative time string ("3 min ago", "2h ago", etc.)
 * using the app's i18n `dashboard.timeAgo.*` keys.
 */
export function timeAgo(iso: string, t: TFunction): string {
  const d = new Date(iso);
  if (!isValidDate(d)) return '—';
  const diff = Math.max(0, Date.now() - d.getTime());
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return t('dashboard.timeAgo.minutes', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('dashboard.timeAgo.hours', { count: hours });
  return t('dashboard.timeAgo.days', { count: Math.floor(hours / 24) });
}
