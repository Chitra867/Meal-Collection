import {
  useMemo,
  useState,
} from "react";

import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

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

export default function ManageRecipesScreen({
  items = [],
  onDeleteRecipe = () => {},
}) {
  const {
    colors,
    isDark,
  } = useTheme();

  const styles = useMemo(
    () => createStyles(colors, isDark),
    [colors, isDark]
  );

  const [searchText, setSearchText] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const safeItems = Array.isArray(items)
    ? items
    : [];

  const filteredRecipes = useMemo(() => {
    const search = searchText
      .trim()
      .toLowerCase();

    return safeItems.filter((recipe) => {
      const matchesSearch =
        !search ||
        [
          recipe.title,
          recipe.subtitle,
          recipe.notes,
          ...(Array.isArray(recipe.tags)
            ? recipe.tags
            : []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search);

      const matchesFilter =
        filter === "all" ||
        (filter === "user" &&
          recipe.source === "mine") ||
        (filter === "starter" &&
          recipe.source !== "mine");

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [safeItems, searchText, filter]);

  const handleDelete = (recipe) => {
    Alert.alert(
      "Delete recipe",
      `Delete "${recipe.title}" permanently?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            onDeleteRecipe(recipe.id),
        },
      ]
    );
  };

  const renderRecipe = ({ item }) => (
    <View style={styles.recipeCard}>
      {item.image ? (
        <Image
          source={{
            uri: item.image,
          }}
          style={styles.recipeImage}
        />
      ) : (
        <View
          style={styles.imagePlaceholder}
        >
          <Ionicons
            name="restaurant-outline"
            size={28}
            color={colors.primary}
          />
        </View>
      )}

      <View style={styles.recipeContent}>
        <View style={styles.recipeHeader}>
          <View
            style={styles.recipeInformation}
          >
            <Text
              style={styles.recipeTitle}
              numberOfLines={1}
            >
              {item.title ||
                "Untitled recipe"}
            </Text>

            <Text
              style={styles.recipeSubtitle}
              numberOfLines={1}
            >
              {item.subtitle ||
                "No description"}
            </Text>
          </View>

          <View
            style={[
              styles.sourceBadge,
              item.source === "mine"
                ? styles.userBadge
                : styles.starterBadge,
            ]}
          >
            <Text
              style={styles.sourceText}
            >
              {item.source === "mine"
                ? "User"
                : "Starter"}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Ionicons
            name="time-outline"
            size={16}
            color={colors.textMuted}
          />

          <Text style={styles.metaText}>
            {Number(item.minutes) || 0} min
          </Text>

          <Ionicons
            name={
              item.favourite
                ? "heart"
                : "heart-outline"
            }
            size={16}
            color={colors.favourite}
          />
        </View>

        <Pressable
          onPress={() =>
            handleDelete(item)
          }
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="trash-outline"
            size={18}
            color={colors.danger}
          />

          <Text
            style={styles.deleteText}
          >
            Delete recipe
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right"]}
    >
      <FlatList
        data={filteredRecipes}
        keyExtractor={(item, index) =>
          item?.id
            ? String(item.id)
            : `recipe-${index}`
        }
        renderItem={renderRecipe}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.listContent
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>
                  Manage Recipes
                </Text>

                <Text
                  style={styles.subtitle}
                >
                  {safeItems.length} recipes
                </Text>
              </View>

              <View style={styles.headerIcon}>
                <Ionicons
                  name="restaurant"
                  size={25}
                  color="#ffffff"
                />
              </View>
            </View>

            <View
              style={styles.searchContainer}
            >
              <Ionicons
                name="search-outline"
                size={20}
                color={colors.textMuted}
              />

              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search recipes"
                placeholderTextColor={
                  colors.textFaint
                }
                style={styles.searchInput}
              />
            </View>

            <View style={styles.filters}>
              {[
                ["all", "All"],
                ["user", "User Recipes"],
                ["starter", "Starter"],
              ].map(([value, label]) => (
                <Pressable
                  key={value}
                  onPress={() =>
                    setFilter(value)
                  }
                  style={[
                    styles.filterButton,
                    filter === value &&
                      styles.activeFilterButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filter === value &&
                        styles.activeFilterText,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="restaurant-outline"
              size={40}
              color={colors.primary}
            />

            <Text style={styles.emptyTitle}>
              No recipes found
            </Text>
          </View>
        }
      />
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

    listContent: {
      flexGrow: 1,
      padding: spacing.lg,
      paddingBottom: 110,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.lg,
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

    headerIcon: {
      width: 50,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: 16,
    },

    searchContainer: {
      minHeight: 50,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surface,
      borderWidth: fixed.hairline,
      borderColor: colors.border,
      borderRadius: radius.lg,
    },

    searchInput: {
      flex: 1,
      marginLeft: spacing.sm,
      color: colors.text,
      fontSize: fontSize.sm,
    },

    filters: {
      flexDirection: "row",
      marginVertical: spacing.md,
    },

    filterButton: {
      flex: 1,
      minHeight: 38,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.xs,
      backgroundColor: colors.surface,
      borderWidth: fixed.hairline,
      borderColor: colors.border,
      borderRadius: radius.pill,
    },

    activeFilterButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    filterText: {
      color: colors.textMuted,
      fontSize: fontSize.xs,
      fontWeight: "800",
    },

    activeFilterText: {
      color: "#ffffff",
    },

    recipeCard: {
      flexDirection: "row",
      marginBottom: spacing.md,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderWidth: fixed.hairline,
      borderColor: colors.border,
      borderRadius: radius.lg,
      ...shadow(1),
    },

    recipeImage: {
      width: 92,
      height: 110,
      borderRadius: radius.md,
      backgroundColor:
        colors.surfaceSecondary,
    },

    imagePlaceholder: {
      width: 92,
      height: 110,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.surfaceSecondary,
      borderRadius: radius.md,
    },

    recipeContent: {
      flex: 1,
      marginLeft: spacing.md,
    },

    recipeHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
    },

    recipeInformation: {
      flex: 1,
      marginRight: spacing.sm,
    },

    recipeTitle: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: "900",
    },

    recipeSubtitle: {
      marginTop: spacing.xs,
      color: colors.textMuted,
      fontSize: fontSize.xs,
    },

    sourceBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
    },

    userBadge: {
      backgroundColor:
        colors.primarySoft,
    },

    starterBadge: {
      backgroundColor: isDark
        ? "#382f16"
        : "#fef3c7",
    },

    sourceText: {
      color: colors.primary,
      fontSize: 10,
      fontWeight: "900",
    },

    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacing.md,
    },

    metaText: {
      flex: 1,
      marginLeft: spacing.xs,
      color: colors.textMuted,
      fontSize: fontSize.xs,
    },

    deleteButton: {
      minHeight: 38,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.md,
      backgroundColor: isDark
        ? "#3b1d25"
        : "#fff1f2",
      borderWidth: fixed.hairline,
      borderColor: colors.danger,
      borderRadius: radius.md,
    },

    deleteText: {
      marginLeft: spacing.xs,
      color: colors.danger,
      fontSize: fontSize.xs,
      fontWeight: "800",
    },

    emptyContainer: {
      alignItems: "center",
      paddingTop: spacing.xxl,
    },

    emptyTitle: {
      marginTop: spacing.md,
      color: colors.text,
      fontSize: fontSize.lg,
      fontWeight: "900",
    },

    pressed: {
      opacity: 0.68,
    },
  });
}