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

  const [section, setSection] = useState<"usuarios" | "restaurantes" | "reservas" | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleRestaurantCreated = () => {
    setRefreshRestaurants(prev => prev + 1);
  };

  const tabValue =
    section === "usuarios" ? 0 :
    section === "restaurantes" ? 1 :
    section === "reservas" ? 2 :
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

  const handleDeleteAccount = () => {
    if (confirm("¿Seguro que querés eliminar tu cuenta? Esta acción no se puede deshacer.")) {
      alert("Acá iría la lógica para eliminar al usuario");
    }
  };

  return (
    <Container sx={{ py: 4 }}>

      {/* ---------------------- NAVBAR (UNA SOLA LÍNEA) ---------------------- */}
      <Paper
        elevation={3}
        sx={{
          mb: 4,
          px: 2,
          py: 1.5,
          backgroundColor: "#FF8C42",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          borderRadius: 2,
          overflowX: "auto",
        }}
      >

        {/* IZQUIERDA → TÍTULO */}
        <Typography
          sx={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "#fff",
            whiteSpace: "nowrap",
          }}
        >
          Administración
        </Typography>

        {/* CENTRO → TABS */}
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => {
            if (newValue === 0) setSection("usuarios");
            if (newValue === 1) setSection("restaurantes");
            if (newValue === 2) setSection("reservas");
          }}
          variant="scrollable"
          scrollButtons={false}
          textColor="inherit"
          TabIndicatorProps={{ style: { background: "white" } }}
          sx={{
            flex: 1,
            "& .MuiTab-root": {
              minWidth: "120px",
              padding: "6px 10px",
              fontSize: "0.8rem",
              fontWeight: 600,
              whiteSpace: "nowrap"
            },
          }}
        >
          <Tab icon={<PeopleIcon />} label="Usuarios" />
          <Tab icon={<RestaurantMenuIcon />} label="Restaurantes" />
          <Tab icon={<BookOnlineIcon />} label="Reservas" />
        </Tabs>

        {/* DERECHA → MENÚ HAMBURGUESA */}
        <IconButton onClick={handleMenuOpen} sx={{ color: "white" }}>
          <MenuIcon />
        </IconButton>

        <Menu
          anchorEl={menuAnchor}
          open={openMenu}
          onClose={handleMenuClose}
          PaperProps={{
          }}
        >
          <MenuItem
            onClick={() => {
              handleMenuClose();
              handleLogout();
            }}
            sx={{ "&:hover": { bgcolor: "#222" } }}
          >
            Cerrar sesión
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleMenuClose();
              handleDeleteAccount();
            }}
            sx={{ color: "red", "&:hover": { bgcolor: "#300" } }}
          >
            Eliminar cuenta
          </MenuItem>
        </Menu>

      </Paper>

      {/* ---------------------- SECCIÓN USUARIOS ---------------------- */}
      {section === "usuarios" && (
        <Box sx={{
          mb: 6,
          p: 3,
          backgroundColor: "black",
          border: "1px solid white",
          borderRadius: 2,
        }}>
          <Typography variant="h4" gutterBottom sx={{ color: "white" }}>
            Gestión de Usuarios
          </Typography>
          <Divider sx={{ my: 3, borderColor: "white" }} />
          <UserList refresh={refreshUsers} />
        </Box>
      )}

      {/* ---------------------- SECCIÓN RESTAURANTES ---------------------- */}
      {section === "restaurantes" && (
        <Box sx={{
          mb: 6,
          p: 3,
          backgroundColor: "black",
          border: "1px solid white",
          borderRadius: 2,
        }}>
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
        <Box sx={{
          mb: 6,
          p: 3,
          backgroundColor: "black",
          border: "1px solid white",
          borderRadius: 2,
        }}>
          <Typography variant="h4" gutterBottom sx={{ color: "white" }}>
            Reservas Pendientes
          </Typography>
          <Divider sx={{ my: 3, borderColor: "white" }} />
          <AdminReservationsList refresh={refreshReservations} />
        </Box>
      )}
    </Container>
  );
}
