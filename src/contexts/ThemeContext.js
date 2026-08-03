import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useColorScheme,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  darkColors,
  lightColors,
} from "../constants/theme";

const STORAGE_KEY =
  "@meal_collection_theme_mode";

const ThemeContext =
  createContext(undefined);

export function ThemeProvider({
  children,
}) {
  const systemColorScheme =
    useColorScheme();

  const [mode, setMode] = useState(
    systemColorScheme === "dark"
      ? "dark"
      : "light"
  );

  const [hasLoaded, setHasLoaded] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSavedTheme() {
      try {
        const savedMode =
          await AsyncStorage.getItem(
            STORAGE_KEY
          );

        if (
          mounted &&
          (savedMode === "light" ||
            savedMode === "dark")
        ) {
          setMode(savedMode);
        }
      } catch (error) {
        console.error(
          "Failed to load theme:",
          error
        );
      } finally {
        if (mounted) {
          setHasLoaded(true);
        }
      }
    }

    void loadSavedTheme();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    async function persistTheme() {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          mode
        );
      } catch (error) {
        console.error(
          "Failed to save theme:",
          error
        );
      }
    }

    void persistTheme();
  }, [mode, hasLoaded]);

  const toggleTheme = useCallback(() => {
    setMode((currentMode) =>
      currentMode === "dark"
        ? "light"
        : "dark"
    );
  }, []);

  const setThemeMode = useCallback(
    (newMode) => {
      if (
        newMode !== "light" &&
        newMode !== "dark"
      ) {
        return;
      }

      setMode(newMode);
    },
    []
  );

  const colors =
    mode === "dark"
      ? darkColors
      : lightColors;

  const value = useMemo(
    () => ({
      mode,
      colors,
      isDark: mode === "dark",
      toggleTheme,
      setThemeMode,
    }),
    [
      mode,
      colors,
      toggleTheme,
      setThemeMode,
    ]
  );

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider."
    );
  }

  return context;
}