import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";

import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import UserTabNavigator from "./src/navigation/UserTabNavigator";
import RecipeFormModal from "./src/components/RecipeFormModal";
import RecipeDetailsScreen from "./src/screens/RecipeDetailsScreen";
import LoginScreen from "./src/screens/LoginScreen";
import AdminDashboardScreen from "./src/screens/AdminDashboardScreen";
import RegisterScreen from "./src/screens/RegisterScreen";

import SEED_ITEMS from "./src/data/seed";

import {
  loadRecipes,
  saveRecipes,
} from "./src/storage/recipeStorage";

import {
  ThemeProvider,
  useTheme,
} from "./src/contexts/ThemeContext";

import {
  AuthProvider,
  useAuth,
} from "./src/contexts/AuthContext";

const Stack = createNativeStackNavigator();

function createRecipeId() {
  return (
    "recipe-" +
    Date.now() +
    "-" +
    Math.random()
      .toString(36)
      .slice(2, 8)
  );
}

function AppContent() {
  const {
    colors,
    isDark,
  } = useTheme();

  const {
    user,
    isAuthLoading,
  } = useAuth();

  const [items, setItems] = useState([]);
  const [hasLoaded, setHasLoaded] =
    useState(false);

  const [formVisible, setFormVisible] =
    useState(false);

  const [
    editingRecipe,
    setEditingRecipe,
  ] = useState(null);

  const navigationTheme = useMemo(() => {
    const baseTheme = isDark
      ? DarkTheme
      : DefaultTheme;

    return {
      ...baseTheme,

      colors: {
        ...baseTheme.colors,

        primary: colors.primary,
        background: colors.bg,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.favourite,
      },
    };
  }, [colors, isDark]);

  useEffect(() => {
    let isMounted = true;

    async function initializeRecipes() {
      try {
        const savedRecipes =
          await loadRecipes();

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

    void initializeRecipes();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    async function persistRecipes() {
      try {
        await saveRecipes(items);
      } catch (error) {
        console.error(
          "Failed to save recipes:",
          error
        );
      }
    }

    void persistRecipes();
  }, [items, hasLoaded]);

  const handleToggleFavourite =
    useCallback((recipeId) => {
      if (!recipeId) {
        return;
      }

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === recipeId
            ? {
                ...item,
                favourite:
                  !item.favourite,
              }
            : item
        )
      );
    }, []);

  const handleOpenAdd =
    useCallback(() => {
      setEditingRecipe(null);
      setFormVisible(true);
    }, []);

  const handleOpenEdit =
    useCallback((recipe) => {
      if (!recipe) {
        return;
      }

      setEditingRecipe(recipe);
      setFormVisible(true);
    }, []);

  const handleCloseForm =
    useCallback(() => {
      setFormVisible(false);
      setEditingRecipe(null);
    }, []);

  const handleSaveRecipe =
    useCallback(
      (formData) => {
        if (!formData) {
          return;
        }

        const currentDate =
          new Date().toISOString();

        if (editingRecipe) {
          setItems((currentItems) =>
            currentItems.map((item) =>
              item.id ===
              editingRecipe.id
                ? {
                    ...item,
                    ...formData,
                    updatedAt:
                      currentDate,
                  }
                : item
            )
          );
        } else {
          const newRecipe = {
            id: createRecipeId(),
            ...formData,

            source: "mine",
            favourite: false,

            createdAt: currentDate,
            updatedAt: currentDate,
          };

          setItems(
            (currentItems) => [
              newRecipe,
              ...currentItems,
            ]
          );
        }

        handleCloseForm();
      },
      [
        editingRecipe,
        handleCloseForm,
      ]
    );

  const handleDeleteRecipe =
    useCallback((recipeId) => {
      if (!recipeId) {
        return;
      }

      setItems((currentItems) =>
        currentItems.filter(
          (item) =>
            item.id !== recipeId
        )
      );
    }, []);

  if (isAuthLoading || !hasLoaded) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {
            backgroundColor:
              colors.bg,
          },
        ]}
      >
        <StatusBar
          barStyle={
            isDark
              ? "light-content"
              : "dark-content"
          }
          backgroundColor={colors.bg}
        />

        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.app,
        {
          backgroundColor:
            colors.bg,
        },
      ]}
    >
      <StatusBar
        barStyle={
          isDark
            ? "light-content"
            : "dark-content"
        }
        backgroundColor={colors.bg}
      />

      <NavigationContainer
        theme={navigationTheme}
      >
        <Stack.Navigator
  screenOptions={{
    headerShown: false,
    animation: "slide_from_right",

    contentStyle: {
      backgroundColor: colors.bg,
    },
  }}
>
  {!user ? (
    <>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
      />
    </>
  ) : user.role === "admin" ? (
    <Stack.Screen
      name="AdminDashboard"
      component={AdminDashboardScreen}
    />
  ) : (
    <>
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
            onOpenDetails={(recipe) => {
              if (!recipe?.id) {
                return;
              }

              navigation.navigate(
                "RecipeDetails",
                {
                  recipeId: recipe.id,
                }
              );
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="RecipeDetails">
        {({
          navigation,
          route,
        }) => {
          const recipeId =
            route.params?.recipeId;

          const recipe = items.find(
            (item) =>
              item.id === recipeId
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

                handleDeleteRecipe(
                  recipe.id
                );

                navigation.goBack();
              }}
            />
          );
        }}
      </Stack.Screen>
    </>
  )}
</Stack.Navigator>
      </NavigationContainer>

      {user?.role === "user" ? (
        <RecipeFormModal
          visible={formVisible}
          recipe={editingRecipe}
          onClose={handleCloseForm}
          onSave={handleSaveRecipe}
        />
      ) : null}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
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
  },
});