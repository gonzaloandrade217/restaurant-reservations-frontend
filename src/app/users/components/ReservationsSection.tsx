'use client';

import React, { useEffect, useState, useRef } from "react";
import { Box, Card, Typography, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const API = "http://192.168.1.6:4000";

interface Props {
  onUpdate?: (data: any[], hasStateChanged: boolean) => void;
}

export default function ReservationsSection({ onUpdate }: Props) {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hiddenReservations, setHiddenReservations] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("hiddenReservations") || "[]");
    } catch {
      return [];
    }
  });

  const previousReservationsRef = useRef<any[]>([]);

  const hideReservation = (id: string) => {
    setHiddenReservations(prev => {
      const updated = [...prev, id];
      localStorage.setItem("hiddenReservations", JSON.stringify(updated));
      return updated;
    });
  };

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");
      if (!token || !userId) throw new Error("Sesión inválida.");

      const res = await fetch(`${API}/reservations/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al obtener reservas");

      const data: any[] = await res.json();

      // Detecta cambios de estado
      const previous = previousReservationsRef.current;
      const hasStateChanged = data.some(r => {
        const prev = previous.find(p => p.id === r.id);
        return prev && prev.status !== r.status;
      });

      // Solo actualizar si cambió algo
      if (JSON.stringify(previous) !== JSON.stringify(data)) {
        previousReservationsRef.current = data;
        setReservations(data);
        if (onUpdate) onUpdate(data, hasStateChanged);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    const interval = setInterval(fetchReservations, 5000);
    return () => clearInterval(interval);
  }, []); 

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const translateStatus = (status: string) => {
    if (status === "ACCEPTED") return "Aceptada";
    if (status === "REJECTED") return "Rechazada";
    if (status === "CANCELLED") return "Cancelada";
    return "Pendiente";
  };

  const statusColor = (status: string) => {
    if (status === "ACCEPTED") return "green";
    if (status === "REJECTED") return "red";
    if (status === "CANCELLED") return "gray";
    return "orange";
  };

  const cancelReservation = async (reservationId: string) => {
    if (!confirm("¿Cancelar reserva?")) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No autenticado.");

      const res = await fetch(`${API}/reservations/${reservationId}/cancel-user`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al cancelar reserva");

      alert("Reserva cancelada.");
      setReservations(prev =>
        prev.map(r => (r.id === reservationId ? { ...r, status: "CANCELLED" } : r))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <Typography sx={{ color: "white" }}>Cargando reservas...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box display="grid" gap={2}>
      {reservations
        .filter(r => !hiddenReservations.includes(r.id))
        .map((r) => (
          <Card
            key={r.id}
            sx={{ backgroundColor: "#111", color: "white", border: "1px solid white", p: 2, position: "relative" }}
          >
            {(r.status === "REJECTED" || r.status === "CANCELLED") && (
              <IconButton
                onClick={() => hideReservation(r.id)}
                sx={{ position: "absolute", top: 8, right: 8, color: "white" }}
              >
                <CloseIcon />
              </IconButton>
            )}

            <Typography variant="h6">Restaurante: {r.restaurant?.name}</Typography>
            <Typography>Fecha: {formatDate(r.date)}</Typography>
            <Typography>Personas: {r.partySize}</Typography>

            {r.cancelReason && (
              <Typography sx={{ mt: 1, fontStyle: "italic", color: "#ff6b6b" }}>
                Razón de cancelación: {r.cancelReason}
              </Typography>
            )}

            <Typography sx={{ mt: 1, fontWeight: "bold", color: statusColor(r.status) }}>
              {translateStatus(r.status)}
            </Typography>

            {(r.status === "PENDING" || r.status === "ACCEPTED") && (
              <Button
                variant="contained"
                sx={{ mt: 2, backgroundColor: "#ff9800" }}
                fullWidth
                onClick={() => cancelReservation(r.id)}
              >
                Cancelar reserva
              </Button>
            )}
          </Card>
        ))}

      {reservations.length === 0 && (
        <Typography align="center" sx={{ color: "white", mt: 2 }}>
          No tenés reservas aún.
        </Typography>
      )}
    </Box>
  );
}
