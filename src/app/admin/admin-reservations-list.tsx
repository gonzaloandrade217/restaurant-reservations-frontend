'use client';

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  Button,
} from "@mui/material";

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
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReservations = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const adminId = localStorage.getItem("userId");

      if (!token || !adminId) {
        throw new Error("No estás autenticado como admin.");
      }

      const res = await fetch(
        `http://localhost:4000/reservations/admin/pending/${adminId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error("Error al cargar reservas");
      }

      const data = await res.json();
      setReservations(data);

    } catch (err: any) {
      setError(err.message);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [refresh]); // <<--- se refresca cuando cambie refresh

  const handleAction = async (id: string, action: "accept" | "reject") => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const res = await fetch(
      `http://localhost:4000/reservations/${id}/${action}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (res.ok) {
      loadReservations(); // <<--- refresca lista automáticamente
    }
  };

  if (loading) return <Typography>Cargando reservas...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Reservas Pendientes
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Restaurante</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Personas</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {reservations.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.restaurant.name}</TableCell>
                <TableCell>{r.user.name}</TableCell>
                <TableCell>{r.user.email}</TableCell>
                <TableCell>{new Date(r.date).toLocaleString()}</TableCell>
                <TableCell>{r.partySize}</TableCell>

                <TableCell>
                  <Button
                    variant="contained"
                    color="success"
                    sx={{ mr: 1 }}
                    onClick={() => handleAction(r.id, "accept")}
                  >
                    Aceptar
                  </Button>

                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleAction(r.id, "reject")}
                  >
                    Rechazar
                  </Button>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>

        </Table>
      </TableContainer>
    </Box>
  );
}
