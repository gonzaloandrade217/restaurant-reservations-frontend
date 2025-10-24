'use client';

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Container,
} from "@mui/material";

interface Restaurant {
  id: number;
  name: string;
  description: string;
  image?: string;
}

export default function UsersDashboardPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setError(null);

        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No se encontró el token. Iniciá sesión nuevamente.");

        const res = await fetch("http://localhost:4000/restaurants", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Error al obtener restaurantes");
        }

        const data = await res.json();
        setRestaurants(data);
      } catch (err: any) {
        console.error("Error cargando restaurantes:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h6">Cargando restaurantes...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Restaurantes disponibles
      </Typography>

      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
        }}
        gap={3}
      >
        {restaurants.map((restaurant) => (
          <Card key={restaurant.id} sx={{ boxShadow: 3 }}>
            {restaurant.image && (
              <CardMedia
                component="img"
                height="180"
                image={restaurant.image}
                alt={restaurant.name}
              />
            )}
            <CardContent>
              <Typography variant="h6">{restaurant.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {restaurant.description}
              </Typography>
              <Button variant="contained" sx={{ mt: 2 }} fullWidth>
                Reservar mesa
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>

      {restaurants.length === 0 && (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body1">
            No hay restaurantes disponibles por el momento.
          </Typography>
        </Box>
      )}
    </Container>
  );
}
