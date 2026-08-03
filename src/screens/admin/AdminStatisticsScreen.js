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
  fixed,
  fontSize,
  radius,
  shadow,
  spacing,
} from "../../constants/theme";

function calculatePercentage(
  value,
  total
) {
  if (!total) {
    return 0;
  }

  return Math.round(
    (value / total) * 100
  );
}

function StatisticsCard({
  title,
  value,
  description,
  icon,
  colors,
  styles,
}) {
  return (
    <View style={styles.statCard}>
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

      <Text style={styles.statTitle}>
        {title}
      </Text>

      <Text style={styles.statDescription}>
        {description}
      </Text>
    </View>
  );
}

function ProgressRow({
  label,
  value,
  total,
  color,
  styles,
}) {
  const percentage =
    calculatePercentage(value, total);

  return (
    <View style={styles.progressSection}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>
          {label}
        </Text>

        <Text style={styles.progressValue}>
          {value} · {percentage}%
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${percentage}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

export default function AdminStatisticsScreen({
  items = [],
}) {
  const {
    colors,
    isDark,
  } = useTheme();

  const styles = useMemo(
    () => createStyles(colors, isDark),
    [colors, isDark]
  );

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const loadStatistics = useCallback(
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
          "Failed to load statistics:",
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
      void loadStatistics();
    }, [loadStatistics])
  );

  const statistics = useMemo(() => {
    const safeItems = Array.isArray(items)
      ? items.filter(Boolean)
      : [];

    const activeUsers = users.filter(
      (registeredUser) =>
        registeredUser?.isActive !== false
    ).length;

    const inactiveUsers = users.filter(
      (registeredUser) =>
        registeredUser?.isActive === false
    ).length;

    const userRecipes = safeItems.filter(
      (recipe) =>
        recipe?.source === "mine"
    ).length;

    const starterRecipes =
      safeItems.filter(
        (recipe) =>
          recipe?.source !== "mine"
      ).length;

    const favouriteRecipes =
      safeItems.filter(
        (recipe) =>
          Boolean(recipe?.favourite)
      ).length;

    const totalCookingTime =
      safeItems.reduce(
        (total, recipe) => {
          return (
            total +
            (Number(recipe?.minutes) || 0)
          );
        },
        0
      );

    const averageCookingTime =
      safeItems.length > 0
        ? Math.round(
            totalCookingTime /
              safeItems.length
          )
        : 0;

    const quickRecipes =
      safeItems.filter((recipe) => {
        const minutes =
          Number(recipe?.minutes) || 0;

        return (
          minutes > 0 &&
          minutes < 30
        );
      }).length;

    const mediumRecipes =
      safeItems.filter((recipe) => {
        const minutes =
          Number(recipe?.minutes) || 0;

        return (
          minutes >= 30 &&
          minutes <= 60
        );
      }).length;

    const longRecipes =
      safeItems.filter((recipe) => {
        const minutes =
          Number(recipe?.minutes) || 0;

        return minutes > 60;
      }).length;

    const categoryCounts = {};

    safeItems.forEach((recipe) => {
      const tags = Array.isArray(
        recipe?.tags
      )
        ? recipe.tags
        : [];

      tags.forEach((tag) => {
        const cleanTag = String(
          tag || ""
        ).trim();

        if (!cleanTag) {
          return;
        }

        const normalizedTag =
          cleanTag.toLowerCase();

        if (
          !categoryCounts[normalizedTag]
        ) {
          categoryCounts[
            normalizedTag
          ] = {
            label: cleanTag,
            count: 0,
          };
        }

        categoryCounts[
          normalizedTag
        ].count += 1;
      });
    });

    const topCategories =
      Object.values(categoryCounts)
        .sort(
          (first, second) =>
            second.count -
            first.count
        )
        .slice(0, 5);

    return {
      totalUsers: users.length,
      activeUsers,
      inactiveUsers,

      totalRecipes: safeItems.length,
      userRecipes,
      starterRecipes,
      favouriteRecipes,

      averageCookingTime,
      quickRecipes,
      mediumRecipes,
      longRecipes,

      topCategories,
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
          Loading statistics...
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
              loadStatistics(true)
            }
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              Statistics
            </Text>

            <Text style={styles.subtitle}>
              Overview of users, recipes and
              collection activity.
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="bar-chart"
              size={26}
              color="#ffffff"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Key Metrics
        </Text>

        <View style={styles.statsGrid}>
          <StatisticsCard
            title="Total Users"
            value={statistics.totalUsers}
            description={`${statistics.activeUsers} active`}
            icon="people-outline"
            colors={colors}
            styles={styles}
          />

          <StatisticsCard
            title="Total Recipes"
            value={
              statistics.totalRecipes
            }
            description={`${statistics.userRecipes} user recipes`}
            icon="restaurant-outline"
            colors={colors}
            styles={styles}
          />

          <StatisticsCard
            title="Favourites"
            value={
              statistics.favouriteRecipes
            }
            description="Saved recipes"
            icon="heart-outline"
            colors={colors}
            styles={styles}
          />

          <StatisticsCard
            title="Average Time"
            value={`${statistics.averageCookingTime}m`}
            description="Per recipe"
            icon="time-outline"
            colors={colors}
            styles={styles}
          />
        </View>

        <Text style={styles.sectionTitle}>
          User Accounts
        </Text>

        <View style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons
                name="people-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>
                Account Status
              </Text>

              <Text
                style={
                  styles.cardSubtitle
                }
              >
                Active and disabled user accounts
              </Text>
            </View>
          </View>

          <ProgressRow
            label="Active users"
            value={statistics.activeUsers}
            total={statistics.totalUsers}
            color="#16a34a"
            styles={styles}
          />

          <ProgressRow
            label="Inactive users"
            value={statistics.inactiveUsers}
            total={statistics.totalUsers}
            color={colors.danger}
            styles={styles}
          />
        </View>

        <Text style={styles.sectionTitle}>
          Recipe Sources
        </Text>

        <View style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons
                name="restaurant-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>
                Recipe Distribution
              </Text>

              <Text
                style={
                  styles.cardSubtitle
                }
              >
                User-created and starter recipes
              </Text>
            </View>
          </View>

          <ProgressRow
            label="User recipes"
            value={statistics.userRecipes}
            total={statistics.totalRecipes}
            color={colors.primary}
            styles={styles}
          />

          <ProgressRow
            label="Starter recipes"
            value={
              statistics.starterRecipes
            }
            total={statistics.totalRecipes}
            color={colors.favourite}
            styles={styles}
          />
        </View>

        <Text style={styles.sectionTitle}>
          Cooking Time
        </Text>

        <View style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons
                name="time-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>
                Recipe Duration
              </Text>

              <Text
                style={
                  styles.cardSubtitle
                }
              >
                Recipes grouped by cooking time
              </Text>
            </View>
          </View>

          <ProgressRow
            label="Under 30 minutes"
            value={statistics.quickRecipes}
            total={statistics.totalRecipes}
            color="#16a34a"
            styles={styles}
          />

          <ProgressRow
            label="30–60 minutes"
            value={
              statistics.mediumRecipes
            }
            total={statistics.totalRecipes}
            color={colors.primary}
            styles={styles}
          />

          <ProgressRow
            label="Over 60 minutes"
            value={statistics.longRecipes}
            total={statistics.totalRecipes}
            color={colors.favourite}
            styles={styles}
          />
        </View>

        <Text style={styles.sectionTitle}>
          Popular Categories
        </Text>

        <View style={styles.chartCard}>
          {statistics.topCategories.length >
          0 ? (
            statistics.topCategories.map(
              (category, index) => {
                const maximumCount =
                  statistics
                    .topCategories[0]
                    ?.count || 1;

                const categoryWidth =
                  Math.round(
                    (category.count /
                      maximumCount) *
                      100
                  );

                return (
                  <View
                    key={`${category.label}-${index}`}
                    style={
                      styles.categorySection
                    }
                  >
                    <View
                      style={
                        styles.categoryHeader
                      }
                    >
                      <Text
                        style={
                          styles.categoryLabel
                        }
                      >
                        {category.label}
                      </Text>

                      <Text
                        style={
                          styles.categoryValue
                        }
                      >
                        {category.count}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.progressTrack
                      }
                    >
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${categoryWidth}%`,
                            backgroundColor:
                              colors.primary,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              }
            )
          ) : (
            <View
              style={styles.emptyContainer}
            >
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="pricetags-outline"
                  size={28}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.emptyTitle}>
                No category data
              </Text>

              <Text style={styles.emptyText}>
                Add tags to recipes to view
                category statistics.
              </Text>
            </View>
          )}
        </View>
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
      minHeight: 152,
      marginBottom: spacing.md,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderWidth: fixed.hairline,
      borderColor: colors.border,
      borderRadius: radius.lg,
      ...shadow(1),
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
      marginTop: spacing.md,
      color: colors.text,
      fontSize: fontSize.xl,
      fontWeight: "900",
    },

    statTitle: {
      marginTop: spacing.xs,
      color: colors.text,
      fontSize: fontSize.sm,
      fontWeight: "800",
    },

    statDescription: {
      marginTop: spacing.xs,
      color: colors.textMuted,
      fontSize: fontSize.xs,
    },

    chartCard: {
      marginBottom: spacing.md,
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderWidth: fixed.hairline,
      borderColor: colors.border,
      borderRadius: radius.lg,
      ...shadow(1),
    },

    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.lg,
    },

    cardIcon: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
      borderRadius: 15,
    },

    cardHeaderText: {
      flex: 1,
      marginLeft: spacing.md,
    },

    cardTitle: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: "900",
    },

    cardSubtitle: {
      marginTop: 2,
      color: colors.textMuted,
      fontSize: fontSize.xs,
    },

    progressSection: {
      marginBottom: spacing.lg,
    },

    progressHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
    },

    progressLabel: {
      color: colors.text,
      fontSize: fontSize.sm,
      fontWeight: "700",
    },

    progressValue: {
      color: colors.textMuted,
      fontSize: fontSize.xs,
      fontWeight: "800",
    },

    progressTrack: {
      height: 10,
      overflow: "hidden",
      backgroundColor:
        colors.surfaceSecondary,
      borderRadius: radius.pill,
    },

    progressBar: {
      height: "100%",
      borderRadius: radius.pill,
    },

    categorySection: {
      marginBottom: spacing.lg,
    },

    categoryHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
    },

    categoryLabel: {
      color: colors.text,
      fontSize: fontSize.sm,
      fontWeight: "800",
    },

    categoryValue: {
      color: colors.primary,
      fontSize: fontSize.sm,
      fontWeight: "900",
    },

    emptyContainer: {
      alignItems: "center",
      paddingVertical: spacing.xl,
    },

    emptyIcon: {
      width: 58,
      height: 58,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
      borderRadius: 29,
    },

    emptyTitle: {
      marginTop: spacing.md,
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: "900",
    },

    emptyText: {
      marginTop: spacing.xs,
      color: colors.textMuted,
      fontSize: fontSize.sm,
      textAlign: "center",
    },
  });
}