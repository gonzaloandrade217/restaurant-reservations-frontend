'use client';

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Container,
  Tabs,
  Tab,
  Paper,
  Divider,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import BookOnlineIcon from "@mui/icons-material/BookOnline";

import { useRouter } from "next/navigation";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  image?: string;
}

export default function UsersDashboardPage() {
  const isMobile = useMediaQuery("(max-width: 600px)");
  const router = useRouter();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event: any) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const logout = () => {
    localStorage.clear();
    router.push("/");
  };

  const deleteAccount = async () => {
    if (!confirm("¿Seguro que querés eliminar tu cuenta? Esta acción no se puede deshacer.")) return;

    try {
      const token = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");
      if (!token || !userId) throw new Error("No estás autenticado.");

      const res = await fetch(`http://192.168.1.6:4000/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al eliminar usuario");

      alert("Usuario eliminado correctamente.");
      localStorage.clear();
      router.push("/");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const [section, setSection] = useState<"restaurantes" | "reservas">("restaurantes");

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reservations, setReservations] = useState<any[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [reservationsError, setReservationsError] = useState<string | null>(null);

  // Notificaciones
  const [newNotification, setNewNotification] = useState(false);

  // -------------------- FETCH RESTAURANTES --------------------
  useEffect(() => {
    if (section !== "restaurantes") return;

    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No se encontró token.");

        const res = await fetch("http://192.168.1.6:4000/restaurants", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error al obtener restaurantes");

        setRestaurants(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [section]);

  // -------------------- FETCH RESERVAS Y NOTIFICACIONES --------------------
  useEffect(() => {
    let previousReservations: any[] = [];

    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const userId = localStorage.getItem("userId");
        if (!token || !userId) throw new Error("Sesión inválida.");

        const res = await fetch(`http://192.168.1.6:4000/reservations/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error al obtener reservas");

        const data: any[] = await res.json();

        // Detectar cambios de estado
        const hasStateChanged = data.some(r => {
          const prev = previousReservations.find(pr => pr.id === r.id);
          return prev && prev.status !== r.status;
        });

        if (hasStateChanged && section !== "reservas") setNewNotification(true);
        if (section === "reservas") setNewNotification(false);

        setReservations(data);
        previousReservations = data;
      } catch (err: any) {
        setReservationsError(err.message);
      } finally {
        setReservationsLoading(false);
      }
    };

    fetchReservations();
    const interval = setInterval(fetchReservations, 5000); // recarga automática
    return () => clearInterval(interval);
  }, [section]);

  const handleReserveClick = (restaurantId: string) => {
    router.push(`/reservations/select-seats?restaurant=${restaurantId}`);
  };

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

  const tabValue = section === "restaurantes" ? 0 : 1;

  return (
    <Container sx={{ py: 4, pb: isMobile ? 10 : 4 }}>
      {/* -------------------- NAVBAR -------------------- */}
      <Paper
        elevation={3}
        sx={{
          mb: 4,
          p: 2,
          backgroundColor: "#ff9800",
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderRadius: 2,
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.8rem",
            fontWeight: 700,
            color: "white",
            whiteSpace: "nowrap",
          }}
        >
          MesaSegura
        </Typography>

        {!isMobile && (
          <Tabs
            value={tabValue}
            onChange={(e, v) => setSection(v === 0 ? "restaurantes" : "reservas")}
            textColor="inherit"
            TabIndicatorProps={{ style: { background: "white" } }}
            sx={{
              ml: 0,
              "& .MuiTab-root": {
                minHeight: "45px",
                padding: "4px 10px",
              },
            }}
          >
            <Tab icon={<RestaurantMenuIcon />} label="Restaurantes" />
            <Tab
              icon={<BookOnlineIcon />}
              label={
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  Mis Reservas
                  {newNotification && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -6,
                        right: -12,
                        width: 12,
                        height: 12,
                        bgcolor: "red",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                </Box>
              }
            />
          </Tabs>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <IconButton onClick={handleMenuOpen} sx={{ color: "white" }}>
          <MenuIcon />
        </IconButton>

        <Menu anchorEl={anchorEl} open={openMenu} onClose={handleMenuClose}>
          <MenuItem onClick={logout}>Cerrar sesión</MenuItem>
          <MenuItem onClick={deleteAccount} sx={{ color: "red" }}>
            Eliminar cuenta
          </MenuItem>
        </Menu>
      </Paper>

      {/* -------------------- SECCIÓN RESTAURANTES -------------------- */}
      {section === "restaurantes" && (
        <Box sx={{ mb: 12 }}>
          <Typography variant="h4" sx={{ color: "white", mb: 2 }}>
            Restaurantes disponibles
          </Typography>
          <Divider sx={{ borderColor: "white", mb: 3 }} />

          {loading ? (
            <Typography sx={{ color: "white" }}>Cargando restaurantes...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <Box
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              }}
              gap={3}
            >
              {restaurants.map((restaurant) => (
                <Card
                  key={restaurant.id}
                  sx={{ backgroundColor: "#111", color: "white", border: "1px solid white" }}
                >
                  {restaurant.image && (
                    <CardMedia
                      component="img"
                      height="180"
                      image={restaurant.image}
                      alt={restaurant.name}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6">{restaurant.name}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {restaurant.description}
                    </Typography>

                    <Button
                      variant="contained"
                      sx={{ mt: 2, backgroundColor: "#ff9800" }}
                      fullWidth
                      onClick={() => handleReserveClick(restaurant.id)}
                    >
                      Reservar mesa
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* -------------------- SECCIÓN RESERVAS -------------------- */}
      {section === "reservas" && (
        <Box sx={{ mb: 12 }}>
          <Typography variant="h4" sx={{ color: "white", mb: 2 }}>
            Mis reservas
          </Typography>
          <Divider sx={{ borderColor: "white", mb: 3 }} />

          {reservationsLoading && <Typography sx={{ color: "white" }}>Cargando reservas...</Typography>}

          {reservationsError && <Typography color="error">{reservationsError}</Typography>}

          {!reservationsLoading && (
            <Box display="grid" gap={2}>
              {reservations.map((r) => (
                <Card key={r.id} sx={{ backgroundColor: "#111", color: "white", border: "1px solid white", p: 2 }}>
                  <Typography variant="h6">Restaurante: {r.restaurant?.name}</Typography>
                  <Typography>Fecha: {formatDate(r.date)}</Typography>
                  <Typography>Personas: {r.people}</Typography>
                  <Typography sx={{ mt: 1, fontWeight: "bold", color: statusColor(r.status) }}>
                    {translateStatus(r.status)}
                  </Typography>
                </Card>
              ))}

              {reservations.length === 0 && (
                <Typography align="center" sx={{ color: "white", mt: 2 }}>
                  No tenés reservas aún.
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* -------------------- MOBILE TABS -------------------- */}
      {isMobile && (
        <Paper
          elevation={3}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#ff9800",
            borderRadius: 0,
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => {
              if (newValue === 0) setSection("restaurantes");
              if (newValue === 1) setSection("reservas");
            }}
            textColor="inherit"
            TabIndicatorProps={{ style: { background: "white" } }}
            variant="fullWidth"
          >
            <Tab icon={<RestaurantMenuIcon />} label="Restaurantes" />
            <Tab
              icon={<BookOnlineIcon />}
              label={
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  Mis Reservas
                  {newNotification && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -6,
                        right: -12,
                        width: 12,
                        height: 12,
                        bgcolor: "red",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                </Box>
              }
            />
          </Tabs>
        </Paper>
      )}
    </Container>
  );
}
