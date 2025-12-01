'use client';

import React, { useState } from "react";
import { Paper, Tabs, Tab, Typography, Box, IconButton, Menu, MenuItem } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@mui/material";

interface NavbarProps {
  section: "restaurantes" | "reservas";
  setSection: (section: "restaurantes" | "reservas") => void;
  newNotification?: boolean;
}

export default function Navbar({ section, setSection, newNotification = false }: NavbarProps) {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event: any) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const logout = () => {
    localStorage.clear();
    router.push("/");
  };

  const deleteAccount = async () => {
    if (!confirm("¿Seguro que querés eliminar tu cuenta?")) return;

    try {
      const token = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");
      if (!token || !userId) throw new Error("No autenticado");

      const res = await fetch(`http://192.168.1.6:4000/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al eliminar usuario");

      alert("Usuario eliminado");
      localStorage.clear();
      router.push("/");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const tabValue = section === "restaurantes" ? 0 : 1;

  return (
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
                      bgcolor: "blue",
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
  );
}
