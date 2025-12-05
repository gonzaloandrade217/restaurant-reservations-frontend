'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Container, Paper, Box, TextField, Tabs, Tab } from "@mui/material";
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
  // previousReservations ahora lo guardamos en un ref para evitar problemas con closures del interval
  const previousReservationsRef = useRef<any[]>([]);
  const [previousReservationsState, setPreviousReservationsState] = useState<any[]>([]); // para render / debugging si hace falta

  const isMobile = useMediaQuery("(max-width:600px)");
  const tabValue = section === "restaurantes" ? 0 : 1;

  // ------------------ FETCH RESERVAS DEL USER ------------------
  const fetchUserReservations = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");
      if (!token || !userId) return;

      const res = await fetch(`${API}/reservations/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const latestReservations = await res.json();

      // comparar contra el ref (si existe)
      const prevList = previousReservationsRef.current || [];

      const hasStateChanged = latestReservations.some((r: { id: any; status: any }) => {
        const prev = prevList.find(p => p.id === r.id);
        return prev && prev.status !== r.status;
      });

      // si hay cambio y el usuario no está mirando la sección reservas -> notificar (ícono)
      if (hasStateChanged && section !== "reservas") {
        setNewNotification(true);
      }

      // actualizar el ref con la lista más reciente para próximas comparaciones
      previousReservationsRef.current = latestReservations;
      // si querés verlas en el estado también (útil para debugging)
      setPreviousReservationsState(latestReservations);
    } catch (err) {
      console.error("Error cargando reservas del user", err);
    }
  }, [section]);

  useEffect(() => {
    // fetch inicial
    fetchUserReservations();

    // interval que usa la versión más actual de fetchUserReservations (porque está memoizada con useCallback)
    const interval = setInterval(() => {
      fetchUserReservations();
    }, 5000);

    // volver a traer cuando se vuelve visible (móviles a veces pausan los timers)
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchUserReservations();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [fetchUserReservations]);

  const handleSectionChange = (newSection: "restaurantes" | "reservas") => {
    setSection(newSection);
    if (newSection === "reservas") setNewNotification(false);
  };

  return (
    <Container sx={{ py: 4, pb: isMobile ? 12 : 4 }}>
      <Navbar section={section} setSection={handleSectionChange} newNotification={newNotification} />

      {/* ----- Contenido principal ----- */}
      {section === "restaurantes" && (
        <>
          {/* Buscador sobre la lista de restaurantes */}
          <Box sx={{ mb: 2, maxWidth: 400 }}>
            <TextField
              placeholder="Buscar restaurante por nombre o ciudad"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: "100%", backgroundColor: "white", borderRadius: 1 }}
            />
          </Box>
          <RestaurantsSection search={search} />
        </>
      )}

      {section === "reservas" && <ReservationsSection />}

      {/* ----- Mobile Tabs ----- */}
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
