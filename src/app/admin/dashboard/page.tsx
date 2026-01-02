"use client";

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
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import PeopleIcon from "@mui/icons-material/People";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import BookOnlineIcon from "@mui/icons-material/BookOnline";

import { useRouter } from "next/navigation";

import UserList from "../../users/user-list";
import CreateRestaurantForm from "../../restaurants/create-restaurant";
import RestaurantList from "../../restaurants/restaurant-list";
import AdminReservationsList from "../admin-reservations-list";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboardPage() {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const { token, loading } = useAuth();

  const [refreshRestaurants, setRefreshRestaurants] = useState(0);
  const [refreshUsers, setRefreshUsers] = useState(0);

  const [section, setSection] = useState<
    "restaurantes" | "reservas" | "usuarios"
  >("restaurantes");

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info"
  >("info");

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [hasPending, setHasPending] = useState(false);
  const [hasUserCanceled, setHasUserCanceled] = useState(false);

  const [pendingReservations, setPendingReservations] = useState<any[]>([]);
  const [userCanceledReservations, setUserCanceledReservations] = useState<any[]>([]);

  const [completedReservations, setCompletedReservations] = useState<any[]>([]);

  const handleReservationCompleted = (reservation: any) => {
    setCompletedReservations((prev) => [...prev, reservation]);
  };

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Container>
    );
  }

  useEffect(() => {
    if (!loading && !token) {
      router.replace("/login"); 
    }
  }, [token, loading, router]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const adminId = localStorage.getItem("userId");
        if (!adminId) return;

        const pendingRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/reservations/admin/pending/${adminId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (pendingRes.ok) {
          const pendingData = await pendingRes.json();
          setPendingReservations(pendingData);
          setHasPending(pendingData.length > 0);
        }

        const canceledRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/reservations/admin/cancelled/${adminId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (canceledRes.ok) {
          const canceledData = await canceledRes.json();
          setUserCanceledReservations(canceledData);
          setHasUserCanceled(canceledData.length > 0);
        }
      } catch (err) {
        console.error("Error fetchReservations:", err);
      }
    };

    fetchReservations();
    const interval = setInterval(fetchReservations, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const tabValue =
    section === "restaurantes"
      ? 0
      : section === "reservas"
      ? 1
      : section === "usuarios"
      ? 2
      : false;

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(menuAnchor);
  const handleMenuOpen = (e: any) => setMenuAnchor(e.currentTarget);
  const handleMenuClose = () => setMenuAnchor(null);

  const handleLogout = () => {
    localStorage.clear();
    router.replace("/login");
  };

  const handleDeleteAccount = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        showAlert("Error al eliminar usuario", "error");
        return;
      }

      showAlert("Usuario eliminado con éxito", "success");
      localStorage.clear();
      router.push("/");
    } catch {
      showAlert("Error de conexión", "error");
    }
  };

  const showAlert = (
    msg: string,
    severity: "success" | "error" | "info" = "info"
  ) => {
    setSnackbarMessage(msg);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleRestaurantCreated = () => {
    setRefreshRestaurants((prev) => prev + 1);
    setShowCreateForm(false);
  };

  return (
    <Container sx={{ py: 4 }}>
      {/* HEADER */}
      <Paper
        elevation={3}
        sx={{
          mb: 4,
          px: 2,
          py: 1.5,
          backgroundColor: "#ff9800",
          display: "flex",
          alignItems: "center",
          borderRadius: 2,
        }}
      >
        {/* TITULO + TABS */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Typography
            sx={{
              fontFamily: "'Playfair Display'",
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "white",
              whiteSpace: "nowrap",
            }}
          >
            MesaSegura - Administración
          </Typography>

          {!isMobile && (
            <Tabs
              value={tabValue}
              onChange={(e, v) => {
                if (v === 0) setSection("restaurantes");
                if (v === 1) setSection("reservas");
                if (v === 2) setSection("usuarios");
              }}
              textColor="inherit"
              TabIndicatorProps={{ style: { background: "white" } }}
            >
              <Tab icon={<RestaurantMenuIcon />} label="Restaurantes" />
              <Tab
                icon={
                  <Box sx={{ position: "relative" }}>
                    <BookOnlineIcon />
                    {hasPending && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: -4,
                          right: -4,
                          width: 12,
                          height: 12,
                          bgcolor: "purple",
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
        </Box>

        {/* MENU */}
        <IconButton
          onClick={handleMenuOpen}
          sx={{ color: "white", ml: "auto" }}
        >
          <MenuIcon />
        </IconButton>

        <Menu anchorEl={menuAnchor} open={openMenu} onClose={handleMenuClose}>
          {isMobile && (
            <>
              <MenuItem
                onClick={() => {
                  setSection("restaurantes");
                  handleMenuClose();
                }}
              >
                Restaurantes
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setSection("reservas");
                  handleMenuClose();
                }}
              >
                Reservas
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setSection("usuarios");
                  handleMenuClose();
                }}
              >
                Usuarios
              </MenuItem>
              <Divider />
            </>
          )}

          <MenuItem
            onClick={() => {
              handleMenuClose();
              handleLogout();
            }}
          >
            Cerrar sesión
          </MenuItem>

          <MenuItem
            sx={{ color: "red" }}
            onClick={() => {
              handleMenuClose();
              setOpenDeleteDialog(true);
            }}
          >
            Eliminar cuenta
          </MenuItem>
        </Menu>
      </Paper>

      {section === "restaurantes" && (
        <Box sx={{ p: 3, backgroundColor: "black", borderRadius: 2 }}>
          <Typography variant="h4" sx={{ color: "white" }}>
            Gestión de Restaurantes
          </Typography>

          <Button
            variant="contained"
            sx={{ mt: 2, mb: 3, backgroundColor: "#ff9800" }}
            onClick={() => setShowCreateForm(!showCreateForm)}
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

      {section === "reservas" && (
        <Box sx={{ p: 3, backgroundColor: "black", borderRadius: 2 }}>
          <Typography variant="h4" sx={{ color: "white" }}>
            Reservas
          </Typography>
          <Divider sx={{ my: 3, borderColor: "white" }} />
          <AdminReservationsList
            refresh={0}
            onComplete={handleReservationCompleted}
          />
        </Box>
      )}

      {section === "usuarios" && (
        <Box sx={{ p: 3, backgroundColor: "black", borderRadius: 2 }}>
          <Typography variant="h4" sx={{ color: "white" }}>
            Lista de Usuarios
          </Typography>
          <Divider sx={{ my: 3, borderColor: "white" }} />
          <UserList refresh={refreshUsers} />
        </Box>
      )}

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Eliminar cuenta</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Seguro que querés eliminar tu cuenta? Esta acción es irreversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button color="error" onClick={handleDeleteAccount}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbarSeverity}
          onClose={() => setSnackbarOpen(false)}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
