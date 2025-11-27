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

interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  description?: string;
  capacity: number;
  cantidadMesas: number;
}

interface RestaurantListProps {
  refresh?: number;
}

export default function RestaurantList({ refresh }: RestaurantListProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchRestaurants = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;

      if (!token) throw new Error('No se encontró token. Iniciá sesión como ADMIN.');
      if (role !== 'ADMIN') throw new Error('Necesitás ser ADMIN para ver la lista de restaurantes.');

      const response = await fetch('http://192.168.1.6:4000/restaurants', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Error al cargar restaurantes (${response.status})`);

      const data = await response.json();
      setRestaurants(data);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [refresh]);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("¿Seguro que querés eliminar este restaurante?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No hay token");

      const res = await fetch(`http://192.168.1.6:4000/restaurants/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error eliminando restaurante");

      setRestaurants((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <Typography>Cargando restaurantes...</Typography>;

  if (error)
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
          <Button variant="contained" onClick={fetchRestaurants}>
            Reintentar
          </Button>

          <Button
            variant="outlined"
            onClick={() => {
              localStorage.removeItem('authToken');
              localStorage.removeItem('userRole');
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
        {restaurants.map((r) => (
          <Grid key={r.id} item xs={12} sm={6} md={4} lg={3}>
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
                <Typography variant="subtitle2" color="text.secondary">
                  Nombre:
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>
                  {r.name}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Dirección:
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {r.address}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Teléfono:
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {r.phone}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Capacidad:
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {r.capacity}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Mesas:
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {r.cantidadMesas}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Descripción:
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {r.description || '-'}
                </Typography>

                {/* BOTÓN EDITAR - AHORA NARANJA */}
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => router.push(`/restaurants/edit/${r.id}`)}
                  sx={{
                    mb: 1,
                    bgcolor: "#f09002ff",
                    color: "white",
                    fontWeight: "bold",
                    ":hover": { bgcolor: "#9f6815ff" },
                  }}
                >
                  Editar
                </Button>

                {/* BOTÓN ELIMINAR */}
                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  onClick={() => handleDelete(r.id)}
                >
                  Eliminar
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
