import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";

import HomeScreen from "../screens/HomeScreen";
import FavouritesScreen from "../screens/FavouritesScreen";
import MyRecipesScreen from "../screens/MyRecipesScreen";
import ProfileScreen from "../screens/ProfileScreen";

import {
  colors,
  fontSize,
} from "../constants/theme";

const Tab = createBottomTabNavigator();

function TabIcon({ icon, focused }) {
  return (
    <Text
      style={{
        fontSize: fontSize.lg,
        opacity: focused ? 1 : 0.5,
      }}
    >
      {icon}
    </Text>
  );
}

export default function UserTabNavigator({
  items = [],
  onAdd = () => {},
  onEdit = () => {},
  onDelete = () => {},
  onOpenDetails = () => {},
  onToggleFavourite = () => {},
}) {
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
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,

        tabBarStyle: {
          height: 68,
          paddingTop: 6,
          paddingBottom: 8,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="⌂" focused={focused} />
          ),
        }}
      >
        {() => <HomeScreen {...sharedProps} />}
      </Tab.Screen>

      <Tab.Screen
        name="Favourites"
        options={{
          title: "Favourites",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="★" focused={focused} />
          ),
        }}
      >
        {() => (
          <FavouritesScreen {...sharedProps} />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="MyRecipes"
        options={{
          title: "My Recipes",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="▤" focused={focused} />
          ),
        }}
      >
        {() => (
          <MyRecipesScreen {...sharedProps} />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="●" focused={focused} />
          ),
        }}
      >
        {() => <ProfileScreen items={items} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}