"use client";

import React from "react";
import { Box, Typography } from "@mui/material";

export default function UsersDashboardPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        backgroundColor: "#121212",
        color: "white",
      }}
    >
      <Typography variant="h3" gutterBottom>
        Dashboard de Usuario
      </Typography>
      <Typography variant="h6">
        Bienvenido al sistema de reservas.
      </Typography>
    </Box>
  );
}
