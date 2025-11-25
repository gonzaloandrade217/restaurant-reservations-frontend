'use client';

import { Box, Typography, useMediaQuery } from "@mui/material";
import UserFormSwitcher from "./users/user-form-switcher";

export default function HomePage() {
  const isMobile = useMediaQuery("(max-width:600px)");

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
        py: isMobile ? 2 : 4, // menos padding vertical en móviles
      }}
    >
      <Typography 
        variant={isMobile ? "h4" : "h3"} // título más pequeño en móviles
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
