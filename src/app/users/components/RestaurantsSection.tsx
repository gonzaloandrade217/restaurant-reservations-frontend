'use client';

import React, { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, Button, Divider,
  Modal, Rating, List, ListItem, ListItemText, Slider, Switch,
  FormControlLabel, Chip,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { useRouter } from "next/navigation";
import RestaurantReviewForm from "@/app/restaurants/restaurant-review-form";
import { parseImage } from "@/app/restaurants/create-restaurant";

const API = "NEXT_PUBLIC_API_URL" in process.env ? process.env.NEXT_PUBLIC_API_URL : "http://localhost:4000";

interface Restaurant {
  id: string; name: string; description?: string; images?: string[];
  city?: string; address?: string; latitude?: number; longitude?: number;
}
interface Review { id: string; comment: string; rating: number; user?: { name: string }; }
interface Props { search?: string; }

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Carrusel tipo Instagram reutilizable
function ImageCarousel({ imgs, restaurantName }: { imgs: string[]; restaurantName: string }) {
  const [idx, setIdx] = useState(0);
  const parsed = imgs.map(s => parseImage(s));

  if (parsed.length === 0) return (
    <Box sx={{ height: 220, backgroundColor: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Typography sx={{ color: "rgba(255,255,255,0.25)", fontSize: "0.85rem" }}>Sin fotos</Typography>
    </Box>
  );

  const current = parsed[idx];

  return (
    <Box sx={{ position: "relative", height: 220, backgroundColor: "#000", overflow: "hidden" }}>
      {/* Imagen principal */}
      <Box
        component="img"
        src={current.url}
        alt={`${restaurantName} ${idx + 1}`}
        sx={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${current.x}% ${current.y}%`, display: "block", userSelect: "none" }}
        onError={(e: any) => { e.target.style.display = "none"; }}
      />

      {/* Flechas */}
      {imgs.length > 1 && (
        <>
          <Box
            onClick={(e) => { e.stopPropagation(); setIdx(i => (i - 1 + imgs.length) % imgs.length); }}
            sx={{
              position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
              width: 30, height: 30, borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "white", fontSize: "0.85rem", userSelect: "none",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.85)" },
            }}
          >‹</Box>
          <Box
            onClick={(e) => { e.stopPropagation(); setIdx(i => (i + 1) % imgs.length); }}
            sx={{
              position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
              width: 30, height: 30, borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "white", fontSize: "0.85rem", userSelect: "none",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.85)" },
            }}
          >›</Box>
        </>
      )}

      {/* Dots tipo Instagram */}
      {imgs.length > 1 && (
        <Box sx={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: "5px" }}>
          {imgs.map((_, i) => (
            <Box
              key={i}
              onClick={(e) => { e.stopPropagation(); setIdx(i); }}
              sx={{
                width: i === idx ? 8 : 6, height: i === idx ? 8 : 6,
                borderRadius: "50%", cursor: "pointer",
                backgroundColor: i === idx ? "white" : "rgba(255,255,255,0.45)",
                transition: "all 0.2s",
              }}
            />
          ))}
        </Box>
      )}

      {/* Contador top-right */}
      {imgs.length > 1 && (
        <Box sx={{
          position: "absolute", top: 8, right: 8,
          backgroundColor: "rgba(0,0,0,0.55)", color: "white",
          fontSize: "0.72rem", px: 1, py: 0.3, borderRadius: 10,
        }}>
          {idx + 1}/{imgs.length}
        </Box>
      )}
    </Box>
  );
}

export default function RestaurantsSection({ search = "" }: Props) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewFormRestaurantId, setReviewFormRestaurantId] = useState<string | null>(null);
  const [reviewsMap, setReviewsMap] = useState<Record<string, Review[]>>({});
  const [openReviewsModal, setOpenReviewsModal] = useState<Restaurant | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [radiusKm, setRadiusKm] = useState(10);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No token");
        const res = await fetch(`${API}/restaurants`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Error al obtener restaurantes");
        const data: Restaurant[] = await res.json();
        setRestaurants(data);
        const reviewsData: Record<string, Review[]> = {};
        for (const r of data) {
          const resRev = await fetch(`${API}/reviews?restaurantId=${r.id}`, { headers: { Authorization: `Bearer ${token}` } });
          reviewsData[r.id] = resRev.ok ? await resRev.json() : [];
        }
        setReviewsMap(reviewsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) { setLocationError("Tu navegador no soporta geolocalización."); return; }
    setLoadingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }); setNearbyOnly(true); setLoadingLocation(false); },
      () => { setLocationError("No se pudo obtener tu ubicación. Verificá los permisos del navegador."); setLoadingLocation(false); }
    );
  };

  const getAverageRating = (reviews: Review[]) => {
    if (!reviews || reviews.length === 0) return 0;
    return reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  };

  const filteredRestaurants = restaurants
    .filter((r) => {
      const matchesSearch = r.name?.toLowerCase().includes(search.toLowerCase()) || r.city?.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (nearbyOnly && userLocation) {
        if (r.latitude == null || r.longitude == null) return false;
        return getDistanceKm(userLocation.lat, userLocation.lon, r.latitude, r.longitude) <= radiusKm;
      }
      return true;
    })
    .map((r) => ({
      ...r,
      distanceKm: userLocation && r.latitude != null && r.longitude != null
        ? getDistanceKm(userLocation.lat, userLocation.lon, r.latitude, r.longitude)
        : undefined,
    }))
    .sort((a, b) => (userLocation && a.distanceKm != null && b.distanceKm != null ? a.distanceKm - b.distanceKm : 0));

  if (loading) return <Typography sx={{ color: "white" }}>Cargando restaurantes...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ mb: 12 }}>
      <Typography variant="h4" sx={{ color: "white", mb: 2 }}>Restaurantes disponibles</Typography>
      <Divider sx={{ borderColor: "white", mb: 3 }} />

      {/* Panel de ubicación */}
      <Box sx={{ mb: 3, p: 2, border: "1px solid rgba(255,255,255,0.2)", borderRadius: 2, backgroundColor: "rgba(255,255,255,0.05)" }}>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Button variant="outlined" startIcon={<MyLocationIcon />} onClick={handleGetLocation} disabled={loadingLocation}
            sx={{ color: "white", borderColor: "white", whiteSpace: "nowrap" }}>
            {loadingLocation ? "Obteniendo ubicación..." : userLocation ? "Actualizar ubicación" : "Usar mi ubicación"}
          </Button>
          {userLocation && (
            <FormControlLabel
              control={<Switch checked={nearbyOnly} onChange={(e) => setNearbyOnly(e.target.checked)}
                sx={{ "& .MuiSwitch-thumb": { backgroundColor: nearbyOnly ? "#ff9800" : "gray" } }} />}
              label={<Typography sx={{ color: "white" }}>Solo cercanos</Typography>}
            />
          )}
        </Box>
        {locationError && <Typography sx={{ color: "#ff6b6b", mt: 1, fontSize: "0.85rem" }}>{locationError}</Typography>}
        {userLocation && nearbyOnly && (
          <Box sx={{ mt: 2, px: 1 }}>
            <Typography sx={{ color: "white", mb: 1 }}>Radio: <strong>{radiusKm} km</strong></Typography>
            <Slider value={radiusKm} onChange={(_, v) => setRadiusKm(v as number)} min={1} max={50} step={1}
              marks={[{ value: 1, label: <span style={{ color: "white" }}>1 km</span> }, { value: 25, label: <span style={{ color: "white" }}>25 km</span> }, { value: 50, label: <span style={{ color: "white" }}>50 km</span> }]}
              sx={{ color: "#ff9800", "& .MuiSlider-markLabel": { color: "white" } }} />
          </Box>
        )}
      </Box>

      {/* Grilla */}
      <Box display="grid" gridTemplateColumns={{ xs: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={3}>
        {filteredRestaurants.map((restaurant) => {
          const reviews = reviewsMap[restaurant.id] || [];
          const avgRating = getAverageRating(reviews);
          const lastReview = reviews[reviews.length - 1];
          const dist = (restaurant as any).distanceKm;

          return (
            <Card key={restaurant.id} sx={{ backgroundColor: "#111", color: "white", border: "1px solid white", overflow: "hidden" }}>

              {/* Carrusel de fotos */}
              <ImageCarousel imgs={restaurant.images ?? []} restaurantName={restaurant.name} />

              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="h6">{restaurant.name}</Typography>
                  {dist != null && (
                    <Chip label={dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`}
                      size="small" sx={{ backgroundColor: "#ff9800", color: "white", ml: 1, flexShrink: 0 }} />
                  )}
                </Box>
                {restaurant.description && <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>{restaurant.description}</Typography>}
                {restaurant.city && <Typography sx={{ mt: 1, opacity: 0.7 }}>Ciudad: {restaurant.city}</Typography>}
                {restaurant.address && <Typography sx={{ mt: 0.5, opacity: 0.7 }}>Dirección: {restaurant.address}</Typography>}

                <Button variant="contained" sx={{ mt: 2, backgroundColor: "#ff9800" }} fullWidth
                  onClick={() => router.push(`/reservations/select-seats?restaurant=${restaurant.id}`)}>
                  Reservar mesa
                </Button>
                <Button variant="outlined" sx={{ mt: 1, color: "white", borderColor: "white" }} fullWidth
                  onClick={() => setReviewFormRestaurantId((prev) => prev === restaurant.id ? null : restaurant.id)}>
                  {reviewFormRestaurantId === restaurant.id ? "Ocultar Review" : "Escribir Review"}
                </Button>

                {reviewFormRestaurantId === restaurant.id && (
                  <RestaurantReviewForm restaurantId={restaurant.id} onSuccess={() => setReviewFormRestaurantId(null)}
                    onNewReview={(review) => setReviewsMap((prev) => ({ ...prev, [restaurant.id]: [...(prev[restaurant.id] || []), review] }))} />
                )}

                {reviews.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Promedio: {avgRating.toFixed(1)} ⭐</Typography>
                    {lastReview?.comment && <Typography sx={{ fontStyle: "italic", mt: 0.5, opacity: 0.8 }}>"{lastReview.comment}"</Typography>}
                    <Button variant="text" sx={{ mt: 1, color: "#ff9800" }} onClick={() => setOpenReviewsModal(restaurant)}>
                      Ver todos los comentarios ({reviews.length})
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })}
        {filteredRestaurants.length === 0 && (
          <Typography align="center" sx={{ color: "white", mt: 2, gridColumn: "1/-1" }}>
            {nearbyOnly ? `No hay restaurantes en un radio de ${radiusKm} km.` : "No se encontraron restaurantes."}
          </Typography>
        )}
      </Box>

      {/* Modal comentarios */}
      <Modal open={!!openReviewsModal} onClose={() => setOpenReviewsModal(null)}>
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 350, maxHeight: "80vh", overflowY: "auto", bgcolor: "#111", color: "white", border: "1px solid #fff", borderRadius: 2, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Comentarios de {openReviewsModal?.name}</Typography>
          <Divider sx={{ borderColor: "white", mb: 1 }} />
          <List>
            {openReviewsModal && (reviewsMap[openReviewsModal.id] || []).map((r) => (
              <ListItem key={r.id} divider>
                <ListItemText primary={`${r.user?.name || "Usuario"}: ${r.comment}`} secondary={<Rating value={r.rating} readOnly size="small" />} />
              </ListItem>
            ))}
          </List>
          <Button variant="contained" sx={{ mt: 2, backgroundColor: "#ff9800" }} fullWidth onClick={() => setOpenReviewsModal(null)}>Cerrar</Button>
        </Box>
      </Modal>
    </Box>
  );
}