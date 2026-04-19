'use client';

import React, { useEffect, useState, useRef } from "react";
import { Box, Card, Typography, Button, IconButton, Tabs, Tab, Pagination, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const PAGE_SIZE = 5;
type StatusFilter = "ALL" | "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELLED";

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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);

  const previousReservationsRef = useRef<any[]>([]);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success'|'error' }>({ open: false, msg: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; reservationId: string }>({ open: false, reservationId: '' });
  const showSnack = (msg: string, severity: 'success'|'error' = 'success') => setSnack({ open: true, msg, severity });

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
      showSnack(err.message, 'error');
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
    if (!iso) return "Sin fecha";

    const [datePart, timePart] = iso.split('T');
  
    const [year, month, day] = datePart.split('-');
    const formattedDate = `${day}/${month}/${year}`;
  
    const formattedTime = timePart.substring(0, 5);
  
    return `${formattedDate} - ${formattedTime} hs`;
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

      showSnack("Reserva cancelada.");
      setReservations(prev =>
        prev.map(r =>
          r.id === reservationId ? { ...r, status: "CANCELLED" } : r
        )
      );
    } catch (err: any) {
      showSnack(err.message, 'error');
    }
  };

  /* ===============================
     RENDER
     =============================== */
  if (loading)
    return <Typography sx={{ color: "white" }}>Cargando reservas...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  const filtered = reservations.filter(r => {
    if (hiddenReservations.includes(r.id)) return false;
    if (statusFilter === "ALL") return true;
    return r.status === statusFilter;
  });

  const reversed = [...filtered].reverse();
  const totalPages = Math.ceil(reversed.length / PAGE_SIZE);
  const paginated = reversed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const FILTERS: { label: string; value: StatusFilter }[] = [
    { label: "Todas", value: "ALL" },
    { label: "Pendientes", value: "PENDING" },
    { label: "Aceptadas", value: "ACCEPTED" },
    { label: "Completadas", value: "COMPLETED" },
    { label: "Canceladas", value: "CANCELLED" },
  ];

  return (
    <Box>
      {/* Tabs de filtro */}
      <Tabs
        value={statusFilter}
        onChange={(_, v) => { setStatusFilter(v); setPage(1); }}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2,
          "& .MuiTab-root": { color: "rgba(255,255,255,0.6)", minWidth: "auto", fontSize: "0.8rem" },
          "& .Mui-selected": { color: "white !important" },
          "& .MuiTabs-indicator": { backgroundColor: "#ff9800" },
        }}
      >
        {FILTERS.map(f => (
          <Tab key={f.value} label={f.label} value={f.value} />
        ))}
      </Tabs>

      {/* Lista de reservas */}
      <Box display="grid" gap={2}>
        {paginated.map(r => (
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
                onClick={() => setConfirmDialog({ open: true, reservationId: r.id })}
              >
                Cancelar reserva
              </Button>
            )}
          </Card>
        ))}

        {filtered.length === 0 && (
          <Typography align="center" sx={{ color: "white", mt: 2 }}>
            {statusFilter === "ALL" ? "No tenés reservas aún." : `No tenés reservas ${FILTERS.find(f => f.value === statusFilter)?.label.toLowerCase()}.`}
          </Typography>
        )}
      </Box>

      {/* Paginación */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
            sx={{
              "& .MuiPaginationItem-root": { color: "white" },
              "& .Mui-selected": { backgroundColor: "#ff9800 !important", color: "white" },
            }}
          />
        </Box>
      )}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, reservationId: '' })}
        PaperProps={{ sx: { backgroundColor: '#1a1a1a', color: 'white', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>¿Cancelar reserva?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>Esta acción no se puede deshacer.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setConfirmDialog({ open: false, reservationId: '' })} sx={{ color: 'rgba(255,255,255,0.5)' }}>Volver</Button>
          <Button variant="contained" sx={{ backgroundColor: '#ff9800', '&:hover': { backgroundColor: '#e86f00' }, fontWeight: 700 }}
            onClick={() => { cancelReservation(confirmDialog.reservationId); setConfirmDialog({ open: false, reservationId: '' }); }}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}