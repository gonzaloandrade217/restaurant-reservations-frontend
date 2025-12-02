'use client';

import React from "react";
import { Card, CardContent, Typography, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface ReservationCardProps {
  id: string;
  date: string;
  partySize: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  restaurant: { name: string };
  cancelReason?: string;
  onCancel?: (id: string) => void;
  onHide?: (id: string) => void;
}

export default function ReservationCard({
  id,
  date,
  partySize,
  status,
  restaurant,
  cancelReason,
  onCancel,
  onHide,
}: ReservationCardProps) {

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const statusColor = () => {
    switch (status) {
      case "ACCEPTED":
        return "green";
      case "REJECTED":
        return "red";
      case "CANCELLED":
        return "gray";
      default:
        return "orange";
    }
  };

  return (
    <Card sx={{ backgroundColor: "#111", color: "white", border: "1px solid white", p: 2, position: "relative" }}>
      
      {(status === "REJECTED" || status === "CANCELLED") && onHide && (
        <IconButton
          onClick={() => onHide(id)}
          sx={{ position: "absolute", top: 8, right: 8, color: "white" }}
        >
          <CloseIcon />
        </IconButton>
      )}

      <CardContent sx={{ p: 0 }}>
        <Typography variant="h6" sx={{ mb: 0.5 }}>Restaurante: {restaurant.name}</Typography>
        <Typography sx={{ mb: 0.5 }}>Fecha: {formatDate(date)}</Typography>
        <Typography sx={{ mb: 0.5 }}>Personas: {partySize}</Typography>

        {(status === "CANCELLED" || status === "REJECTED") && cancelReason && (
          <Typography sx={{ mt: 1, fontStyle: "italic", color: "#ff6b6b" }}>
            Razón de cancelación: {cancelReason}
          </Typography>
        )}

        <Typography sx={{ mt: 1, fontWeight: "bold", color: statusColor() }}>{status}</Typography>

        {(status === "PENDING" || status === "ACCEPTED") && onCancel && (
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2, backgroundColor: "#ff9800" }}
            onClick={() => onCancel(id)}
          >
            Cancelar reserva
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
