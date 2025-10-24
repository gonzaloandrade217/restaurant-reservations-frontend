'use client';

import { useEffect, useState } from 'react';
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
} from '@mui/material';

interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  description?: string;
  capacity?: number;
}

interface RestaurantListProps {
  refresh?: number;
}

export default function RestaurantList({ refresh }: RestaurantListProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      setError(null);

      try {
        // 🔹 Token JWT (copiado del login)
        const token =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImdvbnphQGdtYWlsLmNvbSIsInN1YiI6Ijg5ZmVjMDExLTZiZjktNGFmNy1hMmE0LTUwYWRlMTVkOTIzOCIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc2MTM0NTI4MSwiZXhwIjoxNzYxMzQ4ODgxfQ.8nfNrLuclyuYD1BscXZqBxDLvGlodhkJE1D7KXXtRoI";

        const response = await fetch('http://localhost:4000/restaurants', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al cargar restaurantes');
        }

        const data = await response.json();
        setRestaurants(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [refresh]);

  if (loading) return <Typography>Cargando restaurantes...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Lista de Restaurantes
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Capacidad</TableCell>
              <TableCell>Descripción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {restaurants.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.address}</TableCell>
                <TableCell>{r.phone}</TableCell>
                <TableCell>{r.capacity ?? '-'}</TableCell>
                <TableCell>{r.description || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
