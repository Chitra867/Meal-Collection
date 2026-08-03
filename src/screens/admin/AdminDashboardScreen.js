import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  useTheme,
} from "../../contexts/ThemeContext";

import {
  fixed,
  fontSize,
  radius,
  spacing,
} from "../../constants/theme";

export default function AdminDashboardScreen() {
  const { colors } = useTheme();

  const styles = createStyles(colors);

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              Admin Dashboard
            </Text>

            <Text style={styles.subtitle}>
              Manage the Meal Collection application
            </Text>
          </View>

          <View style={styles.iconBox}>
            <Ionicons
              name="shield-checkmark"
              size={26}
              color="#ffffff"
            />
          </View>
        </View>

        <View style={styles.card}>
          <Ionicons
            name="people-outline"
            size={28}
            color={colors.primary}
          />

          <Text style={styles.cardTitle}>
            Registered Users
          </Text>

          <Text style={styles.cardValue}>
            0
          </Text>
        </View>

        <View style={styles.card}>
          <Ionicons
            name="restaurant-outline"
            size={28}
            color={colors.primary}
          />

          <Text style={styles.cardTitle}>
            Total Recipes
          </Text>

          <Text style={styles.cardValue}>
            0
          </Text>
        </View>
      </ScrollView>
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
      padding: spacing.lg,
      paddingBottom: 110,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.xl,
    },

    title: {
      color: colors.text,
      fontSize: fontSize.xl,
      fontWeight: "900",
    },

    subtitle: {
      marginTop: spacing.xs,
      color: colors.textMuted,
      fontSize: fontSize.sm,
    },

    iconBox: {
      width: 52,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: radius.md,
    },

    card: {
      marginBottom: spacing.md,
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderWidth: fixed.hairline,
      borderColor: colors.border,
      borderRadius: radius.lg,
    },

    cardTitle: {
      marginTop: spacing.md,
      color: colors.textMuted,
      fontSize: fontSize.sm,
      fontWeight: "700",
    },

    cardValue: {
      marginTop: spacing.xs,
      color: colors.text,
      fontSize: fontSize.xxl,
      fontWeight: "900",
    },
  });
}