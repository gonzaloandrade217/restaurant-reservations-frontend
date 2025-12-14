"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Role = "USER" | "ADMIN";

interface AuthContextType {
  isLoggedIn: boolean;
  userRole: Role | null;
  token: string | null;
  login: (token: string, role: Role) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedRole = localStorage.getItem("userRole") as Role | null;

    if (storedToken && storedRole) {
      setToken(storedToken);
      setRole(storedRole);
    }

    setLoading(false);
  }, []);

  const login = (authToken: string, userRole: Role) => {
    localStorage.setItem("authToken", authToken);
    localStorage.setItem("userRole", userRole);

    window.dispatchEvent(new Event("authTokenUpdated"));

    setToken(authToken);
    setRole(userRole);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");

    window.dispatchEvent(new Event("authTokenUpdated"));

    setToken(null);
    setRole(null);
  };

  if (loading) {
    return null; 
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        userRole: role,
        token,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
