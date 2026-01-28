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
    const user = getUser<AuthUser>();

    if (token && user) {
      saveToken(token);
      saveUser(user);
    }
    // setIsLoading(false);
  }, []);

  const login = (token: string, user: AuthUser) => {
    setAccessToken(token);
    setUser(user);
    saveToken(token);
    saveUser(user);
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    clearUser();
    clearToken();
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        isAuthenticated: !!accessToken,
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
