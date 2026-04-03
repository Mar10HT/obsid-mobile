/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary - Teal Green
        primary: '#4d7c6f',
        'primary-hover': '#5d8c7f',
        'primary-on': '#ffffff',
        'primary-container': '#2d4a3f',
        'primary-on-container': '#b8d4ca',

        // Surfaces (dark theme)
        surface: '#0a0a0a',
        'surface-variant': '#1a1a1a',
        'surface-elevated': '#242424',

        // Text
        foreground: '#cbd5e1',
        'foreground-muted': '#94a3b8',
        'on-surface': '#cbd5e1',
        'on-surface-variant': '#94a3b8',
        'on-surface-muted': '#64748b',

        // Borders
        border: '#3a3a3a',
        'border-subtle': '#2a2a2a',
        'border-strong': '#4a4a4a',

        // Semantic
        success: '#4d7c6f',
        'success-bg': 'rgba(77, 124, 111, 0.15)',
        'success-border': 'rgba(77, 124, 111, 0.3)',
        warning: '#c8884d',
        'warning-bg': 'rgba(200, 136, 77, 0.15)',
        'warning-border': 'rgba(200, 136, 77, 0.3)',
        error: '#b85c5c',
        'error-bg': 'rgba(184, 92, 92, 0.15)',
        'error-border': 'rgba(184, 92, 92, 0.3)',
        info: '#6b7bb5',
        'info-bg': 'rgba(107, 123, 181, 0.15)',
        'info-border': 'rgba(107, 123, 181, 0.3)',

        // Status badges
        'status-success': '#10b981',
        'status-success-bg': 'rgba(16, 185, 129, 0.15)',
        'status-warning': '#f59e0b',
        'status-warning-bg': 'rgba(245, 158, 11, 0.15)',
        'status-error': '#ef4444',
        'status-error-bg': 'rgba(239, 68, 68, 0.15)',
        'status-info': '#3b82f6',
        'status-info-bg': 'rgba(59, 130, 246, 0.15)',

        // Accent colors
        'accent-violet': '#a78bfa',
        'accent-cyan': '#22d3ee',
        'accent-teal': '#2dd4bf',
        'accent-amber': '#fbbf24',
      },
      fontFamily: {
        sans: ['Outfit_400Regular', 'sans-serif'],
        'sans-medium': ['Outfit_500Medium', 'sans-serif'],
        'sans-semibold': ['Outfit_600SemiBold', 'sans-serif'],
        'sans-bold': ['Outfit_700Bold', 'sans-serif'],
        mono: ['JetBrainsMono_400Regular', 'monospace'],
        'mono-medium': ['JetBrainsMono_500Medium', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        badge: '6px',
      },
    },
  },
  plugins: [],
};
