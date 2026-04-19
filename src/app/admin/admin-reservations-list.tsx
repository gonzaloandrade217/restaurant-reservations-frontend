'use client';

import { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent, Button, Container,
  TextField, Accordion, AccordionSummary, AccordionDetails,
  Badge, Dialog, DialogTitle, DialogContent, DialogActions,
  Pagination, Chip, LinearProgress, Divider, Snackbar, Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TableBarIcon from "@mui/icons-material/TableBar";
import PeopleIcon from "@mui/icons-material/People";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const PAGE_SIZE = 5;

interface Reservation {
  id: string;
  date: string;
  partySize: number;
  restaurant: { id: string; name: string };
  user: { name: string; email: string };
  cancelReason?: string;
  exceptionDescription?: string;
  completed?: boolean;
}

interface AdminReservationsListProps {
  refresh: number;
  onComplete?: (reservation: Reservation) => void;
}

function formatDate(iso: string) {
  const [datePart, timePart] = iso.split("T");
  const [y, m, d] = datePart.split("-");
  return { date: `${d}/${m}/${y}`, time: timePart?.substring(0, 5) ?? "00:00" };
}

// Contador de mesas con barra de progreso
function TableCounter({ name, info }: { name: string; info: { total: number; used: number; available: number } }) {
  const pct = info.total > 0 ? (info.used / info.total) * 100 : 0;
  const color = pct >= 90 ? "#f44336" : pct >= 60 ? "#ff9800" : "#4caf50";

  return (
    <Card sx={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2, p: 2, mb: 2 }}>
      <Box display="flex" alignItems="center" gap={1} mb={1.5}>
        <TableBarIcon sx={{ color: "#ff9800", fontSize: 20 }} />
        <Typography sx={{ color: "white", fontWeight: 600, fontSize: "0.95rem" }}>{name}</Typography>
      </Box>

      {/* Barra de progreso */}
      <Box mb={1.5}>
        <Box display="flex" justifyContent="space-between" mb={0.5}>
          <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem" }}>Ocupación</Typography>
          <Typography sx={{ color, fontSize: "0.72rem", fontWeight: 600 }}>{Math.round(pct)}%</Typography>
        </Box>
        <LinearProgress
          variant="determinate" value={pct}
          sx={{ height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.1)", "& .MuiLinearProgress-bar": { backgroundColor: color, borderRadius: 4 } }}
        />
      </Box>

      {/* 3 counters */}
      <Box display="flex" gap={1}>
        {[
          { label: "Total", value: info.total, bg: "rgba(255,255,255,0.06)" },
          { label: "Usadas", value: info.used, bg: "rgba(244,67,54,0.12)", color: "#f44336" },
          { label: "Libres", value: info.available, bg: `rgba(${info.available <= 0 ? "244,67,54" : "76,175,80"},0.12)`, color: info.available <= 0 ? "#f44336" : "#4caf50" },
        ].map(c => (
          <Box key={c.label} flex={1} sx={{ backgroundColor: c.bg, borderRadius: 1.5, p: 1, textAlign: "center" }}>
            <Typography sx={{ color: c.color ?? "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: "1.3rem", lineHeight: 1 }}>{c.value}</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", mt: 0.3 }}>{c.label}</Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
}

// Card de reserva
function ReservationCard({ r, isAccepted, onAccept, onReject, onCancel, onComplete,
  cancelReason, onCancelReasonChange, exception, onExceptionChange }: {
  r: Reservation; isAccepted: boolean;
  onAccept?: () => void; onReject?: () => void;
  onCancel?: () => void; onComplete?: (done: boolean) => void;
  cancelReason?: string; onCancelReasonChange?: (v: string) => void;
  exception?: string; onExceptionChange?: (v: string) => void;
}) {
  const { date, time } = formatDate(r.date);
  const statusColor = isAccepted ? "#4caf50" : "#ff9800";
  const statusLabel = isAccepted ? "Aceptada" : "Pendiente";

  return (
    <Card sx={{ backgroundColor: "#111", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2, overflow: "hidden" }}>
      {/* Franja de color superior */}
      <Box sx={{ height: 4, backgroundColor: statusColor }} />

      <CardContent sx={{ p: 2 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Typography sx={{ color: "white", fontWeight: 700, fontSize: "1rem" }}>{r.restaurant.name}</Typography>
          <Chip label={statusLabel} size="small" sx={{ backgroundColor: statusColor, color: "white", fontWeight: 600, fontSize: "0.7rem" }} />
        </Box>

        {/* Info grid */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 1.5 }}>
          <Box display="flex" alignItems="center" gap={0.7}>
            <PeopleIcon sx={{ color: "#ff9800", fontSize: 16 }} />
            <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.82rem" }}>{r.partySize} personas</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.7}>
            <AccessTimeIcon sx={{ color: "#ff9800", fontSize: 16 }} />
            <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.82rem" }}>{time} hs</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.7} sx={{ gridColumn: "1/-1" }}>
            <CalendarTodayIcon sx={{ color: "#ff9800", fontSize: 16 }} />
            <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.82rem" }}>{date}</Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 1.5 }} />

        {/* Cliente */}
        <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", mb: 0.3 }}>Cliente</Typography>
        <Typography sx={{ color: "white", fontWeight: 600, fontSize: "0.88rem" }}>{r.user.name}</Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.75rem", mb: 1.5 }}>{r.user.email}</Typography>

        {/* Pendiente: excepción + botones aceptar/rechazar */}
        {!isAccepted && (
          <>
            <TextField label="Excepción (opcional)" placeholder="Ej: mesa extra para más clientes"
              size="small" fullWidth sx={{ mb: 1.5, "& .MuiOutlinedInput-root": { color: "white", "& fieldset": { borderColor: "rgba(255,255,255,0.2)" } }, "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" } }}
              value={exception || ""} onChange={(e) => onExceptionChange?.(e.target.value)} />
            <Box display="flex" gap={1}>
              <Button fullWidth variant="contained" onClick={onAccept}
                sx={{ backgroundColor: "#4caf50", "&:hover": { backgroundColor: "#388e3c" }, fontWeight: 600, fontSize: "0.8rem" }}>
                Aceptar
              </Button>
              <Button fullWidth variant="contained" onClick={onReject}
                sx={{ backgroundColor: "#f44336", "&:hover": { backgroundColor: "#c62828" }, fontWeight: 600, fontSize: "0.8rem" }}>
                Rechazar
              </Button>
            </Box>
          </>
        )}

        {/* Aceptada: cancelar + completada/incumplida */}
        {isAccepted && (
          <>
            {r.exceptionDescription && (
              <Box sx={{ backgroundColor: "rgba(255,152,0,0.08)", border: "1px solid rgba(255,152,0,0.25)", borderRadius: 1.5, p: 1.2, mb: 1.5 }}>
                <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.7rem", mb: 0.3 }}>📋 Nota interna</Typography>
                <Typography sx={{ color: "#ff9800", fontSize: "0.85rem" }}>{r.exceptionDescription}</Typography>
              </Box>
            )}
            <TextField label="Razón de cancelación" placeholder="Motivo..." size="small" fullWidth
              sx={{ mb: 1.5, "& .MuiOutlinedInput-root": { color: "white", "& fieldset": { borderColor: "rgba(255,255,255,0.2)" } }, "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" } }}
              value={cancelReason || ""} onChange={(e) => onCancelReasonChange?.(e.target.value)} />
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button variant="outlined" onClick={onCancel}
                sx={{ color: "#ff9800", borderColor: "#ff9800", fontWeight: 600, fontSize: "0.78rem", flex: 1 }}>
                Cancelar
              </Button>
              <Button variant="contained" onClick={() => onComplete?.(true)}
                sx={{ backgroundColor: "#4caf50", "&:hover": { backgroundColor: "#388e3c" }, fontWeight: 600, fontSize: "0.78rem", flex: 1 }}>
                Completada
              </Button>
              <Button variant="contained" onClick={() => onComplete?.(false)}
                sx={{ backgroundColor: "#f44336", "&:hover": { backgroundColor: "#c62828" }, fontWeight: 600, fontSize: "0.78rem", flex: 1 }}>
                Incumplida
              </Button>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Card cancelada
function CancelledCard({ r }: { r: Reservation }) {
  const { date, time } = formatDate(r.date);
  return (
    <Card sx={{ backgroundColor: "#111", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2, overflow: "hidden" }}>
      <Box sx={{ height: 4, backgroundColor: "#757575" }} />
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Typography sx={{ color: "white", fontWeight: 700, fontSize: "1rem" }}>{r.restaurant.name}</Typography>
          <Chip label="Cancelada" size="small" sx={{ backgroundColor: "#757575", color: "white", fontWeight: 600, fontSize: "0.7rem" }} />
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 1.5 }}>
          <Box display="flex" alignItems="center" gap={0.7}>
            <PeopleIcon sx={{ color: "#ff9800", fontSize: 16 }} />
            <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.82rem" }}>{r.partySize} personas</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.7}>
            <AccessTimeIcon sx={{ color: "#ff9800", fontSize: 16 }} />
            <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.82rem" }}>{time} hs</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.7} sx={{ gridColumn: "1/-1" }}>
            <CalendarTodayIcon sx={{ color: "#ff9800", fontSize: 16 }} />
            <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.82rem" }}>{date}</Typography>
          </Box>
        </Box>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 1.5 }} />
        <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", mb: 0.3 }}>Cliente</Typography>
        <Typography sx={{ color: "white", fontWeight: 600, fontSize: "0.88rem" }}>{r.user.name}</Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.75rem", mb: 1.5 }}>{r.user.email}</Typography>
        {r.cancelReason && (
          <Box sx={{ backgroundColor: "rgba(244,67,54,0.08)", border: "1px solid rgba(244,67,54,0.2)", borderRadius: 1.5, p: 1.2 }}>
            <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.7rem", mb: 0.3 }}>Motivo</Typography>
            <Typography sx={{ color: "#ff6b6b", fontSize: "0.82rem", fontStyle: "italic" }}>{r.cancelReason}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// Sección paginada
function PaginatedSection({ items, renderItem, emptyMsg }: {
  items: any[]; renderItem: (item: any) => React.ReactNode; emptyMsg: string;
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const paged = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [items.length]);

  if (items.length === 0) return <Typography sx={{ color: "rgba(255,255,255,0.4)", py: 2 }}>{emptyMsg}</Typography>;

  return (
    <Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
        {paged.map(renderItem)}
      </Box>
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)}
            sx={{ "& .MuiPaginationItem-root": { color: "white" }, "& .Mui-selected": { backgroundColor: "#ff9800 !important", color: "white" } }} />
        </Box>
      )}
    </Box>
  );
}

export default function AdminReservationsList({ refresh, onComplete }: AdminReservationsListProps) {
  const [pendingReservations, setPendingReservations] = useState<Reservation[]>([]);
  const [acceptedReservations, setAcceptedReservations] = useState<Reservation[]>([]);
  const [cancelledReservations, setCancelledReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localCancelReasons, setLocalCancelReasons] = useState<Record<string, string>>({});
  const [localExceptions, setLocalExceptions] = useState<Record<string, string>>({});
  const [openMesaModal, setOpenMesaModal] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [tablesUsed, setTablesUsed] = useState(1);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success'|'error'|'warning' }>({ open: false, msg: '', severity: 'success' });
  const showSnack = (msg: string, severity: 'success'|'error'|'warning' = 'success') => setSnack({ open: true, msg, severity });
  const [tablesInfoByRestaurant, setTablesInfoByRestaurant] = useState<Record<string, { total: number; used: number; available: number }>>({});

  const today = new Date();
  const [searchDate, setSearchDate] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`);

  const BASE = process.env.NEXT_PUBLIC_API_URL;

  const loadReservations = async () => {
    const token = localStorage.getItem("authToken");
    const adminId = localStorage.getItem("userId");
    if (!token || !adminId) return;
    setLoading(true); setError(null);
    try {
      const [pendingRes, acceptedRes, cancelledRes] = await Promise.all([
        fetch(`${BASE}/reservations/admin/pending/${adminId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE}/reservations/admin/accepted/${adminId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE}/reservations/admin/cancelled/${adminId}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setPendingReservations(await pendingRes.json());
      setAcceptedReservations(await acceptedRes.json());
      setCancelledReservations(await cancelledRes.json());
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const loadTablesInfo = async (restaurantId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    const [y, m, d] = searchDate.split("-").map(Number);
    const dateForQuery = new Date(Date.UTC(y, m - 1, d)).toISOString();
    const res = await fetch(`${BASE}/restaurants/${restaurantId}/tables?date=${dateForQuery}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return;
    const data = await res.json();
    setTablesInfoByRestaurant(prev => ({ ...prev, [restaurantId]: { total: data.totalTables, used: data.tablesUsed, available: data.availableTables } }));
  };

  useEffect(() => { loadReservations(); }, [refresh, searchDate]);

  useEffect(() => {
    const ids = new Set<string>();
    pendingReservations.forEach(r => ids.add(r.restaurant.id));
    acceptedReservations.forEach(r => ids.add(r.restaurant.id));
    ids.forEach(id => loadTablesInfo(id));
  }, [pendingReservations, acceptedReservations, searchDate]);

  const handleAcceptClick = (r: Reservation) => { setSelectedReservationId(r.id); setSelectedRestaurantId(r.restaurant.id); setTablesUsed(1); setOpenMesaModal(true); };

  const handleAction = async (id: string, action: "reject") => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    if (localExceptions[id]) {
      await fetch(`${BASE}/reservations/${id}/exception`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ message: localExceptions[id] }) });
    }
    const res = await fetch(`${BASE}/reservations/${id}/${action}`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setPendingReservations(prev => prev.filter(r => r.id !== id));
  };

  const confirmAcceptWithTables = async () => {
    if (!selectedReservationId) return;
    const token = localStorage.getItem("authToken");
    if (!token) return;
    const info = tablesInfoByRestaurant[selectedRestaurantId!];
    if (!info || tablesUsed > info.available) { showSnack("No hay suficientes mesas disponibles para ese día.", "warning"); return; }
    if (localExceptions[selectedReservationId]) {
      await fetch(`${BASE}/reservations/${selectedReservationId}/exception`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ message: localExceptions[selectedReservationId] }) });
    }
    const res = await fetch(`${BASE}/reservations/${selectedReservationId}/accept`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ tablesUsed }) });
    if (res.ok) { setOpenMesaModal(false); setSelectedReservationId(null); await loadReservations(); }
  };

  const handleCancel = async (id: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    const reason = localCancelReasons[id];
    if (!reason?.trim()) { showSnack("Debes ingresar una razón para cancelar la reserva.", "warning"); return; }
    const res = await fetch(`${BASE}/reservations/${id}/cancel`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ reason }) });
    if (res.ok) loadReservations();
  };

  const handleCompleted = async (id: string, completed: boolean) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    const res = await fetch(`${BASE}/reservations/${id}/completed`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ completed }) });
    if (res.ok) {
      if (completed && onComplete) { const r = acceptedReservations.find(r => r.id === id); if (r) onComplete(r); }
      loadReservations();
    }
  };

  const filterByDate = (list: Reservation[]) => list.filter(r => r.date.split("T")[0] === searchDate);
  const filteredPending = filterByDate(pendingReservations);
  const filteredAccepted = filterByDate(acceptedReservations);
  const filteredCancelled = filterByDate(cancelledReservations);

  if (loading) return <Typography sx={{ color: "white" }}>Cargando reservas...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  const accordionSx = { backgroundColor: "#0d0d0d", color: "white", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px !important", mb: 2, "&:before": { display: "none" } };

  return (
    <Container sx={{ mt: 4 }}>
      {/* Selector de fecha + contadores */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "280px 1fr" }, gap: 3, mb: 4, alignItems: "start" }}>

        {/* Selector de fecha */}
        <Box sx={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2, p: 2 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1.5}>
            <CalendarTodayIcon sx={{ color: "#ff9800", fontSize: 20 }} />
            <Typography sx={{ color: "white", fontWeight: 600, fontSize: "0.95rem" }}>Filtrar por fecha</Typography>
          </Box>
          <TextField
            type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)}
            fullWidth size="small"
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiOutlinedInput-root": { color: "white", backgroundColor: "rgba(255,255,255,0.05)", "& fieldset": { borderColor: "rgba(255,255,255,0.2)" }, "&:hover fieldset": { borderColor: "#ff9800" }, "&.Mui-focused fieldset": { borderColor: "#ff9800" } },
              "& input::-webkit-calendar-picker-indicator": { filter: "invert(1)", cursor: "pointer" },
            }}
          />
          <Box display="flex" gap={1} mt={1.5} flexWrap="wrap">
            {["Hoy", "Mañana"].map((label, i) => {
              const d = new Date(); d.setDate(d.getDate() + i);
              const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              return (
                <Chip key={label} label={label} size="small" onClick={() => setSearchDate(val)}
                  sx={{ cursor: "pointer", backgroundColor: searchDate === val ? "#ff9800" : "rgba(255,255,255,0.08)", color: "white", fontWeight: 600, fontSize: "0.72rem", "&:hover": { backgroundColor: searchDate === val ? "#ff9800" : "rgba(255,255,255,0.15)" } }} />
              );
            })}
          </Box>
        </Box>

        {/* Contadores de mesas */}
        <Box>
          {Object.entries(tablesInfoByRestaurant).length === 0 ? (
            <Box sx={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2, p: 3, textAlign: "center" }}>
              <TableBarIcon sx={{ color: "rgba(255,255,255,0.2)", fontSize: 32, mb: 1 }} />
              <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>No hay información de mesas para esta fecha</Typography>
            </Box>
          ) : (
            Object.entries(tablesInfoByRestaurant).map(([restaurantId, info]) => {
              const restaurant = pendingReservations.find(r => r.restaurant.id === restaurantId)?.restaurant || acceptedReservations.find(r => r.restaurant.id === restaurantId)?.restaurant;
              if (!restaurant) return null;
              return <TableCounter key={restaurantId} name={restaurant.name} info={info} />;
            })
          )}
        </Box>
      </Box>

      {/* Pendientes */}
      <Accordion defaultExpanded sx={accordionSx}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />} sx={{ borderRadius: 2 }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#ff9800" }} />
            <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>Pendientes</Typography>
            <Chip label={filteredPending.length} size="small" sx={{ backgroundColor: "#ff9800", color: "white", fontWeight: 700, height: 20, fontSize: "0.72rem" }} />
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <PaginatedSection
            items={filteredPending}
            emptyMsg="No hay reservas pendientes para esta fecha."
            renderItem={(r) => (
              <ReservationCard key={r.id} r={r} isAccepted={false}
                onAccept={() => handleAcceptClick(r)}
                onReject={() => handleAction(r.id, "reject")}
                exception={localExceptions[r.id]}
                onExceptionChange={(v) => setLocalExceptions(prev => ({ ...prev, [r.id]: v }))}
              />
            )}
          />
        </AccordionDetails>
      </Accordion>

      {/* Aceptadas */}
      <Accordion sx={accordionSx}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#4caf50" }} />
            <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>Aceptadas</Typography>
            <Chip label={filteredAccepted.length} size="small" sx={{ backgroundColor: "#4caf50", color: "white", fontWeight: 700, height: 20, fontSize: "0.72rem" }} />
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <PaginatedSection
            items={filteredAccepted}
            emptyMsg="No hay reservas aceptadas para esta fecha."
            renderItem={(r) => (
              <ReservationCard key={r.id} r={r} isAccepted={true}
                onCancel={() => handleCancel(r.id)}
                onComplete={(done) => handleCompleted(r.id, done)}
                cancelReason={localCancelReasons[r.id]}
                onCancelReasonChange={(v) => setLocalCancelReasons(prev => ({ ...prev, [r.id]: v }))}
              />
            )}
          />
        </AccordionDetails>
      </Accordion>

      {/* Canceladas */}
      <Accordion sx={accordionSx}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#757575" }} />
            <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>Canceladas</Typography>
            <Chip label={filteredCancelled.length} size="small" sx={{ backgroundColor: "#757575", color: "white", fontWeight: 700, height: 20, fontSize: "0.72rem" }} />
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <PaginatedSection
            items={filteredCancelled}
            emptyMsg="No hay reservas canceladas para esta fecha."
            renderItem={(r) => <CancelledCard key={r.id} r={r} />}
          />
        </AccordionDetails>
      </Accordion>

      {/* Modal mesas */}
      <Dialog open={openMesaModal} onClose={() => setOpenMesaModal(false)}
        PaperProps={{ sx: { backgroundColor: "#1a1a1a", color: "white", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 3, minWidth: 320 } }}>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.08)", pb: 2 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <TableBarIcon sx={{ color: "#ff9800" }} />
            Asignar mesas
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedRestaurantId && tablesInfoByRestaurant[selectedRestaurantId] && (
            <Box sx={{ backgroundColor: "rgba(255,152,0,0.08)", border: "1px solid rgba(255,152,0,0.2)", borderRadius: 1.5, p: 1.5, mb: 2 }}>
              <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.78rem", mb: 0.5 }}>Disponibles hoy</Typography>
              <Typography sx={{ color: "#ff9800", fontWeight: 700, fontSize: "1.4rem" }}>
                {tablesInfoByRestaurant[selectedRestaurantId].available} mesas libres
              </Typography>
            </Box>
          )}
          <TextField type="number" label="Mesas a asignar" fullWidth inputProps={{ min: 1 }} value={tablesUsed}
            onChange={(e) => setTablesUsed(Number(e.target.value))} sx={{ "& .MuiOutlinedInput-root": { color: "white", "& fieldset": { borderColor: "rgba(255,255,255,0.2)" } }, "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" } }} />
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid rgba(255,255,255,0.08)", p: 2, gap: 1 }}>
          <Button onClick={() => setOpenMesaModal(false)} sx={{ color: "rgba(255,255,255,0.5)" }}>Cancelar</Button>
          <Button variant="contained" onClick={confirmAcceptWithTables}
            sx={{ backgroundColor: "#ff9800", "&:hover": { backgroundColor: "#e86f00" }, fontWeight: 700 }}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Container>
  );
}