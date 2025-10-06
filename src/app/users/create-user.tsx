// src/app/users/create-user.tsx
'use client';

import { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Checkbox,
  FormControlLabel, // Nuevo
} from '@mui/material';

export default function CreateUserForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false); // Nuevo estado
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Creando usuario...');

    // Prepara el objeto de datos
    const userData = {
      name,
      email,
      password,
      // Añade el rol solo si isAdmin es true
      role: isAdmin ? 'ADMIN' : 'USER', 
    };

    try {
      const response = await fetch('http://localhost:4000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el usuario');
      }

      const createdUser = await response.json();
      setMessage(`Usuario (${createdUser.role}) creado con éxito: ${createdUser.name}`);
      setName('');
      setEmail('');
      setPassword('');
      setIsAdmin(false); // Resetear
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  // ... (El JSX del formulario sigue abajo)

  return (
    <Box
      component="form"
      sx={{
        p: 4,
        maxWidth: 400,
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
        Crear Nuevo Usuario
      </Typography>
      {/* ... (Tus TextField de Name, Email, Password van aquí con los estilos white) */}

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
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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

      {/* Nuevo componente Checkbox para el rol */}
      <FormControlLabel
        control={
          <Checkbox
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
            sx={{ color: 'white' }} // Color del checkbox
          />
        }
        label={
          <Typography sx={{ color: 'white' }}>
            ¿Registrarse como Administrador de Restaurante?
          </Typography>
        }
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