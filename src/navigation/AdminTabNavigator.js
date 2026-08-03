import {
  StyleSheet,
} from "react-native";

import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import {
  Ionicons,
} from "@expo/vector-icons";

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

const Tab =
  createBottomTabNavigator();

export default function AdminTabNavigator() {
  const { colors } = useTheme();

  const styles = createStyles(colors);

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
          let iconName =
            "ellipse-outline";

          if (
            route.name ===
            "AdminDashboard"
          ) {
            iconName = focused
              ? "grid"
              : "grid-outline";
          }

          if (
            route.name ===
            "ManageUsers"
          ) {
            iconName = focused
              ? "people"
              : "people-outline";
          }

          if (
            route.name ===
            "ManageRecipes"
          ) {
            iconName = focused
              ? "restaurant"
              : "restaurant-outline";
          }

          if (
            route.name ===
            "AdminStatistics"
          ) {
            iconName = focused
              ? "bar-chart"
              : "bar-chart-outline";
          }

          if (
            route.name ===
            "AdminProfile"
          ) {
            iconName = focused
              ? "person-circle"
              : "person-circle-outline";
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={
          AdminDashboardScreen
        }
        options={{
          title: "Dashboard",
        }}
      />

      <Tab.Screen
        name="ManageUsers"
        component={
          ManageUsersScreen
        }
        options={{
          title: "Users",
        }}
      />

      <Tab.Screen
        name="ManageRecipes"
        component={
          ManageRecipesScreen
        }
        options={{
          title: "Recipes",
        }}
      />

      <Tab.Screen
        name="AdminStatistics"
        component={
          AdminStatisticsScreen
        }
        options={{
          title: "Statistics",
        }}
      />

      <Tab.Screen
        name="AdminProfile"
        component={
          AdminProfileScreen
        }
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

      backgroundColor:
        colors.surface,

      borderTopWidth:
        fixed.hairline,

      borderTopColor:
        colors.border,

      elevation: 12,
    },

    tabBarLabel: {
      fontSize: 10,
      fontWeight: "800",
    },
  });
}