'use client';

import React, { useState } from "react";
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
  MenuItem
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

  const [section, setSection] = useState< "restaurantes" | "reservas" | "usuarios">("restaurantes");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleRestaurantCreated = () => {
    setRefreshRestaurants(prev => prev + 1);
  };

  const tabValue =
    section === "restaurantes" ? 0 :
    section === "reservas" ? 1 :
    section === "usuarios" ? 2 :
    false;

  // ------------------------ MENÚ HAMBURGUESA ------------------------
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(menuAnchor);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleDeleteAccount = async () => {
    if (!confirm("¿Seguro que querés eliminar tu cuenta? Esta acción no se puede deshacer.")) return;

    try {
      const token = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId"); // asumimos que guardaste el id del admin
      if (!token || !userId) throw new Error("No estás autenticado.");

      const res = await fetch(`http://localhost:4000/users/${userId}`, {
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

  return (
    <Container sx={{ py: 4 }}>
      {/* ---------------------- NAVBAR RESPONSIVE ---------------------- */}
      <Paper
        elevation={3}
        sx={{
          mb: 4,
          px: 2,
          py: 1.5,
          backgroundColor: "#FF8C42",
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
              "& .MuiTab-root": {
                minWidth: "120px",
                padding: "6px 10px",
                fontSize: "0.85rem",
                fontWeight: 600
              }
            }}
          >
            <Tab icon={<RestaurantMenuIcon />} label="Restaurantes" />
            <Tab icon={<BookOnlineIcon />} label="Reservas" />
            <Tab icon={<PeopleIcon />} label="Usuarios" />
          </Tabs>
        )}

        <IconButton onClick={handleMenuOpen} sx={{ color: "white" }}>
          <MenuIcon />
        </IconButton>

        <Menu anchorEl={menuAnchor} open={openMenu} onClose={handleMenuClose}>
          {isMobile && [
            <MenuItem key="restaurantes" onClick={() => { setSection("restaurantes"); handleMenuClose(); }}>Restaurantes</MenuItem>,
            <MenuItem key="reservas" onClick={() => { setSection("reservas"); handleMenuClose(); }}>Reservas</MenuItem>,
            <MenuItem key="usuarios" onClick={() => { setSection("usuarios"); handleMenuClose(); }}>Usuarios</MenuItem>,
            <Divider key="divider" sx={{ my: 1 }} />,
          ]}

          <MenuItem onClick={() => { handleMenuClose(); handleLogout(); }}>Cerrar sesión</MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); handleDeleteAccount(); }} sx={{ color: "red" }}>
            Eliminar cuenta
          </MenuItem>
        </Menu>
      </Paper>

      {/* ---------------------- SECCIÓN RESTAURANTES ---------------------- */}
      {section === "restaurantes" && (
        <Box sx={{ mb: 6, p: 3, backgroundColor: "black", border: "1px solid white", borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom sx={{ color: "white" }}>
            Gestión de Restaurantes
          </Typography>

          <Button
            variant="contained"
            sx={{
              mt: 2,
              mb: 3,
              backgroundColor: "#FF8C42",
              "&:hover": { backgroundColor: "#e67834" }
            }}
            onClick={() => setShowCreateForm(prev => !prev)}
          >
            {showCreateForm ? "Cerrar formulario" : "Crear restaurante"}
          </Button>

          {showCreateForm && (
            <Box sx={{ mb: 3 }}>
              <CreateRestaurantForm onCreated={handleRestaurantCreated} />
            </Box>
          )}

          <Divider sx={{ my: 3, borderColor: "white" }} />
          <RestaurantList refresh={refreshRestaurants} />
        </Box>
      )}

      {/* ---------------------- SECCIÓN RESERVAS ---------------------- */}
      {section === "reservas" && (
        <Box sx={{ mb: 6, p: 3, backgroundColor: "black", border: "1px solid white", borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom sx={{ color: "white" }}>
            Reservas
          </Typography>
          <Divider sx={{ my: 3, borderColor: "white" }} />
          <AdminReservationsList refresh={refreshReservations} />
        </Box>
      )}

      {/* ---------------------- SECCIÓN USUARIOS ---------------------- */}
      {section === "usuarios" && (
        <Box sx={{ mb: 6, p: 3, backgroundColor: "black", border: "1px solid white", borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom sx={{ color: "white" }}>
            Lista de Usuarios
          </Typography>
          <Divider sx={{ my: 3, borderColor: "white" }} />
          <UserList refresh={refreshUsers} />
        </Box>
      )}

    </Container>
  );
}
