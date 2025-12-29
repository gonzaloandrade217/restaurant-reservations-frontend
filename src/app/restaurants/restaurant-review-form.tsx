'use client';

import { useState } from "react";
import { Box, TextField, Button, Rating, Paper, Typography } from "@mui/material";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

interface Review {
  id: string;
  comment: string;
  rating: number;
  userName?: string;
  user?: {
    name: string;
  };
}

interface RestaurantReviewFormProps {
  restaurantId: string;
  onSuccess?: () => void; 
  onNewReview?: (review: Review) => void; 
}

export default function RestaurantReviewForm({ restaurantId, onSuccess, onNewReview }: RestaurantReviewFormProps) {
  const [rating, setRating] = useState<number | null>(3);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    let userId: string;
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      userId = decoded.sub;
    } catch {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment, restaurantId, userId }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error(err.message || "Error al enviar review");
        return;
      }

      const newReview: Review = await res.json();
      if (onNewReview) onNewReview(newReview); // actualiza el estado en RestaurantsSection

      setComment("");
      setRating(3);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error de conexión", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Rating value={rating} onChange={(e, v) => setRating(v)} size="large" />
        <TextField
          label="Review (opcional)"
          multiline
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button variant="contained" onClick={submit} disabled={loading}>
          {loading ? "Enviando..." : "Enviar Review"}
        </Button>
      </Box>
    </Paper>
  );
}
