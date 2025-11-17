'use client';

import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Container } from "@mui/material";

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setError(null);

        const token = localStorage.getItem("authToken");
        const userId = localStorage.getItem("userId");

        if (!token || !userId) throw new Error("Sesión inválida");

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

        const data = await res.json();
        setReservations(data);

      } catch (err: any) {
        console.error("Error cargando reservas:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Mis reservas
      </Typography>

      {loading && <Typography align="center">Cargando reservas...</Typography>}

      {error && (
        <Typography align="center" color="error">
          {error}
        </Typography>
      )}

      <Box
        display="flex"
        flexDirection="column"
        gap={2}
        sx={{ mt: 3 }}
      >
        {reservations.map((reserva) => (
          <Card key={reserva.id} sx={{ boxShadow: 3 }}>
            <CardContent>
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
                    reserva.status === "ACCEPTED"
                      ? "green"
                      : reserva.status === "REJECTED"
                      ? "red"
                      : "orange"
                }}
              >
                Estado: {reserva.status.toUpperCase()}
              </Typography>
            </CardContent>
          </Card>
        ))}

        {!loading && reservations.length === 0 && (
          <Typography align="center">No tenés reservas aún.</Typography>
        )}
      </Box>
    </Container>
  );
}
