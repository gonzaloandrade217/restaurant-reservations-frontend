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
import { useRouter } from "next/navigation";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  image?: string;
}

export default function UsersDashboardPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reservations, setReservations] = useState<any[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [reservationsError, setReservationsError] = useState<string | null>(null);

  const router = useRouter();

  // 🔹 Cargar restaurantes
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No se encontró el token. Iniciá sesión nuevamente.");

        const res = await fetch("http://localhost:4000/restaurants", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Error al obtener restaurantes");
        }

        setRestaurants(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // 🔹 Cargar reservas del usuario
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const userId = localStorage.getItem("userId");
        if (!token || !userId)
          throw new Error("Sesión inválida, volvé a iniciar sesión.");

        const res = await fetch(
          `http://localhost:4000/reservations/user/${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Error al obtener reservas");
        }

        setReservations(await res.json());
      } catch (err: any) {
        setReservationsError(err.message);
      } finally {
        setReservationsLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const handleReserveClick = (restaurantId: string) => {
    router.push(`/reservations/select-seats?restaurant=${restaurantId}`);
  };

  return (
    <Container sx={{ py: 4 }}>
      {/* RESTAURANTES */}
      <Typography variant="h4" gutterBottom align="center">
        Restaurantes disponibles
      </Typography>

      {loading ? (
        <Typography align="center">Cargando restaurantes...</Typography>
      ) : error ? (
        <Typography align="center" color="error">{error}</Typography>
      ) : (
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

                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  fullWidth
                  onClick={() => handleReserveClick(restaurant.id)}
                >
                  Reservar mesa
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {restaurants.length === 0 && !loading && (
        <Typography align="center" sx={{ mt: 3 }}>
          No hay restaurantes disponibles por el momento.
        </Typography>
      )}

      {/* SEPARADOR */}
      <hr style={{ margin: "40px 0" }} />

      {/* RESERVAS */}
      <Typography variant="h4" gutterBottom align="center">
        Mis reservas
      </Typography>

      {reservationsLoading && (
        <Typography align="center">Cargando reservas...</Typography>
      )}

      {reservationsError && (
        <Typography align="center" color="error">
          {reservationsError}
        </Typography>
      )}

      {!reservationsLoading && (
        <Box display="flex" flexDirection="column" gap={2} mt={3}>
          {reservations.map((reserva: any) => (
            <Card key={reserva.id} sx={{ p: 2, boxShadow: 3 }}>
              <Typography variant="h6">
                Restaurante: {reserva.restaurant?.name}
              </Typography>

              <Typography>Fecha: {reserva.date}</Typography>
              <Typography>Personas: {reserva.people}</Typography>

              <Typography
                sx={{
                  mt: 1,
                  fontWeight: "bold",
                  color:
                    reserva.status === "accepted"
                      ? "green"
                      : reserva.status === "rejected"
                      ? "red"
                      : "orange",
                }}
              >
                Estado: {reserva.status.toUpperCase()}
              </Typography>
            </Card>
          ))}

          {reservations.length === 0 && !reservationsLoading && (
            <Typography align="center" sx={{ mt: 3 }}>
              No tenés reservas aún.
            </Typography>
          )}
        </Box>
      )}
    </Container>
  );
}
