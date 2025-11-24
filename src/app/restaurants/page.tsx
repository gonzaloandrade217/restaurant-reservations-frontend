"use client";

import { useState } from "react";
import { Box, Container, Typography, Divider } from "@mui/material";

import RestaurantList from "@/app/restaurants/restaurant-list";
import CreateRestaurantForm from "@/app/restaurants/create-restaurant";
import CreateReservationForm from "@/app/reservations/create-reservation";

export default function UserDashboardPage() {
  // Cuando este valor cambia, el listado se recarga
  const [refresh, setRefresh] = useState(0);

  const triggerRefresh = () => setRefresh((prev) => prev + 1);

  return (
    <Container>
      {/* HEADER */}
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Buscar y Reservar
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center">
          Encuentra tu mesa perfecta
        </Typography>
      </Box>

      {/* LISTADO DE RESTAURANTES */}
      <Box sx={{ my: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Restaurantes Disponibles
        </Typography>

        {/* Pasamos refresh */}
        <RestaurantList refresh={refresh} />
      </Box>

      {/* FORMULARIO DE CREACIÓN DE RESTAURANTE (ADMIN) */}
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6, p: 3, border: "1px solid #eee", borderRadius: 2 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Registrar Nuevo Restaurante
        </Typography>

        {/* Disparamos refresh al crear */}
        <CreateRestaurantForm onCreated={triggerRefresh} />
      </Box>

      {/* FORMULARIO DE RESERVAS */}
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6, p: 3, border: "1px solid #eee", borderRadius: 2 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Realizar Nueva Reserva
        </Typography>

        {/* También puede refrescar si querés actualizar después de crear reserva */}
        <CreateReservationForm onCreated={triggerRefresh} />
      </Box>
    </Container>
  );
}
