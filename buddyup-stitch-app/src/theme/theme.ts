export const Theme = {
  colors: {
    // Main brand
    primary: '#df8eff',
    primaryContainer: '#d878ff',
    onPrimary: '#4f006d',
    onPrimaryContainer: '#3d0055',

    // Secondary / neon green
    secondary: '#2ff801',
    secondaryDim: '#2be800',
    secondaryContainer: '#106e00',
    onSecondary: '#0b5800',
    onSecondaryFixed: '#064200',

    // Tertiary / yellow
    tertiary: '#fffcca',
    tertiaryDim: '#f0ec00',

    // Surfaces
    background: '#1a0425',
    surface: '#1a0425',
    surfaceDim: '#1a0425',
    surfaceBright: '#411c51',
    surfaceContainerLowest: '#000000',
    surfaceContainerLow: '#21072d',
    surfaceContainer: '#290c36',
    surfaceContainerHigh: '#31113f',
    surfaceContainerHighest: '#391648',
    surfaceVariant: '#391648',

    // Text / icons
    text: '#f9dcff',
    onSurface: '#f9dcff',
    onSurfaceVariant: '#c1a0cb',
    onBackground: '#f9dcff',

    // Borders
    outline: '#896b93',
    outlineVariant: '#593e63',

    // Error
    error: '#ff6e84',
    errorContainer: '#a70138',
    onError: '#490013',

    // Legacy alias (kept for backward compat)
    textMuted: '#c1a0cb',
  },
  spacing: {
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  roundness: {
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    full: 9999,
  },
  typography: {
    displayLg: { fontSize: 56, fontWeight: 'bold' as const },
    headlineLg: { fontSize: 32, fontWeight: 'bold' as const },
    bodyLg: { fontSize: 16, fontWeight: 'normal' as const },
    labelSm: { fontSize: 12, fontWeight: '500' as const },
  }
};
