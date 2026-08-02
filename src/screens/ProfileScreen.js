import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  shadow,
  spacing,
} from "../constants/theme";

import {
  DEFAULT_PROFILE,
  loadProfile,
  resetProfile,
  saveProfile,
} from "../storage/profileStorage";

function getInitials(name) {
  const initials = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "U";
}

function StatCard({ value, label }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "sentences",
  multiline = false,
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        style={[
          styles.input,
          multiline && styles.multilineInput,
        ]}
      />
    </View>
  );
}

export default function ProfileScreen({
  items = [],
}) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [draftProfile, setDraftProfile] =
    useState(DEFAULT_PROFILE);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function initializeProfile() {
      const savedProfile = await loadProfile();

      if (mounted) {
        setProfile(savedProfile);
        setDraftProfile(savedProfile);
        setIsLoading(false);
      }
    }

    initializeProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const statistics = useMemo(() => {
    const favouriteCount = items.filter(
      (item) => item.favourite
    ).length;

    const myRecipeCount = items.filter(
      (item) => item.source === "mine"
    ).length;

    return {
      total: items.length,
      favourites: favouriteCount,
      mine: myRecipeCount,
    };
  }, [items]);

  const openEditModal = () => {
    setDraftProfile(profile);
    setError("");
    setModalVisible(true);
  };

  const closeEditModal = () => {
    if (isSaving) {
      return;
    }

    setDraftProfile(profile);
    setError("");
    setModalVisible(false);
  };

  const updateDraft = (field, value) => {
    setDraftProfile((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const pickProfileImage = async () => {
    try {
      setError("");

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setError(
          "Gallery permission is required to choose a profile image."
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
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

      updateDraft("image", selectedImage.uri);
    } catch (pickerError) {
      console.error(
        "Failed to select profile image:",
        pickerError
      );

      setError(
        "Something went wrong while selecting the image."
      );
    }
  };

  const handleSave = async () => {
    const cleanName = draftProfile.name.trim();
    const cleanEmail = draftProfile.email.trim();
    const cleanBio = draftProfile.bio.trim();

    if (!cleanName) {
      setError("Name is required.");
      return;
    }

    if (
      cleanEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      setError("Enter a valid email address.");
      return;
    }

    const updatedProfile = {
      name: cleanName,
      email: cleanEmail,
      bio: cleanBio,
      image: draftProfile.image || "",
    };

    try {
      setIsSaving(true);
      setError("");

      const saved = await saveProfile(updatedProfile);

      if (!saved) {
        setError("The profile could not be saved.");
        return;
      }

      setProfile(updatedProfile);
      setDraftProfile(updatedProfile);
      setModalVisible(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetProfile = () => {
    Alert.alert(
      "Reset profile",
      "Reset your profile information to the default values?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            const defaultProfile = await resetProfile();

            setProfile(defaultProfile);
            setDraftProfile(defaultProfile);
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.pageContent}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              Profile
            </Text>

            <Text style={styles.subtitle}>
              Manage your personal information
            </Text>
          </View>

          <Pressable
            onPress={openEditModal}
            style={({ pressed }) => [
              styles.editProfileButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.editProfileButtonText}>
              Edit
            </Text>
          </Pressable>
        </View>

        <View style={styles.profileCard}>
          {profile.image ? (
            <Image
              source={{ uri: profile.image }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(profile.name)}
              </Text>
            </View>
          )}

          <Text style={styles.userName}>
            {profile.name}
          </Text>

          {profile.email ? (
            <Text style={styles.userEmail}>
              {profile.email}
            </Text>
          ) : null}

          <Text style={styles.userDescription}>
            {profile.bio || "No profile description added."}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Collection summary
        </Text>

        <View style={styles.statistics}>
          <StatCard
            value={statistics.total}
            label="Total recipes"
          />

          <StatCard
            value={statistics.favourites}
            label="Favourites"
          />

          <StatCard
            value={statistics.mine}
            label="My recipes"
          />
        </View>

        <View style={styles.informationCard}>
          <Text style={styles.informationTitle}>
            Account information
          </Text>

          <View style={styles.informationRow}>
            <Text style={styles.informationLabel}>
              Name
            </Text>

            <Text style={styles.informationValue}>
              {profile.name}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.informationRow}>
            <Text style={styles.informationLabel}>
              Email
            </Text>

            <Text style={styles.informationValue}>
              {profile.email || "Not provided"}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleResetProfile}
          style={({ pressed }) => [
            styles.resetButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.resetButtonText}>
            Reset Profile
          </Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeEditModal}
      >
        <SafeAreaView
          style={styles.modalSafeArea}
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
            <View style={styles.modalHeader}>
              <Pressable
                onPress={closeEditModal}
                disabled={isSaving}
                style={styles.modalHeaderButton}
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </Pressable>

              <Text style={styles.modalTitle}>
                Edit Profile
              </Text>

              <Pressable
                onPress={handleSave}
                disabled={isSaving}
                style={styles.modalHeaderButton}
              >
                <Text style={styles.saveText}>
                  {isSaving ? "Saving..." : "Save"}
                </Text>
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formContent}
            >
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>
                    {error}
                  </Text>
                </View>
              ) : null}

              <View style={styles.avatarEditor}>
                {draftProfile.image ? (
                  <Image
                    source={{ uri: draftProfile.image }}
                    style={styles.editProfileImage}
                  />
                ) : (
                  <View style={styles.editAvatar}>
                    <Text style={styles.avatarText}>
                      {getInitials(draftProfile.name)}
                    </Text>
                  </View>
                )}

                <Pressable
                  onPress={pickProfileImage}
                  style={({ pressed }) => [
                    styles.chooseImageButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.chooseImageButtonText}>
                    Choose Profile Image
                  </Text>
                </Pressable>

                {draftProfile.image ? (
                  <Pressable
                    onPress={() =>
                      updateDraft("image", "")
                    }
                    style={styles.removeImageButton}
                  >
                    <Text style={styles.removeImageText}>
                      Remove Image
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              <FormField
                label="Full name"
                value={draftProfile.name}
                onChangeText={(value) =>
                  updateDraft("name", value)
                }
                placeholder="Enter your full name"
              />

              <FormField
                label="Email address"
                value={draftProfile.email}
                onChangeText={(value) =>
                  updateDraft("email", value)
                }
                placeholder="example@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <FormField
                label="Bio"
                value={draftProfile.bio}
                onChangeText={(value) =>
                  updateDraft("bio", value)
                }
                placeholder="Tell us about yourself"
                multiline
              />

              <Pressable
                onPress={handleSave}
                disabled={isSaving}
                style={({ pressed }) => [
                  styles.saveButton,
                  isSaving && styles.disabledButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving
                    ? "Saving Profile..."
                    : "Save Profile"}
                </Text>
              </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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

  pageContent: {
    paddingBottom: spacing.xxl,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
  },

  title: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: "800",
  },

  subtitle: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },

  editProfileButton: {
    minHeight: fixed.minTouch,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },

  editProfileButtonText: {
    color: colors.surface,
    fontSize: fontSize.sm,
    fontWeight: "800",
  },

  profileCard: {
    alignItems: "center",
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadow(1),
  },

  avatar: {
    width: 88,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: 44,
  },

  profileImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.border,
  },

  avatarText: {
    color: colors.surface,
    fontSize: fontSize.xxl,
    fontWeight: "900",
  },

  userName: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "800",
  },

  userEmail: {
    marginTop: spacing.xs,
    color: colors.primary,
    fontSize: fontSize.sm,
  },

  userDescription: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: "center",
  },

  sectionTitle: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "800",
  },

  statistics: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },

  statCard: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: spacing.xs,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    ...shadow(1),
  },

  statNumber: {
    color: colors.primary,
    fontSize: fontSize.xl,
    fontWeight: "900",
  },

  statLabel: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: "center",
  },

  informationCard: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },

  informationTitle: {
    marginBottom: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "800",
  },

  informationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },

  informationLabel: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },

  informationValue: {
    flex: 1,
    marginLeft: spacing.md,
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: "700",
    textAlign: "right",
  },

  divider: {
    height: fixed.hairline,
    backgroundColor: colors.border,
  },

  resetButton: {
    minHeight: fixed.minTouch,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: spacing.lg,
    backgroundColor: "#fee2e2",
    borderRadius: radius.md,
  },

  resetButtonText: {
    color: colors.danger,
    fontSize: fontSize.sm,
    fontWeight: "800",
  },

  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  keyboardView: {
    flex: 1,
  },

  modalHeader: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: fixed.hairline,
    borderBottomColor: colors.border,
  },

  modalHeaderButton: {
    minWidth: 72,
    minHeight: fixed.minTouch,
    alignItems: "center",
    justifyContent: "center",
  },

  modalTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "800",
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

  avatarEditor: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },

  editAvatar: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: 50,
  },

  editProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.border,
  },

  chooseImageButton: {
    minHeight: fixed.minTouch,
    justifyContent: "center",
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },

  chooseImageButtonText: {
    color: colors.surface,
    fontSize: fontSize.sm,
    fontWeight: "800",
  },

  removeImageButton: {
    padding: spacing.sm,
  },

  removeImageText: {
    color: colors.danger,
    fontSize: fontSize.sm,
    fontWeight: "700",
  },

  field: {
    marginBottom: spacing.lg,
  },

  fieldLabel: {
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
    minHeight: 110,
  },

  saveButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },

  saveButtonText: {
    color: colors.surface,
    fontSize: fontSize.md,
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.55,
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});