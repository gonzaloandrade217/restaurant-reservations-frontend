'use client';

import React, { useState } from "react";
import { Box, Container, Typography, Divider } from "@mui/material";

import UserList from "../../users/user-list";
import CreateRestaurantForm from "../../restaurants/create-restaurant";
import RestaurantList from "../../restaurants/restaurant-list";
import AdminReservationsList from "../admin-reservations-list";

export default function AdminDashboardPage() {
  const [refreshRestaurants, setRefreshRestaurants] = useState(0);
  const [refreshUsers, setRefreshUsers] = useState(0);
  const [refreshReservations, setRefreshReservations] = useState(0);

  const handleReservationUpdated = () => {
    setRefreshReservations(prev => prev + 1);
  };

  const handleRestaurantCreated = () => {
    setRefreshRestaurants(prev => prev + 1);
  };

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
        <CreateRestaurantForm onCreated={handleRestaurantCreated} />
        <Divider sx={{ my: 3 }} />
        <RestaurantList refresh={refreshRestaurants} />
      </Box>

      <Box sx={{ mb: 6, p: 3, border: "1px solid #ccc", borderRadius: 2 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Gestión de Usuarios
        </Typography>
        <Divider sx={{ my: 3 }} />
        <UserList refresh={refreshUsers}/>
      </Box>
      <Box sx={{ mb: 6, p: 3, border: "1px solid #ccc", borderRadius: 2 }}>
        <Typography variant="h4" component="h2" gutterBottom>
        </Typography>
        <AdminReservationsList refresh={refreshReservations}/>
      </Box>
    </Container>
  );
}
