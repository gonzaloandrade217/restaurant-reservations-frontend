"use client";

import React, { useState, useEffect } from "react";
import {
  Paper,
  Tabs,
  Tab,
  Typography,
  Box,
  IconButton,
  Avatar,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@mui/material";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@mui/material";
import UserProfile from "./UserProfile"; 
import { useAuth } from "../../../context/AuthContext";

interface NavbarProps {
  section: "restaurantes" | "reservas";
  setSection: (section: "restaurantes" | "reservas") => void;
  newNotification?: boolean;
}

export default function Navbar({ section, setSection, newNotification = false }: NavbarProps) {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Usuario");

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error" | "info">("info");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false); 

  useEffect(() => {
    const avatar = localStorage.getItem("userPhoto");
    const name = localStorage.getItem("userName");
    if (avatar) setUserPhoto(avatar);
    if (name) setUserName(name);
  }, []);

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  const deleteAccount = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");
      if (!token || !userId) throw new Error("No autenticado");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al eliminar usuario");

      setAlertMessage("Usuario eliminado");
      setAlertSeverity("success");
      setAlertOpen(true);

      localStorage.clear();
      router.push("/");
    } catch (err: any) {
      setAlertMessage(err.message);
      setAlertSeverity("error");
      setAlertOpen(true);
    }
  };

  const tabValue = section === "restaurantes" ? 0 : 1;

  return (
    <>
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
          flexWrap: "wrap",
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
            sx={{ marginLeft: 2 }}
          >
            <Tab icon={<RestaurantMenuIcon />} label="Restaurantes" iconPosition="top" />
            <Tab
              icon={
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  <BookOnlineIcon />
                  {newNotification && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        width: 12,
                        height: 12,
                        bgcolor: "blue",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                </Box>
              }
              label="Mis Reservas"
              iconPosition="top"
            />
          </Tabs>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* Avatar que abre el perfil */}
        <IconButton onClick={() => setProfileOpen(true)} sx={{ p: 0 }}>
          <Avatar
            src={userPhoto || undefined}
            sx={{ width: 36, height: 36, bgcolor: userPhoto ? undefined : "gray" }}
          />
        </IconButton>
      </Paper>

      {/* ----- DIALOG PERFIL USUARIO ----- */}
      <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <UserProfile />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogout}>Cerrar sesión</Button>
          <Button onClick={() => setConfirmOpen(true)} color="error">
            Eliminar cuenta
          </Button>
        </DialogActions>
      </Dialog>

      {/* ----- DIALOG CONFIRMACIÓN ----- */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Eliminar cuenta</DialogTitle>
        <DialogContent>
          <Typography>¿Seguro que querés eliminar tu cuenta?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button
            onClick={() => {
              setConfirmOpen(false);
              deleteAccount();
            }}
            color="error"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ----- ALERTA MUI ----- */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={3000}
        onClose={(event, reason) => {
          if (reason === "clickaway") return;
          setAlertOpen(false);
        }}
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
    </>
  );
}
