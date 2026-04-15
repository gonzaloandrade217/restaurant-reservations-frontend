'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  TextField, Button, Typography, Container, MenuItem, Box,
} from "@mui/material";

// Carrusel reutilizable para el formulario
function PreviewCarousel({
  images,
  currentIdx,
  onSelect,
  onRemove,
}: {
  images: string[];
  currentIdx: number;
  onSelect: (i: number) => void;
  onRemove: (i: number) => void;
}) {
  if (images.length === 0) return null;

  return (
    <Box sx={{ mt: 2 }}>
      {/* Imagen principal */}
      <Box sx={{ position: "relative", height: 220, backgroundColor: "#000", borderRadius: 1, overflow: "hidden", border: "1px solid rgba(255,255,255,0.2)" }}>
        <Box
          component="img"
          src={images[currentIdx]}
          alt={`Foto ${currentIdx + 1}`}
          sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />

        {/* Flechas */}
        {images.length > 1 && (
          <>
            <Box onClick={() => onSelect((currentIdx - 1 + images.length) % images.length)}
              sx={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", fontSize: "1.1rem", userSelect: "none" }}>‹</Box>
            <Box onClick={() => onSelect((currentIdx + 1) % images.length)}
              sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", fontSize: "1.1rem", userSelect: "none" }}>›</Box>
          </>
        )}

        {/* Dots */}
        {images.length > 1 && (
          <Box sx={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: "5px" }}>
            {images.map((_, i) => (
              <Box key={i} onClick={() => onSelect(i)}
                sx={{ width: i === currentIdx ? 8 : 6, height: i === currentIdx ? 8 : 6, borderRadius: "50%", cursor: "pointer", backgroundColor: i === currentIdx ? "white" : "rgba(255,255,255,0.45)", transition: "all 0.2s" }} />
            ))}
          </Box>
        )}

        {/* Contador */}
        {images.length > 1 && (
          <Box sx={{ position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.55)", color: "white", fontSize: "0.72rem", px: 1, py: 0.3, borderRadius: 10 }}>
            {currentIdx + 1}/{images.length}
          </Box>
        )}
      </Box>

      {/* Thumbnails con botón eliminar */}
      <Box display="flex" gap={1} mt={1.5} sx={{ overflowX: "auto", pb: 0.5 }}>
        {images.map((img, i) => (
          <Box key={i} sx={{ position: "relative", flexShrink: 0 }}>
            <Box
              component="img"
              src={img}
              onClick={() => onSelect(i)}
              sx={{
                width: 60, height: 60, objectFit: "cover", borderRadius: 1, cursor: "pointer",
                border: i === currentIdx ? "2px solid #ff9800" : "2px solid rgba(255,255,255,0.2)",
                opacity: i === currentIdx ? 1 : 0.55,
                transition: "all 0.15s",
              }}
            />
            <Box
              onClick={() => onRemove(i)}
              sx={{
                position: "absolute", top: -6, right: -6, width: 18, height: 18,
                backgroundColor: "#e53935", borderRadius: "50%", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.6rem", color: "white", fontWeight: "bold",
                boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
              }}
            >✕</Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function EditRestaurantPage() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();

  const [currentPreview, setCurrentPreview] = useState(0);
  const [restaurant, setRestaurant] = useState({
    name: "", city: "", address: "", phone: "", description: "",
    capacity: 0, cantidadMesas: 0, mesaTipo: "", mesaCapacidad: 0,
    images: [] as string[],
  });

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRestaurant({
        name: data.name, city: data.city, address: data.address, phone: data.phone,
        description: data.description ?? "", capacity: data.capacity ?? 0,
        cantidadMesas: data.cantidadMesas ?? 0, mesaTipo: data.mesaTipo ?? "",
        mesaCapacidad: data.mesaCapacidad ?? 0, images: data.images ?? [],
      });
    };
    if (id) loadData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setRestaurant({ ...restaurant, [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value });
  };

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const oversized = files.filter(f => f.size > 2 * 1024 * 1024);
    if (oversized.length > 0) alert(`${oversized.length} imagen(es) superan los 2 MB y no se agregarán.`);
    files.filter(f => f.size <= 2 * 1024 * 1024).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setRestaurant(prev => ({ ...prev, images: [...prev.images, reader.result as string] }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleRemoveImage = (i: number) => {
    setRestaurant(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
    setCurrentPreview(p => Math.min(p, Math.max(0, restaurant.images.length - 2)));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("authToken");
    const payload = {
      name: restaurant.name, city: restaurant.city, address: restaurant.address,
      phone: restaurant.phone, description: restaurant.description,
      capacity: Number(restaurant.capacity), cantidadMesas: Number(restaurant.cantidadMesas),
      mesaTipo: restaurant.mesaTipo || null,
      mesaCapacidad: restaurant.mesaCapacidad ? Number(restaurant.mesaCapacidad) : null,
      images: restaurant.images,
    };
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (!res.ok) { alert("Error al actualizar el restaurante ❌"); return; }
    alert("Restaurante actualizado correctamente ✔️");
    router.push("/admin/dashboard");
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6, bgcolor: "#000", p: 4, borderRadius: 3, color: "white", boxShadow: "0 0 15px rgba(255,255,255,0.08)" }}>
      <Typography variant="h4" sx={{ textAlign: "center", mb: 3, fontWeight: "bold" }}>
        Editar Restaurante
      </Typography>

      {[
        { label: "Nombre", name: "name" }, { label: "Ciudad", name: "city" },
        { label: "Dirección", name: "address" }, { label: "Teléfono", name: "phone" },
      ].map((field) => (
        <TextField key={field.name} label={field.label} name={field.name}
          value={(restaurant as any)[field.name]} onChange={handleChange}
          fullWidth sx={{ mb: 2 }}
          InputLabelProps={{ style: { color: "#fff" } }}
          InputProps={{ style: { color: "#fff" }, sx: { "& fieldset": { borderColor: "white" } } }} />
      ))}

      <TextField label="Descripción" name="description" value={restaurant.description}
        onChange={handleChange} fullWidth multiline rows={3} sx={{ mb: 2 }}
        InputLabelProps={{ style: { color: "#fff" } }}
        InputProps={{ style: { color: "#fff" }, sx: { "& fieldset": { borderColor: "white" } } }} />

      <TextField label="Capacidad total" type="number" name="capacity" value={restaurant.capacity}
        onChange={handleChange} fullWidth sx={{ mb: 2 }}
        InputLabelProps={{ style: { color: "#fff" } }}
        InputProps={{ style: { color: "#fff" }, sx: { "& fieldset": { borderColor: "white" } } }} />

      <TextField label="Cantidad de mesas" type="number" name="cantidadMesas" value={restaurant.cantidadMesas}
        onChange={handleChange} fullWidth sx={{ mb: 2 }}
        InputLabelProps={{ style: { color: "#fff" } }}
        InputProps={{ style: { color: "#fff" }, sx: { "& fieldset": { borderColor: "white" } } }} />

      <TextField select label="Tipo de mesa" name="mesaTipo" value={restaurant.mesaTipo}
        onChange={handleChange} fullWidth sx={{ mb: 2 }}
        InputLabelProps={{ style: { color: "white" } }}
        InputProps={{ style: { color: "white" }, sx: { "& fieldset": { borderColor: "white" } } }}>
        <MenuItem value="CUADRADA">Cuadrada</MenuItem>
        <MenuItem value="RECTANGULAR">Rectangular</MenuItem>
        <MenuItem value="REDONDA">Redonda</MenuItem>
      </TextField>

      <TextField label="Capacidad por mesa" type="number" name="mesaCapacidad" value={restaurant.mesaCapacidad}
        onChange={handleChange} fullWidth sx={{ mb: 3 }}
        InputLabelProps={{ style: { color: "#fff" } }}
        InputProps={{ style: { color: "#fff" }, sx: { "& fieldset": { borderColor: "white" } } }} />

      {/* Fotos */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ mb: 1, fontSize: "0.9rem", color: "white" }}>
          Fotos del restaurante (opcional)
        </Typography>
        <Button variant="outlined" component="label" sx={{ color: "white", borderColor: "white" }}>
          📷 Adjuntar fotos
          <input type="file" accept="image/*" multiple hidden onChange={handleAddImages} />
        </Button>

        <PreviewCarousel
          images={restaurant.images}
          currentIdx={currentPreview}
          onSelect={setCurrentPreview}
          onRemove={handleRemoveImage}
        />
      </Box>

      <Button fullWidth variant="contained" onClick={handleSave}
        sx={{ bgcolor: "#ff9800", fontWeight: "bold", mb: 2, ":hover": { bgcolor: "#e86f00" } }}>
        Guardar Cambios
      </Button>

      <Button fullWidth variant="contained" onClick={() => router.push("/admin/dashboard")}
        sx={{ bgcolor: "#ff9800", fontWeight: "bold", ":hover": { bgcolor: "#e86f00" } }}>
        Volver
      </Button>
    </Container>
  );
}