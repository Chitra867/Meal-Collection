import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import * as SecureStore from "expo-secure-store";

import {
  authenticateRegisteredUser,
  registerUserAccount,
} from "../storage/userStorage";

const AuthContext =
  createContext(undefined);

const SESSION_KEY =
  "meal_collection_authenticated_user";

const ADMIN_ACCOUNT = {
  id: "admin-1",
  fullName:
    "Meal Collection Admin",
  name: "Meal Collection Admin",
  email:
    "admin@mealcollection.app",
  username: "admin",
  password: "Admin@123",
  role: "admin",
};

function createSessionUser(account) {
  return {
    id: account.id,

    fullName:
      account.fullName ||
      account.name ||
      "",

    name:
      account.fullName ||
      account.name ||
      "",

    email:
      account.email || "",

    username:
      account.username || "",

    role: account.role,
  };
}

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [
    isAuthLoading,
    setIsAuthLoading,
  ] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const storedSession =
          await SecureStore.getItemAsync(
            SESSION_KEY
          );

        if (
          !mounted ||
          !storedSession
        ) {
          return;
        }

        const parsedSession =
          JSON.parse(storedSession);

        if (
          parsedSession?.id &&
          parsedSession?.role
        ) {
          setUser(parsedSession);
        } else {
          await SecureStore.deleteItemAsync(
            SESSION_KEY
          );
        }
      } catch (error) {
        console.error(
          "Failed to restore login session:",
          error
        );

        try {
          await SecureStore.deleteItemAsync(
            SESSION_KEY
          );
        } catch (
          deleteError
        ) {
          console.error(
            "Failed to clear invalid session:",
            deleteError
          );
        }
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

  const saveSession =
    useCallback(
      async (account) => {
        const sessionUser =
          createSessionUser(account);

        await SecureStore.setItemAsync(
          SESSION_KEY,
          JSON.stringify(
            sessionUser
          )
        );

        setUser(sessionUser);

        return sessionUser;
      },
      []
    );

  const signIn = useCallback(
    async ({
      identifier,
      password,
      role = "user",
    }) => {
      const cleanIdentifier =
        String(identifier || "")
          .trim()
          .toLowerCase();

      const cleanPassword =
        String(password || "");

      if (!cleanIdentifier) {
        return {
          success: false,
          message:
            "Username is required.",
        };
      }

      if (!cleanPassword) {
        return {
          success: false,
          message:
            "Password is required.",
        };
      }

      try {
        if (role === "admin") {
          const validIdentifier =
            cleanIdentifier ===
              ADMIN_ACCOUNT.username ||
            cleanIdentifier ===
              ADMIN_ACCOUNT.email;

          const validPassword =
            cleanPassword ===
            ADMIN_ACCOUNT.password;

          if (
            !validIdentifier ||
            !validPassword
          ) {
            return {
              success: false,
              message:
                "The admin username or password is incorrect.",
            };
          }

          const sessionUser =
            await saveSession(
              ADMIN_ACCOUNT
            );

          return {
            success: true,
            user: sessionUser,
          };
        }

        const result =
          await authenticateRegisteredUser(
            cleanIdentifier,
            cleanPassword
          );

        if (!result.success) {
          return result;
        }

        const sessionUser =
          await saveSession(
            result.user
          );

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
    [saveSession]
  );

  const register =
    useCallback(
      async (formData) => {
        return registerUserAccount(
          formData
        );
      },
      []
    );

  const signOut =
    useCallback(async () => {
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
    }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated:
        Boolean(user),
      isAuthLoading,
      signIn,
      register,
      signOut,
    }),
    [
      user,
      isAuthLoading,
      signIn,
      register,
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