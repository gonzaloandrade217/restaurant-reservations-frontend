'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';

export default function SelectSeatsPage() {
  const [partySize, setPartySize] = useState<number>(1);
  const [customPartySize, setCustomPartySize] = useState<string>(''); 
  const [dateTime, setDateTime] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const router = useRouter();

  const searchParams = useSearchParams();
  const restaurantIdFromQuery = searchParams?.get('restaurant') ?? null;

  const [restaurantId, setRestaurantId] = useState<string | null>(restaurantIdFromQuery);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const u = localStorage.getItem('userId');
    const rStored = localStorage.getItem('selectedRestaurantId');
    if (u) setUserId(u);
    if (!restaurantIdFromQuery && rStored) setRestaurantId(rStored);
    if (restaurantIdFromQuery) localStorage.setItem('selectedRestaurantId', restaurantIdFromQuery);
  }, [restaurantIdFromQuery]);

  const toISOStringFromLocalInput = (localValue: string) => {
    const d = new Date(localValue);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  };

  const handleDateTimeChange = (value: string) => {
    if (!value) {
      setDateTime('');
      return;
    }
    const d = new Date(value);
    if (isNaN(d.getTime())) {
      setDateTime(value);
      return;
    }
    d.setMinutes(0, 0, 0);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const localStr = `${yyyy}-${mm}-${dd}T${hh}:00`;
    setDateTime(localStr);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setMessage('');

    if (!userId) {
      setMessage('Error: no estás identificado. Iniciá sesión.');
      return;
    }
    if (!restaurantId) {
      setMessage('Error: no se encontró el restaurante seleccionado.');
      return;
    }
    if (!dateTime) {
      setMessage('Por favor seleccioná fecha y hora.');
      return;
    }

    const iso = toISOStringFromLocalInput(dateTime);
    if (!iso) {
      setMessage('Fecha inválida.');
      return;
    }

    const finalPartySize =
      partySize === 99 ? Number(customPartySize) || 0 : partySize;

    if (finalPartySize < 1) {
      setMessage('Ingresá una cantidad válida.');
      return;
    }

    const dto = {
      restaurantId,
      userId,
      date: iso,
      partySize: finalPartySize,
    };

    try {
      const res = await fetch('http://192.168.1.6:4000/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });

      if (res.ok) {
        setMessage(' Reserva enviada. El admin la revisará.');
        setTimeout(() => router.push('/users/dashboard'), 1000);
      } else {
        const text = await res.text().catch(() => null);
        let errMsg = text || `Error ${res.status}`;
        try {
          const j = JSON.parse(text || '{}');
          if (j?.message) errMsg = j.message;
        } catch {}
        setMessage(` Error: ${errMsg}`);
      }
    } catch (err: any) {
      setMessage(` Error de conexión: ${err.message || err}`);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 4,
        mt: 4,
        maxWidth: 520,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        color: 'white',
        border: '2px solid #ff9800',
        borderRadius: 3,
        backgroundColor: 'rgba(12, 12, 12, 0.75)',
      }}
    >

      {/* BOTÓN VOLVER AL INICIO */}
      <Button
        onClick={() => router.push('/users/dashboard')}
        variant="contained"
        sx={{ backgroundColor: '#ff9800', color: 'white', fontWeight: 'bold' }}
      >
        Volver
      </Button>

      <Typography variant="h5" textAlign="center" sx={{ color: '#ffffffff' }}>
        Reservar en el restaurante
      </Typography>

      {/* Fecha y hora */}
      <TextField
        label="Fecha y hora"
        type="datetime-local"
        value={dateTime}
        onChange={(e) => handleDateTimeChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
        inputProps={{
          step: 3600,
          style: { color: 'white' },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#ff9800' },
            '&:hover fieldset': { borderColor: '#ffb74d' },
            '& input': { color: 'white' },
            '& .MuiSvgIcon-root': { color: 'white' },
          },
          '& .MuiInputLabel-root': { color: '#fdfbf9ff' },
          '& input[type="datetime-local"]::-webkit-calendar-picker-indicator': {
            filter: 'invert(1)',
          },
        }}
        required
        fullWidth
      />

      {/* Selector de personas */}
      <FormControl fullWidth>
        <InputLabel sx={{ color: '#ffffffff' }}>Cantidad de personas</InputLabel>
        <Select
          value={partySize}
          label="Cantidad de personas"
          onChange={(e) => {
            setPartySize(Number(e.target.value));
            if (Number(e.target.value) !== 99) setCustomPartySize('');
          }}
          sx={{
            color: 'white',
            '.MuiSvgIcon-root': { color: '#ff9800' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ff9800' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ffb74d' },
          }}
        >
          {[1, 2, 3, 4].map((n) => (
  <MenuItem
    key={n}
    value={n}
    sx={{
      color: 'white',
      backgroundColor: '#000',
      '&:hover': {
        backgroundColor: '#ff9800',
        color: 'black',
      },
      '&.Mui-selected': {
        backgroundColor: '#ff9800 !important',
        color: 'black',
      },
      '&.Mui-selected:hover': {
        backgroundColor: '#fb8c00 !important',
        color: 'black',
      },
    }}
  >
    {n}
  </MenuItem>
))}
<MenuItem
  value={99}
  sx={{
    color: 'white',
    backgroundColor: '#000',
    '&:hover': {
      backgroundColor: '#ff9800',
      color: 'black',
    },
    '&.Mui-selected': {
      backgroundColor: '#ff9800 !important',
      color: 'black',
    },
    '&.Mui-selected:hover': {
      backgroundColor: '#fb8c00 !important',
      color: 'black',
    },
  }}
>
            Más...
          </MenuItem>
        </Select>
      </FormControl>

      {/* Input extra si eligió "Más..." */}
      {partySize === 99 && (
        <TextField
          label="Cantidad personalizada"
          type="number"
          value={customPartySize}
          onChange={(e) => setCustomPartySize(e.target.value)}
          fullWidth
          InputLabelProps={{ style: { color: '#ff9800' } }}
          inputProps={{ style: { color: 'white' }, min: 1 }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#ff9800' },
              '&:hover fieldset': { borderColor: '#ffb74d' },
            },
          }}
        />
      )}

      <Button
        type="submit"
        variant="contained"
        sx={{
          bgcolor: '#ff9800',
          '&:hover': { bgcolor: '#fb8c00' },
          fontWeight: 'bold',
        }}
      >
        Confirmar Reserva
      </Button>

      {message && (
        <Typography textAlign="center" sx={{ mt: 1, color: '#ff9800' }}>
          {message}
        </Typography>
      )}
    </Box>
  );
}
