"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  clearToken,
  clearUser,
  getToken,
  getUser,
  saveToken,
  saveUser,
} from "../services/local-storage";
import { AuthUser } from "@/models/auth";
import { auth } from "@/lib/firebaseClient";
import { onIdTokenChanged, signOut } from "firebase/auth";

interface AuthContextType {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const token = getToken();
    const storedUser = getUser<AuthUser>();

    if (token && storedUser) {
      setAccessToken(token);
      setUser(storedUser);
    }

    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const newToken = await firebaseUser.getIdToken();
        setAccessToken(newToken);
        saveToken(newToken);

        const currentUser = getUser<AuthUser>();
        if (currentUser) {
          // Normal token refresh — update the token in the stored user
          const updatedUser = { ...currentUser, accessToken: newToken };
          setUser(updatedUser);
          saveUser(updatedUser);
        } else {
          // localStorage was cleared but Firebase session persists via IndexedDB.
          // Reconstruct user from the Firebase auth object.
          const restoredUser: AuthUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email || "Admin",
            accessToken: newToken,
            type: "1",
          };
          setUser(restoredUser);
          saveUser(restoredUser);
        }
      } else {
        // Firebase user signed out — clear everything
        setAccessToken(null);
        setUser(null);
        clearToken();
        clearUser();
      }
    });

    return () => unsubscribe();
  }, []);

  const login = (token: string, newUser: AuthUser) => {
    setAccessToken(token);
    setUser(newUser);
    saveToken(token);
    saveUser(newUser);
  };

  const logout = async () => {
    setAccessToken(null);
    setUser(null);
    clearUser();
    clearToken();
    // Also sign out from Firebase to clear IndexedDB session
    await signOut(auth).catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        isAuthenticated: !!accessToken && !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
