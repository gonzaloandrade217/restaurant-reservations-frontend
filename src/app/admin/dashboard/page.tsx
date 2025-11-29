'use client';

import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Divider,
  Tabs,
  Tab,
  Paper,
  Button,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import PeopleIcon from "@mui/icons-material/People";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import BookOnlineIcon from "@mui/icons-material/BookOnline";

import UserList from "../../users/user-list";
import CreateRestaurantForm from "../../restaurants/create-restaurant";
import RestaurantList from "../../restaurants/restaurant-list";
import AdminReservationsList from "../admin-reservations-list";

export default function AdminDashboardPage() {
  const isMobile = useMediaQuery("(max-width: 600px)");

  const [refreshRestaurants, setRefreshRestaurants] = useState(0);
  const [refreshUsers, setRefreshUsers] = useState(0);
  const [refreshReservations, setRefreshReservations] = useState(0);

  const [section, setSection] = useState<"restaurantes" | "reservas" | "usuarios">("restaurantes");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [hasPending, setHasPending] = useState(false);

  const handleRestaurantCreated = () => setRefreshRestaurants(prev => prev + 1);

  // ------------------ FETCH RESERVAS PENDIENTES ------------------
  const fetchPendingReservations = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const adminId = localStorage.getItem("userId");
      if (!token || !adminId) return;

      const res = await fetch(`http://192.168.1.6:4000/reservations/admin/pending/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const data = await res.json();
      setHasPending(data.length > 0);
    } catch (err) {
      console.error("Error cargando reservas pendientes", err);
    }
  };

  useEffect(() => {
    fetchPendingReservations();
    const interval = setInterval(fetchPendingReservations, 5000); // chequea cada 5s
    return () => clearInterval(interval);
  }, [refreshReservations]);

  const tabValue =
    section === "restaurantes" ? 0 :
    section === "reservas" ? 1 :
    section === "usuarios" ? 2 :
    false;

  // ------------------------ MENÚ HAMBURGUESA ------------------------
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(menuAnchor);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setMenuAnchor(event.currentTarget);
  const handleMenuClose = () => setMenuAnchor(null);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  const handleDeleteAccount = async () => {
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
      window.location.href = "/";
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ------------------------ RENDER ------------------------
  return (
    <Container sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          mb: 4,
          px: 2,
          py: 1.5,
          backgroundColor: "#ff9800",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          borderRadius: 2,
          overflowX: "auto"
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "#fff",
            whiteSpace: "nowrap"
          }}
        >
          MesaSegura - Administración
        </Typography>

        {!isMobile && (
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => {
              if (newValue === 0) setSection("restaurantes");
              if (newValue === 1) setSection("reservas");
              if (newValue === 2) setSection("usuarios");
            }}
            textColor="inherit"
            TabIndicatorProps={{ style: { background: "white" } }}
            sx={{
              flex: 1,
              "& .MuiTab-root": { minWidth: "120px", padding: "6px 10px", fontSize: "0.85rem", fontWeight: 600 }
            }}
          >
            <Tab icon={<RestaurantMenuIcon />} label="Restaurantes" />
            <Tab
              icon={
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  <BookOnlineIcon />
                  {hasPending && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -4,
                        right: -4,
                        width: 12,
                        height: 12,
                        bgcolor: "red",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                </Box>
              }
              label="Reservas"
            />
            <Tab icon={<PeopleIcon />} label="Usuarios" />
          </Tabs>
        )}

        <IconButton onClick={handleMenuOpen} sx={{ color: "white" }}>
          <MenuIcon />
        </IconButton>

        <Menu anchorEl={menuAnchor} open={openMenu} onClose={handleMenuClose}>
          {isMobile && [
            <MenuItem key="restaurantes" onClick={() => { setSection("restaurantes"); handleMenuClose(); }}>Restaurantes</MenuItem>,
            <MenuItem key="reservas" onClick={() => { setSection("reservas"); handleMenuClose(); }}>
              <Box sx={{ position: "relative", display: "inline-flex" }}>
                Reservas
                {hasPending && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: -4,
                      width: 12,
                      height: 12,
                      bgcolor: "red",
                      borderRadius: "50%",
                    }}
                  />
                )}
              </Box>
            </MenuItem>,
            <MenuItem key="usuarios" onClick={() => { setSection("usuarios"); handleMenuClose(); }}>Usuarios</MenuItem>,
            <Divider key="divider" sx={{ my: 1 }} />,
          ]}
          <MenuItem onClick={() => { handleMenuClose(); handleLogout(); }}>Cerrar sesión</MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); handleDeleteAccount(); }} sx={{ color: "red" }}>
            Eliminar cuenta
          </MenuItem>
        </Menu>
      </Paper>

      {/* SECCIONES */}
      {section === "restaurantes" && (
        <Box sx={{ mb: 6, p: 3, backgroundColor: "black", border: "1px solid white", borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom sx={{ color: "white" }}>Gestión de Restaurantes</Typography>
          <Button
            variant="contained"
            sx={{ mt: 2, mb: 3, backgroundColor: "#ff9800", "&:hover": { backgroundColor: "#e67834" } }}
            onClick={() => setShowCreateForm(prev => !prev)}
          >
            {showCreateForm ? "Cerrar formulario" : "Crear restaurante"}
          </Button>
          {showCreateForm && <Box sx={{ mb: 3 }}><CreateRestaurantForm onCreated={handleRestaurantCreated} /></Box>}
          <Divider sx={{ my: 3, borderColor: "white" }} />
          <RestaurantList refresh={refreshRestaurants} />
        </Box>
      )}

      {section === "reservas" && (
        <Box sx={{ mb: 6, p: 3, backgroundColor: "black", border: "1px solid white", borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom sx={{ color: "white" }}>Reservas</Typography>
          <Divider sx={{ my: 3, borderColor: "white" }} />
          <AdminReservationsList refresh={refreshReservations} />
        </Box>
      )}

      {section === "usuarios" && (
        <Box sx={{ mb: 6, p: 3, backgroundColor: "black", border: "1px solid white", borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom sx={{ color: "white" }}>Lista de Usuarios</Typography>
          <Divider sx={{ my: 3, borderColor: "white" }} />
          <UserList refresh={refreshUsers} />
        </Box>
      )}
    </Container>
  );
}
