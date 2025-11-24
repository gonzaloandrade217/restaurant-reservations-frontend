'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
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
  const [refreshCounter, setRefreshCounter] = useState(0);
  const router = useRouter();

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;

      if (!token) throw new Error('No se encontró token. Iniciá sesión como ADMIN.');
      if (role !== 'ADMIN') throw new Error('Necesitás ser ADMIN para ver la lista de usuarios.');

      const response = await fetch('http://localhost:4000/users', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message || 'Sesión inválida o token expirado.');
      }

      if (response.status === 403) throw new Error('No autorizado (403). Necesitás permisos de administrador.');
      if (!response.ok) {
        const body = await response.text().catch(() => null);
        throw new Error(body || `Error al cargar usuarios (${response.status})`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [refresh, refreshCounter]);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Seguro que querés eliminar este usuario? Esta acción no se puede deshacer.')) return;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) throw new Error('No estás autenticado.');

      const res = await fetch(`http://localhost:4000/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Error al eliminar usuario');
      alert('Usuario eliminado correctamente.');
      setRefreshCounter(prev => prev + 1);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <Typography>Cargando usuarios...</Typography>;

  if (error)
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
          <Button variant="contained" onClick={fetchUsers}>Reintentar</Button>
          <Button
            variant="outlined"
            onClick={() => {
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
      <Grid container spacing={2}>
        {users.map((user) => (
          <Grid key={user.id} item xs={12} sm={6} md={4} lg={3}>
            <Card
              sx={{
                borderRadius: 2,
                p: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                transition: '0.2s',
                ':hover': { transform: 'scale(1.02)' },
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">ID:</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{user.id}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Nombre:</Typography>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>{user.name}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Email:</Typography>
                <Typography variant="body2">{user.email}</Typography>

                <Button
                  variant="contained"
                  color="error"
                  sx={{ mt: 1 }}
                  fullWidth
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Eliminar usuario
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
