import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  colors,
  fixed,
  fontSize,
  lineHeight,
  radius,
  shadow,
  spacing,
} from "../constants/theme";

export default function RecipeDetailsScreen({
  recipe,
  onBack = () => {},
  onEdit = () => {},
  onDelete = () => {},
  onToggleFavourite = () => {},
}) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [recipe?.image]);

  const handleDelete = () => {
    if (!recipe) {
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
          onPress: onDelete,
        },
      ]
    );
  };

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundTitle}>
            Recipe not found
          </Text>

          <Text style={styles.notFoundMessage}>
            This recipe may have been deleted.
          </Text>

          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              Go back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const showImage =
    Boolean(recipe.image) && !imageFailed;

  const ingredients = Array.isArray(
    recipe.ingredients
  )
    ? recipe.ingredients
    : [];

  const steps = Array.isArray(recipe.steps)
    ? recipe.steps
    : [];

  const tags = Array.isArray(recipe.tags)
    ? recipe.tags
    : [];

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right"]}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.backText}>
            ‹ Back
          </Text>
        </Pressable>

        <Text
          style={styles.headerTitle}
          numberOfLines={1}
        >
          Recipe Details
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Edit ${recipe.title}`}
          onPress={onEdit}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.editHeaderText}>
            Edit
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageContainer}>
          {showImage ? (
            <Image
              source={{ uri: recipe.image }}
              style={styles.heroImage}
              resizeMode="cover"
              accessibilityLabel={recipe.title}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderIcon}>
                🍽️
              </Text>

              <Text style={styles.placeholderText}>
                No recipe image
              </Text>
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              recipe.favourite
                ? `Remove ${recipe.title} from favourites`
                : `Add ${recipe.title} to favourites`
            }
            onPress={onToggleFavourite}
            style={({ pressed }) => [
              styles.favouriteButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.favouriteIcon}>
              {recipe.favourite ? "★" : "☆"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.contentCard}>
          <Text style={styles.title}>
            {recipe.title}
          </Text>

          <Text style={styles.subtitle}>
            {recipe.subtitle}
          </Text>

          <View style={styles.infoRow}>
            <View
              style={[
                styles.infoBox,
                styles.firstInfoBox,
              ]}
            >
              <Text style={styles.infoLabel}>
                Cooking time
              </Text>

              <Text style={styles.infoValue}>
                {recipe.minutes || 0} minutes
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>
                Source
              </Text>

              <Text style={styles.infoValue}>
                {recipe.source === "mine"
                  ? "My recipe"
                  : "Starter recipe"}
              </Text>
            </View>
          </View>

          {tags.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Tags
              </Text>

              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <View
                    key={`${recipe.id}-tag-${index}`}
                    style={styles.tag}
                  >
                    <Text style={styles.tagText}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Ingredients
            </Text>

            {ingredients.length > 0 ? (
              ingredients.map(
                (ingredient, index) => (
                  <View
                    key={`${recipe.id}-ingredient-${index}`}
                    style={styles.ingredientRow}
                  >
                    <View
                      style={
                        styles.ingredientBullet
                      }
                    />

                    <Text
                      style={styles.ingredientText}
                    >
                      {ingredient}
                    </Text>
                  </View>
                )
              )
            ) : (
              <Text style={styles.emptySectionText}>
                No ingredients have been added.
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Preparation
            </Text>

            {steps.length > 0 ? (
              steps.map((step, index) => (
                <View
                  key={`${recipe.id}-step-${index}`}
                  style={styles.stepRow}
                >
                  <View style={styles.stepNumber}>
                    <Text
                      style={styles.stepNumberText}
                    >
                      {index + 1}
                    </Text>
                  </View>

                  <Text style={styles.stepText}>
                    {step}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptySectionText}>
                No preparation steps have been added.
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Notes
            </Text>

            <Text style={styles.notes}>
              {recipe.notes ||
                "No additional notes have been added."}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onToggleFavourite}
            style={({ pressed }) => [
              styles.favouriteAction,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={styles.favouriteActionText}
            >
              {recipe.favourite
                ? "★ Remove from favourites"
                : "☆ Add to favourites"}
            </Text>
          </Pressable>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onEdit}
              style={({ pressed }) => [
                styles.actionButton,
                styles.editButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.editButtonText}>
                Edit Recipe
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={handleDelete}
              style={({ pressed }) => [
                styles.actionButton,
                styles.deleteButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.deleteButtonText}>
                Delete Recipe
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: fixed.hairline,
    borderBottomColor: colors.border,
  },

  headerButton: {
    minWidth: 70,
    minHeight: fixed.minTouch,
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "800",
    textAlign: "center",
  },

  backText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: "700",
  },

  editHeaderText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: "800",
    textAlign: "right",
  },

  scrollContent: {
    paddingBottom: spacing.xxl,
  },

  imageContainer: {
    position: "relative",
    backgroundColor: colors.border,
  },

  heroImage: {
    width: "100%",
    aspectRatio: 16 / 10,
  },

  imagePlaceholder: {
    width: "100%",
    aspectRatio: 16 / 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.border,
  },

  placeholderIcon: {
    fontSize: 54,
  },

  placeholderText: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },

  favouriteButton: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.lg,
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    ...shadow(2),
  },

  favouriteIcon: {
    color: colors.favourite,
    fontSize: fontSize.xxl,
  },

  contentCard: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadow(1),
  },

  title: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: "900",
    lineHeight: lineHeight(fontSize.xxl),
  },

  subtitle: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: fontSize.md,
  },

  infoRow: {
    flexDirection: "row",
    marginTop: spacing.xl,
  },

  infoBox: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
  },

  firstInfoBox: {
    marginRight: spacing.sm,
  },

  infoLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: "700",
  },

  infoValue: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: "800",
  },

  section: {
    marginTop: spacing.xl,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "800",
  },

  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.sm,
  },

  tag: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.tagBg,
    borderRadius: radius.pill,
  },

  tagText: {
    color: colors.tagText,
    fontSize: fontSize.sm,
    fontWeight: "700",
  },

  ingredientRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: spacing.md,
  },

  ingredientBullet: {
    width: 8,
    height: 8,
    marginTop: 7,
    marginRight: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },

  ingredientText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: fontSize.md,
    lineHeight: lineHeight(fontSize.md),
  },

  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: spacing.md,
  },

  stepNumber: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 16,
  },

  stepNumberText: {
    color: colors.surface,
    fontSize: fontSize.sm,
    fontWeight: "900",
  },

  stepText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: fontSize.md,
    lineHeight: lineHeight(fontSize.md),
  },

  emptySectionText: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontStyle: "italic",
  },

  notes: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: fontSize.md,
    lineHeight: lineHeight(fontSize.md),
  },

  favouriteAction: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
    backgroundColor: "#fef3c7",
    borderRadius: radius.md,
  },

  favouriteActionText: {
    color: "#92400e",
    fontSize: fontSize.sm,
    fontWeight: "800",
  },

  actions: {
    marginTop: spacing.md,
  },

  actionButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },

  editButton: {
    backgroundColor: colors.primary,
  },

  editButtonText: {
    color: colors.surface,
    fontSize: fontSize.md,
    fontWeight: "800",
  },

  deleteButton: {
    marginTop: spacing.sm,
    backgroundColor: "#fee2e2",
  },

  deleteButtonText: {
    color: colors.danger,
    fontSize: fontSize.md,
    fontWeight: "800",
  },

  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
  },

  notFoundTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: "800",
  },

  notFoundMessage: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: "center",
  },

  primaryButton: {
    minHeight: fixed.minTouch,
    justifyContent: "center",
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },

  primaryButtonText: {
    color: colors.surface,
    fontSize: fontSize.sm,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
});