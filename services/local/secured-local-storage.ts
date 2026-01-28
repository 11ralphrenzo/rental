// lib/secureLocalStorage.ts
import CryptoJS from "crypto-js";

const SECRET_KEY = "YOUR_SECRET_KEY_HERE"; // keep this in .env

export const setEncryptedItem = <T>(key: string, value: T) => {
  const stringValue = JSON.stringify(value);
  const encrypted = CryptoJS.AES.encrypt(stringValue, SECRET_KEY).toString();
  localStorage.setItem(key, encrypted);
};

export const getEncryptedItem = <T>(key: string): T | null => {
  const encrypted = localStorage.getItem(key);
  if (!encrypted) return null;

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted) as T;
  } catch (err) {
    return null;
  }
};

export const removeItem = (key: string) => {
  localStorage.removeItem(key);
};
