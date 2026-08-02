import { useEffect, useState } from "react";

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
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        textAlignVertical={multiline ? "top" : "center"}
        style={[
          styles.input,
          multiline && styles.multilineInput,
        ]}
      />
    </View>
  );
}

export default function RecipeFormModal({
  visible,
  recipe,
  onClose,
  onSave,
}) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState("");
  const [minutes, setMinutes] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  const isEditMode = Boolean(recipe);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setTitle(recipe?.title || "");
    setSubtitle(recipe?.subtitle || "");
    setImage(recipe?.image || "");
    setMinutes(
      recipe?.minutes ? String(recipe.minutes) : ""
    );
    setTagsText(
      Array.isArray(recipe?.tags)
        ? recipe.tags.join(", ")
        : ""
    );
    setNotes(recipe?.notes || "");
    setError("");
    setImageFailed(false);
  }, [visible, recipe]);

  useEffect(() => {
    setImageFailed(false);
  }, [image]);

  const pickImageFromGallery = async () => {
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
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [16, 9],
          quality: 0.8,
        });

      if (result.canceled) {
        return;
      }

      const selectedImage = result.assets?.[0];

      if (!selectedImage?.uri) {
        setError("The selected image could not be loaded.");
        return;
      }

      setImage(selectedImage.uri);
      setImageFailed(false);
    } catch (pickerError) {
      console.error(
        "Failed to select image:",
        pickerError
      );

      setError(
        "Something went wrong while selecting the image."
      );
    }
  };

  const removeImage = () => {
    setImage("");
    setImageFailed(false);
  };

  const handleSubmit = () => {
    const cleanTitle = title.trim();
    const cleanSubtitle = subtitle.trim();
    const cleanImage = image.trim();
    const cleanNotes = notes.trim();

    const parsedMinutes =
      Number.parseInt(minutes, 10);

    if (!cleanTitle) {
      setError("Recipe title is required.");
      return;
    }

    if (!cleanSubtitle) {
      setError("Recipe subtitle is required.");
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

    const isRemoteImage =
      /^https?:\/\/\S+$/i.test(cleanImage);

    const isLocalImage =
      cleanImage.startsWith("file:") ||
      cleanImage.startsWith("content:") ||
      cleanImage.startsWith("data:");

    if (
      cleanImage &&
      !isRemoteImage &&
      !isLocalImage
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

    onSave({
      title: cleanTitle,
      subtitle: cleanSubtitle,
      image: cleanImage,
      minutes: parsedMinutes,
      tags,
      notes: cleanNotes,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
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
              onPress={onClose}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </Pressable>

            <Text style={styles.headerTitle}>
              {isEditMode
                ? "Edit Recipe"
                : "Add Recipe"}
            </Text>

            <Pressable
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

              {image && !imageFailed ? (
                <Image
                  source={{ uri: image }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                  onError={() =>
                    setImageFailed(true)
                  }
                />
              ) : (
                <View
                  style={styles.imagePlaceholder}
                >
                  <Text
                    style={styles.placeholderIcon}
                  >
                    🍽️
                  </Text>

                  <Text
                    style={styles.placeholderText}
                  >
                    {imageFailed
                      ? "Image could not be displayed"
                      : "No image selected"}
                  </Text>
                </View>
              )}

              <View style={styles.imageActions}>
                <Pressable
                  onPress={pickImageFromGallery}
                  style={({ pressed }) => [
                    styles.galleryButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={styles.galleryButtonText}
                  >
                    Choose from Gallery
                  </Text>
                </Pressable>

                {image ? (
                  <Pressable
                    onPress={removeImage}
                    style={({ pressed }) => [
                      styles.removeImageButton,
                      pressed && styles.pressed,
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
              value={image.startsWith("http") ? image : ""}
              onChangeText={setImage}
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
                  value.replace(/[^0-9]/g, "")
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
            />

            <FormField
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Write preparation notes..."
              multiline
            />

            <Pressable
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.submitButtonText}>
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
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "800",
  },

  headerButton: {
    minWidth: 64,
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
    minHeight: 120,
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
    transform: [{ scale: 0.98 }],
  },
});