'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  TextField,
  Button,
  Typography,
  Container,
  MenuItem,
  Box,
} from "@mui/material";

export default function EditRestaurantPage() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();

  const [currentPreview, setCurrentPreview] = useState(0);
  const [restaurant, setRestaurant] = useState({
    name: "",
    city: "",
    address: "",
    phone: "",
    description: "",
    capacity: 0,
    cantidadMesas: 0,
    mesaTipo: "",
    mesaCapacidad: 0,
    images: [] as string[],
  });

  // CARGAR DATOS DEL RESTAURANTE
  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("authToken");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      setRestaurant({
        name: data.name,
        city: data.city,
        address: data.address,
        phone: data.phone,
        description: data.description ?? "",
        capacity: data.capacity ?? 0,
        cantidadMesas: data.cantidadMesas ?? 0,
        mesaTipo: data.mesaTipo ?? "",
        mesaCapacidad: data.mesaCapacidad ?? 0,
        images: data.images ?? [],
      });
    };

    if (id) loadData();
  }, [id]);

  // CAMBIO DE CAMPOS
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    setRestaurant({
      ...restaurant,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
    });
  };

  // GUARDAR CAMBIOS
  const handleSave = async () => {
    const token = localStorage.getItem("authToken");

    const payload = {
      name: restaurant.name,
      city: restaurant.city,
      address: restaurant.address,
      phone: restaurant.phone,
      description: restaurant.description,
      capacity: Number(restaurant.capacity),
      cantidadMesas: Number(restaurant.cantidadMesas),
      mesaTipo: restaurant.mesaTipo || null,
      mesaCapacidad: restaurant.mesaCapacidad
        ? Number(restaurant.mesaCapacidad)
        : null,
      images: restaurant.images ?? [],
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(await res.text());
      alert("Error al actualizar el restaurante ❌");
      return;
    }

    alert("Restaurante actualizado correctamente ✔️");
    router.push("/admin/dashboard");
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 6,
        bgcolor: "#000",
        p: 4,
        borderRadius: 3,
        color: "white",
        boxShadow: "0 0 15px rgba(255,255,255,0.08)",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          textAlign: "center",
          mb: 3,
          color: "white",
          fontWeight: "bold",
        }}
      >
        Editar Restaurante
      </Typography>

      {/* CAMPOS PRINCIPALES */}
      {[
        { label: "Nombre", name: "name" },
        { label: "Ciudad", name: "city" },
        { label: "Dirección", name: "address" },
        { label: "Teléfono", name: "phone" },
      ].map((field) => (
        <TextField
          key={field.name}
          label={field.label}
          name={field.name}
          value={(restaurant as any)[field.name]}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
          InputLabelProps={{ style: { color: "#fff" } }}
          InputProps={{
            style: { color: "#fff" },
            sx: { "& fieldset": { borderColor: "white" } },
          }}
        />
      ))}

      {/* DESCRIPCIÓN */}
      <TextField
        label="Descripción"
        name="description"
        value={restaurant.description}
        onChange={handleChange}
        fullWidth
        multiline
        rows={3}
        sx={{ mb: 2 }}
        InputLabelProps={{ style: { color: "#fff" } }}
        InputProps={{
          style: { color: "#fff" },
          sx: { "& fieldset": { borderColor: "white" } },
        }}
      />

      {/* CAPACIDAD TOTAL */}
      <TextField
        label="Capacidad total"
        type="number"
        name="capacity"
        value={restaurant.capacity}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 2 }}
        InputLabelProps={{ style: { color: "#fff" } }}
        InputProps={{
          style: { color: "#fff" },
          sx: { "& fieldset": { borderColor: "white" } },
        }}
      />

      {/* CANTIDAD DE MESAS */}
      <TextField
        label="Cantidad de mesas"
        type="number"
        name="cantidadMesas"
        value={restaurant.cantidadMesas}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 2 }}
        InputLabelProps={{ style: { color: "#fff" } }}
        InputProps={{
          style: { color: "#fff" },
          sx: { "& fieldset": { borderColor: "white" } },
        }}
      />

      {/* TIPO DE MESA */}
      <TextField
        select
        label="Tipo de mesa"
        name="mesaTipo"
        value={restaurant.mesaTipo}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 2 }}
        InputLabelProps={{ style: { color: "white" } }}
        InputProps={{
          style: { color: "white" },
          sx: { "& fieldset": { borderColor: "white" } },
        }}
      >
        <MenuItem value={"CUADRADA"}>Cuadrada</MenuItem>
        <MenuItem value={"RECTANGULAR"}>Rectangular</MenuItem>
        <MenuItem value={"REDONDA"}>Redonda</MenuItem>
      </TextField>

      {/* CAPACIDAD POR MESA */}
      <TextField
        label="Capacidad por mesa"
        type="number"
        name="mesaCapacidad"
        value={restaurant.mesaCapacidad}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 3 }}
        InputLabelProps={{ style: { color: "#fff" } }}
        InputProps={{
          style: { color: "#fff" },
          sx: { "& fieldset": { borderColor: "white" } },
        }}
      />

      {/* FOTOS DEL RESTAURANTE */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ color: "white", mb: 1, fontSize: "0.9rem" }}>
          Fotos del restaurante (opcional)
        </Typography>
        <Button
          variant="outlined"
          component="label"
          sx={{ color: "white", borderColor: "white" }}
        >
          📷 Adjuntar fotos
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              const oversized = files.filter(f => f.size > 2 * 1024 * 1024);
              if (oversized.length > 0) alert(`${oversized.length} imagen(es) superan los 2 MB y no se agregarán.`);
              const valid = files.filter(f => f.size <= 2 * 1024 * 1024);
              valid.forEach(file => {
                const reader = new FileReader();
                reader.onload = () =>
                  setRestaurant(prev => ({ ...prev, images: [...(prev.images || []), reader.result as string] }));
                reader.readAsDataURL(file);
              });
              e.target.value = "";
            }}
          />
        </Button>

        {restaurant.images && restaurant.images.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Box
              component="img"
              src={restaurant.images[currentPreview]}
              alt={`Foto ${currentPreview + 1}`}
              sx={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 1, border: "1px solid rgba(255,255,255,0.3)", display: "block" }}
            />
            {restaurant.images.length > 1 && (
              <Box display="flex" justifyContent="center" alignItems="center" gap={1} mt={1}>
                <Button size="small" onClick={() => setCurrentPreview(p => (p - 1 + restaurant.images.length) % restaurant.images.length)}
                  sx={{ color: "white", minWidth: 32, p: 0 }}>◀</Button>
                <Typography sx={{ color: "white", fontSize: "0.8rem" }}>
                  {currentPreview + 1} / {restaurant.images.length}
                </Typography>
                <Button size="small" onClick={() => setCurrentPreview(p => (p + 1) % restaurant.images.length)}
                  sx={{ color: "white", minWidth: 32, p: 0 }}>▶</Button>
              </Box>
            )}
            <Box display="flex" gap={1} mt={1} sx={{ overflowX: "auto", pb: 0.5 }}>
              {restaurant.images.map((img, i) => (
                <Box key={i} sx={{ position: "relative", flexShrink: 0 }}>
                  <Box
                    component="img"
                    src={img}
                    onClick={() => setCurrentPreview(i)}
                    sx={{
                      width: 56, height: 56, objectFit: "cover", borderRadius: 1, cursor: "pointer",
                      border: i === currentPreview ? "2px solid #ff9800" : "2px solid transparent",
                      opacity: i === currentPreview ? 1 : 0.6,
                    }}
                  />
                  <Box
                    onClick={() => {
                      setRestaurant(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
                      setCurrentPreview(p => Math.min(p, restaurant.images.length - 2));
                    }}
                    sx={{
                      position: "absolute", top: -6, right: -6, width: 18, height: 18,
                      backgroundColor: "#ff6b6b", borderRadius: "50%", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.65rem", color: "white", fontWeight: "bold", lineHeight: 1,
                    }}
                  >✕</Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* BOTÓN GUARDAR */}
      <Button
        fullWidth
        variant="contained"
        onClick={handleSave}
        sx={{
          bgcolor: "#ff9800",
          color: "white",
          fontWeight: "bold",
          mb: 2,
          ":hover": { bgcolor: "#e86f00" },
        }}
      >
        Guardar Cambios
      </Button>

      {/* BOTÓN VOLVER */}
      <Button
        fullWidth
        variant="contained"
        onClick={() => router.push("/admin/dashboard")}
        sx={{
          bgcolor: "#ff9800",
          color: "white",
          fontWeight: "bold",
          ":hover": { bgcolor: "#e86f00" },
        }}
      >
        Volver 
      </Button>
    </Container>
  );
}