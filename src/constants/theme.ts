// Design tokens mapped from Inv-App design system (dark theme)
// Source: Inv-App/src/styles/design-system/colors.css

export const colors = {
  // Primary - Teal Green
  primary: '#4d7c6f',
  primaryHover: '#5d8c7f',
  primaryOn: '#ffffff',
  primaryContainer: '#2d4a3f',
  primaryOnContainer: '#b8d4ca',

  // Surfaces
  surface: '#0a0a0a',
  surfaceVariant: '#1a1a1a',
  surfaceElevated: '#242424',

  // Text
  foreground: '#cbd5e1',
  foregroundMuted: '#94a3b8',
  onSurface: '#cbd5e1',
  onSurfaceVariant: '#94a3b8',
  onSurfaceMuted: '#64748b',

  // Borders
  border: '#3a3a3a',
  borderSubtle: '#2a2a2a',
  borderStrong: '#4a4a4a',

  // Semantic
  success: '#4d7c6f',
  successBg: 'rgba(77, 124, 111, 0.15)',
  successBorder: 'rgba(77, 124, 111, 0.3)',
  warning: '#c8884d',
  warningBg: 'rgba(200, 136, 77, 0.15)',
  warningBorder: 'rgba(200, 136, 77, 0.3)',
  error: '#b85c5c',
  errorBg: 'rgba(184, 92, 92, 0.15)',
  errorBorder: 'rgba(184, 92, 92, 0.3)',
  info: '#6b7bb5',
  infoBg: 'rgba(107, 123, 181, 0.15)',
  infoBorder: 'rgba(107, 123, 181, 0.3)',

  // Status badges
  statusSuccess: '#10b981',
  statusSuccessBg: 'rgba(16, 185, 129, 0.15)',
  statusWarning: '#f59e0b',
  statusWarningBg: 'rgba(245, 158, 11, 0.15)',
  statusError: '#ef4444',
  statusErrorBg: 'rgba(239, 68, 68, 0.15)',
  statusInfo: '#3b82f6',
  statusInfoBg: 'rgba(59, 130, 246, 0.15)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const radius = {
  sm: 6,
  md: 8,
  card: 12,
  lg: 16,
  full: 9999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 12,
  base: 13,   // Obsid base size for data density
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
} as const;
