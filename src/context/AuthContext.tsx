"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Role = "USER" | "ADMIN";

interface AuthContextType {
  isLoggedIn: boolean;
  userRole: Role | null;
  token: string | null;
  userId: string | null;
  login: (token: string, role: Role, userId: string) => void;
  logout: () => void;
  loading: boolean;
  // Helper: devuelve los headers JSON+Auth listos para fetch
  authHeaders: () => { "Content-Type": string; Authorization: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedToken = localStorage.getItem("authToken");
    const storedRole = localStorage.getItem("userRole") as Role | null;
    const storedUserId = localStorage.getItem("userId");
    if (storedToken && storedRole) {
      setToken(storedToken);
      setRole(storedRole);
      setUserId(storedUserId);
    }
    setLoading(false);
  }, []);

  const login = (authToken: string, userRole: Role, id: string) => {
    localStorage.setItem("authToken", authToken);
    localStorage.setItem("userRole", userRole);
    localStorage.setItem("userId", id);
    setToken(authToken);
    setRole(userRole);
    setUserId(id);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    setToken(null);
    setRole(null);
    setUserId(null);
  };

  const authHeaders = () => {
    if (!token) return null;
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!token, userRole: role, token, userId, login, logout, loading, authHeaders }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};