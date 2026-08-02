import AsyncStorage from "@react-native-async-storage/async-storage";

const PROFILE_STORAGE_KEY = "@meal_collection_profile";

export const DEFAULT_PROFILE = {
  name: "Recipe User",
  email: "",
  bio: "Food and recipe enthusiast",
  image: "",
};

export async function loadProfile() {
  try {
    const storedProfile = await AsyncStorage.getItem(
      PROFILE_STORAGE_KEY
    );

    if (!storedProfile) {
      return DEFAULT_PROFILE;
    }

    return {
      ...DEFAULT_PROFILE,
      ...JSON.parse(storedProfile),
    };
  } catch (error) {
    console.error("Failed to load profile:", error);
    return DEFAULT_PROFILE;
  }
}

export async function saveProfile(profile) {
  try {
    await AsyncStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify(profile)
    );

    return true;
  } catch (error) {
    console.error("Failed to save profile:", error);
    return false;
  }
}

export async function resetProfile() {
  try {
    await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
    return DEFAULT_PROFILE;
  } catch (error) {
    console.error("Failed to reset profile:", error);
    return DEFAULT_PROFILE;
  }
}