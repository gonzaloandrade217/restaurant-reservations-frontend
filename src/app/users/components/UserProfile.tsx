'use client';

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  LinearProgress,
  Rating,
  Paper,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useRouter } from "next/navigation";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ReservationsSection from "./ReservationsSection";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Comment {
  id: string;
  restaurantName: string;
  rating: number;
  comment: string;
}

export default function UserProfile() {
  const router = useRouter();

  const [userName, setUserName] = useState("Usuario");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [reputation, setReputation] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [completedReservations, setCompletedReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // menú
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  // dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  const BASE = process.env.NEXT_PUBLIC_API_URL!;

  useEffect(() => {
    const localName = localStorage.getItem("userName");
    const localPhoto = localStorage.getItem("userPhoto");
    if (localName) setUserName(localName);
    if (localPhoto) setUserPhoto(localPhoto);

    const token = localStorage.getItem("authToken");
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${BASE}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al obtener perfil");

        const data = await res.json();

        if (data?.name) {
          setUserName(data.name);
          localStorage.setItem("userName", data.name);
        }

        if (data?.avatar) {
          setUserPhoto(data.avatar);
          localStorage.setItem("userPhoto", data.avatar);
        }

        setReputation(data.reputation ?? 0);
        setComments(data.comments ?? []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [BASE]);

  // === SOLO para alimentar el gráfico ===
  const handleReservationsUpdate = (reservations: any[]) => {
    const completed = reservations.filter(r => r.status === "COMPLETED");
    setCompletedReservations(completed);
  };

  // === Gráfico ===
  const restaurantCounts: Record<string, number> = {};
  completedReservations.forEach(r => {
    const name = r.restaurant?.name || "Desconocido";
    restaurantCounts[name] = (restaurantCounts[name] || 0) + 1;
  });

  const completedChartData = {
    labels: Object.keys(restaurantCounts),
    datasets: [
      {
        label: "Reservas Completadas",
        data: Object.values(restaurantCounts),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: false },
    },
    scales: {
      x: {
        ticks: { maxRotation: 0, minRotation: 0 },
      },
    },
  };

  // === Menú ===
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    setDeleteDialogOpen(false);
    handleMenuClose();

    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const res = await fetch(`${BASE}/users/me`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      localStorage.clear();
      router.push("/register");
    } catch {
      setErrorDialogOpen(true);
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography>Cargando perfil...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, py: 2 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src={userPhoto || undefined}
            sx={{ width: 64, height: 64, bgcolor: userPhoto ? undefined : "gray" }}
          />
          <Typography variant="h6">{userName}</Typography>
        </Box>

        <IconButton onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
          <MenuItem
            sx={{ color: "error.main" }}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Eliminar cuenta
          </MenuItem>
        </Menu>
      </Box>

      {/* Reputación */}
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Reputación promedio
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Rating value={reputation} precision={0.1} readOnly />
          <Typography variant="body2">{reputation.toFixed(1)} / 5</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={(reputation / 5) * 100}
          sx={{ mt: 1, height: 8, borderRadius: 2 }}
        />
      </Box>

      <Divider />

      {/* Gráfico */}
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Reservas Completadas por Restaurante
        </Typography>
        <Bar data={completedChartData} options={chartOptions} />
      </Box>

      <Divider />

      {/* Comentarios */}
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Comentarios
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {comments.length === 0 && (
            <Typography variant="body2">No hay comentarios</Typography>
          )}
          {comments.map((c) => (
            <Paper key={c.id} sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {c.restaurantName}
              </Typography>
              <Rating value={c.rating} readOnly size="small" sx={{ mb: 1 }} />
              <Typography variant="body2">{c.comment}</Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* SOLO para alimentar el gráfico */}
      <Box sx={{ display: "none" }}>
        <ReservationsSection onUpdate={handleReservationsUpdate} />
      </Box>
      
      {/* Dialog eliminar */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Eliminar cuenta</DialogTitle>
        <DialogContent>
          ¿Estás seguro? Esta acción no se puede deshacer.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button color="error" onClick={handleDeleteAccount}>
            Eliminar
          </Button>
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
    </Box>
  );
}
