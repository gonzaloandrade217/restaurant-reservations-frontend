"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  TextField,
  Button,
  Typography,
  Container,
} from "@mui/material";

export default function EditRestaurantPage() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();

  const [restaurant, setRestaurant] = useState({
    name: "",
    address: "",
    phone: "",
    description: "",
    capacity: 0,
    cantidadMesas: 0,
  });

  // CARGAR DATOS DEL RESTAURANTE 
  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("authToken");

      const res = await fetch(`http://192.168.1.6:4000/restaurants/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      // Me quedo solo con lo editable (NO tables)
      setRestaurant({
        name: data.name,
        address: data.address,
        phone: data.phone,
        description: data.description,
        capacity: data.capacity,
        cantidadMesas: data.cantidadMesas,
      });
    };

    if (id) loadData();
  }, [id]);

  // CAMBIO DE CAMPOS 
  const handleChange = (e: any) => {
    setRestaurant({ ...restaurant, [e.target.name]: e.target.value });
  };

  // GUARDAR CAMBIOS 
  const handleSave = async () => {
    const token = localStorage.getItem("authToken");

    // Solo mando lo editable (evito error por tables)
    const payload = {
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone,
      description: restaurant.description,
      capacity: Number(restaurant.capacity),
      cantidadMesas: Number(restaurant.cantidadMesas),
    };

    const res = await fetch(`http://192.168.1.6:4000/restaurants/${id}`, {
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

      {/* CAMPOS */}
      {[
        { label: "Nombre", name: "name" },
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

      {/* CAPACIDAD */}
      <TextField
        label="Capacidad"
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

      {/* CANTIDAD MESAS */}
      <TextField
        label="Cantidad de mesas"
        type="number"
        name="cantidadMesas"
        value={restaurant.cantidadMesas}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 3 }}
        InputLabelProps={{ style: { color: "#fff" } }}
        InputProps={{
          style: { color: "#fff" },
          sx: { "& fieldset": { borderColor: "white" } },
        }}
      />

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
          ":hover": { bgcolor: "#9f68115" },
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
          ":hover": { bgcolor: "#9f68115" },
        }}
      >
        Volver al Dashboard
      </Button>
    </Container>
  );
}
