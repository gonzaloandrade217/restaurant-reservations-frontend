'use client';

import { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';

export default function CreateRestaurantForm() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Creando restaurante...');

    try {
      const response = await fetch('http://localhost:4000/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, address, phone, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el restaurante');
      }

      const restaurantData = await response.json();
      setMessage(`Restaurante creado con éxito: ${restaurantData.name}`);
      setName('');
      setAddress('');
      setPhone('');
      setDescription('');

    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <Box
      component="form"
      sx={{
        p: 4,
        maxWidth: 600,
        mx: 'auto',
        border: '1px solid #ffffff',
        borderRadius: 2,
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
      onSubmit={handleSubmit}
    >
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Crear Nuevo Restaurante
      </Typography>
      <TextField
        label="Nombre"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
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
      <TextField
        label="Dirección"
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
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
      <TextField
        label="Teléfono"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
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
      <TextField
        label="Descripción (opcional)"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        variant="outlined"
        fullWidth
        multiline
        rows={4}
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
      >
        Registrar
      </Button>
      {message && (
        <Typography
          color={message.includes('éxito') ? 'success.main' : 'error.main'}
          sx={{ mt: 2 }}
          align="center"
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}