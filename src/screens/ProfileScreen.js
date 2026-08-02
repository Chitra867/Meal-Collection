import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  colors,
  fontSize,
  radius,
  spacing,
} from "../constants/theme";

export default function ProfileScreen({
  items = [],
}) {
  const favouriteCount = items.filter(
    (item) => item.favourite
  ).length;

  const myRecipeCount = items.filter(
    (item) => item.source === "mine"
  ).length;

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right"]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          Profile
        </Text>

        <Text style={styles.subtitle}>
          Your recipe collection summary
        </Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            U
          </Text>
        </View>

        <Text style={styles.userName}>
          Recipe User
        </Text>

        <Text style={styles.userDescription}>
          Food and recipe enthusiast
        </Text>
      </View>

      <View style={styles.statistics}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {items.length}
          </Text>

          <Text style={styles.statLabel}>
            Total recipes
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {favouriteCount}
          </Text>

          <Text style={styles.statLabel}>
            Favourites
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {myRecipeCount}
          </Text>

          <Text style={styles.statLabel}>
            My recipes
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  header: {
    padding: spacing.lg,
  },

  title: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: "800",
  },

  subtitle: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },

  profileCard: {
    alignItems: "center",
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },

  avatar: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: 38,
  },

  avatarText: {
    color: colors.surface,
    fontSize: fontSize.xxl,
    fontWeight: "900",
  },

  userName: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "800",
  },

  userDescription: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },

  statistics: {
    flexDirection: "row",
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },

  statCard: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: spacing.xs,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },

  statNumber: {
    color: colors.primary,
    fontSize: fontSize.xl,
    fontWeight: "900",
  },

  statLabel: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: "center",
  },
});