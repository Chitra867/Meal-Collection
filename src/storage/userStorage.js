import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

const USERS_STORAGE_KEY =
  "meal_collection_registered_users";

function normalizeUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function removePrivateFields(user) {
  if (!user) {
    return null;
  }

  const {
    passwordHash,
    passwordSalt,
    ...safeUser
  } = user;

  return safeUser;
}

async function readUsers() {
  try {
    const storedUsers =
      await AsyncStorage.getItem(
        USERS_STORAGE_KEY
      );

    if (!storedUsers) {
      return [];
    }

    const parsedUsers =
      JSON.parse(storedUsers);

    return Array.isArray(parsedUsers)
      ? parsedUsers
      : [];
  } catch (error) {
    console.error(
      "Failed to read registered users:",
      error
    );

    return [];
  }
}

async function writeUsers(users) {
  await AsyncStorage.setItem(
    USERS_STORAGE_KEY,
    JSON.stringify(users)
  );
}

async function createPasswordSalt() {
  const randomBytes =
    await Crypto.getRandomBytesAsync(16);

  return Array.from(randomBytes)
    .map((byte) =>
      byte
        .toString(16)
        .padStart(2, "0")
    )
    .join("");
}

async function createPasswordHash(
  password,
  salt
) {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${password}`
  );
}

export async function registerUserAccount({
  fullName,
  email,
  phone,
  username,
  password,
}) {
  try {
    const cleanFullName =
      String(fullName || "").trim();

    const cleanEmail =
      normalizeEmail(email);

    const cleanPhone =
      String(phone || "").trim();

    const cleanUsername =
      normalizeUsername(username);

    const users = await readUsers();

    const usernameExists =
      users.some(
        (user) =>
          normalizeUsername(
            user.username
          ) === cleanUsername
      );

    if (usernameExists) {
      return {
        success: false,
        field: "username",
        message:
          "This username is already registered.",
      };
    }

    const emailExists = users.some(
      (user) =>
        normalizeEmail(user.email) ===
        cleanEmail
    );

    if (emailExists) {
      return {
        success: false,
        field: "email",
        message:
          "This email address is already registered.",
      };
    }

    const passwordSalt =
      await createPasswordSalt();

    const passwordHash =
      await createPasswordHash(
        password,
        passwordSalt
      );

    const newUser = {
      id: Crypto.randomUUID(),
      fullName: cleanFullName,
      email: cleanEmail,
      phone: cleanPhone,
      username: cleanUsername,
      passwordHash,
      passwordSalt,
      role: "user",
      isActive: true,
      createdAt:
        new Date().toISOString(),
    };

    await writeUsers([
      ...users,
      newUser,
    ]);

    return {
      success: true,
      user: removePrivateFields(
        newUser
      ),
    };
  } catch (error) {
    console.error(
      "Failed to register user:",
      error
    );

    return {
      success: false,
      message:
        "The account could not be created.",
    };
  }
}

export async function authenticateRegisteredUser(
  identifier,
  password
) {
  try {
    const cleanIdentifier =
      String(identifier || "")
        .trim()
        .toLowerCase();

    const users = await readUsers();

    const matchedUser =
      users.find((user) => {
        return (
          normalizeUsername(
            user.username
          ) === cleanIdentifier ||
          normalizeEmail(user.email) ===
            cleanIdentifier
        );
      });

    if (!matchedUser) {
      return {
        success: false,
        message:
          "The username or password is incorrect.",
      };
    }

    if (
      matchedUser.isActive === false
    ) {
      return {
        success: false,
        message:
          "This account has been disabled.",
      };
    }

    const enteredPasswordHash =
      await createPasswordHash(
        password,
        matchedUser.passwordSalt
      );

    if (
      enteredPasswordHash !==
      matchedUser.passwordHash
    ) {
      return {
        success: false,
        message:
          "The username or password is incorrect.",
      };
    }

    return {
      success: true,
      user: removePrivateFields(
        matchedUser
      ),
    };
  } catch (error) {
    console.error(
      "Failed to authenticate user:",
      error
    );

    return {
      success: false,
      message:
        "The account could not be authenticated.",
    };
  }
}

export async function getRegisteredUsers() {
  const users = await readUsers();

  return users.map(removePrivateFields);
}