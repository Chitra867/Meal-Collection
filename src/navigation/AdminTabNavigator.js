import {
  useMemo,
} from "react";

import {
  StyleSheet,
} from "react-native";

import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import { Ionicons } from "@expo/vector-icons";

import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import ManageUsersScreen from "../screens/admin/ManageUsersScreen";
import ManageRecipesScreen from "../screens/admin/ManageRecipesScreen";
import AdminStatisticsScreen from "../screens/admin/AdminStatisticsScreen";
import AdminProfileScreen from "../screens/admin/AdminProfileScreen";

import {
  fixed,
} from "../constants/theme";

import {
  useTheme,
} from "../contexts/ThemeContext";

const Tab = createBottomTabNavigator();

export default function AdminTabNavigator({
  items = [],
  onDeleteRecipe = () => {},
}) {
  const { colors } = useTheme();

  const styles = useMemo(
    () => createStyles(colors),
    [colors]
  );

  return (
    <Tab.Navigator
      initialRouteName="AdminDashboard"
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
          focused,
          color,
          size,
        }) => {
          const icons = {
            AdminDashboard: focused
              ? "grid"
              : "grid-outline",

            ManageUsers: focused
              ? "people"
              : "people-outline",

            ManageRecipes: focused
              ? "restaurant"
              : "restaurant-outline",

            AdminStatistics: focused
              ? "bar-chart"
              : "bar-chart-outline",

            AdminProfile: focused
              ? "person-circle"
              : "person-circle-outline",
          };

          return (
            <Ionicons
              name={
                icons[route.name] ||
                "ellipse-outline"
              }
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="AdminDashboard"
        options={{
          title: "Dashboard",
        }}
      >
        {() => (
          <AdminDashboardScreen
            items={items}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="ManageUsers"
        component={ManageUsersScreen}
        options={{
          title: "Users",
        }}
      />

      <Tab.Screen
        name="ManageRecipes"
        options={{
          title: "Recipes",
        }}
      >
        {() => (
          <ManageRecipesScreen
            items={items}
            onDeleteRecipe={
              onDeleteRecipe
            }
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="AdminStatistics"
        options={{
          title: "Statistics",
        }}
      >
        {() => (
          <AdminStatisticsScreen
            items={items}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="AdminProfile"
        component={AdminProfileScreen}
        options={{
          title: "Profile",
        }}
      />
    </Tab.Navigator>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    tabBar: {
      height: 72,
      paddingTop: 7,
      paddingBottom: 8,
      backgroundColor: colors.surface,
      borderTopWidth: fixed.hairline,
      borderTopColor: colors.border,
      elevation: 12,
    },

    tabBarLabel: {
      fontSize: 10,
      fontWeight: "800",
    },
  });
}