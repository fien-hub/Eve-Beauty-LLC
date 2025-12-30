// Eve Beauty Web Theme - Matches mobile app theme
export const colors = {
  // Primary - Coral/Peach
  primary: '#F4B5A4',
  primaryDark: '#E89580',
  primaryDarker: '#D97A5F',
  primaryLight: '#F8CFC3',
  primaryLighter: '#FCE5DF',
  primarySubtle: '#FEF5F2',

  // Soft Pink - For tab buttons
  softPink: '#E8A598',

  // High Contrast Coral - For text/icons on white
  highContrastCoral: '#D97A5F',

  // Secondary - Grey
  secondary: '#9CA3AF',
  secondaryDark: '#6B7280',
  secondaryLight: '#D1D5DB',
  secondarySubtle: '#F3F4F6',

  // Tertiary - Teal
  tertiary: '#5EEAD4',
  tertiaryDark: '#2DD4BF',
  tertiaryLight: '#99F6E4',
  tertiarySubtle: '#CCFBF1',

  // Neutral
  background: '#FFFFFF',
  backgroundGray: '#F7F7F7',
  backgroundDark: '#F0F0F0',
  surface: '#FFFFFF',
  surfaceElevated: '#FAFAFA',

  // Text
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textLight: '#9E9E9E',
  textDisabled: '#BDBDBD',

  // Border
  border: '#E5E5E5',
  borderLight: '#F0F0F0',
  borderDark: '#D0D0D0',

  // Semantic
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  white: '#FFFFFF',
  black: '#000000',

  // Status
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  inProgress: '#8B5CF6',
  completed: '#10B981',
  cancelled: '#EF4444',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

export const spacing = {
  xxs: '0.125rem',  // 2px
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  xxl: '2rem',      // 32px
  xxxl: '3rem',     // 48px
  xxxxl: '4rem',    // 64px
} as const;

export const borderRadius = {
  sm: '0.25rem',    // 4px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  xxl: '1.5rem',    // 24px
  full: '9999px',
} as const;

export const fontSize = {
  xs: '0.6875rem',  // 11px
  sm: '0.8125rem',  // 13px
  md: '0.9375rem',  // 15px
  lg: '1.0625rem',  // 17px
  xl: '1.25rem',    // 20px
  xxl: '1.75rem',   // 28px
  xxxl: '2.25rem',  // 36px
  xxxxl: '3rem',    // 48px
} as const;

export const fontWeight = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.07)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  primaryGlow: '0 4px 14px rgba(244, 181, 164, 0.4)',
} as const;

export const animation = {
  fast: '150ms',
  normal: '250ms',
  slow: '350ms',
} as const;

export const theme = {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
  animation,
} as const;

export type Theme = typeof theme;

