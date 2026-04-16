'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Card, CardContent, Grid, Button, Box } from '@mui/material';
import { parseImage } from './create-restaurant';

interface Restaurant {
  id: string; name: string; address: string; phone: string;
  description?: string; capacity: number; cantidadMesas: number;
  images?: string[];
}
interface RestaurantListProps { refresh?: number; adminId?: string; }

// Carrusel compacto para el admin
function AdminCarousel({ imgs }: { imgs: string[] }) {
  const [idx, setIdx] = useState(0);
  const parsed = imgs.map(s => parseImage(s));

  if (parsed.length === 0) return (
    <Box sx={{ height: 150, backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px 8px 0 0" }}>
      <Typography sx={{ color: "#aaa", fontSize: "0.8rem" }}>Sin fotos</Typography>
    </Box>
  );

  const cur = parsed[idx];
  return (
    <Box sx={{ position: "relative", height: 150, borderRadius: "8px 8px 0 0", overflow: "hidden", backgroundColor: "#000" }}>
      <Box component="img" src={cur.url} alt="foto"
        sx={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${cur.x}% ${cur.y}%`, display: "block" }}
        onError={(e: any) => { e.target.style.display = "none"; }} />
      {parsed.length > 1 && (
        <>
          <Box onClick={() => setIdx(i => (i - 1 + parsed.length) % parsed.length)}
            sx={{ position: "absolute", left: 5, top: "50%", transform: "translateY(-50%)", width: 24, height: 24, borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", fontSize: "0.85rem", userSelect: "none" }}>‹</Box>
          <Box onClick={() => setIdx(i => (i + 1) % parsed.length)}
            sx={{ position: "absolute", right: 5, top: "50%", transform: "translateY(-50%)", width: 24, height: 24, borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", fontSize: "0.85rem", userSelect: "none" }}>›</Box>
          <Box sx={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", display: "flex", gap: "4px" }}>
            {parsed.map((_, i) => (
              <Box key={i} onClick={() => setIdx(i)}
                sx={{ width: i === idx ? 8 : 5, height: i === idx ? 8 : 5, borderRadius: "50%", cursor: "pointer", backgroundColor: i === idx ? "white" : "rgba(255,255,255,0.5)", transition: "all 0.2s" }} />
            ))}
          </Box>
          <Box sx={{ position: "absolute", top: 5, right: 5, backgroundColor: "rgba(0,0,0,0.5)", color: "white", fontSize: "0.65rem", px: 0.8, py: 0.2, borderRadius: 8 }}>
            {idx + 1}/{parsed.length}
          </Box>
        </>
      )}
    </Box>
  );
}

export default function RestaurantList({ refresh, adminId }: RestaurantListProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchRestaurants = async () => {
    setLoading(true); setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
      if (!token) throw new Error('No se encontró token. Iniciá sesión como ADMIN.');
      if (role !== 'ADMIN') throw new Error('Necesitás ser ADMIN para ver la lista de restaurantes.');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants?admin=true`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Error al cargar restaurantes (${response.status})`);
      setRestaurants(await response.json());
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRestaurants(); }, [refresh, adminId]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que querés eliminar este restaurante?')) return;
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No hay token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error eliminando restaurante');
      setRestaurants(prev => prev.filter(r => r.id !== id));
    } catch (err: any) { alert(err.message); }
  };

  if (loading) return <Typography>Cargando restaurantes...</Typography>;
  if (error) return (
    <Container sx={{ mt: 4, textAlign: 'center' }}>
      <Typography color="error" gutterBottom>{error}</Typography>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
        <Button variant="contained" onClick={fetchRestaurants}>Reintentar</Button>
        <Button variant="outlined" onClick={() => { localStorage.removeItem('authToken'); localStorage.removeItem('userRole'); router.push('/login'); }}>
          Ir a Login
        </Button>
      </Box>
    </Container>
  );

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {restaurants.map((r) => (
          <Grid key={r.id} item xs={12} sm={6} md={4} lg={3}>
            <Card sx={{ width: 300, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', transition: '0.2s', display: 'flex', flexDirection: 'column', ':hover': { transform: 'scale(1.02)' } }}>
              {/* Carrusel de fotos */}
              <AdminCarousel imgs={r.images ?? []} />

              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Typography variant="subtitle2" color="text.secondary">Nombre</Typography>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 600, wordBreak: 'break-word' }}>{r.name}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Dirección</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{r.address}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Teléfono</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{r.phone}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Capacidad</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{r.capacity}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Mesas</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{r.cantidadMesas}</Typography>

                <Box sx={{ mt: "auto" }}>
                  <Button variant="contained" fullWidth onClick={() => router.push(`/restaurants/edit/${r.id}`)}
                    sx={{ mb: 1, bgcolor: '#ff9800', color: 'white', fontWeight: 'bold', ':hover': { bgcolor: '#e86f00' } }}>
                    Editar
                  </Button>
                  <Button variant="contained" color="error" fullWidth onClick={() => handleDelete(r.id)}>
                    Eliminar
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}