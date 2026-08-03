import {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  fixed,
  fontSize,
  lineHeight,
  radius,
  shadow,
  spacing,
} from "../constants/theme";

import {
  useTheme,
} from "../contexts/ThemeContext";

function RecipeCard({
  item,
  width,
  onOpenDetails = () => {},
  onEdit = () => {},
  onDelete = () => {},
  onToggleFavourite = () => {},
}) {
  const {
    colors,
    isDark,
  } = useTheme();

  const styles = useMemo(
    () => createStyles(colors, isDark),
    [colors, isDark]
  );

  const [imageFailed, setImageFailed] =
    useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [item?.image]);

  if (!item) {
    return null;
  }

  const tags = Array.isArray(item.tags)
    ? item.tags
    : [];

  const showImage =
    Boolean(item.image) &&
    !imageFailed;

  const handleFavourite = (event) => {
    event?.stopPropagation?.();

    if (item.id) {
      onToggleFavourite(item.id);
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          width,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.title}`}
        onPress={() =>
          onOpenDetails(item)
        }
        style={({ pressed }) => [
          pressed &&
            styles.contentPressed,
        ]}
      >
        <View style={styles.imageContainer}>
          {showImage ? (
            <Image
              source={{
                uri: item.image,
              }}
              style={styles.image}
              resizeMode="cover"
              onError={() =>
                setImageFailed(true)
              }
            />
          ) : (
            <View
              style={
                styles.imagePlaceholder
              }
            >
              <View
                style={
                  styles.placeholderCircle
                }
              >
                <Ionicons
                  name="restaurant-outline"
                  size={30}
                  color={colors.primary}
                />
              </View>

              <Text
                style={
                  styles.placeholderText
                }
              >
                No image available
              </Text>
            </View>
          )}

          <View style={styles.timeBadge}>
            <Ionicons
              name="time-outline"
              size={14}
              color="#ffffff"
            />

            <Text style={styles.timeText}>
              {Number(item.minutes) || 0} min
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              item.favourite
                ? `Remove ${item.title} from favourites`
                : `Add ${item.title} to favourites`
            }
            onPress={handleFavourite}
            style={({ pressed }) => [
              styles.favouriteButton,
              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Ionicons
              name={
                item.favourite
                  ? "heart"
                  : "heart-outline"
              }
              size={24}
              color={colors.favourite}
            />
          </Pressable>
        </View>

        <View style={styles.cardBody}>
          <Text
            style={styles.recipeTitle}
            numberOfLines={2}
          >
            {item.title ||
              "Untitled recipe"}
          </Text>

          {item.subtitle ? (
            <Text
              style={styles.subtitle}
              numberOfLines={1}
            >
              {item.subtitle}
            </Text>
          ) : null}

          {tags.length > 0 ? (
            <View
              style={
                styles.tagsContainer
              }
            >
              {tags
                .slice(0, 3)
                .map((tag, index) => (
                  <View
                    key={`${item.id}-tag-${index}`}
                    style={styles.tag}
                  >
                    <Text
                      style={
                        styles.tagText
                      }
                      numberOfLines={1}
                    >
                      {tag}
                    </Text>
                  </View>
                ))}
            </View>
          ) : null}

          {item.notes ? (
            <Text
              style={styles.notes}
              numberOfLines={2}
            >
              {item.notes}
            </Text>
          ) : null}

          <View style={styles.detailsRow}>
            <Text
              style={styles.detailsText}
            >
              View recipe
            </Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color={colors.primary}
            />
          </View>
        </View>
      </Pressable>

      {item.source === "mine" ? (
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              onEdit(item)
            }
            style={({ pressed }) => [
              styles.actionButton,
              styles.editButton,
              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Ionicons
              name="create-outline"
              size={17}
              color={colors.primary}
            />

            <Text
              style={
                styles.editButtonText
              }
            >
              Edit
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              onDelete(item)
            }
            style={({ pressed }) => [
              styles.actionButton,
              styles.deleteButton,
              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Ionicons
              name="trash-outline"
              size={17}
              color={colors.danger}
            />

            <Text
              style={
                styles.deleteButtonText
              }
            >
              Delete
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function createStyles(
  colors,
  isDark
) {
  return StyleSheet.create({
    card: {
      overflow: "hidden",
      marginBottom: spacing.lg,
      backgroundColor: colors.surface,
      borderWidth: fixed.hairline,
      borderColor: colors.border,
      borderRadius: radius.lg,
      ...shadow(2),
    },

    contentPressed: {
      opacity: 0.9,
    },

    imageContainer: {
      position: "relative",
      backgroundColor:
        colors.surfaceSecondary,
    },

    image: {
      width: "100%",
      aspectRatio: 16 / 9,
    },

    imagePlaceholder: {
      width: "100%",
      aspectRatio: 16 / 9,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.surfaceSecondary,
    },

    placeholderCircle: {
      width: 58,
      height: 58,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.primarySoft,
      borderRadius: 29,
    },

    placeholderText: {
      marginTop: spacing.sm,
      color: colors.textMuted,
      fontSize: fontSize.sm,
    },

    timeBadge: {
      position: "absolute",
      left: spacing.md,
      bottom: spacing.md,
      minHeight: 32,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.sm,
      backgroundColor:
        "rgba(15, 23, 42, 0.86)",
      borderRadius: radius.pill,
    },

    timeText: {
      marginLeft: 4,
      color: "#ffffff",
      fontSize: fontSize.xs,
      fontWeight: "800",
    },

    favouriteButton: {
      position: "absolute",
      top: spacing.md,
      right: spacing.md,
      width: 46,
      height: 46,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        isDark
          ? "rgba(21, 30, 47, 0.94)"
          : "rgba(255, 255, 255, 0.94)",
      borderWidth: fixed.hairline,
      borderColor: colors.border,
      borderRadius: 23,
      ...shadow(1),
    },

    cardBody: {
      padding: spacing.lg,
    },

    recipeTitle: {
      color: colors.text,
      fontSize: fontSize.lg,
      fontWeight: "900",
      lineHeight: lineHeight(
        fontSize.lg
      ),
    },

    subtitle: {
      marginTop: spacing.xs,
      color: colors.textMuted,
      fontSize: fontSize.sm,
    },

    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: spacing.md,
    },

    tag: {
      marginRight: spacing.xs,
      marginBottom: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: 5,
      backgroundColor: colors.tagBg,
      borderRadius: radius.pill,
    },

    tagText: {
      color: colors.tagText,
      fontSize: fontSize.xs,
      fontWeight: "800",
    },

    notes: {
      marginTop: spacing.sm,
      color: colors.textMuted,
      fontSize: fontSize.sm,
      lineHeight: lineHeight(
        fontSize.sm
      ),
    },

    detailsRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacing.md,
    },

    detailsText: {
      marginRight: spacing.xs,
      color: colors.primary,
      fontSize: fontSize.sm,
      fontWeight: "900",
    },

    actions: {
      flexDirection: "row",
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
    },

    actionButton: {
      flex: 1,
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: fixed.hairline,
      borderRadius: radius.md,
    },

    editButton: {
      marginRight: spacing.sm,
      backgroundColor:
        colors.primarySoft,
      borderColor: colors.primary,
    },

    editButtonText: {
      marginLeft: spacing.xs,
      color: colors.primary,
      fontSize: fontSize.sm,
      fontWeight: "800",
    },

    deleteButton: {
      backgroundColor:
        isDark
          ? "#3b1d25"
          : "#fee2e2",
      borderColor: colors.danger,
    },

    deleteButtonText: {
      marginLeft: spacing.xs,
      color: colors.danger,
      fontSize: fontSize.sm,
      fontWeight: "800",
    },

    buttonPressed: {
      opacity: 0.68,
      transform: [
        {
          scale: 0.97,
        },
      ],
    },
  });
}

export default memo(RecipeCard);