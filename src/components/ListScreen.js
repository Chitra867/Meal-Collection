import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import RecipeCard from "./RecipeCard";

import {
  fixed,
  fontSize,
  lineHeight,
  radius,
  spacing,
} from "../constants/theme";

import {
  useTheme,
} from "../contexts/ThemeContext";

const TIME_FILTERS = [
  {
    id: "all",
    label: "Any time",
  },
  {
    id: "quick",
    label: "Under 30 min",
  },
  {
    id: "medium",
    label: "30–60 min",
  },
  {
    id: "long",
    label: "Over 60 min",
  },
];

function getColumnCount(width) {
  if (width >= 900) {
    return 3;
  }

  if (width >= 600) {
    return 2;
  }

  return 1;
}

function FilterChip({
  label,
  active,
  onPress,
  styles,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        selected: active,
      }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,
        active && styles.activeFilterChip,
        pressed && styles.pressed,
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.filterChipText,
          active &&
            styles.activeFilterChipText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FilterLabel({
  children,
  styles,
}) {
  return (
    <Text style={styles.filterLabel}>
      {children}
    </Text>
  );
}

export default function ListScreen({
  title = "Explore Recipes",
  subtitle,
  items = [],

  emptyTitle = "No recipes found",
  emptyMessage =
    "Try another search or change the selected filters.",

  onAdd = null,
  onEdit = () => {},
  onDelete = () => {},
  onToggleFavourite = () => {},
  onOpenDetails = () => {},

  showSearch = true,
  showFavouriteFilter = true,
  showCategoryFilter = true,
  showTimeFilter = true,
}) {
  const { width } = useWindowDimensions();

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

  const [
    showFavouritesOnly,
    setShowFavouritesOnly,
  ] = useState(false);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("All");

  const [selectedTime, setSelectedTime] =
    useState("all");

  const [
    filtersVisible,
    setFiltersVisible,
  ] = useState(false);

  const safeItems = useMemo(() => {
    return Array.isArray(items)
      ? items.filter(Boolean)
      : [];
  }, [items]);

  const numberOfColumns =
    getColumnCount(width);

  const horizontalPadding = spacing.lg;
  const columnGap = spacing.md;

  const availableWidth =
    width -
    horizontalPadding * 2 -
    columnGap * (numberOfColumns - 1);

  const cardWidth = Math.max(
    0,
    availableWidth / numberOfColumns
  );

  const favouriteCount = useMemo(() => {
    return safeItems.filter((item) =>
      Boolean(item.favourite)
    ).length;
  }, [safeItems]);

  const categories = useMemo(() => {
    const categoryMap = new Map();

    safeItems.forEach((item) => {
      const tags = Array.isArray(item.tags)
        ? item.tags
        : [];

      tags.forEach((tag) => {
        const cleanTag = String(
          tag || ""
        ).trim();

        if (!cleanTag) {
          return;
        }

        const key =
          cleanTag.toLowerCase();

        if (!categoryMap.has(key)) {
          categoryMap.set(
            key,
            cleanTag
          );
        }
      });
    });

    return [
      "All",
      ...Array.from(
        categoryMap.values()
      ).sort((first, second) =>
        first.localeCompare(second)
      ),
    ];
  }, [safeItems]);

  useEffect(() => {
    if (
      selectedCategory !== "All" &&
      !categories.includes(
        selectedCategory
      )
    ) {
      setSelectedCategory("All");
    }
  }, [
    categories,
    selectedCategory,
  ]);

  const filteredItems = useMemo(() => {
    const search = searchText
      .trim()
      .toLowerCase();

    return safeItems.filter((item) => {
      const tags = Array.isArray(
        item.tags
      )
        ? item.tags
        : [];

      const matchesFavourite =
        !showFavouriteFilter ||
        !showFavouritesOnly ||
        Boolean(item.favourite);

      const matchesCategory =
        !showCategoryFilter ||
        selectedCategory === "All" ||
        tags.some((tag) => {
          return (
            String(tag)
              .trim()
              .toLowerCase() ===
            selectedCategory.toLowerCase()
          );
        });

      const minutes =
        Number(item.minutes) || 0;

      let matchesTime = true;

      if (
        showTimeFilter &&
        selectedTime === "quick"
      ) {
        matchesTime =
          minutes > 0 &&
          minutes < 30;
      }

      if (
        showTimeFilter &&
        selectedTime === "medium"
      ) {
        matchesTime =
          minutes >= 30 &&
          minutes <= 60;
      }

      if (
        showTimeFilter &&
        selectedTime === "long"
      ) {
        matchesTime =
          minutes > 60;
      }

      const searchableText = [
        item.title,
        item.subtitle,
        item.notes,
        ...tags,

        ...(Array.isArray(
          item.ingredients
        )
          ? item.ingredients
          : []),

        ...(Array.isArray(item.steps)
          ? item.steps
          : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !search ||
        searchableText.includes(search);

      return (
        matchesFavourite &&
        matchesCategory &&
        matchesTime &&
        matchesSearch
      );
    });
  }, [
    safeItems,
    searchText,
    showFavouritesOnly,
    selectedCategory,
    selectedTime,
    showFavouriteFilter,
    showCategoryFilter,
    showTimeFilter,
  ]);

  const activeFilterCount =
    Number(showFavouritesOnly) +
    Number(
      selectedCategory !== "All"
    ) +
    Number(selectedTime !== "all");

  const hasActiveFilters =
    searchText.trim().length > 0 ||
    activeFilterCount > 0;

  const displaySubtitle =
    subtitle ??
    `${safeItems.length} recipes · ${favouriteCount} favourites`;

  const clearFilters = () => {
    setSearchText("");
    setShowFavouritesOnly(false);
    setSelectedCategory("All");
    setSelectedTime("all");
  };

  const handleDeleteRequest = (
    recipe
  ) => {
    if (!recipe?.id) {
      return;
    }

    Alert.alert(
      "Delete recipe",
      `Delete "${recipe.title}" from your collection?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            onDelete(recipe.id),
        },
      ]
    );
  };

  const headerContent = (
    <View>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text
            style={styles.screenTitle}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {title}
          </Text>

          <Text
            style={styles.screenSubtitle}
            numberOfLines={1}
          >
            {displaySubtitle}
          </Text>
        </View>

        {typeof onAdd === "function" ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add recipe"
            onPress={onAdd}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="add"
              size={21}
              color="#ffffff"
            />

            <Text
              style={
                styles.addButtonText
              }
            >
              Add
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.controls}>
        {showSearch ? (
          <View
            style={
              styles.searchContainer
            }
          >
            <Ionicons
              name="search-outline"
              size={20}
              color={colors.textMuted}
            />

            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search recipes or ingredients"
              placeholderTextColor={
                colors.textFaint
              }
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              style={styles.searchInput}
            />

            {searchText ? (
              <Pressable
                onPress={() =>
                  setSearchText("")
                }
                hitSlop={10}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.textMuted}
                />
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <View style={styles.filterToolbar}>
          <Pressable
            onPress={() =>
              setFiltersVisible(
                (current) => !current
              )
            }
            style={({ pressed }) => [
              styles.filterToggle,
              filtersVisible &&
                styles.filterToggleActive,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="options-outline"
              size={18}
              color={
                filtersVisible
                  ? "#ffffff"
                  : colors.primary
              }
            />

            <Text
              style={[
                styles.filterToggleText,
                filtersVisible &&
                  styles.filterToggleTextActive,
              ]}
            >
              Filters
            </Text>

            {activeFilterCount > 0 ? (
              <View
                style={
                  styles.filterCountBadge
                }
              >
                <Text
                  style={
                    styles.filterCountText
                  }
                >
                  {activeFilterCount}
                </Text>
              </View>
            ) : null}
          </Pressable>

          {hasActiveFilters ? (
            <Pressable
              onPress={clearFilters}
              style={({ pressed }) => [
                styles.resetButton,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.resetButtonText
                }
              >
                Reset
              </Text>
            </Pressable>
          ) : null}
        </View>

        {filtersVisible ? (
          <View style={styles.filterPanel}>
            {showFavouriteFilter ? (
              <View
                style={
                  styles.filterSection
                }
              >
                <FilterLabel
                  styles={styles}
                >
                  Collection
                </FilterLabel>

                <View
                  style={
                    styles.collectionRow
                  }
                >
                  <FilterChip
                    label={`All (${safeItems.length})`}
                    active={
                      !showFavouritesOnly
                    }
                    onPress={() =>
                      setShowFavouritesOnly(
                        false
                      )
                    }
                    styles={styles}
                  />

                  <FilterChip
                    label={`Favourites (${favouriteCount})`}
                    active={
                      showFavouritesOnly
                    }
                    onPress={() =>
                      setShowFavouritesOnly(
                        true
                      )
                    }
                    styles={styles}
                  />
                </View>
              </View>
            ) : null}

            {showCategoryFilter &&
            categories.length > 1 ? (
              <View
                style={
                  styles.filterSection
                }
              >
                <FilterLabel
                  styles={styles}
                >
                  Category
                </FilterLabel>

                <ScrollView
                  horizontal
                  nestedScrollEnabled
                  showsHorizontalScrollIndicator={
                    false
                  }
                  contentContainerStyle={
                    styles.horizontalFilters
                  }
                >
                  {categories.map(
                    (category) => (
                      <FilterChip
                        key={category}
                        label={category}
                        active={
                          selectedCategory ===
                          category
                        }
                        onPress={() =>
                          setSelectedCategory(
                            category
                          )
                        }
                        styles={styles}
                      />
                    )
                  )}
                </ScrollView>
              </View>
            ) : null}

            {showTimeFilter ? (
              <View
                style={
                  styles.filterSection
                }
              >
                <FilterLabel
                  styles={styles}
                >
                  Cooking time
                </FilterLabel>

                <ScrollView
                  horizontal
                  nestedScrollEnabled
                  showsHorizontalScrollIndicator={
                    false
                  }
                  contentContainerStyle={
                    styles.horizontalFilters
                  }
                >
                  {TIME_FILTERS.map(
                    (filter) => (
                      <FilterChip
                        key={filter.id}
                        label={filter.label}
                        active={
                          selectedTime ===
                          filter.id
                        }
                        onPress={() =>
                          setSelectedTime(
                            filter.id
                          )
                        }
                        styles={styles}
                      />
                    )
                  )}
                </ScrollView>
              </View>
            ) : null}
          </View>
        ) : null}

        {hasActiveFilters ? (
          <Text style={styles.resultText}>
            {filteredItems.length}{" "}
            {filteredItems.length === 1
              ? "recipe"
              : "recipes"}{" "}
            found
          </Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right"]}
    >
      <FlatList
        key={`columns-${numberOfColumns}`}
        data={filteredItems}
        numColumns={numberOfColumns}
        ListHeaderComponent={
          headerContent
        }
        keyExtractor={(item, index) =>
          item?.id
            ? String(item.id)
            : `recipe-${index}`
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={5}
        windowSize={7}
        contentContainerStyle={
          styles.listContent
        }
        columnWrapperStyle={
          numberOfColumns > 1
            ? styles.columnWrapper
            : undefined
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.cardWrapper,
              {
                width: cardWidth,
              },
            ]}
          >
            <RecipeCard
              item={item}
              width="100%"
              onOpenDetails={
                onOpenDetails
              }
              onEdit={onEdit}
              onDelete={
                handleDeleteRequest
              }
              onToggleFavourite={
                onToggleFavourite
              }
            />
          </View>
        )}
        ListEmptyComponent={
          <View
            style={
              styles.emptyContainer
            }
          >
            <View
              style={
                styles.emptyIconContainer
              }
            >
              <Ionicons
                name="restaurant-outline"
                size={34}
                color={colors.primary}
              />
            </View>

            <Text
              style={styles.emptyTitle}
            >
              {emptyTitle}
            </Text>

            <Text
              style={styles.emptyMessage}
            >
              {emptyMessage}
            </Text>

            {hasActiveFilters ? (
              <Pressable
                onPress={clearFilters}
                style={({ pressed }) => [
                  styles.emptyButton,
                  pressed &&
                    styles.pressed,
                ]}
              >
                <Text
                  style={
                    styles.emptyButtonText
                  }
                >
                  Clear filters
                </Text>
              </Pressable>
            ) : null}
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
      paddingBottom: 110,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
    },

    headerText: {
      flex: 1,
      marginRight: spacing.md,
    },

    screenTitle: {
      color: colors.text,
      fontSize: fontSize.xl,
      fontWeight: "900",
      lineHeight: lineHeight(
        fontSize.xl
      ),
    },

    screenSubtitle: {
      marginTop: spacing.xs,
      color: colors.textMuted,
      fontSize: fontSize.sm,
    },

    addButton: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.md,
      backgroundColor: colors.primary,
      borderRadius: radius.pill,
    },

    addButtonText: {
      marginLeft: 3,
      color: "#ffffff",
      fontSize: fontSize.sm,
      fontWeight: "800",
    },

    controls: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
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
      marginHorizontal: spacing.sm,
      color: colors.text,
      fontSize: fontSize.sm,
    },

    filterToolbar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: spacing.sm,
    },

    filterToggle: {
      minHeight: 40,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      backgroundColor:
        colors.primarySoft,
      borderWidth: fixed.hairline,
      borderColor: colors.primary,
      borderRadius: radius.pill,
    },

    filterToggleActive: {
      backgroundColor: colors.primary,
    },

    filterToggleText: {
      marginLeft: spacing.xs,
      color: colors.primary,
      fontSize: fontSize.sm,
      fontWeight: "800",
    },

    filterToggleTextActive: {
      color: "#ffffff",
    },

    filterCountBadge: {
      minWidth: 20,
      height: 20,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: spacing.sm,
      paddingHorizontal: 5,
      backgroundColor: "#ffffff",
      borderRadius: 10,
    },

    filterCountText: {
      color: colors.primary,
      fontSize: 11,
      fontWeight: "900",
    },

    resetButton: {
      minHeight: 40,
      justifyContent: "center",
      paddingHorizontal: spacing.md,
    },

    resetButtonText: {
      color: colors.primary,
      fontSize: fontSize.sm,
      fontWeight: "800",
    },

    filterPanel: {
      marginTop: spacing.sm,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderWidth: fixed.hairline,
      borderColor: colors.border,
      borderRadius: radius.lg,
    },

    filterSection: {
      marginBottom: spacing.md,
    },

    filterLabel: {
      marginBottom: spacing.sm,
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: "900",
      letterSpacing: 0.7,
      textTransform: "uppercase",
    },

    collectionRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },

    horizontalFilters: {
      gap: spacing.sm,
      paddingRight: spacing.md,
    },

    filterChip: {
      minHeight: 38,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.md,
      backgroundColor:
        colors.surfaceSecondary,
      borderWidth: fixed.hairline,
      borderColor: colors.border,
      borderRadius: radius.pill,
    },

    activeFilterChip: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    filterChipText: {
      color: colors.textMuted,
      fontSize: fontSize.xs,
      fontWeight: "700",
    },

    activeFilterChipText: {
      color: "#ffffff",
    },

    resultText: {
      marginTop: spacing.sm,
      color: colors.textMuted,
      fontSize: fontSize.xs,
      fontWeight: "700",
    },

    cardWrapper: {
      alignSelf: "center",
    },

    columnWrapper: {
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
    },

    emptyContainer: {
      alignItems: "center",
      paddingHorizontal: spacing.xxl,
      paddingTop: spacing.xxl,
    },

    emptyIconContainer: {
      width: 68,
      height: 68,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.primarySoft,
      borderRadius: 34,
    },

    emptyTitle: {
      marginTop: spacing.md,
      color: colors.text,
      fontSize: fontSize.lg,
      fontWeight: "800",
      textAlign: "center",
    },

    emptyMessage: {
      marginTop: spacing.sm,
      color: colors.textMuted,
      fontSize: fontSize.sm,
      lineHeight: lineHeight(
        fontSize.sm
      ),
      textAlign: "center",
    },

    emptyButton: {
      minHeight: 44,
      justifyContent: "center",
      marginTop: spacing.lg,
      paddingHorizontal: spacing.lg,
      backgroundColor: colors.primary,
      borderRadius: radius.pill,
    },

    emptyButtonText: {
      color: "#ffffff",
      fontSize: fontSize.sm,
      fontWeight: "800",
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