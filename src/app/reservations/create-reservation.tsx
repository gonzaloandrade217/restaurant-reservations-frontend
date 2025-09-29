'use client';

import { useEffect, useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { CreateReservationDto } from './dto/create-reservation.dto';

interface Restaurant {
  id: string;
  name: string;
}

interface Table {
  id: string;
  number: number;
  capacity: number;
}

export default function CreateReservationForm() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [selectedTableId, setSelectedTableId] = useState('');
  const [partySize, setPartySize] = useState(1);
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');

  // 1. Obtener la lista de restaurantes al cargar el componente
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch('http://localhost:4000/restaurants');
        const data = await response.json();
        setRestaurants(data);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      }
    };
    fetchRestaurants();
  }, []);

  // 2. Obtener la lista de mesas cuando se selecciona un restaurante
  useEffect(() => {
    if (selectedRestaurantId) {
      const fetchTables = async () => {
        try {
          // Asume que tu backend tiene un endpoint para obtener mesas por restaurante
          const response = await fetch(`http://localhost:4000/restaurants/${selectedRestaurantId}/tables`);
          const data = await response.json();
          setTables(data);
        } catch (error) {
          console.error('Error fetching tables:', error);
        }
      };
      fetchTables();
    } else {
      setTables([]);
    }
  }, [selectedRestaurantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Creando reserva...');

    // Asume que el userId lo obtienes del login o es fijo para la prueba
    const userId = 'aqui-va-el-id-del-usuario-logueado'; 

    const reservationData: CreateReservationDto = {
      date,
      partySize,
      userId,
      restaurantId: selectedRestaurantId,
      tableId: selectedTableId,
    };

    try {
      const response = await fetch('http://localhost:4000/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la reserva');
      }

      const newReservation = await response.json();
      setMessage(`Reserva creada con éxito para la mesa ${newReservation.tableId}`);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <Box
      component="form"
      sx={{ p: 4, maxWidth: 600, mx: 'auto', border: '1px solid #ffffff', borderRadius: 2, boxShadow: 3, display: 'flex', flexDirection: 'column', gap: 3 }}
      onSubmit={handleSubmit}
    >
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Crear Nueva Reserva
      </Typography>
      
      {/* Selector de Restaurante */}
      <FormControl fullWidth sx={{
        '& .MuiInputBase-root': {
          color: 'white',
          '& fieldset': { borderColor: 'white' },
          '&:hover fieldset': { borderColor: 'white' },
          '&.Mui-focused fieldset': { borderColor: 'white' }
        },
        '& .MuiInputLabel-root': { color: 'white' }
      }}>
        <InputLabel>Restaurante</InputLabel>
        <Select
          value={selectedRestaurantId}
          label="Restaurante"
          onChange={(e) => setSelectedRestaurantId(e.target.value as string)}
        >
          {restaurants.map((restaurant) => (
            <MenuItem key={restaurant.id} value={restaurant.id}>
              {restaurant.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Selector de Mesa (depende del restaurante) */}
      <FormControl fullWidth disabled={!selectedRestaurantId} sx={{
        '& .MuiInputBase-root': {
          color: 'white',
          '& fieldset': { borderColor: 'white' },
          '&:hover fieldset': { borderColor: 'white' },
          '&.Mui-focused fieldset': { borderColor: 'white' }
        },
        '& .MuiInputLabel-root': { color: 'white' }
      }}>
        <InputLabel>Mesa</InputLabel>
        <Select
          value={selectedTableId}
          label="Mesa"
          onChange={(e) => setSelectedTableId(e.target.value as string)}
        >
          {tables.map((table) => (
            <MenuItem key={table.id} value={table.id}>
              Mesa #{table.number} (Capacidad: {table.capacity})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Selector de fecha */}
      <TextField
        label="Fecha y Hora de la Reserva"
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        variant="outlined"
        fullWidth
        required
        InputLabelProps={{
          shrink: true,
          style: { color: 'white' },
        }}
        sx={{
          '& .MuiInputBase-input': { color: 'white' },
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'white' },
            '&:hover fieldset': { borderColor: 'white' },
            '&.Mui-focused fieldset': { borderColor: 'white' },
          },
        }}
      />

      {/* Tamaño del grupo */}
      <TextField
        label="Número de personas"
        type="number"
        value={partySize}
        onChange={(e) => setPartySize(parseInt(e.target.value))}
        variant="outlined"
        fullWidth
        required
        sx={{
          '& .MuiInputBase-input': { color: 'white' },
          '& .MuiInputLabel-root': { color: 'white' },
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'white' },
            '&:hover fieldset': { borderColor: 'white' },
            '&.Mui-focused fieldset': { borderColor: 'white' },
          },
        }}
      />
      
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={!selectedTableId || !selectedRestaurantId || !date || !partySize}
      >
        Crear Reserva
      </Button>
      {message && (
        <Typography color={message.includes('éxito') ? 'success.main' : 'error.main'} sx={{ mt: 2 }} align="center">
          {message}
        </Typography>
      )}
    </Box>
  );
}