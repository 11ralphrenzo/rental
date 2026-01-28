"use client";

import { createContext, useContext, useState, useEffect, use } from "react";
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
    const storedUser = getUser<AuthUser>();

    if (token && storedUser) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setAccessToken(token);
      setUser(storedUser);
    }
    // setIsLoading(false);
  }, []);

  const login = (token: string, newUser: AuthUser) => {
    setAccessToken(token);
    setUser(newUser);
    saveToken(token);
    saveUser(newUser);
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
