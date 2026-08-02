import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  colors,
  fixed,
  fontSize,
  lineHeight,
  radius,
  shadow,
  spacing,
} from "../constants/theme";

export default function RecipeCard({
  item,
  width,
  onOpenDetails,
  onEdit,
  onDelete,
  onToggleFavourite,
}) {
  const [imageFailed, setImageFailed] =
    useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [item.image]);

  const showImage =
    Boolean(item.image) && !imageFailed;

  const handleFavourite = (event) => {
    event.stopPropagation?.();
    onToggleFavourite(item.id);
  };

  return (
    <View style={[styles.card, { width }]}>
      <Pressable
        onPress={() => onOpenDetails(item)}
        style={({ pressed }) => [
          pressed && styles.contentPressed,
        ]}
      >
        <View style={styles.imageContainer}>
          {showImage ? (
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderIcon}>
                🍽️
              </Text>

              <Text style={styles.placeholderText}>
                No image available
              </Text>
            </View>
          )}

          <View style={styles.timeBadge}>
            <Text style={styles.timeText}>
              {item.minutes} min
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
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.favouriteIcon}>
              {item.favourite ? "★" : "☆"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.cardBody}>
          <Text
            style={styles.recipeTitle}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <Text
            style={styles.subtitle}
            numberOfLines={1}
          >
            {item.subtitle}
          </Text>

          {item.tags?.length > 0 ? (
            <View style={styles.tagsContainer}>
              {item.tags
                .slice(0, 3)
                .map((tag) => (
                  <View
                    key={`${item.id}-${tag}`}
                    style={styles.tag}
                  >
                    <Text style={styles.tagText}>
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

          <Text style={styles.detailsText}>
            View full recipe →
          </Text>
        </View>
      </Pressable>

      <View style={styles.actions}>
        <Pressable
          onPress={() => onEdit(item)}
          style={({ pressed }) => [
            styles.actionButton,
            styles.editButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.editButtonText}>
            Edit
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onDelete(item)}
          style={({ pressed }) => [
            styles.actionButton,
            styles.deleteButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.deleteButtonText}>
            Delete
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: fixed.hairline,
    borderColor: colors.border,
    borderRadius: radius.lg,
    ...shadow(2),
  },

  contentPressed: {
    opacity: 0.88,
  },

  imageContainer: {
    position: "relative",
    backgroundColor: colors.border,
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
    backgroundColor: colors.border,
  },

  placeholderIcon: {
    fontSize: fontSize.xxl,
  },

  placeholderText: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },

  timeBadge: {
    position: "absolute",
    left: spacing.sm,
    bottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: "rgba(17,24,39,0.82)",
    borderRadius: radius.pill,
  },

  timeText: {
    color: colors.surface,
    fontSize: fontSize.xs,
    fontWeight: "700",
  },

  favouriteButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: fixed.minTouch,
    height: fixed.minTouch,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: radius.pill,
  },

  favouriteIcon: {
    color: colors.favourite,
    fontSize: fontSize.xl,
  },

  cardBody: {
    padding: spacing.lg,
  },

  recipeTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "800",
    lineHeight: lineHeight(fontSize.lg),
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
    paddingVertical: spacing.xs,
    backgroundColor: colors.tagBg,
    borderRadius: radius.pill,
  },

  tagText: {
    color: colors.tagText,
    fontSize: fontSize.xs,
    fontWeight: "700",
  },

  notes: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: lineHeight(fontSize.sm),
  },

  detailsText: {
    marginTop: spacing.md,
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: "800",
  },

  actions: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },

  actionButton: {
    flex: 1,
    minHeight: fixed.minTouch,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },

  editButton: {
    marginRight: spacing.sm,
    backgroundColor: colors.tagBg,
  },

  editButtonText: {
    color: colors.primaryDark,
    fontSize: fontSize.sm,
    fontWeight: "800",
  },

  deleteButton: {
    backgroundColor: "#fee2e2",
  },

  deleteButtonText: {
    color: colors.danger,
    fontSize: fontSize.sm,
    fontWeight: "800",
  },

  buttonPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.97 }],
  },
});