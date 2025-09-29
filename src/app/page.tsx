import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import CreateUserForm from './users/create-user';
import UserList from './users/user-list';
import CreateRestaurantForm from './restaurants/create-restaurant';
import RestaurantList from './restaurants/restaurant-list';
import CreateReservationForm from './reservations/create-reservation';

export default function HomePage() {
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom align="center">
          Gestión de Reservas
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <CreateUserForm />
        <UserList />
        <Box sx={{ mt: 8 }}>
          <CreateRestaurantForm />
        </Box>
        <RestaurantList />
        <Box sx={{ mt: 8 }}>
          <CreateReservationForm />
        </Box>
      </Box>
    </Container>
  );
}