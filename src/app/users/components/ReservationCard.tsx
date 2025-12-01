'use client';

import React from "react";
import { Card, CardContent, Typography, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface ReservationCardProps {
  id: string;
  date: string;
  partySize: number;
  status: string;
  restaurant: { name: string };
  onCancel?: (id: string) => void;
  onHide?: (id: string) => void;
}

export default function ReservationCard({ id, date, partySize, status, restaurant, onCancel, onHide }: ReservationCardProps) {
  const formatDate = (iso: string) => new Date(iso).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const statusColor = (status: string) => {
    if (status === "ACCEPTED") return "green";
    if (status === "REJECTED") return "red";
    if (status === "CANCELLED") return "gray";
    return "orange";
  };

  return (
    <Card sx={{ backgroundColor: "#111", color: "white", border: "1px solid white", p: 2, position: "relative" }}>
      {(status === "REJECTED" || status === "CANCELLED") && onHide && (
        <IconButton onClick={() => onHide(id)} sx={{ position: "absolute", top: 8, right: 8, color: "white" }}>
          <CloseIcon />
        </IconButton>
      )}

      <Typography variant="h6">Restaurante: {restaurant.name}</Typography>
      <Typography>Fecha: {formatDate(date)}</Typography>
      <Typography>Personas: {partySize}</Typography>
      <Typography sx={{ mt: 1, fontWeight: "bold", color: statusColor(status) }}>{status}</Typography>

      {(status === "PENDING" || status === "ACCEPTED") && onCancel && (
        <Button fullWidth variant="contained" sx={{ mt: 2, backgroundColor: "#ff9800" }} onClick={() => onCancel(id)}>
          Cancelar reserva
        </Button>
      )}
    </Card>
  );
}
