import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  useTheme,
} from "../../contexts/ThemeContext";

import {
  fontSize,
  spacing,
} from "../../constants/theme";

export default function AdminStatisticsScreen() {
  const { colors } = useTheme();

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Statistics
        </Text>

        <Text style={styles.description}>
          Application statistics will appear here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.bg,
    },

    content: {
      flex: 1,
      padding: spacing.lg,
    },

    title: {
      color: colors.text,
      fontSize: fontSize.xl,
      fontWeight: "900",
    },

    description: {
      marginTop: spacing.sm,
      color: colors.textMuted,
      fontSize: fontSize.sm,
    },
  });
}