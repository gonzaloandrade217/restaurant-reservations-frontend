'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
} from '@mui/material';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserListProps {
  refresh?: number;
}

export default function UserList({ refresh }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;

      if (!token) {
        throw new Error('No se encontró token. Iniciá sesión como ADMIN.');
      }
      // Opcional: verificar rol guardado en localStorage
      if (role !== 'ADMIN') {
        throw new Error('Necesitás ser ADMIN para ver la lista de usuarios.');
      }

      console.log('🔐 Enviando Authorization header con token:', token?.slice(0, 20) + '...');

      const response = await fetch('http://localhost:4000/users', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Token inválido/expirado o faltó (backend devuelve 401)
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message || 'Sesión inválida o token expirado (401). Iniciá sesión nuevamente.');
      }

      if (response.status === 403) {
        throw new Error('No autorizado (403). Necesitás permisos de administrador.');
      }

      if (!response.ok) {
        const body = await response.text().catch(() => null);
        throw new Error(body || `Error al cargar la lista de usuarios (${response.status})`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      console.error('❌ Error al cargar usuarios:', err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  if (loading) return <Typography>Cargando usuarios...</Typography>;
  if (error)
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
          <Button variant="contained" onClick={fetchUsers}>
            Reintentar
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              // limpia token y manda al login
              if (typeof window !== 'undefined') {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userRole');
              }
              router.push('/login');
            }}
          >
            Ir a Login
          </Button>
        </Box>
      </Container>
    );

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Lista de Usuarios
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">
                  {user.id}
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
