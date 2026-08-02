import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@recipe_collection";

export async function saveRecipes(recipes) {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(recipes)
    );
  } catch (error) {
    console.error("Failed to save recipes:", error);
  }
}

export async function loadRecipes() {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);

    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error("Failed to load recipes:", error);
    return null;
  }
}