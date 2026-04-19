"use client";

import { useRouter } from "next/navigation";
import { useAuth, Role } from "../context/AuthContext";

export const useLoginHandler = () => {
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (access_token: string, userRole: Role, userId: string) => {
    login(access_token, userRole, userId);

    if (userRole === "ADMIN") router.push("/admin/dashboard");
    else router.push("/users/pages");
  };

  return { handleLogin };
};