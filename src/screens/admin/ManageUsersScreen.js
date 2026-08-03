import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  deleteRegisteredUser,
  getRegisteredUsers,
  updateRegisteredUserStatus,
} from "../../storage/userStorage";

import {
  useTheme,
} from "../../contexts/ThemeContext";

import {
  fixed,
  fontSize,
  radius,
  shadow,
  spacing,
} from "../../constants/theme";

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleDateString();
}

export default function ManageUsersScreen() {
  const {
    colors,
    isDark,
  } = useTheme();

  const styles = useMemo(
    () => createStyles(colors, isDark),
    [colors, isDark]
  );

  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const loadUsers = useCallback(
    async (refreshing = false) => {
      try {
        if (refreshing) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const registeredUsers =
          await getRegisteredUsers();

        const sortedUsers = [
          ...registeredUsers,
        ].sort((first, second) => {
          return (
            new Date(second.createdAt || 0) -
            new Date(first.createdAt || 0)
          );
        });

        setUsers(sortedUsers);
      } catch (error) {
        console.error(
          "Failed to load users:",
          error
        );

        Alert.alert(
          "Users unavailable",
          "Registered users could not be loaded."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      void loadUsers();
    }, [loadUsers])
  );

  const filteredUsers = useMemo(() => {
    const search = searchText
      .trim()
      .toLowerCase();

    if (!search) {
      return users;
    }

    return users.filter((user) => {
      const searchableText = [
        user.fullName,
        user.name,
        user.username,
        user.email,
        user.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search);
    });
  }, [users, searchText]);

  const handleStatusChange = (user) => {
    const newStatus = !user.isActive;

    Alert.alert(
      newStatus
        ? "Activate user"
        : "Deactivate user",
      newStatus
        ? `Activate "${user.fullName}"?`
        : `Deactivate "${user.fullName}"? This user will not be able to log in.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: newStatus
            ? "Activate"
            : "Deactivate",

          style: newStatus
            ? "default"
            : "destructive",

          onPress: async () => {
            const result =
              await updateRegisteredUserStatus(
                user.id,
                newStatus
              );

            if (!result.success) {
              Alert.alert(
                "Update failed",
                result.message
              );

              return;
            }

            setUsers((currentUsers) =>
              currentUsers.map((item) =>
                item.id === user.id
                  ? {
                      ...item,
                      isActive: newStatus,
                    }
                  : item
              )
            );
          },
        },
      ]
    );
  };

  const handleDelete = (user) => {
    Alert.alert(
      "Delete user",
      `Permanently delete "${user.fullName}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",

          onPress: async () => {
            const result =
              await deleteRegisteredUser(
                user.id
              );

            if (!result.success) {
              Alert.alert(
                "Delete failed",
                result.message
              );

              return;
            }

            setUsers((currentUsers) =>
              currentUsers.filter(
                (item) =>
                  item.id !== user.id
              )
            );
          },
        },
      ]
    );
  };

  const renderUser = ({ item }) => {
    const active =
      item.isActive !== false;

    return (
      <View style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {String(
                item.fullName ||
                  item.username ||
                  "U"
              )
                .trim()
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>

          <View style={styles.userIdentity}>
            <Text
              style={styles.userName}
              numberOfLines={1}
            >
              {item.fullName ||
                item.name ||
                "Unnamed user"}
            </Text>

            <Text
              style={styles.username}
              numberOfLines={1}
            >
              @{item.username}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              active
                ? styles.activeBadge
                : styles.inactiveBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                active
                  ? styles.activeText
                  : styles.inactiveText,
              ]}
            >
              {active
                ? "Active"
                : "Inactive"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Ionicons
            name="mail-outline"
            size={17}
            color={colors.textMuted}
          />

          <Text
            style={styles.detailText}
            numberOfLines={1}
          >
            {item.email ||
              "No email address"}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons
            name="call-outline"
            size={17}
            color={colors.textMuted}
          />

          <Text style={styles.detailText}>
            {item.phone ||
              "No phone number"}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons
            name="calendar-outline"
            size={17}
            color={colors.textMuted}
          />

          <Text style={styles.detailText}>
            Registered{" "}
            {formatDate(item.createdAt)}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() =>
              handleStatusChange(item)
            }
            style={({ pressed }) => [
              styles.actionButton,
              active
                ? styles.deactivateButton
                : styles.activateButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name={
                active
                  ? "pause-circle-outline"
                  : "checkmark-circle-outline"
              }
              size={18}
              color={
                active
                  ? colors.favourite
                  : "#16a34a"
              }
            />

            <Text
              style={[
                styles.actionText,
                {
                  color: active
                    ? colors.favourite
                    : "#16a34a",
                },
              ]}
            >
              {active
                ? "Deactivate"
                : "Activate"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              handleDelete(item)
            }
            style={({ pressed }) => [
              styles.actionButton,
              styles.deleteButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={colors.danger}
            />

            <Text
              style={[
                styles.actionText,
                {
                  color: colors.danger,
                },
              ]}
            >
              Delete
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right"]}
    >
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={renderUser}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() =>
              loadUsers(true)
            }
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>
                  Manage Users
                </Text>

                <Text
                  style={styles.subtitle}
                >
                  {users.length} registered{" "}
                  {users.length === 1
                    ? "user"
                    : "users"}
                </Text>
              </View>

              <View style={styles.headerIcon}>
                <Ionicons
                  name="people"
                  size={25}
                  color="#ffffff"
                />
              </View>
            </View>

            <View
              style={styles.searchContainer}
            >
              <Ionicons
                name="search-outline"
                size={20}
                color={colors.textMuted}
              />

              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search name, username or email"
                placeholderTextColor={
                  colors.textFaint
                }
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.searchInput}
              />

              {searchText ? (
                <Pressable
                  onPress={() =>
                    setSearchText("")
                  }
                  hitSlop={10}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.textMuted}
                  />
                </Pressable>
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View
              style={styles.loadingContainer}
            >
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="people-outline"
                  size={34}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.emptyTitle}>
                No users found
              </Text>

              <Text style={styles.emptyText}>
                Registered users will appear
                here.
              </Text>
            </View>
          )
        }
      />
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
      backgroundColor: colors.bg,
    },

    listContent: {
      flexGrow: 1,
      padding: spacing.lg,
      paddingBottom: 110,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.lg,
    },

    title: {
      color: colors.text,
      fontSize: fontSize.xl,
      fontWeight: "900",
    },

    subtitle: {
      marginTop: spacing.xs,
      color: colors.textMuted,
      fontSize: fontSize.sm,
    },

    headerIcon: {
      width: 50,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: 16,
    },

    searchContainer: {
      minHeight: 50,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.lg,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surface,
      borderWidth: fixed.hairline,
      borderColor: colors.border,
      borderRadius: radius.lg,
    },

    searchInput: {
      flex: 1,
      marginHorizontal: spacing.sm,
      color: colors.text,
      fontSize: fontSize.sm,
    },

    userCard: {
      marginBottom: spacing.md,
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderWidth: fixed.hairline,
      borderColor: colors.border,
      borderRadius: radius.lg,
      ...shadow(1),
    },

    userHeader: {
      flexDirection: "row",
      alignItems: "center",
    },

    avatar: {
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: 24,
    },

    avatarText: {
      color: "#ffffff",
      fontSize: fontSize.lg,
      fontWeight: "900",
    },

    userIdentity: {
      flex: 1,
      marginLeft: spacing.md,
    },

    userName: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: "900",
    },

    username: {
      marginTop: 2,
      color: colors.textMuted,
      fontSize: fontSize.sm,
    },

    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
    },

    activeBadge: {
      backgroundColor: isDark
        ? "#123822"
        : "#dcfce7",
    },

    inactiveBadge: {
      backgroundColor: isDark
        ? "#3b1d25"
        : "#fee2e2",
    },

    statusText: {
      fontSize: fontSize.xs,
      fontWeight: "900",
    },

    activeText: {
      color: "#16a34a",
    },

    inactiveText: {
      color: colors.danger,
    },

    divider: {
      height: fixed.hairline,
      marginVertical: spacing.md,
      backgroundColor: colors.border,
    },

    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.sm,
    },

    detailText: {
      flex: 1,
      marginLeft: spacing.sm,
      color: colors.textMuted,
      fontSize: fontSize.sm,
    },

    actions: {
      flexDirection: "row",
      marginTop: spacing.md,
    },

    actionButton: {
      flex: 1,
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: fixed.hairline,
      borderRadius: radius.md,
    },

    deactivateButton: {
      marginRight: spacing.sm,
      backgroundColor: isDark
        ? "#382f16"
        : "#fffbeb",
      borderColor: colors.favourite,
    },

    activateButton: {
      marginRight: spacing.sm,
      backgroundColor: isDark
        ? "#123822"
        : "#f0fdf4",
      borderColor: "#16a34a",
    },

    deleteButton: {
      backgroundColor: isDark
        ? "#3b1d25"
        : "#fff1f2",
      borderColor: colors.danger,
    },

    actionText: {
      marginLeft: spacing.xs,
      fontSize: fontSize.sm,
      fontWeight: "800",
    },

    loadingContainer: {
      alignItems: "center",
      paddingTop: spacing.xxl,
    },

    emptyContainer: {
      alignItems: "center",
      paddingTop: spacing.xxl,
    },

    emptyIcon: {
      width: 68,
      height: 68,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
      borderRadius: 34,
    },

    emptyTitle: {
      marginTop: spacing.md,
      color: colors.text,
      fontSize: fontSize.lg,
      fontWeight: "900",
    },

    emptyText: {
      marginTop: spacing.sm,
      color: colors.textMuted,
      fontSize: fontSize.sm,
      textAlign: "center",
    },

    pressed: {
      opacity: 0.68,
      transform: [{ scale: 0.98 }],
    },
  });
}