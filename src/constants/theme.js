import {
  Platform,
  StyleSheet,
} from "react-native";

export const lightColors = {
  bg: "#f4f5f7",
  surface: "#ffffff",
  surfaceSecondary: "#f8fafc",

  text: "#0f172a",
  textMuted: "#64748b",
  textFaint: "#9ca3af",

  primary: "#2563eb",
  primarySoft: "#dbeafe",

  border: "#e2e8f0",
  danger: "#dc2626",

  favourite: "#d97706",

  tagBg: "#e0e7ff",
  tagText: "#3730a3",

  overlay: "rgba(15, 23, 42, 0.5)",
};

export const darkColors = {
  bg: "#0b1120",
  surface: "#151e2f",
  surfaceSecondary: "#1e293b",

  text: "#f8fafc",
  textMuted: "#a7b0c0",
  textFaint: "#6b7280",

  primary: "#60a5fa",
  primarySoft: "#172554",

  border: "#2d3a4f",
  danger: "#f87171",

  favourite: "#fbbf24",

  tagBg: "#252f5a",
  tagText: "#c7d2fe",

  overlay: "rgba(0, 0, 0, 0.7)",
};

/*
  Temporary compatibility export.

  Files that have not yet been converted to useTheme()
  will continue to use the light palette instead of crashing.
*/
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  xxl: 40,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
};

export const fixed = {
  minTouch: 44,
  hairline: StyleSheet.hairlineWidth,
};

export function lineHeight(size) {
  return Math.round(size * 1.4);
}

export function shadow(level = 1) {
  const elevation = Math.max(1, level * 2);

  return Platform.select({
    ios: {
      shadowColor: "#000000",
      shadowOpacity: 0.08 + level * 0.02,
      shadowOffset: {
        width: 0,
        height: level,
      },
      shadowRadius: level * 3,
    },

    android: {
      elevation,
    },

    default: {},
  });
}