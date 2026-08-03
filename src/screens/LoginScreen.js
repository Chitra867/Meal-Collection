import {
  useEffect,
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

import {
  SafeAreaView,
} from "react-native-safe-area-context";

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

export default function LoginScreen({
  navigation,
  route,
}) {
  const {
    colors,
    isDark,
    toggleTheme,
  } = useTheme();

  const { signIn } = useAuth();

  const styles = useMemo(
    () =>
      createStyles(
        colors,
        isDark
      ),
    [colors, isDark]
  );

  const [role, setRole] =
    useState("user");

  const [
    identifier,
    setIdentifier,
  ] = useState("");

  const [password, setPassword] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  useEffect(() => {
    const registeredUsername =
      route.params
        ?.registeredUsername;

    if (registeredUsername) {
      setRole("user");

      setIdentifier(
        registeredUsername
      );

      setPassword("");
      setError("");
    }
  }, [
    route.params
      ?.registeredUsername,
  ]);

  const handleLogin =
    async () => {
      if (isSubmitting) {
        return;
      }

      setError("");
      setIsSubmitting(true);

      try {
        const result =
          await signIn({
            identifier,
            password,
            role,
          });

        if (!result.success) {
          setError(
            result.message
          );
        }
      } catch (loginError) {
        console.error(
          "Login failed:",
          loginError
        );

        setError(
          "The account could not be signed in."
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  const selectRole = (
    selectedRole
  ) => {
    setRole(selectedRole);
    setIdentifier("");
    setPassword("");
    setError("");
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
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
        >
          <View style={styles.topBar}>
            <View />

            <Pressable
              onPress={toggleTheme}
              style={({ pressed }) => [
                styles.themeButton,
                pressed &&
                  styles.pressed,
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

          <View
            style={styles.brand}
          >
            <View
              style={
                styles.logoContainer
              }
            >
              <Ionicons
                name="restaurant"
                size={34}
                color="#ffffff"
              />
            </View>

            <Text
              style={styles.appName}
            >
              Meal Collection
            </Text>

            <Text
              style={
                styles.appDescription
              }
            >
              Sign in to manage your recipes and favourites
            </Text>
          </View>

          <View
            style={styles.loginCard}
          >
            <Text
              style={styles.title}
            >
              Welcome Back
            </Text>

            <Text
              style={styles.subtitle}
            >
              Enter your username and password
            </Text>

            <View
              style={
                styles.roleSelector
              }
            >
              <Pressable
                onPress={() =>
                  selectRole("user")
                }
                style={[
                  styles.roleButton,

                  role === "user" &&
                    styles.activeRoleButton,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={
                    role === "user"
                      ? "#ffffff"
                      : colors.textMuted
                  }
                />

                <Text
                  style={[
                    styles.roleText,

                    role === "user" &&
                      styles.activeRoleText,
                  ]}
                >
                  User
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  selectRole("admin")
                }
                style={[
                  styles.roleButton,

                  role === "admin" &&
                    styles.activeRoleButton,
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={
                    role === "admin"
                      ? "#ffffff"
                      : colors.textMuted
                  }
                />

                <Text
                  style={[
                    styles.roleText,

                    role === "admin" &&
                      styles.activeRoleText,
                  ]}
                >
                  Admin
                </Text>
              </Pressable>
            </View>

            {error ? (
              <View
                style={styles.errorBox}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color={colors.danger}
                />

                <Text
                  style={
                    styles.errorText
                  }
                >
                  {error}
                </Text>
              </View>
            ) : null}

            <Text style={styles.label}>
              Username
            </Text>

            <View
              style={
                styles.inputContainer
              }
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={
                  colors.textMuted
                }
              />

              <TextInput
                value={identifier}
                onChangeText={
                  setIdentifier
                }
                placeholder={
                  role === "admin"
                    ? "Enter admin username"
                    : "Enter your username"
                }
                placeholderTextColor={
                  colors.textFaint
                }
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>

            <Text style={styles.label}>
              Password
            </Text>

            <View
              style={
                styles.inputContainer
              }
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={
                  colors.textMuted
                }
              />

              <TextInput
                value={password}
                onChangeText={
                  setPassword
                }
                placeholder="Enter your password"
                placeholderTextColor={
                  colors.textFaint
                }
                secureTextEntry={
                  !showPassword
                }
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={
                  handleLogin
                }
                style={styles.input}
              />

              <Pressable
                onPress={() =>
                  setShowPassword(
                    (current) =>
                      !current
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
                  color={
                    colors.textMuted
                  }
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

                pressed &&
                  styles.pressed,
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
                    Sign In
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#ffffff"
                  />
                </>
              )}
            </Pressable>

            {role === "user" ? (
              <Pressable
                onPress={() =>
                  navigation.navigate(
                    "Register"
                  )
                }
                style={
                  styles.registerLink
                }
              >
                <Text
                  style={
                    styles.registerLinkText
                  }
                >
                  Don&apos;t have an account?{" "}
                  <Text
                    style={
                      styles.registerLinkStrong
                    }
                  >
                    Register
                  </Text>
                </Text>
              </Pressable>
            ) : (
              <View
                style={styles.adminHint}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={colors.primary}
                />

                <Text
                  style={
                    styles.adminHintText
                  }
                >
                  Administrator access only
                </Text>
              </View>
            )}
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
      backgroundColor:
        colors.bg,
    },

    keyboardView: {
      flex: 1,
    },

    content: {
      flexGrow: 1,
      justifyContent: "center",
      padding: spacing.lg,
      paddingBottom:
        spacing.xxl,
    },

    topBar: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      marginBottom:
        spacing.sm,
    },

    themeButton: {
      width: fixed.minTouch,
      height: fixed.minTouch,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.surface,
      borderWidth:
        fixed.hairline,
      borderColor:
        colors.border,
      borderRadius:
        radius.pill,
    },

    brand: {
      alignItems: "center",
      marginBottom:
        spacing.xl,
    },

    logoContainer: {
      width: 72,
      height: 72,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.primary,
      borderRadius: 24,
      ...shadow(2),
    },

    appName: {
      marginTop:
        spacing.md,
      color: colors.text,
      fontSize:
        fontSize.xl,
      fontWeight: "900",
    },

    appDescription: {
      maxWidth: 310,
      marginTop:
        spacing.xs,
      color:
        colors.textMuted,
      fontSize:
        fontSize.sm,
      textAlign: "center",
      lineHeight: 20,
    },

    loginCard: {
      padding:
        spacing.lg,
      backgroundColor:
        colors.surface,
      borderWidth:
        fixed.hairline,
      borderColor:
        colors.border,
      borderRadius:
        radius.lg,
      ...shadow(2),
    },

    title: {
      color: colors.text,
      fontSize:
        fontSize.xl,
      fontWeight: "900",
    },

    subtitle: {
      marginTop:
        spacing.xs,
      color:
        colors.textMuted,
      fontSize:
        fontSize.sm,
    },

    roleSelector: {
      flexDirection: "row",
      marginTop:
        spacing.lg,
      padding: 4,
      backgroundColor:
        colors.surfaceSecondary,
      borderRadius:
        radius.md,
    },

    roleButton: {
      flex: 1,
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius:
        radius.md,
    },

    activeRoleButton: {
      backgroundColor:
        colors.primary,
    },

    roleText: {
      marginLeft:
        spacing.xs,
      color:
        colors.textMuted,
      fontSize:
        fontSize.sm,
      fontWeight: "800",
    },

    activeRoleText: {
      color: "#ffffff",
    },

    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      marginTop:
        spacing.md,
      padding:
        spacing.md,
      backgroundColor:
        isDark
          ? "#3b1d25"
          : "#fee2e2",
      borderRadius:
        radius.md,
    },

    errorText: {
      flex: 1,
      marginLeft:
        spacing.sm,
      color:
        colors.danger,
      fontSize:
        fontSize.sm,
      fontWeight: "700",
    },

    label: {
      marginTop:
        spacing.lg,
      marginBottom:
        spacing.sm,
      color: colors.text,
      fontSize:
        fontSize.sm,
      fontWeight: "800",
    },

    inputContainer: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal:
        spacing.md,
      backgroundColor:
        colors.surfaceSecondary,
      borderWidth:
        fixed.hairline,
      borderColor:
        colors.border,
      borderRadius:
        radius.md,
    },

    input: {
      flex: 1,
      marginHorizontal:
        spacing.sm,
      color: colors.text,
      fontSize:
        fontSize.md,
    },

    loginButton: {
      minHeight: 54,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop:
        spacing.xl,
      backgroundColor:
        colors.primary,
      borderRadius:
        radius.md,
    },

    loginButtonText: {
      marginRight:
        spacing.sm,
      color: "#ffffff",
      fontSize:
        fontSize.md,
      fontWeight: "900",
    },

    registerLink: {
      alignItems: "center",
      paddingTop:
        spacing.lg,
    },

    registerLinkText: {
      color:
        colors.textMuted,
      fontSize:
        fontSize.sm,
    },

    registerLinkStrong: {
      color:
        colors.primary,
      fontWeight: "900",
    },

    adminHint: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop:
        spacing.lg,
      padding:
        spacing.md,
      backgroundColor:
        colors.primarySoft,
      borderRadius:
        radius.md,
    },

    adminHintText: {
      marginLeft:
        spacing.sm,
      color:
        colors.primary,
      fontSize:
        fontSize.sm,
      fontWeight: "700",
    },

    disabledButton: {
      opacity: 0.55,
    },

    pressed: {
      opacity: 0.7,
      transform: [
        {
          scale: 0.98,
        },
      ],
    },
  });
}