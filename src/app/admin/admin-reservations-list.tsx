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
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface Reservation {
  id: string;
  date: string;
  partySize: number;
  restaurant: { id: string; name: string };
  user: { name: string; email: string };
  cancelReason?: string;
  completed?: boolean;
}

interface AdminReservationsListProps {
  refresh: number;
  onComplete?: (reservation: Reservation) => void; // <-- prop para notificar completadas
}

export default function AdminReservationsList({ refresh, onComplete }: AdminReservationsListProps) {
  const [pendingReservations, setPendingReservations] = useState<Reservation[]>([]);
  const [acceptedReservations, setAcceptedReservations] = useState<Reservation[]>([]);
  const [cancelledReservations, setCancelledReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [adminRestaurantId, setAdminRestaurantId] = useState<string | null>(null);


  const [localCancelReasons, setLocalCancelReasons] = useState<{ [id: string]: string }>({});
  const [localExceptions, setLocalExceptions] = useState<{ [id: string]: string }>({});

  // ===== MODAL MESAS =====
  const [openMesaModal, setOpenMesaModal] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [tablesUsed, setTablesUsed] = useState<number>(1);
  const [tablesInfoByRestaurant, setTablesInfoByRestaurant] = useState<
    Record<string, { total: number; used: number; available: number }>  
  >({});

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const [searchDate, setSearchDate] = useState(`${yyyy}-${mm}-${dd}`);

  const BASE = process.env.NEXT_PUBLIC_API_URL;

  const loadReservations = async () => {
    const token = localStorage.getItem("authToken");
    const adminId = localStorage.getItem("userId");
    if (!token || !adminId) return;

    setLoading(true);
    setError(null);

    try {
      const [pendingRes, acceptedRes, cancelledRes] = await Promise.all([
        fetch(`${BASE}/reservations/admin/pending/${adminId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE}/reservations/admin/accepted/${adminId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE}/reservations/admin/cancelled/${adminId}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const pendingData = await pendingRes.json();
      setPendingReservations(pendingData);

      if (pendingData.length > 0) {
        setAdminRestaurantId(pendingData[0].restaurant.id);
      }
      setAcceptedReservations(await acceptedRes.json());
      setCancelledReservations(await cancelledRes.json());
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTablesInfo = async (restaurantId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    console.log("Fetching tables with:", {
      restaurantId,
      searchDate,
    });

    const calendarDateToQuery = (dateStr: string) => {
      const [y, m, d] = dateStr.split("-").map(Number);
      return new Date(Date.UTC(y, m - 1, d, 0, 0, 0)).toISOString();
    };

    const dateForQuery = calendarDateToQuery(searchDate);

    const res = await fetch(
      `${BASE}/restaurants/${restaurantId}/tables?date=${dateForQuery}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) return;

    const data = await res.json();

    setTablesInfoByRestaurant(prev => ({
      ...prev,
      [restaurantId]: {
        total: data.totalTables,
        used: data.tablesUsed,
        available: data.availableTables,
      }
    }));
  };

  useEffect(() => {
    loadReservations();
  }, [refresh, searchDate]);
  
  useEffect(() => {
    const restaurantIds = new Set<string>();

    pendingReservations.forEach(r => restaurantIds.add(r.restaurant.id));
    acceptedReservations.forEach(r => restaurantIds.add(r.restaurant.id));

    if (restaurantIds.size === 0) return;

    restaurantIds.forEach(id => {
      loadTablesInfo(id);
    });
  }, [pendingReservations, acceptedReservations, searchDate]);


  const handleAction = async (id: string, action: "reject") => {
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
      setPendingReservations(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleAcceptClick = (r: Reservation) => {
    setSelectedReservationId(r.id);
    setSelectedRestaurantId(r.restaurant.id);
    setTablesUsed(1);
    setOpenMesaModal(true);
  };

  const reloadAllTablesInfo = async () => {
    const restaurantIds = new Set<string>();

    pendingReservations.forEach(r => restaurantIds.add(r.restaurant.id));
    acceptedReservations.forEach(r => restaurantIds.add(r.restaurant.id));

    for (const id of restaurantIds) {
      await loadTablesInfo(id);
    }
  };

  const confirmAcceptWithTables = async () => {
    if (!selectedReservationId) return;

    const token = localStorage.getItem("authToken");
      if (!token) return;

    const info = tablesInfoByRestaurant[selectedRestaurantId!];
    if (!info || tablesUsed > info.available) {
      alert("No hay suficientes mesas disponibles para ese día");
      return;
    }

    if (localExceptions[selectedReservationId]) {
      await fetch(`${BASE}/reservations/${selectedReservationId}/exception`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: localExceptions[selectedReservationId] }),
      });
    }

    const res = await fetch(`${BASE}/reservations/${selectedReservationId}/accept`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tablesUsed }),
    });

    if (res.ok) {
      setOpenMesaModal(false);
      setSelectedReservationId(null);

      await loadReservations();
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

  const handleCompleted = async (id: string, completed: boolean) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const res = await fetch(`${BASE}/reservations/${id}/completed`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ completed }),
    });

    if (res.ok) {
      const updatedReservation = acceptedReservations.find(r => r.id === id);
      if (completed && updatedReservation && onComplete) {
        onComplete(updatedReservation); 
      }
      loadReservations();
    }
  };

  if (loading) return <Typography>Cargando reservas...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  const filterByDate = (reservations: Reservation[]) =>
    reservations.filter(r => {

      const datePart = r.date.split('T')[0];

      return datePart === searchDate;
    });

  const filteredPending = filterByDate(pendingReservations);
  const filteredAccepted = filterByDate(acceptedReservations);
  const filteredCancelled = filterByDate(cancelledReservations);

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
        <Typography variant="body2" sx={{ mb: 1 }}>
          {(() => {
            const [datePart, timePart] = r.date.split('T');
            const [year, month, day] = datePart.split('-');
            const time = timePart.substring(0, 5);
            return `${day}/${month}/${year} a las ${time} hs`;
          })()}
        </Typography>

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
          <>
            <TextField
              label="Razón de cancelación"
              placeholder="Motivo de cancelación"
              size="small"
              fullWidth
              sx={{ mb: 1 }}
              value={localCancelReasons[r.id] || ""}
              onChange={(e) => setLocalCancelReasons(prev => ({ ...prev, [r.id]: e.target.value }))}
            />
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button variant="contained" sx={{ backgroundColor: "#ff9800" }} onClick={() => handleCancel(r.id)}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: "#4caf50" }}
                onClick={() => handleCompleted(r.id, true)}
              >
                Completada
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: "#f44336" }}
                onClick={() => handleCompleted(r.id, false)}
              >
                Incumplida
              </Button>
            </Box>
          </>
        )}

        {!isAccepted && (
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button variant="contained" sx={{ backgroundColor: "#ff9800" }} onClick={() => handleAcceptClick(r)}>
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
        <Typography variant="body2" sx={{ mb: 1 }}>
          {(() => {
            const partes = r.date.split('T'); 
            const fecha = partes[0]; 
            const horaCompleta = partes[1]; 

            const [anio, mes, dia] = fecha.split('-');
            const horaMinutos = horaCompleta.substring(0, 5);

            return `${dia}/${mes}/${anio} a las ${horaMinutos} hs`;
          })()}
        </Typography>

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
      <Grid container spacing={2} alignItems="stretch" sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <TextField
            type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{ backgroundColor: "white", borderRadius: 2 }}
            />
        </Grid>

        <Grid item xs={12} md={8}>
          {Object.entries(tablesInfoByRestaurant).map(([restaurantId, info]) => {
            const restaurant =
              pendingReservations.find(r => r.restaurant.id === restaurantId)?.restaurant ||
              acceptedReservations.find(r => r.restaurant.id === restaurantId)?.restaurant;

            if (!restaurant) return null;

            return (
              <Card key={restaurantId} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">
                    Mesas del día: {restaurant.name}
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body2">Totales</Typography>
                      <Typography variant="h6">{info.total}</Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2">Usadas</Typography>
                      <Typography variant="h6">{info.used}</Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2">Disponibles</Typography>
                      <Typography
                        variant="h6"
                        color={info.available <= 0 ? "error" : "primary"}
                      >
                        {info.available}
                </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            );
          })}
      </Grid>
    </Grid>


      {/* --- PENDIENTES --- */}
      <Accordion defaultExpanded sx={{ backgroundColor: "#100f0fff", color: "white" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Pendientes <Badge badgeContent={filteredPending.length} color="secondary" sx={{ ml: 1 }} />
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {filteredPending.length === 0 && <Typography>No hay reservas pendientes</Typography>}
            {filteredPending.map(r => (
              <Grid key={r.id} item xs={12} sm={6} md={4} lg={3}>
                {renderReservationCard(r, false)}
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* --- ACEPTADAS --- */}
      <Accordion sx={{ backgroundColor: "#100f0fff", color: "white", mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Aceptadas <Badge badgeContent={filteredAccepted.length} color="secondary" sx={{ ml: 1 }} />
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {filteredAccepted.length === 0 && <Typography>No hay reservas aceptadas</Typography>}
            {filteredAccepted.map(r => (
              <Grid key={r.id} item xs={12} sm={6} md={4} lg={3}>
                {renderReservationCard(r, true)}
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* --- CANCELADAS --- */}
      <Accordion sx={{ backgroundColor: "#100f0fff", color: "white", mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Canceladas <Badge badgeContent={filteredCancelled.length} color="secondary" sx={{ ml: 1 }} />
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {filteredCancelled.length === 0 && <Typography>No hay reservas canceladas</Typography>}
            {filteredCancelled.map(r => (
              <Grid key={r.id} item xs={12} sm={6} md={4} lg={3}>
                {renderCancelledCard(r)}
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
      <Dialog open={openMesaModal} onClose={() => setOpenMesaModal(false)}>
        <DialogTitle>Asignar mesas</DialogTitle>

        <DialogContent>
          <TextField
            type="number"
            label="Cantidad de mesas a usar"
            fullWidth
            inputProps={{ min: 1 }}
            value={tablesUsed}
            onChange={(e) => setTablesUsed(Number(e.target.value))}
            sx={{ mt: 1 }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenMesaModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#ff9800" }}
            onClick={confirmAcceptWithTables}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
