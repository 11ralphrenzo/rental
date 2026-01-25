import { Admin } from "@/models/admin";
import {
  getEncryptedItem,
  removeItem,
  setEncryptedItem,
} from "./local/secured-local-storage";

const KEY = "user_session";

export const saveAdmin = (admin: Admin) => {
  setEncryptedItem(KEY, JSON.stringify(admin));
};

export function getAdmin<T>() {
  const raw = getEncryptedItem<T>(KEY);
  return raw ? (JSON.parse(String(raw)) as Admin) : null;
}

export const clearAdmin = () => {
  removeItem(KEY);
};
