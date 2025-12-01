'use client';

import React, { useState, useEffect } from "react";
import { Container, Paper, Tabs, Tab, Box, TextField } from "@mui/material";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import { useMediaQuery } from "@mui/material";

import Navbar from "../components/Navbar";
import ReservationsSection from "../components/ReservationsSection";
import RestaurantsSection from "../components/RestaurantsSection";

const API = "http://192.168.1.6:4000";

export default function UsersDashboardPage() {
  const [section, setSection] = useState<"restaurantes" | "reservas">("restaurantes");
  const [newNotification, setNewNotification] = useState(false);
  const [search, setSearch] = useState("");
  const [previousReservations, setPreviousReservations] = useState<any[]>([]);

  const isMobile = useMediaQuery("(max-width:600px)");
  const tabValue = section === "restaurantes" ? 0 : 1;

  // ------------------ FETCH RESERVAS DEL USER ------------------
  const fetchUserReservations = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");
      if (!token || !userId) return;

      const res = await fetch(`${API}/reservations/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const latestReservations = await res.json();

      // Detecta cambios de estado
      const hasStateChanged = latestReservations.some((r: { id: any; status: any; }) => {
        const prev = previousReservations.find(p => p.id === r.id);
        return prev && prev.status !== r.status;
      });

      // Mostrar notificación si hubo cambio y no estamos en "reservas"
      if (hasStateChanged && section !== "reservas") setNewNotification(true);

      // Actualizamos previas
      setPreviousReservations(latestReservations);
    } catch (err) {
      console.error("Error cargando reservas del user", err);
    }
  };

  useEffect(() => {
    fetchUserReservations();
    const interval = setInterval(fetchUserReservations, 5000); // cada 5s
    return () => clearInterval(interval);
  }, [section, previousReservations]);

  // ------------------ HANDLER DE SECTION ------------------
  const handleSectionChange = (newSection: "restaurantes" | "reservas") => {
    setSection(newSection);
    if (newSection === "reservas") setNewNotification(false);
  };

  return (
    <Container sx={{ py: 4, pb: isMobile ? 10 : 4 }}>
      <Navbar section={section} setSection={handleSectionChange} newNotification={newNotification} />

      {!isMobile && (
        <Box sx={{ mb: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => handleSectionChange(newValue === 0 ? "restaurantes" : "reservas")}
            textColor="inherit"
            TabIndicatorProps={{ style: { background: "white" } }}
          >
            <Tab icon={<RestaurantMenuIcon />} label="Restaurantes" />
            <Tab
              icon={
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  <BookOnlineIcon />
                  {newNotification && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -6,
                        right: -12,
                        width: 12,
                        height: 12,
                        bgcolor: "green",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                </Box>
              }
              label="Mis Reservas"
            />
          </Tabs>

          {section === "restaurantes" && (
            <TextField
              placeholder="Buscar restaurante por nombre o ciudad"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ maxWidth: 400, backgroundColor: "white", borderRadius: 1 }}
            />
          )}
        </Box>
      )}

      {section === "restaurantes" && <RestaurantsSection search={search} />}
      {section === "reservas" && <ReservationsSection />}

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
            onChange={(e, newValue) => handleSectionChange(newValue === 0 ? "restaurantes" : "reservas")}
            textColor="inherit"
            TabIndicatorProps={{ style: { background: "white" } }}
            variant="fullWidth"
          >
            <Tab icon={<RestaurantMenuIcon />} label="Restaurantes" />
            <Tab
              icon={
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  <BookOnlineIcon />
                  {newNotification && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -6,
                        right: -12,
                        width: 12,
                        height: 12,
                        bgcolor: "purple",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                </Box>
              }
              label="Mis Reservas"
            />
          </Tabs>
        </Paper>
      )}
    </Container>
  );
}
