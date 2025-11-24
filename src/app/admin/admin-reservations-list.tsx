'use client';

import { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, Button, Container, Divider } from "@mui/material";

interface Reservation {
  id: string;
  date: string;
  partySize: number;
  restaurant: { name: string };
  user: { name: string; email: string };
}

interface AdminReservationsListProps {
  refresh: number;
}

export default function AdminReservationsList({ refresh }: AdminReservationsListProps) {
  const [pendingReservations, setPendingReservations] = useState<Reservation[]>([]);
  const [acceptedReservations, setAcceptedReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReservations = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      const adminId = localStorage.getItem("userId");

      if (!token || !adminId) throw new Error("No estás autenticado como admin.");

      // Pendientes
      const pendingRes = await fetch(`http://localhost:4000/reservations/admin/pending/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!pendingRes.ok) throw new Error("Error al cargar reservas pendientes");
      const pendingData: Reservation[] = await pendingRes.json();
      setPendingReservations(pendingData);

      // Aceptadas
      const acceptedRes = await fetch(`http://localhost:4000/reservations/admin/accepted/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!acceptedRes.ok) throw new Error("Error al cargar reservas aceptadas");
      const acceptedData: Reservation[] = await acceptedRes.json();
      setAcceptedReservations(acceptedData);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [refresh]);

  const handleAction = async (id: string, action: "accept" | "reject") => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const res = await fetch(`http://localhost:4000/reservations/${id}/${action}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) loadReservations();
  };

  if (loading) return <Typography>Cargando reservas...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container sx={{ mt: 4 }}>
      {/* ---------------------- RESERVAS PENDIENTES ---------------------- */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Pendientes</Typography>
      <Grid container spacing={2} sx={{ mb: 6 }}>
        {pendingReservations.map((r) => (
          <Grid key={r.id} item xs={12} sm={6} md={4} lg={3}>
            <Card sx={{ borderRadius: 2, p: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', transition: '0.2s', ':hover': { transform: 'scale(1.02)' } }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Restaurante:</Typography>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>{r.restaurant.name}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Cliente:</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>{r.user.name}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Email:</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{r.user.email}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Fecha:</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{new Date(r.date).toLocaleString()}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Personas:</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{r.partySize}</Typography>

                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button variant="contained" color="success" onClick={() => handleAction(r.id, "accept")}>Aceptar</Button>
                  <Button variant="contained" color="error" onClick={() => handleAction(r.id, "reject")}>Rechazar</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
        <Divider sx={{ my: 3, borderColor: "white" }} />
      {/* ---------------------- RESERVAS ACEPTADAS ---------------------- */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Aceptadas</Typography>
      <Grid container spacing={2}>
        {acceptedReservations.map((r) => (
          <Grid key={r.id} item xs={12} sm={6} md={4} lg={3}>
            <Card sx={{ borderRadius: 2, p: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', transition: '0.2s', ':hover': { transform: 'scale(1.02)' } }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Restaurante:</Typography>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>{r.restaurant.name}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Cliente:</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>{r.user.name}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Email:</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{r.user.email}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Fecha:</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{new Date(r.date).toLocaleString()}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Personas:</Typography>
                <Typography variant="body2">{r.partySize}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
