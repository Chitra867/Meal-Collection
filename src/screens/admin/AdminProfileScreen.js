import {
  Alert,
  Pressable,
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
  useAuth,
} from "../../contexts/AuthContext";

import {
  fixed,
  fontSize,
  radius,
  spacing,
} from "../../constants/theme";

export default function AdminProfileScreen() {
  const {
    colors,
    isDark,
    toggleTheme,
  } = useTheme();

  const {
    user,
    signOut,
  } = useAuth();

  const styles = createStyles(
    colors,
    isDark
  );

  const handleLogout = () => {
    Alert.alert(
      "Sign out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign out",
          style: "destructive",
          onPress: signOut,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Admin Profile
        </Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons
              name="shield-checkmark"
              size={34}
              color="#ffffff"
            />
          </View>

          <Text style={styles.name}>
            {user?.name ||
              "Meal Collection Admin"}
          </Text>

          <Text style={styles.email}>
            {user?.email ||
              "admin@mealcollection.app"}
          </Text>
        </View>

        <Pressable
          onPress={toggleTheme}
          style={styles.optionButton}
        >
          <Ionicons
            name={
              isDark
                ? "sunny-outline"
                : "moon-outline"
            }
            size={22}
            color={colors.primary}
          />

          <Text style={styles.optionText}>
            Switch to{" "}
            {isDark
              ? "Light Mode"
              : "Dark Mode"}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <Ionicons
            name="log-out-outline"
            size={21}
            color="#ffffff"
          />

          <Text style={styles.logoutText}>
            Sign Out
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function createStyles(
  colors,
  isDark
) {
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

    profileCard: {
      alignItems: "center",
      marginTop: spacing.xl,
      padding: spacing.xl,
      backgroundColor: colors.surface,
      borderWidth: fixed.hairline,
      borderColor: colors.border,
      borderRadius: radius.lg,
    },

    avatar: {
      width: 78,
      height: 78,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: 39,
    },

    name: {
      marginTop: spacing.md,
      color: colors.text,
      fontSize: fontSize.lg,
      fontWeight: "900",
    },

    email: {
      marginTop: spacing.xs,
      color: colors.textMuted,
      fontSize: fontSize.sm,
    },

    optionButton: {
      minHeight: 54,
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacing.lg,
      paddingHorizontal: spacing.lg,
      backgroundColor: colors.surface,
      borderWidth: fixed.hairline,
      borderColor: colors.border,
      borderRadius: radius.md,
    },

    optionText: {
      marginLeft: spacing.md,
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: "700",
    },

    logoutButton: {
      minHeight: 54,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.md,
      backgroundColor: colors.danger,
      borderRadius: radius.md,
    },

    logoutText: {
      marginLeft: spacing.sm,
      color: "#ffffff",
      fontSize: fontSize.md,
      fontWeight: "900",
    },
  });
}