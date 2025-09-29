'use client';

import { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';

export default function CreateUserForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Creando usuario...');

    try {
      const response = await fetch('http://localhost:4000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el usuario');
      }

      const userData = await response.json();
      setMessage(`Usuario creado con éxito: ${userData.name}`);
      setName('');
      setEmail('');
      setPassword('');

    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <Box
      component="form"
      sx={{
        p: 4,
        maxWidth: 400,
        mx: 'auto',
        border: '1px solid #ffffff', // Borde del contenedor
        borderRadius: 2,
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
      onSubmit={handleSubmit}
    >
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Crear Nuevo Usuario
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
          '& .MuiInputBase-input': {
            color: 'white', // Color del texto del input
          },
          '& .MuiInputLabel-root': {
            color: 'white', // Color de la etiqueta
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'white', // Borde por defecto
            },
            '&:hover fieldset': {
              borderColor: 'white', // Borde al pasar el mouse
            },
            '&.Mui-focused fieldset': {
              borderColor: 'white', // Borde cuando el campo está seleccionado
            },
          },
        }}
      />
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        variant="outlined"
        fullWidth
        required
        sx={{
          '& .MuiInputBase-input': {
            color: 'white',
          },
          '& .MuiInputLabel-root': {
            color: 'white',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'white',
            },
            '&:hover fieldset': {
              borderColor: 'white',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'white',
            },
          },
        }}
      />
      <TextField
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        variant="outlined"
        fullWidth
        required
        sx={{
          '& .MuiInputBase-input': {
            color: 'white',
          },
          '& .MuiInputLabel-root': {
            color: 'white',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'white',
            },
            '&:hover fieldset': {
              borderColor: 'white',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'white',
            },
          },
        }}
      />
      <Button type="submit" variant="contained" color="primary" fullWidth>
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