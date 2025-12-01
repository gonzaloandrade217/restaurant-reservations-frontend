'use client';

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import { useRouter } from "next/navigation";

const API = "http://192.168.1.6:4000";

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  image?: string;
  city?: string;
  address?: string;
}

interface Props {
  search?: string; 
}

export default function RestaurantsSection({ search = "" }: Props) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No token");

        const res = await fetch(`${API}/restaurants`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error al obtener restaurantes");

        setRestaurants(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleReserveClick = (restaurantId: string) => {
    router.push(`/reservations/select-seats?restaurant=${restaurantId}`);
  };

  // Filtrado dinámico por nombre o ciudad
  const filteredRestaurants = restaurants.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.city?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Typography sx={{ color: "white" }}>Cargando restaurantes...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ mb: 12 }}>
      <Typography variant="h4" sx={{ color: "white", mb: 2 }}>
        Restaurantes disponibles
      </Typography>
      <Divider sx={{ borderColor: "white", mb: 3 }} />

      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
        }}
        gap={3}
      >
        {filteredRestaurants.map((restaurant) => (
          <Card
            key={restaurant.id}
            sx={{ backgroundColor: "#111", color: "white", border: "1px solid white" }}
          >
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
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {restaurant.description}
              </Typography>
              {restaurant.city && (
                <Typography sx={{ mt: 1, opacity: 0.7 }}>Ciudad: {restaurant.city}</Typography>
              )}
              {restaurant.address && (
                <Typography sx={{ mt: 1, opacity: 0.7 }}>Dirección: {restaurant.address}</Typography>
              )}
              <Button
                variant="contained"
                sx={{ mt: 2, backgroundColor: "#ff9800" }}
                fullWidth
                onClick={() => handleReserveClick(restaurant.id)}
              >
                Reservar mesa
              </Button>
            </CardContent>
          </Card>
        ))}
        {filteredRestaurants.length === 0 && (
          <Typography align="center" sx={{ color: "white", mt: 2 }}>
            No se encontraron restaurantes.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
