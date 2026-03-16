// Design tokens for BuddyUp

export const colors = {
  // Background
  bg: "#0B0C10", // Deeper black for high contrast
  bgCard: "#1F2833", // Sleek dark slate
  bgInput: "#131722",

  // Brand - Exciting Neon Pink/Orange Gradient Vibe
  primary: "#FF3366", // Neon Pink
  primaryLight: "#FF758C", // Lighter pink
  secondary: "#FFB347", // Vibrant Orange

  // Accent
  accent: "#00E5FF", // Cyan pop
  warning: "#FFD700", // Gold

  // Text
  text: "#FFFFFF",
  textSub: "#C5C6C7",
  textMuted: "#8892B0",

  // Interest chips - brighter complementary colors
  chipGym: "#FF4B4B",
  chipCoding: "#00F2FE",
  chipSports: "#00D2FF",
  chipTravel: "#FF9A9E",
  chipHangout: "#F8CA24",
  chipGaming: "#BD34FE",

  // Utility
  border: "#2C3440",
  success: "#00E676",
  error: "#FF1744",
  transparent: "transparent",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 32,
  full: 9999,
};

export const fontSizes = {
  xs: 11,
  sm: 13,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 34,
};

export const INTEREST_COLORS: Record<string, string> = {
  Gym: colors.chipGym,
  Running: colors.chipGym,
  Yoga: colors.accent,
  Football: colors.chipSports,
  Basketball: colors.chipSports,
  Cricket: colors.chipSports,
  Badminton: colors.chipSports,
  Coding: colors.chipCoding,
  Gaming: colors.chipGaming,
  Hiking: colors.chipTravel,
  Travel: colors.chipTravel,
  "Coffee Hangouts": colors.chipHangout,
};

export const INTERESTS = Object.keys(INTEREST_COLORS);
