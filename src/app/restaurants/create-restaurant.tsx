'use client';

import { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";

interface CreateRestaurantFormProps {
  onCreated?: () => void;
}

export default function CreateRestaurantForm({ onCreated }: CreateRestaurantFormProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState<number | "">("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Creando restaurante...");

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No se encontró el token. Iniciá sesión nuevamente.");

      const response = await fetch("http://localhost:4000/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          address,
          phone,
          description,
          capacity: capacity === "" ? null : Number(capacity),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear el restaurante");
      }

      const restaurantData = await response.json();
      setMessage(`✅ Restaurante creado con éxito: ${restaurantData.name}`);
      setName("");
      setAddress("");
      setPhone("");
      setDescription("");
      setCapacity("");

      if (onCreated) onCreated();
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 4,
        maxWidth: 400,
        mx: "auto",
        border: "1px solid #ffffff",
        borderRadius: 2,
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        align="center"
        sx={{ color: "white" }}
      >
        Crear Nuevo Restaurante
      </Typography>

      <TextField
        label="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        fullWidth
        sx={{
          "& .MuiInputBase-input": { color: "white" },
          "& .MuiInputLabel-root": { color: "white" },
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "white" },
            "&:hover fieldset": { borderColor: "white" },
            "&.Mui-focused fieldset": { borderColor: "white" },
          },
        }}
      />

      <TextField
        label="Dirección"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
        fullWidth
        sx={{
          "& .MuiInputBase-input": { color: "white" },
          "& .MuiInputLabel-root": { color: "white" },
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "white" },
            "&:hover fieldset": { borderColor: "white" },
            "&.Mui-focused fieldset": { borderColor: "white" },
          },
        }}
      />

      <TextField
        label="Teléfono"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        fullWidth
        sx={{
          "& .MuiInputBase-input": { color: "white" },
          "& .MuiInputLabel-root": { color: "white" },
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "white" },
            "&:hover fieldset": { borderColor: "white" },
            "&.Mui-focused fieldset": { borderColor: "white" },
          },
        }}
      />

      <TextField
        label="Capacidad"
        type="number"
        value={capacity}
        onChange={(e) =>
          setCapacity(e.target.value === "" ? "" : Number(e.target.value))
        }
        required
        fullWidth
        sx={{
          "& .MuiInputBase-input": { color: "white" },
          "& .MuiInputLabel-root": { color: "white" },
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "white" },
            "&:hover fieldset": { borderColor: "white" },
            "&.Mui-focused fieldset": { borderColor: "white" },
          },
        }}
      />

      <TextField
        label="Descripción (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        multiline
        rows={3}
        sx={{
          "& .MuiInputBase-input": { color: "white" },
          "& .MuiInputLabel-root": { color: "white" },
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "white" },
            "&:hover fieldset": { borderColor: "white" },
            "&.Mui-focused fieldset": { borderColor: "white" },
          },
        }}
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
      >
        Registrar
      </Button>

      {message && (
        <Typography
          align="center"
          sx={{
            color: message.includes("éxito") ? "success.main" : "error.main",
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}
