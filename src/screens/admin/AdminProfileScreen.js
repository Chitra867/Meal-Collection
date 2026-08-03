import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  useFocusEffect,
} from "@react-navigation/native";

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
  getRegisteredUsers,
} from "../../storage/userStorage";

import {
  fixed,
  fontSize,
  radius,
  shadow,
  spacing,
} from "../../constants/theme";

function formatDate(value) {
  if (!value) {
    return "Built-in administrator";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Built-in administrator";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function InfoRow({
  icon,
  label,
  value,
  colors,
  styles,
  isLast = false,
}) {
  return (
    <>
      <View style={styles.infoRow}>
        <View style={styles.infoIcon}>
          <Ionicons
            name={icon}
            size={20}
            color={colors.primary}
          />
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>
            {label}
          </Text>

          <Text
            style={styles.infoValue}
            numberOfLines={1}
          >
            {value}
          </Text>
        </View>
      </View>

      {!isLast ? (
        <View style={styles.divider} />
      ) : null}
    </>
  );
}

function QuickAction({
  icon,
  title,
  description,
  onPress,
  colors,
  styles,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickAction,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.quickActionIcon}>
        <Ionicons
          name={icon}
          size={23}
          color={colors.primary}
        />
      </View>

      <Text style={styles.quickActionTitle}>
        {title}
      </Text>

      <Text
        style={styles.quickActionDescription}
        numberOfLines={2}
      >
        {description}
      </Text>

      <Ionicons
        name="arrow-forward-circle-outline"
        size={20}
        color={colors.textMuted}
        style={styles.quickActionArrow}
      />
    </Pressable>
  );
}

export default function AdminProfileScreen({
  navigation,
  items = [],
}) {
  const {
    colors,
    isDark,
    toggleTheme,
  } = useTheme();

  const {
    user,
    signOut,
  } = useAuth();

  const styles = useMemo(
    () => createStyles(colors, isDark),
    [colors, isDark]
  );

  const [registeredUsers, setRegisteredUsers] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const loadProfileData = useCallback(
    async (refreshing = false) => {
      try {
        if (refreshing) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const users =
          await getRegisteredUsers();

        setRegisteredUsers(
          Array.isArray(users)
            ? users
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load admin profile data:",
          error
        );

        setRegisteredUsers([]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      void loadProfileData();
    }, [loadProfileData])
  );

  const profileData = useMemo(() => {
    const safeItems = Array.isArray(items)
      ? items.filter(Boolean)
      : [];

    const activeUsers =
      registeredUsers.filter(
        (registeredUser) =>
          registeredUser?.isActive !== false
      ).length;

    return {
      totalUsers: registeredUsers.length,
      activeUsers,
      totalRecipes: safeItems.length,
    };
  }, [registeredUsers, items]);

  const displayName =
    user?.fullName ||
    user?.name ||
    "Meal Collection Admin";

  const displayEmail =
    user?.email ||
    "admin@mealcollection.app";

  const displayUsername =
    user?.username ||
    "admin";

  const displayRole =
    user?.role === "admin"
      ? "Administrator"
      : user?.role || "Administrator";

  const avatarLetter = String(displayName)
    .trim()
    .charAt(0)
    .toUpperCase();

  const navigateToTab = (screenName) => {
    if (!navigation) {
      return;
    }

    navigation.navigate(screenName);
  };

  const handleLogout = () => {
    Alert.alert(
      "Sign out",
      "Are you sure you want to sign out of the Admin panel?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign out",
          style: "destructive",
          onPress: () => {
            void signOut();
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={styles.loadingContainer}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading Admin profile...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() =>
              loadProfileData(true)
            }
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              Admin Profile
            </Text>

            <Text style={styles.subtitle}>
              Manage your account and application
              preferences.
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="settings-outline"
              size={25}
              color="#ffffff"
            />
          </View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.decorationOne} />
          <View style={styles.decorationTwo} />

          <View style={styles.avatarBorder}>
            <View style={styles.avatar}>
              {avatarLetter ? (
                <Text style={styles.avatarText}>
                  {avatarLetter}
                </Text>
              ) : (
                <Ionicons
                  name="person"
                  size={38}
                  color={colors.primary}
                />
              )}
            </View>

            <View style={styles.verifiedBadge}>
              <Ionicons
                name="shield-checkmark"
                size={16}
                color="#ffffff"
              />
            </View>
          </View>

          <Text style={styles.name}>
            {displayName}
          </Text>

          <Text style={styles.email}>
            {displayEmail}
          </Text>

          <View style={styles.roleBadge}>
            <Ionicons
              name="shield-checkmark-outline"
              size={15}
              color="#ffffff"
            />

            <Text style={styles.roleText}>
              {displayRole}
            </Text>
          </View>
        </View>

        <View style={styles.statisticsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {profileData.totalUsers}
            </Text>

            <Text style={styles.statLabel}>
              Users
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {profileData.activeUsers}
            </Text>

            <Text style={styles.statLabel}>
              Active
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {profileData.totalRecipes}
            </Text>

            <Text style={styles.statLabel}>
              Recipes
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Quick Management
        </Text>

        <View style={styles.quickActionsGrid}>
          <QuickAction
            icon="people-outline"
            title="Users"
            description="Manage registered accounts"
            onPress={() =>
              navigateToTab("ManageUsers")
            }
            colors={colors}
            styles={styles}
          />

          <QuickAction
            icon="restaurant-outline"
            title="Recipes"
            description="Review recipe collection"
            onPress={() =>
              navigateToTab("ManageRecipes")
            }
            colors={colors}
            styles={styles}
          />

          <QuickAction
            icon="bar-chart-outline"
            title="Statistics"
            description="View application insights"
            onPress={() =>
              navigateToTab("AdminStatistics")
            }
            colors={colors}
            styles={styles}
          />

          <QuickAction
            icon="grid-outline"
            title="Dashboard"
            description="Return to Admin overview"
            onPress={() =>
              navigateToTab("AdminDashboard")
            }
            colors={colors}
            styles={styles}
          />
        </View>

        <Text style={styles.sectionTitle}>
          Appearance
        </Text>

        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <Ionicons
                name={
                  isDark
                    ? "moon"
                    : "sunny"
                }
                size={22}
                color={colors.primary}
              />
            </View>

            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                Dark Mode
              </Text>

              <Text style={styles.settingDescription}>
                {isDark
                  ? "Dark appearance is currently enabled."
                  : "Use a darker appearance throughout the app."}
              </Text>
            </View>

            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{
                false: colors.border,
                true: colors.primary,
              }}
              thumbColor="#ffffff"
              ios_backgroundColor={
                colors.border
              }
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Account Information
        </Text>

        <View style={styles.infoCard}>
          <InfoRow
            icon="person-outline"
            label="Username"
            value={displayUsername}
            colors={colors}
            styles={styles}
          />

          <InfoRow
            icon="mail-outline"
            label="Email Address"
            value={displayEmail}
            colors={colors}
            styles={styles}
          />

          <InfoRow
            icon="shield-outline"
            label="Account Role"
            value={displayRole}
            colors={colors}
            styles={styles}
          />

          <InfoRow
            icon="checkmark-circle-outline"
            label="Account Status"
            value="Active"
            colors={colors}
            styles={styles}
          />

          <InfoRow
            icon="calendar-outline"
            label="Account Created"
            value={formatDate(
              user?.createdAt
            )}
            colors={colors}
            styles={styles}
            isLast
          />
        </View>

        <Text style={styles.sectionTitle}>
          Security
        </Text>

        <View style={styles.securityCard}>
          <View style={styles.securityIcon}>
            <Ionicons
              name="lock-closed-outline"
              size={24}
              color="#16a34a"
            />
          </View>

          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>
              Admin Session Protected
            </Text>

            <Text style={styles.securityDescription}>
              Your authentication session is stored
              securely on this device.
            </Text>
          </View>

          <Ionicons
            name="checkmark-circle"
            size={23}
            color="#16a34a"
          />
        </View>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color="#ffffff"
          />

          <Text style={styles.logoutText}>
            Sign Out
          </Text>
        </Pressable>

        <Text style={styles.footerText}>
          Meal Collection Administration Panel
        </Text>
      </ScrollView>
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

    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg,
    },

    loadingText: {
      marginTop: spacing.md,
      color: colors.textMuted,
      fontSize: fontSize.sm,
    },

    content: {
      padding: spacing.lg,
      paddingBottom: 115,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.xl,
    },

    headerText: {
      flex: 1,
      marginRight: spacing.md,
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

    headerIcon: {
      width: 52,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: 17,
      ...shadow(1),
    },

    profileCard: {
      overflow: "hidden",
      alignItems: "center",
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
      backgroundColor: colors.primary,
      borderRadius: radius.lg,
      ...shadow(1),
    },

    decorationOne: {
      position: "absolute",
      top: -45,
      right: -35,
      width: 140,
      height: 140,
      backgroundColor:
        "rgba(255,255,255,0.08)",
      borderRadius: 70,
    },

    decorationTwo: {
      position: "absolute",
      bottom: -55,
      left: -45,
      width: 150,
      height: 150,
      backgroundColor:
        "rgba(255,255,255,0.06)",
      borderRadius: 75,
    },

    avatarBorder: {
      position: "relative",
      padding: 5,
      backgroundColor:
        "rgba(255,255,255,0.28)",
      borderRadius: 55,
    },

    avatar: {
      width: 88,
      height: 88,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#ffffff",
      borderRadius: 44,
    },

    avatarText: {
      color: colors.primary,
      fontSize: 34,
      fontWeight: "900",
    },

    verifiedBadge: {
      position: "absolute",
      right: 0,
      bottom: 3,
      width: 29,
      height: 29,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#16a34a",
      borderWidth: 3,
      borderColor: colors.primary,
      borderRadius: 15,
    },

    name: {
      marginTop: spacing.md,
      color: "#ffffff",
      fontSize: fontSize.xl,
      fontWeight: "900",
      textAlign: "center",
    },

    email: {
      marginTop: spacing.xs,
      color: "rgba(255,255,255,0.78)",
      fontSize: fontSize.sm,
      textAlign: "center",
    },

    roleBadge: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor:
        "rgba(255,255,255,0.18)",
      borderWidth: fixed.hairline,
      borderColor:
        "rgba(255,255,255,0.28)",
      borderRadius: radius.pill,
    },

    roleText: {
      marginLeft: spacing.xs,
      color: "#ffffff",
      fontSize: fontSize.xs,
      fontWeight: "900",
    },

    statisticsCard: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacing.md,
      paddingVertical: spacing.lg,
      backgroundColor: colors.surface,
      borderWidth: fixed.hairline,
      borderColor: colors.border,
      borderRadius: radius.lg,
      ...shadow(1),
    },

    statItem: {
      flex: 1,
      alignItems: "center",
    },

    statValue: {
      color: colors.primary,
      fontSize: fontSize.xl,
      fontWeight: "900",
    },

    statLabel: {
      marginTop: spacing.xs,
      color: colors.textMuted,
      fontSize: fontSize.xs,
      fontWeight: "700",
    },

    statDivider: {
      width: fixed.hairline,
      height: 42,
      backgroundColor: colors.border,
    },

    sectionTitle: {
      marginTop: spacing.xl,
      marginBottom: spacing.md,
      color: colors.text,
      fontSize: fontSize.lg,
      fontWeight: "900",
    },

    quickActionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },

    quickAction: {
      position: "relative",
      width: "48%",
      minHeight: 150,
      marginBottom: spacing.md,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderWidth: fixed.hairline,
      borderColor: colors.border,
      borderRadius: radius.lg,
      ...shadow(1),
    },

    quickActionIcon: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
      borderRadius: 14,
    },

    quickActionTitle: {
      marginTop: spacing.md,
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: "900",
    },

    quickActionDescription: {
      marginTop: spacing.xs,
      paddingRight: spacing.lg,
      color: colors.textMuted,
      fontSize: fontSize.xs,
      lineHeight: 17,
    },

    quickActionArrow: {
      position: "absolute",
      right: spacing.md,
      bottom: spacing.md,
    },

    settingsCard: {
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderWidth: fixed.hairline,
      borderColor: colors.border,
      borderRadius: radius.lg,
      ...shadow(1),
    },

    settingRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    settingIcon: {
      width: 46,
      height: 46,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
      borderRadius: 15,
    },

    settingContent: {
      flex: 1,
      marginHorizontal: spacing.md,
    },

    settingTitle: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: "900",
    },

    settingDescription: {
      marginTop: 3,
      color: colors.textMuted,
      fontSize: fontSize.xs,
      lineHeight: 17,
    },

    infoCard: {
      paddingHorizontal: spacing.lg,
      backgroundColor: colors.surface,
      borderWidth: fixed.hairline,
      borderColor: colors.border,
      borderRadius: radius.lg,
      ...shadow(1),
    },

    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.md,
    },

    infoIcon: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
      borderRadius: 13,
    },

    infoContent: {
      flex: 1,
      marginLeft: spacing.md,
    },

    infoLabel: {
      color: colors.textMuted,
      fontSize: fontSize.xs,
      fontWeight: "700",
    },

    infoValue: {
      marginTop: 3,
      color: colors.text,
      fontSize: fontSize.sm,
      fontWeight: "800",
    },

    divider: {
      height: fixed.hairline,
      backgroundColor: colors.border,
    },

    securityCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.lg,
      backgroundColor: isDark
        ? "#123822"
        : "#f0fdf4",
      borderWidth: fixed.hairline,
      borderColor: "#16a34a",
      borderRadius: radius.lg,
    },

    securityIcon: {
      width: 46,
      height: 46,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? "#1b4d2d"
        : "#dcfce7",
      borderRadius: 15,
    },

    securityContent: {
      flex: 1,
      marginHorizontal: spacing.md,
    },

    securityTitle: {
      color: isDark
        ? "#dcfce7"
        : "#166534",
      fontSize: fontSize.sm,
      fontWeight: "900",
    },

    securityDescription: {
      marginTop: spacing.xs,
      color: isDark
        ? "#86efac"
        : "#15803d",
      fontSize: fontSize.xs,
      lineHeight: 17,
    },

    logoutButton: {
      minHeight: 56,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.xl,
      backgroundColor: colors.danger,
      borderRadius: radius.lg,
      ...shadow(1),
    },

    logoutText: {
      marginLeft: spacing.sm,
      color: "#ffffff",
      fontSize: fontSize.md,
      fontWeight: "900",
    },

    footerText: {
      marginTop: spacing.lg,
      color: colors.textFaint,
      fontSize: fontSize.xs,
      textAlign: "center",
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