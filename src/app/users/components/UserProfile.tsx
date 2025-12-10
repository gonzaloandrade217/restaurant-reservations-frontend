"use client";

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
  const [loading, setLoading] = useState(true);

  // Cambia BASE si tu backend corre en otra máquina/puerto
  const BASE = "http://192.168.1.6:4000";

  useEffect(() => {
    // Primero carga lo que ya haya en localStorage (para que no se vea vacío)
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

        if (!res.ok) {
          console.warn("No se pudo obtener perfil (status):", res.status);
          setLoading(false);
          return;
        }

        const data = await res.json();

        // protege contra payloads inesperados
        if (data?.name) {
          setUserName(data.name);
          localStorage.setItem("userName", data.name);
        }
        if (data?.avatar) {
          setUserPhoto(data.avatar);
          localStorage.setItem("userPhoto", data.avatar);
        } else {
          // si el backend devuelve null/undefined, borramos la key para evitar inconsistencias
          if (localStorage.getItem("userPhoto")) {
            localStorage.removeItem("userPhoto");
          }
          setUserPhoto(null);
        }

        setReputation(typeof data.reputation === "number" ? data.reputation : 0);
        setComments(Array.isArray(data.comments) ? data.comments : []);
      } catch (error) {
        console.error("Error cargando perfil:", error);
        // no sobreescribimos localStorage en error de red
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
