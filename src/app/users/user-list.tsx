'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container, Typography, Box, Button, TextField,
  InputAdornment, Rating, Chip, Divider, CircularProgress, Avatar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import PersonIcon from '@mui/icons-material/Person';

interface Reservation {
  id: string;
  status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  adminRating?: number | null;
  reservations?: Reservation[];
}

interface UserListProps { refresh?: number; }

function UserRow({ user, onRatingChange }: { user: User; onRatingChange: (id: string, rating: number) => void }) {
  const reservations = user.reservations ?? [];
  const completed = reservations.filter(r => r.status === 'COMPLETED').length;
  const cancelled = reservations.filter(r => r.status === 'CANCELLED').length;
  const pending = reservations.filter(r => r.status === 'PENDING').length;
  const accepted = reservations.filter(r => r.status === 'ACCEPTED').length;
  const total = reservations.length;

  const [hover, setHover] = useState(-1);
  const [saving, setSaving] = useState(false);

  const handleRate = async (newValue: number | null) => {
    if (newValue === null) return;
    setSaving(true);
    await onRatingChange(user.id, newValue);
    setSaving(false);
  };

  const compliance = total > 0 ? Math.round((completed / total) * 100) : null;
  const complianceColor = compliance === null ? '#888' : compliance >= 75 ? '#4caf50' : compliance >= 40 ? '#ff9800' : '#f44336';

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 2,
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      '&:hover': { backgroundColor: 'rgba(255,255,255,0.03)' },
      flexWrap: { xs: 'wrap', md: 'nowrap' },
    }}>
      <Avatar src={user.avatar || undefined}
        sx={{ width: 40, height: 40, backgroundColor: '#ff9800', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
        {!user.avatar && user.name.charAt(0).toUpperCase()}
      </Avatar>

      {/* Nombre y email */}
      <Box sx={{ minWidth: 0, flex: '1 1 180px' }}>
        <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {user.name}
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {user.email}
        </Typography>
      </Box>

      {/* Stats de reservas */}
      <Box display="flex" gap={1} flexWrap="wrap" sx={{ flex: '1 1 200px' }}>
        <Chip icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />} label={`${completed} completadas`} size="small"
          sx={{ backgroundColor: 'rgba(76,175,80,0.12)', color: '#4caf50', border: '1px solid rgba(76,175,80,0.25)', fontSize: '0.72rem' }} />
        <Chip icon={<CancelIcon sx={{ fontSize: '14px !important' }} />} label={`${cancelled} canceladas`} size="small"
          sx={{ backgroundColor: 'rgba(244,67,54,0.12)', color: '#f44336', border: '1px solid rgba(244,67,54,0.25)', fontSize: '0.72rem' }} />
        {(pending + accepted) > 0 && (
          <Chip icon={<PendingIcon sx={{ fontSize: '14px !important' }} />} label={`${pending + accepted} activas`} size="small"
            sx={{ backgroundColor: 'rgba(255,152,0,0.12)', color: '#ff9800', border: '1px solid rgba(255,152,0,0.25)', fontSize: '0.72rem' }} />
        )}
      </Box>

      {/* % cumplimiento */}
      <Box sx={{ flex: '0 0 80px', textAlign: 'center' }}>
        {compliance !== null ? (
          <>
            <Typography sx={{ color: complianceColor, fontWeight: 700, fontSize: '1.1rem', lineHeight: 1 }}>
              {compliance}%
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem' }}>cumplimiento</Typography>
          </>
        ) : (
          <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>sin datos</Typography>
        )}
      </Box>

      {/* Rating con estrellas */}
      <Box sx={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}>
        <Rating
          value={user.adminRating ?? 0}
          onChange={(_, v) => handleRate(v)}
          onChangeActive={(_, v) => setHover(v)}
          precision={1}
          size="small"
          sx={{ '& .MuiRating-iconFilled': { color: '#ff9800' }, '& .MuiRating-iconHover': { color: '#ffb74d' }, '& .MuiRating-iconEmpty .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.35)' } }}
        />
        <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.68rem' }}>
          {saving ? 'Guardando...' : hover > 0 ? ['Muy malo','Malo','Regular','Bueno','Excelente'][hover - 1] : user.adminRating ? `${user.adminRating}/5` : 'Sin calificar'}
        </Typography>
      </Box>
    </Box>
  );
}

export default function UserList({ refresh }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const fetchUsers = async () => {
    setLoading(true); setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
      if (!token) throw new Error('No se encontró token. Iniciá sesión como ADMIN.');
      if (role !== 'ADMIN') throw new Error('Necesitás ser ADMIN para ver la lista de usuarios.');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/with-reservations`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) throw new Error('Sesión inválida o token expirado.');
      if (response.status === 403) throw new Error('No autorizado (403).');
      if (!response.ok) throw new Error(`Error al cargar usuarios (${response.status})`);

      setUsers(await response.json());
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = async (userId: string, rating: number) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/rating`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ rating }),
    });
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, adminRating: rating } : u));
    }
  };

  useEffect(() => { fetchUsers(); }, [refresh]);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={6}><CircularProgress sx={{ color: '#ff9800' }} /></Box>
  );

  if (error) return (
    <Container sx={{ mt: 4, textAlign: 'center' }}>
      <Typography color="error" gutterBottom>{error}</Typography>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
        <Button variant="contained" onClick={fetchUsers}>Reintentar</Button>
        <Button variant="outlined" onClick={() => { localStorage.removeItem('authToken'); localStorage.removeItem('userRole'); router.push('/login'); }}>
          Ir a Login
        </Button>
      </Box>
    </Container>
  );

  return (
    <Container sx={{ mt: 4, px: { xs: 1, sm: 3 } }}>
      {/* Buscador */}
      <TextField
        placeholder="Buscar por nombre o email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        fullWidth
        sx={{
          mb: 3, maxWidth: 420,
          '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.06)', color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' }, '&:hover fieldset': { borderColor: '#ff9800' }, '&.Mui-focused fieldset': { borderColor: '#ff9800' } },
          '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.3)' },
        }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} /></InputAdornment>,
        }}
      />

      {/* Header de la tabla */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 1.2,
        backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '8px 8px 0 0',
        border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none',
        flexWrap: { xs: 'wrap', md: 'nowrap' },
      }}>
        <Box sx={{ width: 40, flexShrink: 0 }} />
        <Typography sx={{ flex: '1 1 180px', color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Usuario</Typography>
        <Typography sx={{ flex: '1 1 200px', color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Reservas</Typography>
        <Typography sx={{ flex: '0 0 80px', color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Cumpl.</Typography>
        <Typography sx={{ flex: '0 0 auto', color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Calificación</Typography>
      </Box>

      {/* Lista */}
      <Box sx={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <PersonIcon sx={{ color: 'rgba(255,255,255,0.15)', fontSize: 40, mb: 1 }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.3)' }}>
              {search ? 'No se encontraron usuarios.' : 'No hay usuarios con reservas.'}
            </Typography>
          </Box>
        ) : (
          filtered.map(user => (
            <UserRow key={user.id} user={user} onRatingChange={handleRatingChange} />
          ))
        )}
      </Box>

      <Typography sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', mt: 1.5, textAlign: 'right' }}>
        {filtered.length} usuario{filtered.length !== 1 ? 's' : ''}
      </Typography>
    </Container>
  );
}