"use client";

import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Container } from "@mui/material";

interface Reservation {
  id: string;
  restaurantName: string;
  people: number;
  date: string;
  status: string;
}

export default function UserReservationsPage() {
  const [accepted, setAccepted] = useState<Reservation[]>([]);
  const [rejected, setRejected] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const userId = localStorage.getItem("userId");

        if (!token || !userId) throw new Error("Sesión inválida.");

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const [acceptedRes, rejectedRes] = await Promise.all([
          fetch(`http://192.168.1.6:4000/reservations/user/accepted?userId=${userId}`, { headers }),
          fetch(`http://192.168.1.6:4000/reservations/user/rejected?userId=${userId}`, { headers }),
        ]);

        const acceptedData = await acceptedRes.json();
        const rejectedData = await rejectedRes.json();

        setAccepted(acceptedData);
        setRejected(rejectedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  if (loading) return <Container><Typography>Cargando...</Typography></Container>;
  if (error) return <Container><Typography color="error">{error}</Typography></Container>;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Mis Reservas
      </Typography>

      <Typography variant="h5" sx={{ mt: 3 }}> Aceptadas</Typography>
      {accepted.length === 0 && <Typography>No tenés reservas aceptadas.</Typography>}
      {accepted.map(r => (
        <Card key={r.id} sx={{ mt: 2 }}>
          <CardContent>
            <Typography><b>Restaurante:</b> {r.restaurantName}</Typography>
            <Typography><b>Personas:</b> {r.people}</Typography>
            <Typography><b>Fecha:</b> {r.date}</Typography>
          </CardContent>
        </Card>
      ))}

      <Typography variant="h5" sx={{ mt: 4 }}> Rechazadas</Typography>
      {rejected.length === 0 && <Typography>No tenés reservas rechazadas.</Typography>}
      {rejected.map(r => (
        <Card key={r.id} sx={{ mt: 2 }}>
          <CardContent>
            <Typography><b>Restaurante:</b> {r.restaurantName}</Typography>
            <Typography><b>Personas:</b> {r.people}</Typography>
            <Typography><b>Fecha:</b> {r.date}</Typography>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
}
