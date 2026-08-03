import {
  useEffect,
  useMemo,
  useState,
} from "react";

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

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  fixed,
  fontSize,
  radius,
  shadow,
  spacing,
} from "../constants/theme";

import {
  useTheme,
} from "../contexts/ThemeContext";

import {
  useAuth,
} from "../contexts/AuthContext";

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
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");

  return initials || "U";
}

function StatCard({
  value,
  label,
  icon,
  styles,
  colors,
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons
          name={icon}
          size={20}
          color={colors.primary}
        />
      </View>

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
  styles,
  colors,
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
        placeholderTextColor={
          colors.textFaint
        }
        keyboardType={keyboardType}
        autoCapitalize={
          autoCapitalize
        }
        autoCorrect={false}
        multiline={multiline}
        textAlignVertical={
          multiline
            ? "top"
            : "center"
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

export default function ProfileScreen({
  items = [],
}) {
  const {
    colors,
    isDark,
  } = useTheme();

  const {
    user,
    signOut,
  } = useAuth();

  const styles = useMemo(
    () =>
      createStyles(
        colors,
        isDark
      ),
    [colors, isDark]
  );

  const [profile, setProfile] =
    useState(DEFAULT_PROFILE);

  const [
    draftProfile,
    setDraftProfile,
  ] = useState(DEFAULT_PROFILE);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);

  const [
    modalVisible,
    setModalVisible,
  ] = useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function initializeProfile() {
      try {
        const savedProfile =
          await loadProfile();

        if (!mounted) {
          return;
        }

        const normalizedProfile = {
          ...savedProfile,

          name:
            savedProfile?.name ||
            user?.name ||
            DEFAULT_PROFILE.name,

          email:
            savedProfile?.email ||
            user?.email ||
            "",
        };

        setProfile(
          normalizedProfile
        );

        setDraftProfile(
          normalizedProfile
        );
      } catch (loadError) {
        console.error(
          "Failed to initialize profile:",
          loadError
        );

        if (mounted) {
          setProfile(
            DEFAULT_PROFILE
          );

          setDraftProfile(
            DEFAULT_PROFILE
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void initializeProfile();

    return () => {
      mounted = false;
    };
  }, [user]);

  const statistics = useMemo(() => {
    const safeItems =
      Array.isArray(items)
        ? items
        : [];

    const favouriteCount =
      safeItems.filter(
        (item) =>
          Boolean(item?.favourite)
      ).length;

    const myRecipeCount =
      safeItems.filter(
        (item) =>
          item?.source === "mine"
      ).length;

    return {
      total: safeItems.length,
      favourites:
        favouriteCount,
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

  const updateDraft = (
    field,
    value
  ) => {
    setDraftProfile(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  };

  const pickProfileImage =
    async () => {
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
          await ImagePicker.launchImageLibraryAsync(
            {
              mediaTypes: [
                "images",
              ],

              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            }
          );

        if (result.canceled) {
          return;
        }

        const selectedImage =
          result.assets?.[0];

        if (
          !selectedImage?.uri
        ) {
          setError(
            "The selected image could not be loaded."
          );

          return;
        }

        updateDraft(
          "image",
          selectedImage.uri
        );
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
    const cleanName =
      String(
        draftProfile.name || ""
      ).trim();

    const cleanEmail =
      String(
        draftProfile.email || ""
      ).trim();

    const cleanBio =
      String(
        draftProfile.bio || ""
      ).trim();

    if (!cleanName) {
      setError(
        "Name is required."
      );

      return;
    }

    if (
      cleanEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {
      setError(
        "Enter a valid email address."
      );

      return;
    }

    const updatedProfile = {
      name: cleanName,
      email: cleanEmail,
      bio: cleanBio,

      image:
        draftProfile.image ||
        "",
    };

    try {
      setIsSaving(true);
      setError("");

      const saved =
        await saveProfile(
          updatedProfile
        );

      if (!saved) {
        setError(
          "The profile could not be saved."
        );

        return;
      }

      setProfile(updatedProfile);
      setDraftProfile(
        updatedProfile
      );

      setModalVisible(false);
    } catch (saveError) {
      console.error(
        "Failed to save profile:",
        saveError
      );

      setError(
        "The profile could not be saved."
      );
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
            const defaultProfile =
              await resetProfile();

            const restoredProfile =
              {
                ...defaultProfile,

                name:
                  user?.name ||
                  defaultProfile.name,

                email:
                  user?.email ||
                  defaultProfile.email,
              };

            setProfile(
              restoredProfile
            );

            setDraftProfile(
              restoredProfile
            );
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Sign out",
      "Are you sure you want to sign out of your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign out",
          style: "destructive",

          onPress: async () => {
            try {
              setIsLoggingOut(
                true
              );

              await signOut();
            } catch (
              logoutError
            ) {
              console.error(
                "Failed to sign out:",
                logoutError
              );

              Alert.alert(
                "Sign out failed",
                "Your account could not be signed out."
              );
            } finally {
              setIsLoggingOut(
                false
              );
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={
          styles.loadingContainer
        }
      >
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
          styles.pageContent
        }
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              Profile
            </Text>

            <Text
              style={styles.subtitle}
            >
              Manage your account and personal information
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            onPress={openEditModal}
            style={({ pressed }) => [
              styles.editProfileButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="create-outline"
              size={17}
              color="#ffffff"
            />

            <Text
              style={
                styles.editProfileButtonText
              }
            >
              Edit
            </Text>
          </Pressable>
        </View>

        <View
          style={styles.profileCard}
        >
          <View
            style={
              styles.avatarContainer
            }
          >
            {profile.image ? (
              <Image
                source={{
                  uri: profile.image,
                }}
                style={
                  styles.profileImage
                }
              />
            ) : (
              <View
                style={styles.avatar}
              >
                <Text
                  style={
                    styles.avatarText
                  }
                >
                  {getInitials(
                    profile.name
                  )}
                </Text>
              </View>
            )}

            <View
              style={
                styles.activeBadge
              }
            />
          </View>

          <Text
            style={styles.userName}
          >
            {profile.name}
          </Text>

          <Text
            style={styles.userEmail}
          >
            {profile.email ||
              user?.email ||
              "No email provided"}
          </Text>

          <View
            style={styles.roleBadge}
          >
            <Ionicons
              name="person-outline"
              size={14}
              color={colors.primary}
            />

            <Text
              style={
                styles.roleBadgeText
              }
            >
              Recipe User
            </Text>
          </View>

          <Text
            style={
              styles.userDescription
            }
          >
            {profile.bio ||
              "No profile description added."}
          </Text>
        </View>

        <Text
          style={styles.sectionTitle}
        >
          Collection summary
        </Text>

        <View
          style={styles.statistics}
        >
          <StatCard
            value={
              statistics.total
            }
            label="Total"
            icon="restaurant-outline"
            styles={styles}
            colors={colors}
          />

          <StatCard
            value={
              statistics.favourites
            }
            label="Favourites"
            icon="heart-outline"
            styles={styles}
            colors={colors}
          />

          <StatCard
            value={
              statistics.mine
            }
            label="My recipes"
            icon="book-outline"
            styles={styles}
            colors={colors}
          />
        </View>

        <Text
          style={styles.sectionTitle}
        >
          Account
        </Text>

        <View
          style={
            styles.informationCard
          }
        >
          <View
            style={
              styles.informationHeader
            }
          >
            <View
              style={
                styles.informationIcon
              }
            >
              <Ionicons
                name="person-circle-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <Text
              style={
                styles.informationTitle
              }
            >
              Account information
            </Text>
          </View>

          <View
            style={
              styles.informationRow
            }
          >
            <Text
              style={
                styles.informationLabel
              }
            >
              Name
            </Text>

            <Text
              style={
                styles.informationValue
              }
            >
              {profile.name}
            </Text>
          </View>

          <View
            style={styles.divider}
          />

          <View
            style={
              styles.informationRow
            }
          >
            <Text
              style={
                styles.informationLabel
              }
            >
              Email
            </Text>

            <Text
              style={
                styles.informationValue
              }
              numberOfLines={1}
            >
              {profile.email ||
                user?.email ||
                "Not provided"}
            </Text>
          </View>

          <View
            style={styles.divider}
          />

          <View
            style={
              styles.informationRow
            }
          >
            <Text
              style={
                styles.informationLabel
              }
            >
              Role
            </Text>

            <Text
              style={
                styles.informationValue
              }
            >
              User
            </Text>
          </View>
        </View>

        <View
          style={styles.actionSection}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reset profile"
            onPress={
              handleResetProfile
            }
            style={({ pressed }) => [
              styles.resetButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="refresh-outline"
              size={19}
              color={colors.danger}
            />

            <Text
              style={
                styles.resetButtonText
              }
            >
              Reset Profile
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            disabled={isLoggingOut}
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,

              isLoggingOut &&
                styles.disabledButton,

              pressed &&
                styles.pressed,
            ]}
          >
            {isLoggingOut ? (
              <ActivityIndicator
                size="small"
                color="#ffffff"
              />
            ) : (
              <>
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color="#ffffff"
                />

                <Text
                  style={
                    styles.logoutButtonText
                  }
                >
                  Sign out
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={
          closeEditModal
        }
      >
        <SafeAreaView
          style={
            styles.modalSafeArea
          }
          edges={[
            "top",
            "bottom",
          ]}
        >
          <KeyboardAvoidingView
            style={
              styles.keyboardView
            }
            behavior={
              Platform.OS === "ios"
                ? "padding"
                : "height"
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <Pressable
                onPress={
                  closeEditModal
                }
                disabled={isSaving}
                style={
                  styles.modalHeaderButton
                }
              >
                <Text
                  style={
                    styles.cancelText
                  }
                >
                  Cancel
                </Text>
              </Pressable>

              <Text
                style={
                  styles.modalTitle
                }
              >
                Edit Profile
              </Text>

              <Pressable
                onPress={handleSave}
                disabled={isSaving}
                style={
                  styles.modalHeaderButton
                }
              >
                <Text
                  style={
                    styles.saveText
                  }
                >
                  {isSaving
                    ? "Saving..."
                    : "Save"}
                </Text>
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.formContent
              }
            >
              {error ? (
                <View
                  style={
                    styles.errorBox
                  }
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={20}
                    color={
                      colors.danger
                    }
                  />

                  <Text
                    style={
                      styles.errorText
                    }
                  >
                    {error}
                  </Text>
                </View>
              ) : null}

              <View
                style={
                  styles.avatarEditor
                }
              >
                {draftProfile.image ? (
                  <Image
                    source={{
                      uri:
                        draftProfile.image,
                    }}
                    style={
                      styles.editProfileImage
                    }
                  />
                ) : (
                  <View
                    style={
                      styles.editAvatar
                    }
                  >
                    <Text
                      style={
                        styles.avatarText
                      }
                    >
                      {getInitials(
                        draftProfile.name
                      )}
                    </Text>
                  </View>
                )}

                <Pressable
                  onPress={
                    pickProfileImage
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.chooseImageButton,

                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="images-outline"
                    size={18}
                    color="#ffffff"
                  />

                  <Text
                    style={
                      styles.chooseImageButtonText
                    }
                  >
                    Choose Image
                  </Text>
                </Pressable>

                {draftProfile.image ? (
                  <Pressable
                    onPress={() =>
                      updateDraft(
                        "image",
                        ""
                      )
                    }
                    style={
                      styles.removeImageButton
                    }
                  >
                    <Text
                      style={
                        styles.removeImageText
                      }
                    >
                      Remove Image
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              <FormField
                label="Full name"
                value={
                  draftProfile.name
                }
                onChangeText={(
                  value
                ) =>
                  updateDraft(
                    "name",
                    value
                  )
                }
                placeholder="Enter your full name"
                styles={styles}
                colors={colors}
              />

              <FormField
                label="Email address"
                value={
                  draftProfile.email
                }
                onChangeText={(
                  value
                ) =>
                  updateDraft(
                    "email",
                    value
                  )
                }
                placeholder="example@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                styles={styles}
                colors={colors}
              />

              <FormField
                label="Bio"
                value={
                  draftProfile.bio
                }
                onChangeText={(
                  value
                ) =>
                  updateDraft(
                    "bio",
                    value
                  )
                }
                placeholder="Tell us about yourself"
                multiline
                styles={styles}
                colors={colors}
              />

              <Pressable
                onPress={handleSave}
                disabled={isSaving}
                style={({
                  pressed,
                }) => [
                  styles.saveButton,

                  isSaving &&
                    styles.disabledButton,

                  pressed &&
                    styles.pressed,
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator
                    size="small"
                    color="#ffffff"
                  />
                ) : (
                  <Text
                    style={
                      styles.saveButtonText
                    }
                  >
                    Save Profile
                  </Text>
                )}
              </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
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
      backgroundColor:
        colors.bg,
    },

    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.bg,
    },

    pageContent: {
      paddingBottom: 110,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      padding: spacing.lg,
    },

    headerText: {
      flex: 1,
      marginRight: spacing.md,
    },

    title: {
      color: colors.text,
      fontSize: fontSize.xxl,
      fontWeight: "900",
    },

    subtitle: {
      marginTop: spacing.xs,
      color:
        colors.textMuted,
      fontSize: fontSize.sm,
    },

    editProfileButton: {
      minHeight:
        fixed.minTouch,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      paddingHorizontal:
        spacing.md,

      backgroundColor:
        colors.primary,

      borderRadius:
        radius.pill,
    },

    editProfileButtonText: {
      marginLeft: spacing.xs,
      color: "#ffffff",
      fontSize: fontSize.sm,
      fontWeight: "800",
    },

    profileCard: {
      alignItems: "center",
      marginHorizontal:
        spacing.lg,

      padding: spacing.xl,

      backgroundColor:
        colors.surface,

      borderWidth:
        fixed.hairline,

      borderColor:
        colors.border,

      borderRadius:
        radius.lg,

      ...shadow(1),
    },

    avatarContainer: {
      position: "relative",
    },

    avatar: {
      width: 92,
      height: 92,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        colors.primary,

      borderRadius: 46,
    },

    profileImage: {
      width: 92,
      height: 92,

      backgroundColor:
        colors.border,

      borderRadius: 46,
    },

    activeBadge: {
      position: "absolute",
      right: 3,
      bottom: 3,

      width: 20,
      height: 20,

      backgroundColor:
        "#22c55e",

      borderWidth: 3,

      borderColor:
        colors.surface,

      borderRadius: 10,
    },

    avatarText: {
      color: "#ffffff",
      fontSize:
        fontSize.xxl,
      fontWeight: "900",
    },

    userName: {
      marginTop: spacing.md,
      color: colors.text,
      fontSize: fontSize.lg,
      fontWeight: "900",
    },

    userEmail: {
      marginTop: spacing.xs,
      color:
        colors.textMuted,
      fontSize: fontSize.sm,
    },

    roleBadge: {
      flexDirection: "row",
      alignItems: "center",

      marginTop: spacing.md,

      paddingHorizontal:
        spacing.md,

      paddingVertical:
        spacing.xs,

      backgroundColor:
        colors.primarySoft,

      borderRadius:
        radius.pill,
    },

    roleBadgeText: {
      marginLeft: spacing.xs,
      color:
        colors.primary,

      fontSize:
        fontSize.xs,

      fontWeight: "800",
    },

    userDescription: {
      marginTop: spacing.md,
      color:
        colors.textMuted,

      fontSize:
        fontSize.sm,

      textAlign: "center",
    },

    sectionTitle: {
      marginTop: spacing.xl,

      marginHorizontal:
        spacing.lg,

      color: colors.text,

      fontSize:
        fontSize.lg,

      fontWeight: "900",
    },

    statistics: {
      flexDirection: "row",

      marginTop:
        spacing.md,

      paddingHorizontal:
        spacing.md,
    },

    statCard: {
      flex: 1,

      alignItems: "center",

      marginHorizontal:
        spacing.xs,

      paddingVertical:
        spacing.md,

      paddingHorizontal:
        spacing.xs,

      backgroundColor:
        colors.surface,

      borderWidth:
        fixed.hairline,

      borderColor:
        colors.border,

      borderRadius:
        radius.md,
    },

    statIcon: {
      width: 38,
      height: 38,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        colors.primarySoft,

      borderRadius: 19,
    },

    statNumber: {
      marginTop: spacing.sm,

      color:
        colors.primary,

      fontSize:
        fontSize.xl,

      fontWeight: "900",
    },

    statLabel: {
      marginTop: spacing.xs,

      color:
        colors.textMuted,

      fontSize:
        fontSize.xs,

      textAlign: "center",
    },

    informationCard: {
      margin:
        spacing.lg,

      padding:
        spacing.lg,

      backgroundColor:
        colors.surface,

      borderWidth:
        fixed.hairline,

      borderColor:
        colors.border,

      borderRadius:
        radius.lg,
    },

    informationHeader: {
      flexDirection: "row",
      alignItems: "center",

      marginBottom:
        spacing.md,
    },

    informationIcon: {
      width: 42,
      height: 42,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        colors.primarySoft,

      borderRadius: 14,
    },

    informationTitle: {
      marginLeft:
        spacing.md,

      color: colors.text,

      fontSize:
        fontSize.md,

      fontWeight: "900",
    },

    informationRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",

      paddingVertical:
        spacing.md,
    },

    informationLabel: {
      color:
        colors.textMuted,

      fontSize:
        fontSize.sm,
    },

    informationValue: {
      flex: 1,

      marginLeft:
        spacing.md,

      color: colors.text,

      fontSize:
        fontSize.sm,

      fontWeight: "700",

      textAlign: "right",
    },

    divider: {
      height:
        fixed.hairline,

      backgroundColor:
        colors.border,
    },

    actionSection: {
      paddingHorizontal:
        spacing.lg,
    },

    resetButton: {
      minHeight: 52,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        isDark
          ? "#3b1d25"
          : "#fff1f2",

      borderWidth:
        fixed.hairline,

      borderColor:
        colors.danger,

      borderRadius:
        radius.md,
    },

    resetButtonText: {
      marginLeft:
        spacing.sm,

      color:
        colors.danger,

      fontSize:
        fontSize.sm,

      fontWeight: "800",
    },

    logoutButton: {
      minHeight: 54,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      marginTop:
        spacing.md,

      backgroundColor:
        colors.danger,

      borderRadius:
        radius.md,
    },

    logoutButtonText: {
      marginLeft:
        spacing.sm,

      color: "#ffffff",

      fontSize:
        fontSize.md,

      fontWeight: "900",
    },

    modalSafeArea: {
      flex: 1,

      backgroundColor:
        colors.bg,
    },

    keyboardView: {
      flex: 1,
    },

    modalHeader: {
      minHeight: 60,

      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",

      paddingHorizontal:
        spacing.md,

      backgroundColor:
        colors.surface,

      borderBottomWidth:
        fixed.hairline,

      borderBottomColor:
        colors.border,
    },

    modalHeaderButton: {
      minWidth: 72,

      minHeight:
        fixed.minTouch,

      alignItems: "center",
      justifyContent: "center",
    },

    modalTitle: {
      color: colors.text,
      fontSize: fontSize.lg,
      fontWeight: "800",
    },

    cancelText: {
      color:
        colors.textMuted,

      fontSize:
        fontSize.sm,

      fontWeight: "700",
    },

    saveText: {
      color:
        colors.primary,

      fontSize:
        fontSize.sm,

      fontWeight: "800",
    },

    formContent: {
      padding: spacing.lg,
      paddingBottom:
        spacing.xxl,
    },

    errorBox: {
      flexDirection: "row",
      alignItems: "center",

      marginBottom:
        spacing.lg,

      padding:
        spacing.md,

      backgroundColor:
        isDark
          ? "#3b1d25"
          : "#fee2e2",

      borderRadius:
        radius.md,
    },

    errorText: {
      flex: 1,

      marginLeft:
        spacing.sm,

      color:
        colors.danger,

      fontSize:
        fontSize.sm,

      fontWeight: "700",
    },

    avatarEditor: {
      alignItems: "center",

      marginBottom:
        spacing.xl,
    },

    editAvatar: {
      width: 100,
      height: 100,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        colors.primary,

      borderRadius: 50,
    },

    editProfileImage: {
      width: 100,
      height: 100,

      backgroundColor:
        colors.border,

      borderRadius: 50,
    },

    chooseImageButton: {
      minHeight:
        fixed.minTouch,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      marginTop:
        spacing.md,

      paddingHorizontal:
        spacing.lg,

      backgroundColor:
        colors.primary,

      borderRadius:
        radius.pill,
    },

    chooseImageButtonText: {
      marginLeft:
        spacing.sm,

      color: "#ffffff",

      fontSize:
        fontSize.sm,

      fontWeight: "800",
    },

    removeImageButton: {
      padding:
        spacing.sm,
    },

    removeImageText: {
      color:
        colors.danger,

      fontSize:
        fontSize.sm,

      fontWeight: "700",
    },

    field: {
      marginBottom:
        spacing.lg,
    },

    fieldLabel: {
      marginBottom:
        spacing.sm,

      color:
        colors.text,

      fontSize:
        fontSize.sm,

      fontWeight: "700",
    },

    input: {
      minHeight:
        fixed.minTouch,

      paddingHorizontal:
        spacing.md,

      paddingVertical:
        spacing.sm,

      color: colors.text,

      fontSize:
        fontSize.md,

      backgroundColor:
        colors.surface,

      borderWidth:
        fixed.hairline,

      borderColor:
        colors.border,

      borderRadius:
        radius.md,
    },

    multilineInput: {
      minHeight: 110,
    },

    saveButton: {
      minHeight: 52,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        colors.primary,

      borderRadius:
        radius.md,
    },

    saveButtonText: {
      color: "#ffffff",

      fontSize:
        fontSize.md,

      fontWeight: "800",
    },

    disabledButton: {
      opacity: 0.55,
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
}