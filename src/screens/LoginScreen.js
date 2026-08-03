import {
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  fixed,
  fontSize,
  radius,
  shadow,
  spacing,
} from "../constants/theme";

import {
  useTheme,
} from "../contexts/ThemeContext";

import {
  useAuth,
} from "../contexts/AuthContext";

export default function LoginScreen() {
  const {
    colors,
    isDark,
    toggleTheme,
  } = useTheme();

  const { signIn } = useAuth();

  const styles = useMemo(
    () => createStyles(colors, isDark),
    [colors, isDark]
  );

  const [role, setRole] =
    useState("user");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const selectRole = (selectedRole) => {
    setRole(selectedRole);
    setError("");

    if (selectedRole === "admin") {
      setEmail(
        "admin@mealcollection.app"
      );

      setPassword("Admin@123");
    } else {
      setEmail(
        "user@mealcollection.app"
      );

      setPassword("User@123");
    }
  };

  const handleLogin = async () => {
    if (isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const result = await signIn({
        email,
        password,
        role,
      });

      if (!result.success) {
        setError(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.content
          }
        >
          <View style={styles.topBar}>
            <View />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isDark
                  ? "Use light mode"
                  : "Use dark mode"
              }
              onPress={toggleTheme}
              style={({ pressed }) => [
                styles.themeButton,
                pressed && styles.pressed,
              ]}
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
            </Pressable>
          </View>

          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons
                name="restaurant"
                size={34}
                color="#ffffff"
              />
            </View>

            <Text style={styles.appName}>
              Meal Collection
            </Text>

            <Text style={styles.appSubtitle}>
              Save, manage and discover your
              favourite recipes
            </Text>
          </View>

          <View style={styles.loginCard}>
            <Text style={styles.title}>
              Welcome back
            </Text>

            <Text style={styles.subtitle}>
              Select your account type and
              enter your credentials.
            </Text>

            <View style={styles.roleSelector}>
              <Pressable
                onPress={() =>
                  selectRole("user")
                }
                style={({ pressed }) => [
                  styles.roleButton,
                  role === "user" &&
                    styles.activeRoleButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={19}
                  color={
                    role === "user"
                      ? "#ffffff"
                      : colors.textMuted
                  }
                />

                <Text
                  style={[
                    styles.roleButtonText,
                    role === "user" &&
                      styles.activeRoleButtonText,
                  ]}
                >
                  User
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  selectRole("admin")
                }
                style={({ pressed }) => [
                  styles.roleButton,
                  role === "admin" &&
                    styles.activeRoleButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={19}
                  color={
                    role === "admin"
                      ? "#ffffff"
                      : colors.textMuted
                  }
                />

                <Text
                  style={[
                    styles.roleButtonText,
                    role === "admin" &&
                      styles.activeRoleButtonText,
                  ]}
                >
                  Admin
                </Text>
              </Pressable>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color={colors.danger}
                />

                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            ) : null}

            <Text style={styles.label}>
              Email address
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.textMuted}
              />

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={
                  colors.textFaint
                }
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>

            <Text style={styles.label}>
              Password
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.textMuted}
              />

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={
                  colors.textFaint
                }
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={
                  handleLogin
                }
                style={styles.input}
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                onPress={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                hitSlop={10}
              >
                <Ionicons
                  name={
                    showPassword
                      ? "eye-off-outline"
                      : "eye-outline"
                  }
                  size={21}
                  color={colors.textMuted}
                />
              </Pressable>
            </View>

            <Pressable
              disabled={isSubmitting}
              onPress={handleLogin}
              style={({ pressed }) => [
                styles.loginButton,
                isSubmitting &&
                  styles.disabledButton,
                pressed && styles.pressed,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator
                  color="#ffffff"
                />
              ) : (
                <>
                  <Text
                    style={
                      styles.loginButtonText
                    }
                  >
                    Sign in as{" "}
                    {role === "admin"
                      ? "Admin"
                      : "User"}
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#ffffff"
                  />
                </>
              )}
            </Pressable>

            <View style={styles.demoBox}>
              <Text style={styles.demoTitle}>
                Development credentials
              </Text>

              <Text style={styles.demoText}>
                {role === "admin"
                  ? "admin@mealcollection.app  •  Admin@123"
                  : "user@mealcollection.app  •  User@123"}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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

    keyboardView: {
      flex: 1,
    },

    content: {
      flexGrow: 1,
      justifyContent: "center",
      padding: spacing.lg,
      paddingBottom: spacing.xxl,
    },

    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },

    themeButton: {
      width: fixed.minTouch,
      height: fixed.minTouch,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      borderWidth: fixed.hairline,
      borderColor: colors.border,
      borderRadius: radius.pill,
    },

    logoContainer: {
      alignItems: "center",
      marginBottom: spacing.xl,
    },

    logo: {
      width: 72,
      height: 72,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: 24,
      ...shadow(2),
    },

    appName: {
      marginTop: spacing.md,
      color: colors.text,
      fontSize: fontSize.xl,
      fontWeight: "900",
    },

    appSubtitle: {
      maxWidth: 310,
      marginTop: spacing.xs,
      color: colors.textMuted,
      fontSize: fontSize.sm,
      textAlign: "center",
      lineHeight: 20,
    },

    loginCard: {
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderWidth: fixed.hairline,
      borderColor: colors.border,
      borderRadius: radius.lg,
      ...shadow(2),
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
      lineHeight: 20,
    },

    roleSelector: {
      flexDirection: "row",
      marginTop: spacing.lg,
      padding: 4,
      backgroundColor:
        colors.surfaceSecondary,
      borderRadius: radius.md,
    },

    roleButton: {
      flex: 1,
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.md,
    },

    activeRoleButton: {
      backgroundColor: colors.primary,
    },

    roleButtonText: {
      marginLeft: spacing.xs,
      color: colors.textMuted,
      fontSize: fontSize.sm,
      fontWeight: "800",
    },

    activeRoleButtonText: {
      color: "#ffffff",
    },

    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacing.md,
      padding: spacing.md,
      backgroundColor: isDark
        ? "#3b1d25"
        : "#fee2e2",
      borderRadius: radius.md,
    },

    errorText: {
      flex: 1,
      marginLeft: spacing.sm,
      color: colors.danger,
      fontSize: fontSize.sm,
      fontWeight: "700",
    },

    label: {
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
      color: colors.text,
      fontSize: fontSize.sm,
      fontWeight: "800",
    },

    inputContainer: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      backgroundColor:
        colors.surfaceSecondary,
      borderWidth: fixed.hairline,
      borderColor: colors.border,
      borderRadius: radius.md,
    },

    input: {
      flex: 1,
      marginHorizontal: spacing.sm,
      color: colors.text,
      fontSize: fontSize.md,
    },

    loginButton: {
      minHeight: 54,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.xl,
      backgroundColor: colors.primary,
      borderRadius: radius.md,
    },

    loginButtonText: {
      marginRight: spacing.sm,
      color: "#ffffff",
      fontSize: fontSize.md,
      fontWeight: "900",
    },

    disabledButton: {
      opacity: 0.6,
    },

    demoBox: {
      marginTop: spacing.md,
      padding: spacing.md,
      backgroundColor:
        colors.primarySoft,
      borderRadius: radius.md,
    },

    demoTitle: {
      color: colors.primary,
      fontSize: fontSize.xs,
      fontWeight: "900",
      textTransform: "uppercase",
    },

    demoText: {
      marginTop: spacing.xs,
      color: colors.textMuted,
      fontSize: fontSize.xs,
    },

    pressed: {
      opacity: 0.72,
      transform: [
        {
          scale: 0.98,
        },
      ],
    },
  });
}