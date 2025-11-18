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
  useMediaQuery
} from "@mui/material";

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

  return (
    <Container sx={{ py: 4 }}>

      {/* ---------------------- NAVBAR ---------------------- */}
      <Paper
        elevation={3}
        sx={{
          mb: 4,
          p: 2,
          backgroundColor: "#FF8C42",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          borderRadius: 2
        }}
      >
        {/* TÍTULO ADMINISTRACIÓN */}
        <Typography
          sx={{
            fontFamily: "'Playfair Display', serif",
            fontSize: isMobile ? "1.4rem" : "1.8rem",
            fontWeight: 700,
            color: "#fff",
            mb: isMobile ? 2 : 0
          }}
        >
          Administración
        </Typography>

        {/* TABS */}
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => {
            if (newValue === 0) setSection("usuarios");
            if (newValue === 1) setSection("restaurantes");
            if (newValue === 2) setSection("reservas");
          }}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={false}
          textColor="inherit"
          TabIndicatorProps={{ style: { background: "white" } }}
          sx={{
            minHeight: "40px",
            "& .MuiTab-root": {
              minWidth: isMobile ? "90px" : "120px",
              padding: "6px 10px",
              fontSize: "0.8rem",
              fontWeight: 600,
            }
          }}
        >
          <Tab icon={<PeopleIcon />} label="Usuarios" />
          <Tab icon={<RestaurantMenuIcon />} label="Restaurantes" />
          <Tab icon={<BookOnlineIcon />} label="Reservas" />
        </Tabs>
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

          {/* BOTÓN PARA MOSTRAR/OCULTAR FORMULARIO */}
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

          {/* FORMULARIO MOSTRADO SOLO SI SE ABRE */}
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
