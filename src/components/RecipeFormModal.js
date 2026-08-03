import { useEffect, useMemo, useState } from "react";

import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  colors,
  fixed,
  fontSize,
  radius,
  spacing,
} from "../constants/theme";

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        textAlignVertical={
          multiline ? "top" : "center"
        }
        style={[
          styles.input,
          multiline &&
            styles.multilineInput,
        ]}
      />
    </View>
  );
}

function isRemoteImageUri(value) {
  return /^https?:\/\/\S+$/i.test(
    String(value || "").trim()
  );
}

function isLocalImageUri(value) {
  const uri = String(value || "").trim();

  return (
    uri.startsWith("file:") ||
    uri.startsWith("content:") ||
    uri.startsWith("data:") ||
    uri.startsWith("ph:")
  );
}

function createLines(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function RecipeFormModal({
  visible = false,
  recipe = null,
  onClose = () => {},
  onSave = () => {},
}) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] =
    useState("");

  const [image, setImage] = useState("");
  const [imageUrl, setImageUrl] =
    useState("");

  const [minutes, setMinutes] =
    useState("");

  const [tagsText, setTagsText] =
    useState("");

  const [
    ingredientsText,
    setIngredientsText,
  ] = useState("");

  const [stepsText, setStepsText] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [error, setError] =
    useState("");

  const [imageFailed, setImageFailed] =
    useState(false);

  const isEditMode = Boolean(recipe);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const recipeImage = String(
      recipe?.image || ""
    );

    setTitle(recipe?.title || "");
    setSubtitle(recipe?.subtitle || "");

    setImage(recipeImage);

    setImageUrl(
      isRemoteImageUri(recipeImage)
        ? recipeImage
        : ""
    );

    setMinutes(
      recipe?.minutes
        ? String(recipe.minutes)
        : ""
    );

    setTagsText(
      Array.isArray(recipe?.tags)
        ? recipe.tags.join(", ")
        : ""
    );

    setIngredientsText(
      Array.isArray(recipe?.ingredients)
        ? recipe.ingredients.join("\n")
        : ""
    );

    setStepsText(
      Array.isArray(recipe?.steps)
        ? recipe.steps.join("\n")
        : ""
    );

    setNotes(recipe?.notes || "");
    setError("");
    setImageFailed(false);
  }, [visible, recipe]);

  useEffect(() => {
    setImageFailed(false);
  }, [image, imageUrl]);

  const cleanImageUrl = imageUrl.trim();

  const previewImage = useMemo(() => {
    if (cleanImageUrl) {
      return isRemoteImageUri(cleanImageUrl)
        ? cleanImageUrl
        : "";
    }

    return image;
  }, [cleanImageUrl, image]);

  const showImage =
    Boolean(previewImage) && !imageFailed;

  const handleImageUrlChange = (value) => {
    setImageUrl(value);
    setImageFailed(false);

    if (
      !value.trim() &&
      isRemoteImageUri(image)
    ) {
      setImage("");
    }
  };

  const pickImageFromGallery =
    async () => {
      try {
        setError("");

        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          setError(
            "Gallery permission is required to select a recipe image."
          );
          return;
        }

        const result =
          await ImagePicker.launchImageLibraryAsync(
            {
              mediaTypes: ["images"],
              allowsEditing: true,
              aspect: [16, 9],
              quality: 0.8,
            }
          );

        if (result.canceled) {
          return;
        }

        const selectedImage =
          result.assets?.[0];

        if (!selectedImage?.uri) {
          setError(
            "The selected image could not be loaded."
          );
          return;
        }

        setImage(selectedImage.uri);
        setImageUrl("");
        setImageFailed(false);
      } catch (pickerError) {
        console.error(
          "Failed to select recipe image:",
          pickerError
        );

        setError(
          "Something went wrong while selecting the image."
        );
      }
    };

  const removeImage = () => {
    setImage("");
    setImageUrl("");
    setImageFailed(false);
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  const handleSubmit = () => {
    setError("");

    const cleanTitle = title.trim();
    const cleanSubtitle =
      subtitle.trim();

    const cleanImage =
      cleanImageUrl || image.trim();

    const cleanNotes = notes.trim();

    const parsedMinutes =
      Number.parseInt(minutes, 10);

    if (!cleanTitle) {
      setError(
        "Recipe title is required."
      );
      return;
    }

    if (!cleanSubtitle) {
      setError(
        "Recipe subtitle is required."
      );
      return;
    }

    if (
      !Number.isInteger(parsedMinutes) ||
      parsedMinutes <= 0
    ) {
      setError(
        "Cooking time must be greater than zero."
      );
      return;
    }

    if (
      cleanImage &&
      !isRemoteImageUri(cleanImage) &&
      !isLocalImageUri(cleanImage)
    ) {
      setError(
        "Select an image or enter a valid image URL."
      );
      return;
    }

    const tags = [
      ...new Set(
        tagsText
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      ),
    ];

    const ingredients = createLines(
      ingredientsText
    );

    const steps = createLines(
      stepsText
    );

    if (ingredients.length === 0) {
      setError(
        "Add at least one ingredient."
      );
      return;
    }

    if (steps.length === 0) {
      setError(
        "Add at least one preparation step."
      );
      return;
    }

    onSave({
      title: cleanTitle,
      subtitle: cleanSubtitle,
      image: cleanImage,
      minutes: parsedMinutes,
      tags,
      ingredients,
      steps,
      notes: cleanNotes,
    });
  };

  return (
    <Modal
      visible={Boolean(visible)}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "bottom"]}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : "height"
          }
        >
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close recipe form"
              onPress={handleClose}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </Pressable>

            <Text
              style={styles.headerTitle}
              numberOfLines={1}
            >
              {isEditMode
                ? "Edit Recipe"
                : "Add Recipe"}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isEditMode
                  ? "Save recipe changes"
                  : "Save new recipe"
              }
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.saveText}>
                Save
              </Text>
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              styles.formContent
            }
          >
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            ) : null}

            <View style={styles.imageSection}>
              <Text style={styles.label}>
                Recipe image
              </Text>

              {showImage ? (
                <Image
                  source={{
                    uri: previewImage,
                  }}
                  style={styles.imagePreview}
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
                  <Text
                    style={
                      styles.placeholderIcon
                    }
                  >
                    🍽️
                  </Text>

                  <Text
                    style={
                      styles.placeholderText
                    }
                  >
                    {imageFailed
                      ? "Image could not be displayed"
                      : cleanImageUrl &&
                          !isRemoteImageUri(
                            cleanImageUrl
                          )
                        ? "Enter a complete image URL"
                        : "No image selected"}
                  </Text>
                </View>
              )}

              <View
                style={styles.imageActions}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Choose recipe image from gallery"
                  onPress={
                    pickImageFromGallery
                  }
                  style={({ pressed }) => [
                    styles.galleryButton,
                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <Text
                    style={
                      styles.galleryButtonText
                    }
                  >
                    Choose from Gallery
                  </Text>
                </Pressable>

                {image || imageUrl ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Remove recipe image"
                    onPress={removeImage}
                    style={({ pressed }) => [
                      styles.removeImageButton,
                      pressed &&
                        styles.pressed,
                    ]}
                  >
                    <Text
                      style={
                        styles.removeImageButtonText
                      }
                    >
                      Remove
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

            <FormField
              label="Image URL (optional)"
              value={imageUrl}
              onChangeText={
                handleImageUrlChange
              }
              placeholder="https://example.com/recipe.jpg"
              keyboardType="url"
              autoCapitalize="none"
            />

            <FormField
              label="Recipe title"
              value={title}
              onChangeText={setTitle}
              placeholder="Example: Chicken Curry"
            />

            <FormField
              label="Subtitle"
              value={subtitle}
              onChangeText={setSubtitle}
              placeholder="Example: Indian · Chicken"
            />

            <FormField
              label="Cooking time in minutes"
              value={minutes}
              onChangeText={(value) =>
                setMinutes(
                  value.replace(
                    /[^0-9]/g,
                    ""
                  )
                )
              }
              placeholder="Example: 45"
              keyboardType="number-pad"
              autoCapitalize="none"
            />

            <FormField
              label="Tags"
              value={tagsText}
              onChangeText={setTagsText}
              placeholder="Indian, Chicken, Spicy"
              autoCapitalize="words"
            />

            <FormField
              label="Ingredients"
              value={ingredientsText}
              onChangeText={
                setIngredientsText
              }
              placeholder={
                "Enter one ingredient per line\n500g chicken\n2 onions\n1 tablespoon oil"
              }
              multiline
            />

            <FormField
              label="Preparation steps"
              value={stepsText}
              onChangeText={setStepsText}
              placeholder={
                "Enter one step per line\nHeat the oil\nCook the onions\nAdd the chicken"
              }
              multiline
            />

            <FormField
              label="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Add serving suggestions or other notes..."
              multiline
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isEditMode
                  ? "Update recipe"
                  : "Add recipe"
              }
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.submitButtonText
                }
              >
                {isEditMode
                  ? "Update Recipe"
                  : "Add Recipe"}
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  keyboardView: {
    flex: 1,
  },

  header: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: fixed.hairline,
    borderBottomColor: colors.border,
  },

  headerTitle: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "800",
    textAlign: "center",
  },

  headerButton: {
    minWidth: 72,
    minHeight: fixed.minTouch,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: "700",
  },

  saveText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: "800",
  },

  formContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  imageSection: {
    marginBottom: spacing.lg,
  },

  imagePreview: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: colors.border,
    borderRadius: radius.lg,
  },

  imagePlaceholder: {
    width: "100%",
    aspectRatio: 16 / 9,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.border,
    borderRadius: radius.lg,
  },

  placeholderIcon: {
    fontSize: fontSize.xxl,
  },

  placeholderText: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: "center",
  },

  imageActions: {
    flexDirection: "row",
    marginTop: spacing.sm,
  },

  galleryButton: {
    flex: 1,
    minHeight: fixed.minTouch,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },

  galleryButtonText: {
    color: colors.surface,
    fontSize: fontSize.sm,
    fontWeight: "800",
    textAlign: "center",
  },

  removeImageButton: {
    minHeight: fixed.minTouch,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: "#fee2e2",
    borderRadius: radius.md,
  },

  removeImageButtonText: {
    color: colors.danger,
    fontSize: fontSize.sm,
    fontWeight: "800",
  },

  field: {
    marginBottom: spacing.lg,
  },

  label: {
    marginBottom: spacing.sm,
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: "700",
  },

  input: {
    minHeight: fixed.minTouch,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: fontSize.md,
    backgroundColor: colors.surface,
    borderWidth: fixed.hairline,
    borderColor: colors.border,
    borderRadius: radius.md,
  },

  multilineInput: {
    minHeight: 140,
  },

  errorBox: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: "#fee2e2",
    borderRadius: radius.md,
  },

  errorText: {
    color: colors.danger,
    fontSize: fontSize.sm,
    fontWeight: "700",
  },

  submitButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },

  submitButtonText: {
    color: colors.surface,
    fontSize: fontSize.md,
    fontWeight: "800",
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