import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import RecipeCard from "./RecipeCard";

import {
  colors,
  fixed,
  fontSize,
  lineHeight,
  radius,
  spacing,
} from "../constants/theme";

function getColumnCount(width) {
  if (width >= 900) {
    return 3;
  }

  if (width >= 600) {
    return 2;
  }

  return 1;
}

function FilterButton({
  label,
  active,
  onPress,
  style,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterButton,
        style,
        active && styles.activeFilterButton,
        pressed && styles.pressed,
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.filterButtonText,
          active && styles.activeFilterButtonText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function ListScreen({
  title = "My Collection",
  subtitle,
  items = [],
  emptyTitle = "No recipes found",
  emptyMessage = "Try another search or change the selected filter.",

  onAdd = null,
  onEdit = () => {},
  onDelete = () => {},
  onToggleFavourite = () => {},
  onOpenDetails = () => {},

  showSearch = true,
  showFavouriteFilter = true,
}) {
  const { width } = useWindowDimensions();

  const [searchText, setSearchText] = useState("");
  const [showFavouritesOnly, setShowFavouritesOnly] =
    useState(false);

  const numberOfColumns = getColumnCount(width);

  const horizontalPadding = spacing.lg;
  const columnGap = spacing.md;

  const availableWidth =
    width -
    horizontalPadding * 2 -
    columnGap * (numberOfColumns - 1);

  const cardWidth =
    availableWidth / numberOfColumns;

  const favouriteCount = useMemo(
    () =>
      items.filter((item) => item.favourite)
        .length,
    [items]
  );

  const filteredItems = useMemo(() => {
    const search =
      searchText.trim().toLowerCase();

    return items.filter((item) => {
      const matchesFavourite =
        !showFavouritesOnly ||
        Boolean(item.favourite);

      const searchableText = [
        item.title,
        item.subtitle,
        item.notes,
        ...(Array.isArray(item.tags)
          ? item.tags
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
        matchesSearch
      );
    });
  }, [
    items,
    searchText,
    showFavouritesOnly,
  ]);

  const handleDeleteRequest = (recipe) => {
    if (!recipe?.id) {
      return;
    }

    Alert.alert(
      "Delete recipe",
      `Are you sure you want to delete "${recipe.title}"?`,
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

  const clearFilters = () => {
    setSearchText("");
    setShowFavouritesOnly(false);
  };

  const displaySubtitle =
    subtitle ??
    `${items.length} recipes · ${favouriteCount} favourites`;

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right"]}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text
            style={styles.screenTitle}
            numberOfLines={1}
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
            <Text style={styles.addButtonText}>
              + Add
            </Text>
          </Pressable>
        ) : null}
      </View>

      {showSearch ||
      showFavouriteFilter ? (
        <View style={styles.controls}>
          {showSearch ? (
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search recipes..."
              placeholderTextColor={
                colors.textFaint
              }
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              style={styles.searchInput}
            />
          ) : null}

          {showFavouriteFilter ? (
            <View
              style={styles.filterContainer}
            >
              <FilterButton
                label={`All (${items.length})`}
                active={!showFavouritesOnly}
                onPress={() =>
                  setShowFavouritesOnly(false)
                }
                style={styles.firstFilter}
              />

              <FilterButton
                label={`Favourites (${favouriteCount})`}
                active={showFavouritesOnly}
                onPress={() =>
                  setShowFavouritesOnly(true)
                }
              />
            </View>
          ) : null}
        </View>
      ) : null}

      <FlatList
        key={`columns-${numberOfColumns}`}
        data={filteredItems}
        numColumns={numberOfColumns}
        keyExtractor={(item) =>
          String(item.id)
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.listContent,
          filteredItems.length === 0 &&
            styles.emptyListContent,
        ]}
        columnWrapperStyle={
          numberOfColumns > 1
            ? styles.columnWrapper
            : undefined
        }
        renderItem={({ item }) => (
          <RecipeCard
            item={item}
            width={cardWidth}
            onOpenDetails={onOpenDetails}
            onEdit={onEdit}
            onDelete={
              handleDeleteRequest
            }
            onToggleFavourite={
              onToggleFavourite
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              🔎
            </Text>

            <Text style={styles.emptyTitle}>
              {emptyTitle}
            </Text>

            <Text style={styles.emptyMessage}>
              {emptyMessage}
            </Text>

            {(searchText ||
              showFavouritesOnly) && (
              <Pressable
                onPress={clearFilters}
                style={({ pressed }) => [
                  styles.clearButton,
                  pressed &&
                    styles.pressed,
                ]}
              >
                <Text
                  style={
                    styles.clearButtonText
                  }
                >
                  Clear filters
                </Text>
              </Pressable>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
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
    fontSize: fontSize.xxl,
    fontWeight: "800",
    lineHeight: lineHeight(
      fontSize.xxl
    ),
  },

  screenSubtitle: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },

  addButton: {
    minHeight: fixed.minTouch,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },

  addButtonText: {
    color: colors.surface,
    fontSize: fontSize.sm,
    fontWeight: "800",
  },

  controls: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },

  searchInput: {
    minHeight: fixed.minTouch,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
    backgroundColor: colors.surface,
    borderWidth: fixed.hairline,
    borderColor: colors.border,
    borderRadius: radius.md,
  },

  filterContainer: {
    flexDirection: "row",
    marginTop: spacing.sm,
  },

  firstFilter: {
    marginRight: spacing.sm,
  },

  filterButton: {
    minHeight: fixed.minTouch,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: fixed.hairline,
    borderColor: colors.border,
    borderRadius: radius.pill,
  },

  activeFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  filterButtonText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: "700",
  },

  activeFilterButtonText: {
    color: colors.surface,
  },

  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  emptyListContent: {
    justifyContent: "center",
  },

  columnWrapper: {
    justifyContent: "space-between",
  },

  emptyContainer: {
    alignItems: "center",
    padding: spacing.xxl,
  },

  emptyIcon: {
    fontSize: fontSize.xxl,
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
    textAlign: "center",
  },

  clearButton: {
    minHeight: fixed.minTouch,
    justifyContent: "center",
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },

  clearButtonText: {
    color: colors.surface,
    fontSize: fontSize.sm,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
});