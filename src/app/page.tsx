"use client";

import { useEffect } from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import UserFormSwitcher from "./users/user-form-switcher";

export default function HomePage() {
  const isMobile = useMediaQuery("(max-width:600px)");
  const router = useRouter();
  const { isLoggedIn, userRole, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (isLoggedIn) {
      if (userRole === "ADMIN") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/users/pages");
      }
    }
  }, [isLoggedIn, userRole, loading, router]);

  if (loading || isLoggedIn) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#121212",
        color: "white",
        px: 2,
        py: isMobile ? 2 : 4,
      }}
    >
      <Typography
        variant={isMobile ? "h4" : "h3"}
        gutterBottom
        sx={{ textAlign: "center", mb: isMobile ? 2 : 4 }}
      >
        Bienvenido a MesaSegura
      </Typography>

      <Box sx={{ width: "100%", maxWidth: isMobile ? 300 : 400 }}>
        <UserFormSwitcher />
      </Box>
    </Box>
  );
}
