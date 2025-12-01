'use client';

import React from "react";
import { Card, CardContent, CardMedia, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";

interface RestaurantCardProps {
  id: string;
  name: string;
  city?: string;
  address?: string;
  description?: string;
  image?: string;
}

export default function RestaurantCard({ id, name, city, address, description, image }: RestaurantCardProps) {
  const router = useRouter();
  const handleReserveClick = () => router.push(`/reservations/select-seats?restaurant=${id}`);

  return (
    <Card sx={{ backgroundColor: "#111", color: "white", border: "1px solid white" }}>
      {image && <CardMedia component="img" height="180" image={image} alt={name} />}
      <CardContent>
        <Typography variant="h6">{name}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>{description}</Typography>
        {city && <Typography sx={{ mt: 1, opacity: 0.7 }}>Ciudad: {city}</Typography>}
        {address && <Typography sx={{ mt: 1, opacity: 0.7 }}>Dirección: {address}</Typography>}
        <Button fullWidth variant="contained" sx={{ mt: 2, backgroundColor: "#ff9800" }} onClick={handleReserveClick}>
          Reservar mesa
        </Button>
      </CardContent>
    </Card>
  );
}
