import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getRegisteredUsers,
} from "../../storage/userStorage";

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
  shadow,
  spacing,
} from "../../constants/theme";

function formatDate(value) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatCard({
  title,
  value,
  icon,
  helperText,
  colors,
  styles,
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={styles.statIcon}>
          <Ionicons
            name={icon}
            size={22}
            color={colors.primary}
          />
        </View>

        <Text style={styles.statValue}>
          {value}
        </Text>
      </View>

      <Text style={styles.statTitle}>
        {title}
      </Text>

      <Text style={styles.statHelper}>
        {helperText}
      </Text>
    </View>
  );
}

function EmptySection({
  icon,
  title,
  message,
  colors,
  styles,
}) {
  return (
    <View style={styles.emptySection}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name={icon}
          size={26}
          color={colors.primary}
        />
      </View>

      <Text style={styles.emptyTitle}>
        {title}
      </Text>

      <Text style={styles.emptyMessage}>
        {message}
      </Text>
    </View>
  );
}

export default function AdminDashboardScreen({
  items = [],
}) {
  const {
    colors,
    isDark,
  } = useTheme();

  const { user } = useAuth();

  const styles = useMemo(
    () => createStyles(colors, isDark),
    [colors, isDark]
  );

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const loadDashboardData = useCallback(
    async (refreshing = false) => {
      try {
        if (refreshing) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const registeredUsers =
          await getRegisteredUsers();

        setUsers(
          Array.isArray(registeredUsers)
            ? registeredUsers
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load dashboard data:",
          error
        );

        setUsers([]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      void loadDashboardData();
    }, [loadDashboardData])
  );

  const dashboardData = useMemo(() => {
    const safeItems = Array.isArray(items)
      ? items.filter(Boolean)
      : [];

    const activeUsers = users.filter(
      (registeredUser) =>
        registeredUser?.isActive !== false
    );

    const inactiveUsers = users.filter(
      (registeredUser) =>
        registeredUser?.isActive === false
    );

    const userRecipes = safeItems.filter(
      (recipe) =>
        recipe?.source === "mine"
    );

    const starterRecipes =
      safeItems.filter(
        (recipe) =>
          recipe?.source !== "mine"
      );

    const favouriteRecipes =
      safeItems.filter(
        (recipe) =>
          Boolean(recipe?.favourite)
      );

    const recentUsers = [...users]
      .sort((first, second) => {
        return (
          new Date(
            second?.createdAt || 0
          ).getTime() -
          new Date(
            first?.createdAt || 0
          ).getTime()
        );
      })
      .slice(0, 4);

    const recentRecipes = [...safeItems]
      .sort((first, second) => {
        const secondDate =
          second?.createdAt ||
          second?.updatedAt ||
          0;

        const firstDate =
          first?.createdAt ||
          first?.updatedAt ||
          0;

        return (
          new Date(secondDate).getTime() -
          new Date(firstDate).getTime()
        );
      })
      .slice(0, 4);

    return {
      totalRecipes: safeItems.length,
      activeUsers: activeUsers.length,
      inactiveUsers: inactiveUsers.length,
      userRecipes: userRecipes.length,
      starterRecipes:
        starterRecipes.length,
      favourites:
        favouriteRecipes.length,
      recentUsers,
      recentRecipes,
    };
  }, [items, users]);

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
          Loading dashboard...
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
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() =>
              loadDashboardData(true)
            }
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>
              Welcome back
            </Text>

            <Text style={styles.adminName}>
              {user?.name ||
                user?.fullName ||
                "Administrator"}
            </Text>

            <Text style={styles.subtitle}>
              Here is the latest activity in
              Meal Collection.
            </Text>
          </View>

          <View style={styles.adminIcon}>
            <Ionicons
              name="shield-checkmark"
              size={27}
              color="#ffffff"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Overview
        </Text>

        <View style={styles.statsGrid}>
          <StatCard
            title="Registered Users"
            value={users.length}
            icon="people-outline"
            helperText={`${dashboardData.activeUsers} active`}
            colors={colors}
            styles={styles}
          />

          <StatCard
            title="Total Recipes"
            value={dashboardData.totalRecipes}
            icon="restaurant-outline"
            helperText={`${dashboardData.userRecipes} user-created`}
            colors={colors}
            styles={styles}
          />

          <StatCard
            title="Favourites"
            value={dashboardData.favourites}
            icon="heart-outline"
            helperText="Saved recipes"
            colors={colors}
            styles={styles}
          />

          <StatCard
            title="Inactive Users"
            value={dashboardData.inactiveUsers}
            icon="person-remove-outline"
            helperText="Disabled accounts"
            colors={colors}
            styles={styles}
          />
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIcon}>
              <Ionicons
                name="analytics-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <View style={styles.summaryHeaderText}>
              <Text
                style={styles.summaryTitle}
              >
                Recipe Summary
              </Text>

              <Text
                style={
                  styles.summarySubtitle
                }
              >
                Distribution of current recipes
              </Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text
                style={
                  styles.summaryNumber
                }
              >
                {dashboardData.userRecipes}
              </Text>

              <Text
                style={
                  styles.summaryLabel
                }
              >
                User Recipes
              </Text>
            </View>

            <View
              style={
                styles.summaryDivider
              }
            />

            <View style={styles.summaryItem}>
              <Text
                style={
                  styles.summaryNumber
                }
              >
                {
                  dashboardData.starterRecipes
                }
              </Text>

              <Text
                style={
                  styles.summaryLabel
                }
              >
                Starter Recipes
              </Text>
            </View>

            <View
              style={
                styles.summaryDivider
              }
            />

            <View style={styles.summaryItem}>
              <Text
                style={
                  styles.summaryNumber
                }
              >
                {dashboardData.favourites}
              </Text>

              <Text
                style={
                  styles.summaryLabel
                }
              >
                Favourites
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Recently Registered Users
        </Text>

        {dashboardData.recentUsers.length >
        0 ? (
          <View style={styles.listCard}>
            {dashboardData.recentUsers.map(
              (registeredUser, index) => {
                const active =
                  registeredUser?.isActive !==
                  false;

                const displayName =
                  registeredUser?.fullName ||
                  registeredUser?.name ||
                  registeredUser?.username ||
                  "Unnamed user";

                return (
                  <View
                    key={
                      registeredUser?.id ||
                      `recent-user-${index}`
                    }
                  >
                    <View
                      style={
                        styles.activityRow
                      }
                    >
                      <View
                        style={
                          styles.userAvatar
                        }
                      >
                        <Text
                          style={
                            styles.userAvatarText
                          }
                        >
                          {displayName
                            .trim()
                            .charAt(0)
                            .toUpperCase()}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.activityContent
                        }
                      >
                        <Text
                          style={
                            styles.activityTitle
                          }
                          numberOfLines={1}
                        >
                          {displayName}
                        </Text>

                        <Text
                          style={
                            styles.activitySubtitle
                          }
                          numberOfLines={1}
                        >
                          @
                          {registeredUser?.username ||
                            "unknown"}
                        </Text>

                        <Text
                          style={
                            styles.activityDate
                          }
                        >
                          Registered{" "}
                          {formatDate(
                            registeredUser?.createdAt
                          )}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,

                          active
                            ? styles.activeBadge
                            : styles.inactiveBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,

                            active
                              ? styles.activeStatusText
                              : styles.inactiveStatusText,
                          ]}
                        >
                          {active
                            ? "Active"
                            : "Inactive"}
                        </Text>
                      </View>
                    </View>

                    {index <
                    dashboardData.recentUsers
                      .length -
                      1 ? (
                      <View
                        style={
                          styles.listDivider
                        }
                      />
                    ) : null}
                  </View>
                );
              }
            )}
          </View>
        ) : (
          <EmptySection
            icon="people-outline"
            title="No registered users"
            message="Newly registered users will appear here."
            colors={colors}
            styles={styles}
          />
        )}

        <Text style={styles.sectionTitle}>
          Recently Added Recipes
        </Text>

        {dashboardData.recentRecipes
          .length > 0 ? (
          <View style={styles.listCard}>
            {dashboardData.recentRecipes.map(
              (recipe, index) => (
                <View
                  key={
                    recipe?.id ||
                    `recent-recipe-${index}`
                  }
                >
                  <View
                    style={
                      styles.activityRow
                    }
                  >
                    <View
                      style={
                        styles.recipeIcon
                      }
                    >
                      <Ionicons
                        name="restaurant-outline"
                        size={21}
                        color={colors.primary}
                      />
                    </View>

                    <View
                      style={
                        styles.activityContent
                      }
                    >
                      <Text
                        style={
                          styles.activityTitle
                        }
                        numberOfLines={1}
                      >
                        {recipe?.title ||
                          "Untitled recipe"}
                      </Text>

                      <Text
                        style={
                          styles.activitySubtitle
                        }
                        numberOfLines={1}
                      >
                        {recipe?.subtitle ||
                          "No description"}
                      </Text>

                      <Text
                        style={
                          styles.activityDate
                        }
                      >
                        {Number(
                          recipe?.minutes
                        ) || 0}{" "}
                        minutes
                      </Text>
                    </View>

                    <View
                      style={
                        styles.recipeSourceBadge
                      }
                    >
                      <Text
                        style={
                          styles.recipeSourceText
                        }
                      >
                        {recipe?.source ===
                        "mine"
                          ? "User"
                          : "Starter"}
                      </Text>
                    </View>
                  </View>

                  {index <
                  dashboardData.recentRecipes
                    .length -
                    1 ? (
                    <View
                      style={
                        styles.listDivider
                      }
                    />
                  ) : null}
                </View>
              )
            )}
          </View>
        ) : (
          <EmptySection
            icon="restaurant-outline"
            title="No recipes available"
            message="Recently added recipes will appear here."
            colors={colors}
            styles={styles}
          />
        )}
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
      paddingBottom: 110,
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

    greeting: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      fontWeight: "700",
    },

    adminName: {
      marginTop: spacing.xs,
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

    adminIcon: {
      width: 54,
      height: 54,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: 18,
      ...shadow(1),
    },

    sectionTitle: {
      marginTop: spacing.md,
      marginBottom: spacing.md,
      color: colors.text,
      fontSize: fontSize.lg,
      fontWeight: "900",
    },

    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },

    statCard: {
      width: "48%",
      minHeight: 142,
      marginBottom: spacing.md,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderWidth: fixed.hairline,
      borderColor: colors.border,
      borderRadius: radius.lg,
      ...shadow(1),
    },

    statHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    statIcon: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
      borderRadius: 14,
    },

    statValue: {
      color: colors.text,
      fontSize: fontSize.xl,
      fontWeight: "900",
    },

    statTitle: {
      marginTop: spacing.md,
      color: colors.text,
      fontSize: fontSize.sm,
      fontWeight: "800",
    },

    statHelper: {
      marginTop: spacing.xs,
      color: colors.textMuted,
      fontSize: fontSize.xs,
    },

    summaryCard: {
      marginTop: spacing.md,
      marginBottom: spacing.md,
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderWidth: fixed.hairline,
      borderColor: colors.border,
      borderRadius: radius.lg,
      ...shadow(1),
    },

    summaryHeader: {
      flexDirection: "row",
      alignItems: "center",
    },

    summaryIcon: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
      borderRadius: 15,
    },

    summaryHeaderText: {
      flex: 1,
      marginLeft: spacing.md,
    },

    summaryTitle: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: "900",
    },

    summarySubtitle: {
      marginTop: 2,
      color: colors.textMuted,
      fontSize: fontSize.xs,
    },

    summaryRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacing.lg,
    },

    summaryItem: {
      flex: 1,
      alignItems: "center",
    },

    summaryNumber: {
      color: colors.primary,
      fontSize: fontSize.xl,
      fontWeight: "900",
    },

    summaryLabel: {
      marginTop: spacing.xs,
      color: colors.textMuted,
      fontSize: 11,
      textAlign: "center",
    },

    summaryDivider: {
      width: fixed.hairline,
      height: 42,
      backgroundColor: colors.border,
    },

    listCard: {
      paddingHorizontal: spacing.lg,
      backgroundColor: colors.surface,
      borderWidth: fixed.hairline,
      borderColor: colors.border,
      borderRadius: radius.lg,
      ...shadow(1),
    },

    activityRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.md,
    },

    userAvatar: {
      width: 46,
      height: 46,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: 23,
    },

    userAvatarText: {
      color: "#ffffff",
      fontSize: fontSize.md,
      fontWeight: "900",
    },

    recipeIcon: {
      width: 46,
      height: 46,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
      borderRadius: 16,
    },

    activityContent: {
      flex: 1,
      marginHorizontal: spacing.md,
    },

    activityTitle: {
      color: colors.text,
      fontSize: fontSize.sm,
      fontWeight: "900",
    },

    activitySubtitle: {
      marginTop: 2,
      color: colors.textMuted,
      fontSize: fontSize.xs,
    },

    activityDate: {
      marginTop: spacing.xs,
      color: colors.textFaint,
      fontSize: 11,
    },

    listDivider: {
      height: fixed.hairline,
      backgroundColor: colors.border,
    },

    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
    },

    activeBadge: {
      backgroundColor: isDark
        ? "#123822"
        : "#dcfce7",
    },

    inactiveBadge: {
      backgroundColor: isDark
        ? "#3b1d25"
        : "#fee2e2",
    },

    statusText: {
      fontSize: 10,
      fontWeight: "900",
    },

    activeStatusText: {
      color: "#16a34a",
    },

    inactiveStatusText: {
      color: colors.danger,
    },

    recipeSourceBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      backgroundColor:
        colors.primarySoft,
      borderRadius: radius.pill,
    },

    recipeSourceText: {
      color: colors.primary,
      fontSize: 10,
      fontWeight: "900",
    },

    emptySection: {
      alignItems: "center",
      padding: spacing.xl,
      backgroundColor: colors.surface,
      borderWidth: fixed.hairline,
      borderColor: colors.border,
      borderRadius: radius.lg,
    },

    emptyIcon: {
      width: 56,
      height: 56,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
      borderRadius: 28,
    },

    emptyTitle: {
      marginTop: spacing.md,
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: "900",
    },

    emptyMessage: {
      marginTop: spacing.xs,
      color: colors.textMuted,
      fontSize: fontSize.sm,
      textAlign: "center",
    },
  });
}