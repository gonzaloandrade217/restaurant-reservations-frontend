"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Role = 'USER' | 'ADMIN';

interface AuthContextType {
  isLoggedIn: boolean;
  userRole: Role | null;
  login: (token: string, role: Role) => void; 
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedRole = localStorage.getItem('userRole') as Role;

    if (storedToken && storedRole) {
      setToken(storedToken);
      setRole(storedRole);
    }
  }, []);

  const login = (authToken: string, userRole: Role) => {
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('userRole', userRole);
    setToken(authToken);
    setRole(userRole);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!token, userRole: role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};