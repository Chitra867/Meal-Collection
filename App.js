import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import UserTabNavigator from "./src/navigation/UserTabNavigator";
import RecipeFormModal from "./src/components/RecipeFormModal";
import RecipeDetailsScreen from "./src/screens/RecipeDetailsScreen";
import SEED_ITEMS from "./src/data/seed";

import {
  loadRecipes,
  saveRecipes,
} from "./src/storage/recipeStorage";

const Stack = createNativeStackNavigator();

export default function App() {
  const [items, setItems] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [formVisible, setFormVisible] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);

  // Load saved recipes when the application starts.
  useEffect(() => {
    let isMounted = true;

    async function initializeRecipes() {
      try {
        const savedRecipes = await loadRecipes();

        if (!isMounted) {
          return;
        }

        setItems(
          Array.isArray(savedRecipes)
            ? savedRecipes
            : SEED_ITEMS
        );
      } catch (error) {
        console.error(
          "Failed to initialize recipes:",
          error
        );

        if (isMounted) {
          setItems(SEED_ITEMS);
        }
      } finally {
        if (isMounted) {
          setHasLoaded(true);
        }
      }
    }

    initializeRecipes();

    return () => {
      isMounted = false;
    };
  }, []);

  // Save recipes whenever the items array changes.
  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    void saveRecipes(items);
  }, [items, hasLoaded]);

  const handleToggleFavourite = (recipeId) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === recipeId
          ? {
              ...item,
              favourite: !item.favourite,
            }
          : item
      )
    );
  };

  const handleOpenAdd = () => {
    setEditingRecipe(null);
    setFormVisible(true);
  };

  const handleOpenEdit = (recipe) => {
    setEditingRecipe(recipe);
    setFormVisible(true);
  };

  const handleCloseForm = () => {
    setFormVisible(false);
    setEditingRecipe(null);
  };

  const handleSaveRecipe = (formData) => {
    if (editingRecipe) {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === editingRecipe.id
            ? {
                ...item,
                ...formData,
              }
            : item
        )
      );
    } else {
      const newRecipe = {
        id: `recipe-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        ...formData,
        source: "mine",
        favourite: false,
      };

      setItems((currentItems) => [
        newRecipe,
        ...currentItems,
      ]);
    }

    handleCloseForm();
  };

  const handleDeleteRecipe = (recipeId) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) => item.id !== recipeId
      )
    );
  };

  if (!hasLoaded) {
    return (
      <SafeAreaProvider style={styles.app}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#f4f5f7"
        />

        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#2563eb"
          />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={styles.app}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f4f5f7"
      />

      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="UserTabs"
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="UserTabs">
            {({ navigation }) => (
              <UserTabNavigator
                items={items}
                onAdd={handleOpenAdd}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteRecipe}
                onToggleFavourite={
                  handleToggleFavourite
                }
                onOpenDetails={(recipe) =>
                  navigation.navigate(
                    "RecipeDetails",
                    {
                      recipeId: recipe.id,
                    }
                  )
                }
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="RecipeDetails">
            {({ navigation, route }) => {
              const recipeId =
                route.params?.recipeId;

              const recipe = items.find(
                (item) => item.id === recipeId
              );

              return (
                <RecipeDetailsScreen
                  recipe={recipe}
                  onBack={() =>
                    navigation.goBack()
                  }
                  onEdit={() => {
                    if (recipe) {
                      handleOpenEdit(recipe);
                    }
                  }}
                  onToggleFavourite={() => {
                    if (recipe) {
                      handleToggleFavourite(
                        recipe.id
                      );
                    }
                  }}
                  onDelete={() => {
                    if (!recipe) {
                      return;
                    }

                    handleDeleteRecipe(recipe.id);
                    navigation.goBack();
                  }}
                />
              );
            }}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>

      <RecipeFormModal
        visible={formVisible}
        recipe={editingRecipe}
        onClose={handleCloseForm}
        onSave={handleSaveRecipe}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f5f7",
  },
});