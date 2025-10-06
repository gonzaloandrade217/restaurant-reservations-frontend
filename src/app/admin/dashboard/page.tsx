"use client";

import React from "react";
import { Box, Container, Typography, Divider } from "@mui/material";

import UserFormSwitcher from "../../users/user-form-switcher";
import UserList from "../../users/user-list";
import CreateRestaurantForm from "../../restaurants/create-restaurant";
import RestaurantList from "../../restaurants/restaurant-list";

export default function AdminDashboardPage() {
  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 6, textAlign: "center" }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Panel de Administración
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Gestión de Usuarios y Restaurantes
        </Typography>
      </Box>

      <Box sx={{ mb: 6, p: 3, border: "1px solid #ccc", borderRadius: 2 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Gestión de Restaurantes
        </Typography>
        <CreateRestaurantForm />
        <Divider sx={{ my: 3 }} />
        <RestaurantList />
      </Box>

      <Box sx={{ mb: 6, p: 3, border: "1px solid #ccc", borderRadius: 2 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Gestión de Usuarios
        </Typography>
        <UserFormSwitcher />
        <Divider sx={{ my: 3 }} />
        <UserList />
      </Box>
    </Container>
  );
}
