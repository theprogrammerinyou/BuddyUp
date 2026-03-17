// Design tokens for BuddyUp
import React from "react";

export const themes = {
  dark: {
    bg: "#0B0C10",
    bgCard: "#1F2833",
    bgInput: "#131722",
    primary: "#FF3366",
    primaryLight: "#FF758C",
    secondary: "#FFB347",
    accent: "#00E5FF",
    warning: "#FFD700",
    text: "#FFFFFF",
    textSub: "#C5C6C7",
    textMuted: "#8892B0",
    border: "#2C3440",
    success: "#00E676",
    error: "#FF1744",
    transparent: "transparent",
    chipGym: "#FF4B4B",
    chipCoding: "#00F2FE",
    chipSports: "#00D2FF",
    chipTravel: "#FF9A9E",
    chipHangout: "#F8CA24",
    chipGaming: "#BD34FE",
  },
  anime: {
    bg: "#1a0533",
    bgCard: "#2d1050",
    bgInput: "#3d1a6e",
    primary: "#e040fb",
    primaryLight: "#ea80fc",
    secondary: "#ff6d00",
    accent: "#40c4ff",
    warning: "#ffd740",
    text: "#FFFFFF",
    textSub: "#e1bee7",
    textMuted: "#ce93d8",
    border: "#4a2070",
    success: "#69f0ae",
    error: "#ff5252",
    transparent: "transparent",
    chipGym: "#ef5350",
    chipCoding: "#40c4ff",
    chipSports: "#29b6f6",
    chipTravel: "#f48fb1",
    chipHangout: "#ffcc02",
    chipGaming: "#ce93d8",
  },
} as const;

export type ThemeName = keyof typeof themes;

export const ThemeContext = React.createContext<{
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  colors: (typeof themes)[ThemeName];
}>({
  themeName: "dark",
  setTheme: () => {},
  colors: themes.dark,
});

// Keep existing colors export pointing at dark theme so all screens remain unchanged
export const colors = themes.dark;

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
