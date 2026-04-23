'use client';

import React, { useEffect, useState, useRef } from "react";
import {
  Box, Typography, Avatar, LinearProgress, Rating, Divider,
  IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Snackbar, Alert, CircularProgress, TextField,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { useRouter } from "next/navigation";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Tooltip, Legend,
} from "chart.js";
import ReservationsSection from "./ReservationsSection";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BASE = process.env.NEXT_PUBLIC_API_URL!;

const cardSx = {
  backgroundColor: "#e8e8e8",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 2,
  p: 2,
};

export default function UserProfile() {

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userName, setUserName] = useState("Usuario");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [reputation, setReputation] = useState(0);
  const [completedReservations, setCompletedReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");

  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success" as "success" | "error"
  });

  const showSnack = (msg: string, severity: "success" | "error" = "success") =>
    setSnack({ open: true, msg, severity });

  useEffect(() => {
    const localName = localStorage.getItem("userName");
    const localPhoto = localStorage.getItem("userPhoto");
    if (localName) setUserName(localName);
    if (localPhoto) setUserPhoto(localPhoto);

    const token = localStorage.getItem("authToken");
    if (!token) { setLoading(false); return; }

    fetch(`${BASE}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data?.name) setUserName(data.name);
        if (data?.avatar) setUserPhoto(data.avatar);
        setReputation(data.reputation ?? 0);
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showSnack("La imagen no puede superar los 2 MB.", "error"); return; }

    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const token = localStorage.getItem("authToken");
      if (!token) return;
      try {
        const res = await fetch(`${BASE}/users/me`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ avatar: base64 }),
        });
        if (!res.ok) throw new Error();
        setUserPhoto(base64);
        localStorage.setItem("userPhoto", base64);
        showSnack("Foto actualizada");
      } catch {
        showSnack("Error al subir foto", "error");
      } finally {
        setUploadingPhoto(false);
        e.target.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReservationsUpdate = (r: any[]) =>
    setCompletedReservations(r.filter(x => x.status === "COMPLETED"));

  const handleSaveProfile = async () => {
    if (!editName.trim()) { showSnack("El nombre no puede estar vacío.", "error"); return; }
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await fetch(`${BASE}/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (!res.ok) throw new Error();
      setUserName(editName.trim());
      localStorage.setItem("userName", editName.trim());
      setEditDialogOpen(false);
      showSnack("Perfil actualizado.");
    } catch {
      showSnack("No se pudo actualizar el perfil.", "error");
    }
  };

  const handleLogout = () => { localStorage.clear(); router.push("/login"); };

  const handleDeleteAccount = async () => {
    setDeleteDialogOpen(false);
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await fetch(`${BASE}/users/me`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      localStorage.clear();
      router.push("/register");
    } catch { setErrorDialogOpen(true); }
  };

  const reputationColor =
    reputation >= 4 ? "#4caf50" :
    reputation >= 2.5 ? "#ff9800" :
    "#f44336";

  const restaurantCounts: Record<string, number> = {};
  completedReservations.forEach(r => {
    const name = r.restaurant?.name || "Desconocido";
    restaurantCounts[name] = (restaurantCounts[name] || 0) + 1;
  });

  const chartData = {
    labels: Object.keys(restaurantCounts),
    datasets: [{
      data: Object.values(restaurantCounts),
      backgroundColor: "#ff9800",
      borderRadius: 6,
    }],
  };

  const chartOptions = {
    plugins: { legend: { display: false } },
  };

  if (loading) return (
    <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, py: 2 }}>

      {/* HEADER */}
      <Box display="flex" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={2}>
          <Box position="relative">
            <Avatar src={userPhoto || undefined} sx={{ width: 68, height: 68, bgcolor: "#ff9800" }}>
              {!userPhoto && userName[0]}
            </Avatar>
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                position: "absolute", bottom: 0, right: 0,
                bgcolor: "#ff9800", border: "2px solid white",
                width: 26, height: 26, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", "&:hover": { bgcolor: "#e65100" },
              }}
            >
              {uploadingPhoto
                ? <CircularProgress size={13} sx={{ color: "white" }} />
                : <CameraAltIcon sx={{ fontSize: 14, color: "white" }} />}
            </Box>
            <input hidden type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoChange} />
          </Box>

          <Box>
            <Typography fontWeight={700}>{userName}</Typography>
            <Typography color="#555" fontSize={13}>
              {completedReservations.length} reservas completadas
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ borderRadius: "50%", width: 40, height: 40, p: 0 }}>
          <MoreVertIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => { setEditName(userName); setEditDialogOpen(true); setAnchorEl(null); }}>Editar perfil</MenuItem>
          <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
          <MenuItem sx={{ color: "error.main" }} onClick={() => { setAnchorEl(null); setDeleteDialogOpen(true); }}>
            Eliminar cuenta
          </MenuItem>
        </Menu>
      </Box>

      <Divider />

      {/* REPUTACIÓN */}
      <Box sx={cardSx}>
        <Typography fontWeight={600} mb={1}>Reputación</Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Rating value={reputation} precision={0.1} readOnly />
          <Typography fontWeight={700} color={reputationColor}>
            {reputation.toFixed(1)} / 5
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={(reputation / 5) * 100} sx={{ mt: 2 }} />
      </Box>

      {/* GRÁFICO */}
      {Object.keys(restaurantCounts).length > 0 && (
        <Box sx={cardSx}>
          <Typography fontWeight={600} mb={2}>Reservas completadas por restaurante</Typography>
          <Bar data={chartData} options={chartOptions} />
        </Box>
      )}

      <Box sx={{ display: "none" }}>
        <ReservationsSection onUpdate={handleReservationsUpdate} />
      </Box>

      {/* Dialog editar perfil */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Editar perfil</DialogTitle>
        <DialogContent sx={{ pt: "16px !important" }}>
          <TextField
            label="Nombre"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            fullWidth
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") handleSaveProfile(); }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" sx={{ bgcolor: "#ff9800", "&:hover": { bgcolor: "#e65100" } }} onClick={handleSaveProfile}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog eliminar */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Eliminar cuenta</DialogTitle>
        <DialogContent>¿Estás seguro? Esta acción no se puede deshacer.</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleDeleteAccount}>Eliminar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog error */}
      <Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>No se pudo eliminar la cuenta.</DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}