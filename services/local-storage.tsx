import { Admin } from "@/models/admin";
import {
  getEncryptedItem,
  removeItem,
  setEncryptedItem,
} from "./local/secured-local-storage";
import { AuthUser } from "@/models/auth";

const KEY = "user_session";
const ACCESS_KEY = "user_token";

export const saveUser = (user: Admin | AuthUser) => {
  setEncryptedItem(KEY, JSON.stringify(user));
};

export function getUser<T>() {
  const raw = getEncryptedItem<T>(KEY);
  return raw ? (JSON.parse(String(raw)) as T) : null;
}

export const clearUser = () => removeItem(KEY);

// Access Token

export const saveToken = (token: string) => setEncryptedItem(ACCESS_KEY, token);

export const getToken = () => getEncryptedItem<string>(ACCESS_KEY);

export const clearToken = () => removeItem(ACCESS_KEY);
