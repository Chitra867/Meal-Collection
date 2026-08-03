import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import * as SecureStore from "expo-secure-store";

const AuthContext = createContext(null);

const SESSION_KEY =
  "meal_collection_authenticated_user";

/*
  Temporary development accounts.

  Replace this local validation with a backend API
  before publishing the application.
*/
const DEMO_ACCOUNTS = [
  {
    id: "user-1",
    name: "Recipe User",
    email: "user@mealcollection.app",
    password: "User@123",
    role: "user",
  },
  {
    id: "admin-1",
    name: "Meal Collection Admin",
    email: "admin@mealcollection.app",
    password: "Admin@123",
    role: "admin",
  },
];

function createSessionUser(account) {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
  };
}

export function AuthProvider({
  children,
}) {
  const [user, setUser] = useState(null);

  const [
    isAuthLoading,
    setIsAuthLoading,
  ] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const storedUser =
          await SecureStore.getItemAsync(
            SESSION_KEY
          );

        if (!storedUser || !mounted) {
          return;
        }

        const parsedUser =
          JSON.parse(storedUser);

        if (
          parsedUser?.id &&
          parsedUser?.role
        ) {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error(
          "Failed to restore login session:",
          error
        );

        await SecureStore.deleteItemAsync(
          SESSION_KEY
        );
      } finally {
        if (mounted) {
          setIsAuthLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(
    async ({
      email,
      password,
      role,
    }) => {
      const normalizedEmail = String(
        email || ""
      )
        .trim()
        .toLowerCase();

      const normalizedPassword =
        String(password || "");

      if (!normalizedEmail) {
        return {
          success: false,
          message:
            "Email address is required.",
        };
      }

      if (!normalizedPassword) {
        return {
          success: false,
          message: "Password is required.",
        };
      }

      const account =
        DEMO_ACCOUNTS.find(
          (item) =>
            item.email.toLowerCase() ===
              normalizedEmail &&
            item.password ===
              normalizedPassword
        );

      if (!account) {
        return {
          success: false,
          message:
            "The email or password is incorrect.",
        };
      }

      if (account.role !== role) {
        return {
          success: false,
          message:
            role === "admin"
              ? "This account is not an administrator account."
              : "This account is not a user account.",
        };
      }

      const sessionUser =
        createSessionUser(account);

      try {
        await SecureStore.setItemAsync(
          SESSION_KEY,
          JSON.stringify(sessionUser)
        );

        setUser(sessionUser);

        return {
          success: true,
          user: sessionUser,
        };
      } catch (error) {
        console.error(
          "Failed to create login session:",
          error
        );

        return {
          success: false,
          message:
            "The login session could not be created.",
        };
      }
    },
    []
  );

  const signOut = useCallback(
    async () => {
      try {
        await SecureStore.deleteItemAsync(
          SESSION_KEY
        );
      } catch (error) {
        console.error(
          "Failed to clear login session:",
          error
        );
      } finally {
        setUser(null);
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAuthLoading,
      signIn,
      signOut,
    }),
    [
      user,
      isAuthLoading,
      signIn,
      signOut,
    ]
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}