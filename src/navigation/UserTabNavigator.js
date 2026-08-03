import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import FavouritesScreen from "../screens/FavouritesScreen";
import MyRecipesScreen from "../screens/MyRecipesScreen";
import ProfileScreen from "../screens/ProfileScreen";

import {
  fixed,
  fontSize,
} from "../constants/theme";

import {
  useTheme,
} from "../contexts/ThemeContext";

const Tab = createBottomTabNavigator();

function ThemePlaceholderScreen() {
  return null;
}

export default function UserTabNavigator({
  items = [],
  onAdd = () => {},
  onEdit = () => {},
  onDelete = () => {},
  onOpenDetails = () => {},
  onToggleFavourite = () => {},
}) {
  const {
    colors,
    isDark,
    toggleTheme,
  } = useTheme();

  const styles = createStyles(colors);

  const sharedProps = {
    items,
    onAdd,
    onEdit,
    onDelete,
    onOpenDetails,
    onToggleFavourite,
  };

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,

        tabBarActiveTintColor:
          colors.primary,

        tabBarInactiveTintColor:
          colors.textMuted,

        sceneStyle: {
          backgroundColor: colors.bg,
        },

        tabBarStyle: styles.tabBar,

        tabBarLabelStyle:
          styles.tabBarLabel,

        tabBarIcon: ({
          color,
          size,
          focused,
        }) => {
          let iconName =
            "ellipse-outline";

          if (route.name === "Home") {
            iconName = focused
              ? "home"
              : "home-outline";
          }

          if (
            route.name ===
            "Favourites"
          ) {
            iconName = focused
              ? "heart"
              : "heart-outline";
          }

          if (
            route.name ===
            "MyRecipes"
          ) {
            iconName = focused
              ? "restaurant"
              : "restaurant-outline";
          }

          if (
            route.name === "Profile"
          ) {
            iconName = focused
              ? "person"
              : "person-outline";
          }

          if (
            route.name === "Theme"
          ) {
            iconName = isDark
              ? "sunny-outline"
              : "moon-outline";
          }

          return (
            <Ionicons
              name={iconName}
              size={
                route.name === "Theme"
                  ? size + 2
                  : size
              }
              color={
                route.name === "Theme"
                  ? colors.primary
                  : color
              }
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        options={{
          title: "Home",
        }}
      >
        {() => (
          <HomeScreen
            {...sharedProps}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Favourites"
        options={{
          title: "Favourites",
        }}
      >
        {() => (
          <FavouritesScreen
            {...sharedProps}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="MyRecipes"
        options={{
          title: "My Recipes",
        }}
      >
        {() => (
          <MyRecipesScreen
            {...sharedProps}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Profile"
        options={{
          title: "Profile",
        }}
      >
        {() => (
          <ProfileScreen
            items={items}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Theme"
        component={
          ThemePlaceholderScreen
        }
        listeners={{
          tabPress: (event) => {
            event.preventDefault();
            toggleTheme();
          },
        }}
        options={{
          title: isDark
            ? "Light"
            : "Dark",
        }}
      />
    </Tab.Navigator>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    tabBar: {
      height: 70,
      paddingTop: 7,
      paddingBottom: 7,
      backgroundColor: colors.surface,
      borderTopWidth:
        fixed.hairline,
      borderTopColor: colors.border,
      elevation: 14,
      shadowColor: "#000000",
      shadowOffset: {
        width: 0,
        height: -3,
      },
      shadowOpacity: 0.1,
      shadowRadius: 10,
    },

    tabBarLabel: {
      fontSize: 10,
      fontWeight: "800",
    },
  });
}