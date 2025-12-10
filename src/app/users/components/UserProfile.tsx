'use client';

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  LinearProgress,
  Rating,
  Paper,
  Divider
} from "@mui/material";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Comment {
  id: string;
  restaurantName: string;
  rating: number;
  comment: string;
}

export default function UserProfile() {
  const [userName, setUserName] = useState("Usuario");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [reputation, setReputation] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reservationsPerDay, setReservationsPerDay] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const BASE = "http://192.168.1.6:4000"; // Cambia según tu backend

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

        // Procesar reservas por día
        if (data.reservationsLastMonth) {
          const daysArray = Object.keys(data.reservationsLastMonth).sort();
          const reservationsArray = daysArray.map(day => data.reservationsLastMonth[day]);
          setReservationsPerDay(reservationsArray);
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const chartData = {
    labels: reservationsPerDay.map((_, i) => `${i + 1}`),
    datasets: [
      {
        label: "Reservas del último mes",
        data: reservationsPerDay,
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
        ticks: { maxRotation: 0, minRotation: 0 }, // etiquetas horizontales
      },
    },
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, py: 2 }}>
      {/* Avatar + nombre */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar
          src={userPhoto || undefined}
          sx={{ width: 64, height: 64, bgcolor: userPhoto ? undefined : "gray" }}
        />
        <Typography variant="h6">{userName}</Typography>
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

      {/* Gráfico de reservas */}
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Reservas del último mes
        </Typography>
        <Bar data={chartData} options={chartOptions} />
      </Box>

      <Divider />

      {/* Comentarios */}
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Comentarios
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {comments.length === 0 && <Typography variant="body2">No hay comentarios</Typography>}
          {comments.map((c) => (
            <Paper key={c.id} sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                {c.restaurantName}
              </Typography>
              <Rating value={c.rating} readOnly size="small" sx={{ mb: 1 }} />
              <Typography variant="body2">{c.comment}</Typography>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
