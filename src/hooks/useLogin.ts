"use client";

import { useRouter } from "next/navigation";
import { useAuth, Role } from "../context/AuthContext";

export const useLoginHandler = () => {
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (access_token: string, userRole: Role, userId: string) => {
    localStorage.setItem("authToken", access_token);
    localStorage.setItem("userRole", userRole);
    localStorage.setItem("userId", userId);

    login(access_token, userRole);

    if (userRole === "ADMIN") router.push("/admin/dashboard");
    else router.push("/users/dashboard");
  };

  return { handleLogin };
};
