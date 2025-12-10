'use client';

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Divider,
  Modal,
  Rating,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import { useRouter } from "next/navigation";
import RestaurantReviewForm from "@/app/restaurants/restaurant-review-form";

const API = "http://192.168.1.6:4000";

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  image?: string;
  city?: string;
  address?: string;
}

interface Review {
  id: string;
  comment: string;
  rating: number;
  userName?: string;
  user?: {
    name: string;
  };
}

interface Props {
  search?: string;
}

export default function RestaurantsSection({ search = "" }: Props) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewFormRestaurantId, setReviewFormRestaurantId] = useState<string | null>(null);
  const [reviewsMap, setReviewsMap] = useState<Record<string, Review[]>>({});
  const [openReviewsModal, setOpenReviewsModal] = useState<Restaurant | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No token");

        const res = await fetch(`${API}/restaurants`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error al obtener restaurantes");

        const data: Restaurant[] = await res.json();
        setRestaurants(data);

        // Traer reviews por cada restaurante
        const reviewsData: Record<string, Review[]> = {};
        for (const r of data) {
          const resRev = await fetch(`${API}/reviews?restaurantId=${r.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
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

  const handleReserveClick = (restaurantId: string) => {
    router.push(`/reservations/select-seats?restaurant=${restaurantId}`);
  };

  const filteredRestaurants = restaurants.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.city?.toLowerCase().includes(search.toLowerCase())
  );

  const getRandomComment = (reviews: Review[]) => {
    if (!reviews || reviews.length === 0) return null;
    return reviews[reviews.length - 1]; // mostrar la review más reciente
  };

  const getAverageRating = (reviews: Review[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  };

  if (loading) return <Typography sx={{ color: "white" }}>Cargando restaurantes...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ mb: 12 }}>
      <Typography variant="h4" sx={{ color: "white", mb: 2 }}>
        Restaurantes disponibles
      </Typography>
      <Divider sx={{ borderColor: "white", mb: 3 }} />

      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
        }}
        gap={3}
      >
        {filteredRestaurants.map((restaurant) => {
          const reviews = reviewsMap[restaurant.id] || [];
          const randomReview = getRandomComment(reviews);
          const avgRating = getAverageRating(reviews);

          return (
            <Card
              key={restaurant.id}
              sx={{ backgroundColor: "#111", color: "white", border: "1px solid white" }}
            >
              {restaurant.image && (
                <CardMedia
                  component="img"
                  height="180"
                  image={restaurant.image}
                  alt={restaurant.name}
                />
              )}
              <CardContent>
                <Typography variant="h6">{restaurant.name}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {restaurant.description}
                </Typography>
                {restaurant.city && (
                  <Typography sx={{ mt: 1, opacity: 0.7 }}>Ciudad: {restaurant.city}</Typography>
                )}
                {restaurant.address && (
                  <Typography sx={{ mt: 1, opacity: 0.7 }}>Dirección: {restaurant.address}</Typography>
                )}

                <Button
                  variant="contained"
                  sx={{ mt: 2, backgroundColor: "#ff9800" }}
                  fullWidth
                  onClick={() => handleReserveClick(restaurant.id)}
                >
                  Reservar mesa
                </Button>

                <Button
                  variant="outlined"
                  sx={{ mt: 1, color: "white", borderColor: "white" }}
                  fullWidth
                  onClick={() =>
                    setReviewFormRestaurantId(prev => (prev === restaurant.id ? null : restaurant.id))
                  }
                >
                  {reviewFormRestaurantId === restaurant.id ? "Ocultar Review" : "Escribir Review"}
                </Button>

                {reviewFormRestaurantId === restaurant.id && (
                  <RestaurantReviewForm
                    restaurantId={restaurant.id}
                    onSuccess={() => setReviewFormRestaurantId(null)}
                    onNewReview={(review) => {
                      // Solo actualizar reviews del restaurant actual
                      setReviewsMap(prev => {
                        const prevReviews = prev[restaurant.id] || [];
                        return { ...prev, [restaurant.id]: [...prevReviews, review] };
                      });
                    }}
                  />
                )}

                {/* Mostrar comentario más reciente y promedio */}
                {reviews.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Promedio: {avgRating.toFixed(1)} ⭐</Typography>
                    {randomReview && (
                      <Typography sx={{ fontStyle: "italic", mt: 0.5 }}>
                        "{randomReview.comment}"
                      </Typography>
                    )}
                    <Button
                      variant="text"
                      sx={{ mt: 1, color: "#ff9800" }}
                      onClick={() => setOpenReviewsModal(restaurant)}
                    >
                      Ver todos los comentarios ({reviews.length})
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })}
        {filteredRestaurants.length === 0 && (
          <Typography align="center" sx={{ color: "white", mt: 2 }}>
            No se encontraron restaurantes.
          </Typography>
        )}
      </Box>

      {/* Modal para comentarios del restaurant seleccionado */}
      <Modal
        open={!!openReviewsModal}
        onClose={() => setOpenReviewsModal(null)}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 350,
            maxHeight: "80vh",
            overflowY: "auto",
            bgcolor: "#111",
            color: "white",
            border: "1px solid #fff",
            borderRadius: 2,
            p: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            Comentarios de {openReviewsModal?.name}
          </Typography>
          <Divider sx={{ borderColor: "white", mb: 1 }} />
          <List>
            {openReviewsModal &&
              (reviewsMap[openReviewsModal.id] || []).map((r) => (
                <ListItem key={r.id} divider>
                  <ListItemText
                    primary={`${r.user?.name || "Usuario"}: ${r.comment}`}
                    secondary={<Rating value={r.rating} readOnly size="small" />}
                  />
                </ListItem>
              ))}
          </List>
          <Button
            variant="contained"
            sx={{ mt: 2, backgroundColor: "#ff9800" }}
            fullWidth
            onClick={() => setOpenReviewsModal(null)}
          >
            Cerrar
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
