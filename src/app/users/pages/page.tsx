'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Container, Paper, Box, TextField, Tabs, Tab, Snackbar, Alert } from "@mui/material";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import { useMediaQuery } from "@mui/material";

import Navbar from "../components/Navbar";
import ReservationsSection from "../components/ReservationsSection";
import RestaurantsSection from "../components/RestaurantsSection";
import UserMap from "../components/UserMap";

const API = "NEXT_PUBLIC_API_URL" in process.env ? process.env.NEXT_PUBLIC_API_URL : "http://localhost:4000";

export default function UsersDashboardPage() {
  const [section, setSection] = useState<"restaurantes" | "reservas">("restaurantes");
  const [newNotification, setNewNotification] = useState(false);
  const [search, setSearch] = useState("");
  const [restaurantsForMap, setRestaurantsForMap] = useState<any[]>([]);

  const previousReservationsRef = useRef<any[]>([]);
  const [previousReservationsState, setPreviousReservationsState] = useState<any[]>([]);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error" | "info">("info");

  const isMobile = useMediaQuery("(max-width:600px)");
  const tabValue = section === "restaurantes" ? 0 : 1;

  const showAlert = (msg: string, severity: "success" | "error" | "info" = "info") => {
    setAlertMessage(msg);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  // ------------------ FETCH RESERVAS DEL USER ------------------
  const fetchUserReservations = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");
      if (!token || !userId) return;

      const res = await fetch(`${API}/reservations/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        showAlert("Error al cargar tus reservas", "error");
        return;
      }

      const latestReservations = await res.json();
      const prevList = previousReservationsRef.current || [];

      const hasStateChanged = latestReservations.some((r: { id: any; status: any }) => {
        const prev = prevList.find(p => p.id === r.id);
        return prev && prev.status !== r.status;
      });

      if (hasStateChanged && section !== "reservas") {
        setNewNotification(true);
      }

      previousReservationsRef.current = latestReservations;
      setPreviousReservationsState(latestReservations);
    } catch (err) {
      console.error("Error cargando reservas del user", err);
      showAlert("Error de conexión al cargar reservas", "error");
    }
  }, [section]);

  useEffect(() => {
    fetchUserReservations();
    const interval = setInterval(() => fetchUserReservations(), 5000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchUserReservations();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [fetchUserReservations]);

  // ------------------ FETCH RESTAURANTES PARA EL MAPA ------------------
  useEffect(() => {
    const fetchRestaurantsForMap = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const res = await fetch(`${API}/restaurants?recommended=true&search=${search}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          showAlert("Error al cargar restaurantes para el mapa", "error");
          return;
        }

        const data = await res.json();
        // filtramos solo los que tengan lat y lon
        const validData = data.filter((r: any) => r.latitude != null && r.longitude != null);
        setRestaurantsForMap(validData);
      } catch (err) {
        console.error("Error cargando restaurantes para el mapa", err);
        showAlert("Error de conexión al cargar restaurantes", "error");
      }
    };

    fetchRestaurantsForMap();
  }, [search]);

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

          <Box
            sx={{
              mt: 4,
              height: 400,
              position: "relative",
              zIndex: 1,
            }}
          >
            {typeof window !== "undefined" && <UserMap restaurants={restaurantsForMap} />}
          </Box>
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
            zIndex: 1300,
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
                        bgcolor: "white",
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

      {/* ----- ALERTA MUI ----- */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={3000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={alertSeverity}
          onClose={() => setAlertOpen(false)}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
