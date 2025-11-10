'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Typography, TextField, Button } from '@mui/material';
import { CreateReservationDto } from '../dto/create-reservation.dto';

export default function SelectSeatsPage() {
  const [partySize, setPartySize] = useState(1);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState<string>('');
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('restaurant');
  const router = useRouter();

  // ✅ TOMAR USER ID DEL TOKEN
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setUserId(decoded.sub); // USER ID REAL
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Creando reserva...');

    const reservationData: CreateReservationDto = {
      date: new Date().toISOString(),
      partySize,
      restaurantId: restaurantId!,
      userId,
    };

    const response = await fetch("http://localhost:4000/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reservationData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      setMessage("Error: " + errorData.message);
      return;
    }

    setMessage("Reserva creada con éxito");
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5">Seleccioná cantidad de personas</Typography>

      <TextField
        label="Número de personas"
        type="number"
        value={partySize}
        onChange={(e) => setPartySize(parseInt(e.target.value))}
        required
      />

      <Button type="submit" variant="contained">
        Confirmar reserva
      </Button>

      {message && <Typography>{message}</Typography>}
    </Box>
  );
}
