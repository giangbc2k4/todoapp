// storage/authStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export interface StoredUser {
  email: string;
  displayName?: string;
}

// Vẫn giữ mấy hàm cũ cho đỡ vỡ code nếu chỗ nào còn dùng
export async function saveToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error("Failed to save token", error);
  }
}

export async function getToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error("Failed to load token", error);
    return null;
  }
}

export async function removeToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error("Failed to remove token", error);
  }
}

// ==== NEW: lưu user ====
export async function saveUser(user: StoredUser): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Failed to save user", error);
  }
}

export async function getUser(): Promise<StoredUser | null> {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch (error) {
    console.error("Failed to load user", error);
    return null;
  }
}

export async function clearAuth(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  } catch (error) {
    console.error("Failed to clear auth", error);
  }
}
