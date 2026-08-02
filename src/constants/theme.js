import {
  Platform,
  StyleSheet,
} from "react-native";

import {
  isTablet,
  ms,
} from "./responsive";

export const colors = {
  bg: "#f4f5f7",
  surface: "#ffffff",
  primary: "#2563eb",
  primaryDark: "#1e40af",
  text: "#111827",
  textMuted: "#6b7280",
  textFaint: "#9ca3af",
  border: "#e5e7eb",
  tagBg: "#e0e7ff",
  tagText: "#3730a3",
  danger: "#dc2626",
  favourite: "#f59e0b",
};

export const spacing = {
  xs: ms(4),
  sm: ms(8),
  md: ms(12),
  lg: ms(16),
  xl: ms(24),
  xxl: ms(32),
};

export const radius = {
  sm: ms(6),
  md: ms(10),
  lg: ms(14),
  pill: 999,
};

const TEXT_FACTOR = 0.3;

export const fontSize = {
  xs: ms(12, TEXT_FACTOR),
  sm: ms(14, TEXT_FACTOR),
  md: ms(16, TEXT_FACTOR),
  lg: ms(18, TEXT_FACTOR),
  xl: ms(24, TEXT_FACTOR),
  xxl: ms(30, TEXT_FACTOR),
};

export const lineHeight = (size) =>
  Math.round(size * 1.4);

export const fixed = {
  hairline: StyleSheet.hairlineWidth,
  minTouch: 44,
};

export const shadow = (level = 1) =>
  Platform.select({
    ios: {
      shadowColor: "#000000",
      shadowOpacity: 0.06 + level * 0.02,
      shadowRadius: level * 6,
      shadowOffset: {
        width: 0,
        height: level * 2,
      },
    },

    android: {
      elevation: level * 2,
    },

    default: {},
  });

export { isTablet };

export default {
  colors,
  spacing,
  radius,
  fontSize,
  lineHeight,
  fixed,
  shadow,
  isTablet,
};