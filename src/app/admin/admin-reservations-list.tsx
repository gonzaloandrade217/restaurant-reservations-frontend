'use client';

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Container,
  Divider,
  TextField
} from "@mui/material";

interface Reservation {
  id: string;
  date: string;
  partySize: number;
  restaurant: { name: string };
  user: { name: string; email: string };
  cancelReason?: string;
}

interface AdminReservationsListProps {
  refresh: number;
}

export default function AdminReservationsList({ refresh }: AdminReservationsListProps) {
  const [pendingReservations, setPendingReservations] = useState<Reservation[]>([]);
  const [acceptedReservations, setAcceptedReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localCancelReasons, setLocalCancelReasons] = useState<{ [id: string]: string }>({});
  const [searchDate, setSearchDate] = useState("");

  // Función de carga
  const loadReservations = async () => {
    const token = localStorage.getItem("authToken");
    const adminId = localStorage.getItem("userId");
    if (!token || !adminId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch en paralelo
      const [pendingRes, acceptedRes] = await Promise.all([
        fetch(`https://192.168.1.6:4000/reservations/admin/pending/${adminId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`https://192.168.1.6:4000/reservations/admin/accepted/${adminId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const pendingData: Reservation[] = await pendingRes.json();
      const acceptedData: Reservation[] = await acceptedRes.json();

      // Solo actualizar si cambió
      setPendingReservations(prev =>
        JSON.stringify(prev) !== JSON.stringify(pendingData) ? pendingData : prev
      );
      setAcceptedReservations(prev =>
        JSON.stringify(prev) !== JSON.stringify(acceptedData) ? acceptedData : prev
      );

      // Inicializar razones locales
      const reasonsMap: { [id: string]: string } = {};
      [...pendingData, ...acceptedData].forEach(r => {
        if (r.cancelReason) reasonsMap[r.id] = r.cancelReason;
      });
      setLocalCancelReasons(reasonsMap);

    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Solo ejecutar al montar o cuando refresh cambie
  useEffect(() => {
    let mounted = true;

    if (mounted) {
      loadReservations();
    }

    return () => { mounted = false; };
  }, [refresh]);

  const handleAction = async (id: string, action: "accept" | "reject") => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    if (localCancelReasons[id]) {
      await fetch(`https://192.168.1.6:4000/reservations/${id}/exception`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: localCancelReasons[id] }),
      });
    }

    const res = await fetch(`https://192.168.1.6:4000/reservations/${id}/${action}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const updated = pendingReservations.find(r => r.id === id);
      if (action === "accept" && updated) setAcceptedReservations(prev => [...prev, updated]);
      setPendingReservations(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleCancel = async (id: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const reason = localCancelReasons[id];
    if (!reason || reason.trim() === "") {
      alert("Debes ingresar una razón para cancelar la reserva");
      return;
    }

    const res = await fetch(`https://192.168.1.6:4000/reservations/${id}/cancel`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reason }),
    });

    if (res.ok) loadReservations();
  };

  if (loading) return <Typography>Cargando reservas...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  const filteredPending = searchDate
    ? pendingReservations.filter(r => r.date.startsWith(searchDate))
    : pendingReservations;

  const filteredAccepted = searchDate
    ? acceptedReservations.filter(r => r.date.startsWith(searchDate))
    : acceptedReservations;

  const renderReservationCard = (r: Reservation, isAccepted: boolean) => (
    <Card key={r.id} sx={{ borderRadius: 2, p: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
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

        {(r.cancelReason && (r.cancelReason.trim() !== "")) && (
          <>
            <Typography variant="subtitle2" color="text.secondary">Razón de cancelación:</Typography>
            <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic', color: '#ff6b6b' }}>
              {r.cancelReason}
            </Typography>
          </>
        )}

        <TextField
          label="Razón de cancelación"
          placeholder="Motivo de cancelación"
          size="small"
          fullWidth
          sx={{ mb: 1 }}
          value={localCancelReasons[r.id] || ""}
          onChange={(e) => setLocalCancelReasons(prev => ({ ...prev, [r.id]: e.target.value }))}
        />

        {isAccepted ? (
          <Button variant="contained" color="warning" onClick={() => handleCancel(r.id)}>Cancelar</Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button variant="contained" color="success" onClick={() => handleAction(r.id, "accept")}>Aceptar</Button>
            <Button variant="contained" color="error" onClick={() => handleAction(r.id, "reject")}>Rechazar</Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <TextField
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ width: "250px", backgroundColor: "white", borderRadius: 2 }}
        />
      </Box>

      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Pendientes</Typography>
      <Grid container spacing={2} sx={{ mb: 6 }}>
        {filteredPending.length === 0 && <Typography sx={{ ml: 2 }}>No hay reservas pendientes</Typography>}
        {filteredPending.map(r => (
          <Grid key={r.id} item xs={12} sm={6} md={4} lg={3}>
            {renderReservationCard(r, false)}
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3, borderColor: "white" }} />

      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Aceptadas</Typography>
      <Grid container spacing={2}>
        {filteredAccepted.length === 0 && <Typography sx={{ ml: 2 }}>No hay reservas aceptadas</Typography>}
        {filteredAccepted.map(r => (
          <Grid key={r.id} item xs={12} sm={6} md={4} lg={3}>
            {renderReservationCard(r, true)}
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
