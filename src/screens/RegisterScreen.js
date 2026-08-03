import {
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
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

function RegisterField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  colors,
  styles,
  keyboardType = "default",
  autoCapitalize = "sentences",
  secureTextEntry = false,
  rightElement = null,
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
      </Text>

      <View
        style={styles.inputContainer}
      >
        <Ionicons
          name={icon}
          size={20}
          color={colors.textMuted}
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={
            colors.textFaint
          }
          keyboardType={keyboardType}
          autoCapitalize={
            autoCapitalize
          }
          autoCorrect={false}
          secureTextEntry={
            secureTextEntry
          }
          style={styles.input}
        />

        {rightElement}
      </View>
    </View>
  );
}

export default function RegisterScreen({
  navigation,
}) {
  const {
    colors,
    isDark,
  } = useTheme();

  const { register } = useAuth();

  const styles = useMemo(
    () =>
      createStyles(
        colors,
        isDark
      ),
    [colors, isDark]
  );

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    acceptedTerms,
    setAcceptedTerms,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const validateForm = () => {
    const cleanFullName =
      fullName.trim();

    const cleanEmail =
      email.trim().toLowerCase();

    const cleanUsername =
      username.trim().toLowerCase();

    const phoneDigits =
      phone.replace(/\D/g, "");

    if (cleanFullName.length < 2) {
      return "Enter your full name.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {
      return "Enter a valid email address.";
    }

    if (
      phoneDigits.length < 7 ||
      phoneDigits.length > 15
    ) {
      return "Enter a valid phone number.";
    }

    if (
      cleanUsername.length < 4
    ) {
      return "Username must contain at least 4 characters.";
    }

    if (
      !/^[a-zA-Z0-9._-]+$/.test(
        cleanUsername
      )
    ) {
      return "Username can contain letters, numbers, dots, underscores and hyphens only.";
    }

    if (password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      return "Password must include uppercase, lowercase and a number.";
    }

    if (
      password !==
      confirmPassword
    ) {
      return "Password and confirm password do not match.";
    }

    if (!acceptedTerms) {
      return "You must accept the terms and conditions.";
    }

    return "";
  };

  const handleRegister =
    async () => {
      if (isSubmitting) {
        return;
      }

      const validationError =
        validateForm();

      if (validationError) {
        setError(validationError);
        return;
      }

      setError("");
      setIsSubmitting(true);

      try {
        const result =
          await register({
            fullName:
              fullName.trim(),

            email:
              email
                .trim()
                .toLowerCase(),

            phone:
              phone.trim(),

            username:
              username
                .trim()
                .toLowerCase(),

            password,
          });

        if (!result.success) {
          setError(
            result.message
          );

          return;
        }

        Alert.alert(
          "Registration successful",
          "Your account has been created. Sign in using the username and password you entered.",
          [
            {
              text: "Go to Login",

              onPress: () => {
                navigation.reset({
                  index: 0,

                  routes: [
                    {
                      name: "Login",

                      params: {
                        registeredUsername:
                          result.user
                            .username,
                      },
                    },
                  ],
                });
              },
            },
          ]
        );
      } catch (registrationError) {
        console.error(
          "Registration failed:",
          registrationError
        );

        setError(
          "The account could not be created."
        );
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
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
        >
          <View style={styles.header}>
            <Pressable
              onPress={() =>
                navigation.goBack()
              }
              style={({ pressed }) => [
                styles.backButton,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={colors.text}
              />
            </Pressable>

            <View
              style={styles.headerText}
            >
              <Text
                style={styles.title}
              >
                Create Account
              </Text>

              <Text
                style={styles.subtitle}
              >
                Register to manage your recipe collection
              </Text>
            </View>
          </View>

          <View
            style={
              styles.registrationCard
            }
          >
            <View
              style={
                styles.logoContainer
              }
            >
              <Ionicons
                name="person-add"
                size={30}
                color="#ffffff"
              />
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

            <RegisterField
              label="Full name"
              icon="person-outline"
              value={fullName}
              onChangeText={
                setFullName
              }
              placeholder="Enter your full name"
              colors={colors}
              styles={styles}
            />

            <RegisterField
              label="Email address"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              colors={colors}
              styles={styles}
            />

            <RegisterField
              label="Phone number"
              icon="call-outline"
              value={phone}
              onChangeText={(value) =>
                setPhone(
                  value.replace(
                    /[^0-9+\-\s]/g,
                    ""
                  )
                )
              }
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              autoCapitalize="none"
              colors={colors}
              styles={styles}
            />

            <RegisterField
              label="Username"
              icon="at-outline"
              value={username}
              onChangeText={(value) =>
                setUsername(
                  value.replace(
                    /\s/g,
                    ""
                  )
                )
              }
              placeholder="Choose a username"
              autoCapitalize="none"
              colors={colors}
              styles={styles}
            />

            <RegisterField
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={
                setPassword
              }
              placeholder="Create a password"
              autoCapitalize="none"
              secureTextEntry={
                !showPassword
              }
              colors={colors}
              styles={styles}
              rightElement={
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
              }
            />

            <RegisterField
              label="Confirm password"
              icon="shield-checkmark-outline"
              value={confirmPassword}
              onChangeText={
                setConfirmPassword
              }
              placeholder="Enter password again"
              autoCapitalize="none"
              secureTextEntry={
                !showConfirmPassword
              }
              colors={colors}
              styles={styles}
              rightElement={
                <Pressable
                  onPress={() =>
                    setShowConfirmPassword(
                      (current) =>
                        !current
                    )
                  }
                  hitSlop={10}
                >
                  <Ionicons
                    name={
                      showConfirmPassword
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={21}
                    color={
                      colors.textMuted
                    }
                  />
                </Pressable>
              }
            />

            <Pressable
              onPress={() =>
                setAcceptedTerms(
                  (current) =>
                    !current
                )
              }
              style={
                styles.termsRow
              }
            >
              <Ionicons
                name={
                  acceptedTerms
                    ? "checkbox"
                    : "square-outline"
                }
                size={23}
                color={
                  acceptedTerms
                    ? colors.primary
                    : colors.textMuted
                }
              />

              <Text
                style={
                  styles.termsText
                }
              >
                I accept the terms and conditions.
              </Text>
            </Pressable>

            <Pressable
              disabled={isSubmitting}
              onPress={
                handleRegister
              }
              style={({ pressed }) => [
                styles.registerButton,

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
                      styles.registerButtonText
                    }
                  >
                    Create Account
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#ffffff"
                  />
                </>
              )}
            </Pressable>

            <Pressable
              onPress={() =>
                navigation.goBack()
              }
              style={
                styles.loginLink
              }
            >
              <Text
                style={
                  styles.loginLinkText
                }
              >
                Already registered?{" "}
                <Text
                  style={
                    styles.loginLinkStrong
                  }
                >
                  Sign in
                </Text>
              </Text>
            </Pressable>
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
      padding: spacing.lg,
      paddingBottom:
        spacing.xxl,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom:
        spacing.lg,
    },

    backButton: {
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

    headerText: {
      flex: 1,
      marginLeft:
        spacing.md,
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

    registrationCard: {
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

    logoContainer: {
      width: 62,
      height: 62,
      alignSelf: "center",
      alignItems: "center",
      justifyContent: "center",
      marginBottom:
        spacing.lg,
      backgroundColor:
        colors.primary,
      borderRadius: 20,
    },

    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom:
        spacing.lg,
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

    field: {
      marginBottom:
        spacing.lg,
    },

    label: {
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

    termsRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom:
        spacing.lg,
    },

    termsText: {
      flex: 1,
      marginLeft:
        spacing.sm,
      color:
        colors.textMuted,
      fontSize:
        fontSize.sm,
    },

    registerButton: {
      minHeight: 54,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.primary,
      borderRadius:
        radius.md,
    },

    registerButtonText: {
      marginRight:
        spacing.sm,
      color: "#ffffff",
      fontSize:
        fontSize.md,
      fontWeight: "900",
    },

    loginLink: {
      alignItems: "center",
      paddingTop:
        spacing.lg,
    },

    loginLinkText: {
      color:
        colors.textMuted,
      fontSize:
        fontSize.sm,
    },

    loginLinkStrong: {
      color:
        colors.primary,
      fontWeight: "900",
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