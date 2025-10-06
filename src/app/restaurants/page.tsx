import React from 'react';
import { Box, Container, Typography, Divider } from '@mui/material';

import RestaurantList from '@/app/restaurants/restaurant-list';
import CreateReservationForm from '@/app/reservations/create-reservation';

export default function UserDashboardPage() {
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Buscar y Reservar
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center">
          Encuentra tu mesa perfecta
        </Typography>
      </Box>
      
      {/* Sección de Listado de Restaurantes (El cliente ve la lista y selecciona) */}
      <Box sx={{ my: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom>Restaurantes Disponibles</Typography>
        <RestaurantList />
      </Box>

      {/* Sección de Creación de Reserva (Asumo que el cliente elige el restaurante de la lista) */}
      <Divider sx={{ my: 4 }} />
      <Box sx={{ mb: 6, p: 3, border: '1px solid #eee', borderRadius: 2 }}>
        <Typography variant="h4" component="h2" gutterBottom>Realizar Nueva Reserva</Typography>
        <CreateReservationForm />
      </Box>
    </Container>
  );
}