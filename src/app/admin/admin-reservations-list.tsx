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
  const [cancelledReservations, setCancelledReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCancelled, setLoadingCancelled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [localCancelReasons, setLocalCancelReasons] = useState<{ [id: string]: string }>({});
  const [localExceptions, setLocalExceptions] = useState<{ [id: string]: string }>({});
  const [searchDate, setSearchDate] = useState("");
  const [cancelledOffset, setCancelledOffset] = useState(0);
  const [hideCancelled, setHideCancelled] = useState(false);

  const BASE = "http://192.168.1.6:4000";

  // Carga reservas pendientes y aceptadas
  const loadReservations = async () => {
    const token = localStorage.getItem("authToken");
    const adminId = localStorage.getItem("userId");
    if (!token || !adminId) return;

    setLoading(true);
    setError(null);

    try {
      const [pendingRes, acceptedRes] = await Promise.all([
        fetch(`${BASE}/reservations/admin/pending/${adminId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BASE}/reservations/admin/accepted/${adminId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const pendingData: Reservation[] = await pendingRes.json();
      const acceptedData: Reservation[] = await acceptedRes.json();

      setPendingReservations(pendingData);
      setAcceptedReservations(acceptedData);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Carga reservas canceladas (paginadas)
  const loadCancelled = async (limit = 10) => {
    const token = localStorage.getItem("authToken");
    const adminId = localStorage.getItem("userId");
    if (!token || !adminId) return;

    setLoadingCancelled(true);
    try {
      const res = await fetch(
        `${BASE}/reservations/admin/cancelled/${adminId}?limit=${limit}&offset=${cancelledOffset}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data: Reservation[] = await res.json();
      setCancelledReservations(prev => [...prev, ...data]);
      setCancelledOffset(prev => prev + limit);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCancelled(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [refresh]);

  const handleAction = async (id: string, action: "accept" | "reject") => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    if (localExceptions[id]) {
      await fetch(`${BASE}/reservations/${id}/exception`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: localExceptions[id] }),
      });
    }

    const res = await fetch(`${BASE}/reservations/${id}/${action}`, {
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

    const res = await fetch(`${BASE}/reservations/${id}/cancel`, {
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

  const filteredCancelled = searchDate
    ? cancelledReservations.filter(r => r.date.startsWith(searchDate))
    : cancelledReservations;

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

        {!isAccepted && (
          <TextField
            label="Excepción"
            placeholder="Ej: agrego otra mesa para que entren más clientes"
            size="small"
            fullWidth
            sx={{ mb: 1 }}
            value={localExceptions[r.id] || ""}
            onChange={(e) => setLocalExceptions(prev => ({ ...prev, [r.id]: e.target.value }))}
          />
        )}

        {isAccepted && (
          <TextField
            label="Razón de cancelación"
            placeholder="Motivo de cancelación"
            size="small"
            fullWidth
            sx={{ mb: 1 }}
            value={localCancelReasons[r.id] || ""}
            onChange={(e) => setLocalCancelReasons(prev => ({ ...prev, [r.id]: e.target.value }))}
          />
        )}

        {isAccepted ? (
          <Button variant="contained" sx={{ backgroundColor: "#ff9800" }} onClick={() => handleCancel(r.id)}>
            Cancelar
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button variant="contained" sx={{ backgroundColor: "#ff9800" }} onClick={() => handleAction(r.id, "accept")}>
              Aceptar
            </Button>
            <Button variant="contained" sx={{ backgroundColor: "#ff9800" }} onClick={() => handleAction(r.id, "reject")}>
              Rechazar
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderCancelledCard = (r: Reservation) => (
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

        <Typography variant="subtitle2" color="text.secondary">Razón de cancelación:</Typography>
        <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic', color: '#ff6b6b' }}>
          {r.cancelReason || "Sin motivo especificado"}
        </Typography>
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

      <Divider sx={{ my: 3, borderColor: "white" }} />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Canceladas</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#ff9800" }}
            onClick={() => setHideCancelled(!hideCancelled)}
          >
            {hideCancelled ? "Mostrar canceladas" : "Ocultar canceladas"}
          </Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#ff9800" }}
            disabled={loadingCancelled}
            onClick={() => loadCancelled(10)}
          >
            {loadingCancelled ? "Cargando..." : "Ver más"}
          </Button>
        </Box>
      </Box>

      {!hideCancelled && (
        <Grid container spacing={2}>
          {filteredCancelled.length === 0 && <Typography sx={{ ml: 2 }}>No hay reservas canceladas</Typography>}
          {filteredCancelled.map(r => (
            <Grid key={r.id} item xs={12} sm={6} md={4} lg={3}>
              {renderCancelledCard(r)}
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
