"use client";

import { Box, Typography } from "@mui/material";
import UserFormSwitcher from "./users/user-form-switcher";

export default function HomePage() {
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
      }}
    >
      <Typography variant="h3" gutterBottom>
        Bienvenido al Sistema de Reservas
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Por favor, inicia sesión o regístrate
      </Typography>

      <Box sx={{ mt: 4, width: "100%", maxWidth: 400 }}>
        <UserFormSwitcher />
      </Box>
    </Box>
  );
}
