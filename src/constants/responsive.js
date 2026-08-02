import {
  Dimensions,
  PixelRatio,
} from "react-native";

const { width, height } = Dimensions.get("window");

const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

const shortest = Math.min(width, height);
const longest = Math.max(width, height);

export const scale = (size) =>
  (shortest / BASE_WIDTH) * size;

export const verticalScale = (size) =>
  (longest / BASE_HEIGHT) * size;

export const moderateScale = (
  size,
  factor = 0.5
) => size + (scale(size) - size) * factor;

export const px = (size) =>
  PixelRatio.roundToNearestPixel(size);

export const ms = (
  size,
  factor = 0.5
) => px(moderateScale(size, factor));

export const isTablet = shortest >= 600;

export const systemFontScale =
  PixelRatio.getFontScale();

export const screen = {
  width,
  height,
  shortest,
  longest,
  isTablet,
};