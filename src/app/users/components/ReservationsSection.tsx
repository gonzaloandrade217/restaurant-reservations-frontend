'use client';

import React, { useEffect, useState, useRef } from "react";
import { Box, Card, Typography, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const API =
  "NEXT_PUBLIC_API_URL" in process.env
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:4000";

interface Props {
  onUpdate?: (data: any[], hasStateChanged: boolean) => void;
}

export default function ReservationsSection({ onUpdate }: Props) {
  const [reservations, setReservations] = useState<any[]>([]);
  const [hiddenReservations, setHiddenReservations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const previousReservationsRef = useRef<any[]>([]);

  /* ===============================
     OCULTAR RESERVA (PERSISTENTE)
     =============================== */
  const hideReservation = async (id: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No autenticado.");

      const res = await fetch(`${API}/users/me/hidden-reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reservationId: id }),
      });

      if (!res.ok) throw new Error("No se pudo ocultar la reserva");

      setHiddenReservations(prev => [...prev, id]);
    } catch (err: any) {
      alert(err.message);
    }
  };

  /* ===============================
     FETCH RESERVAS OCULTAS
     =============================== */
  const fetchHiddenReservations = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const res = await fetch(`${API}/users/me/hidden-reservations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setHiddenReservations(data);
      }
    } catch {
      // silencioso
    }
  };

  /* ===============================
     FETCH RESERVAS
     =============================== */
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

      const previous = previousReservationsRef.current;
      const hasStateChanged = data.some(r => {
        const prev = previous.find(p => p.id === r.id);
        return prev && prev.status !== r.status;
      });

      if (JSON.stringify(previous) !== JSON.stringify(data)) {
        previousReservationsRef.current = data;
        setReservations(data);
        onUpdate?.(data, hasStateChanged);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     INIT
     =============================== */
  useEffect(() => {
    fetchHiddenReservations();
    fetchReservations();

    const interval = setInterval(fetchReservations, 5000);
    return () => clearInterval(interval);
  }, []);

  /* ===============================
     HELPERS
     =============================== */
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
    if (status === "COMPLETED") return "Completada";
    return "Pendiente";
  };

  const statusColor = (status: string) => {
    if (status === "ACCEPTED") return "green";
    if (status === "REJECTED") return "red";
    if (status === "CANCELLED") return "gray";
    if (status === "COMPLETED") return "blue";
    return "orange";
  };

  /* ===============================
     CANCELAR RESERVA
     =============================== */
  const cancelReservation = async (reservationId: string) => {
    if (!confirm("¿Cancelar reserva?")) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No autenticado.");

      const res = await fetch(
        `${API}/reservations/${reservationId}/cancel-user`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Error al cancelar reserva");

      alert("Reserva cancelada.");
      setReservations(prev =>
        prev.map(r =>
          r.id === reservationId ? { ...r, status: "CANCELLED" } : r
        )
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  /* ===============================
     RENDER
     =============================== */
  if (loading)
    return <Typography sx={{ color: "white" }}>Cargando reservas...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box display="grid" gap={2}>
      {reservations
        .filter(r => !hiddenReservations.includes(r.id))
        .map(r => (
          <Card
            key={r.id}
            sx={{
              backgroundColor: "#111",
              color: "white",
              border: "1px solid white",
              p: 2,
              position: "relative",
            }}
          >
            {(r.status === "REJECTED" || r.status === "CANCELLED") && (
              <IconButton
                onClick={() => hideReservation(r.id)}
                sx={{ position: "absolute", top: 8, right: 8, color: "white" }}
              >
                <CloseIcon />
              </IconButton>
            )}

            <Typography variant="h6">
              Restaurante: {r.restaurant?.name}
            </Typography>
            <Typography>Fecha: {formatDate(r.date)}</Typography>
            <Typography>Personas: {r.partySize}</Typography>

            {r.cancelReason && (
              <Typography
                sx={{ mt: 1, fontStyle: "italic", color: "#ff6b6b" }}
              >
                Razón de cancelación: {r.cancelReason}
              </Typography>
            )}

            <Typography
              sx={{ mt: 1, fontWeight: "bold", color: statusColor(r.status) }}
            >
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
