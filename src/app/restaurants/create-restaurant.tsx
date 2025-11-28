'use client';

import { useState } from "react";
import { Box, TextField, Button, Typography, MenuItem } from "@mui/material";

interface CreateRestaurantFormProps {
  onCreated?: () => void;
}

type MesaTipoOption = "CUADRADA" | "RECTANGULAR" | "REDONDA";

export default function CreateRestaurantForm({ onCreated }: CreateRestaurantFormProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState<number | "">("");
  const [cantidadMesas, setCantidadMesas] = useState<number | "">("");

  const [mesaCapacidad, setMesaCapacidad] = useState<number | "">("");
  const [mesaTipo, setMesaTipo] = useState<MesaTipoOption | "">(""); // corregido

  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Creando restaurante...");

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No se encontró el token.");

      const response = await fetch("http://192.168.1.6:4000/restaurants", {
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
          capacity: Number(capacity),
          cantidadMesas: Number(cantidadMesas),
          mesaCapacidad: Number(mesaCapacidad),
          mesaTipo: mesaTipo || undefined, // enviar undefined si no hay selección
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear el restaurante");
      }

      const restaurantData = await response.json();
      setMessage(`Restaurante creado con éxito: ${restaurantData.name}`);

      // Limpiar formulario
      setName("");
      setAddress("");
      setPhone("");
      setDescription("");
      setCapacity("");
      setCantidadMesas("");
      setMesaCapacidad("");
      setMesaTipo("");

      if (onCreated) onCreated();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        width: "100%",
        maxWidth: 450,
        mx: "auto",
        mt: { xs: 2, sm: 4 },
        border: "1px solid white",
        borderRadius: 2,
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
        gap: { xs: 2, sm: 2.5, md: 3 },
      }}
    >
      <Typography
        variant="h5"
        align="center"
        sx={{
          color: "white",
          fontSize: { xs: "1.4rem", sm: "1.6rem", md: "1.8rem" },
        }}
      >
        Crear Nuevo Restaurante
      </Typography>

      {/* Inputs */}
      {[
        {
          label: "Nombre",
          value: name,
          onChange: (e: any) => setName(e.target.value),
        },
        {
          label: "Dirección",
          value: address,
          onChange: (e: any) => setAddress(e.target.value),
        },
        {
          label: "Teléfono",
          value: phone,
          onChange: (e: any) => setPhone(e.target.value),
        },
        {
          label: "Capacidad Total",
          value: capacity,
          type: "number",
          onChange: (e: any) =>
            setCapacity(e.target.value === "" ? "" : Number(e.target.value)),
        },
        {
          label: "Cantidad de Mesas",
          value: cantidadMesas,
          type: "number",
          onChange: (e: any) =>
            setCantidadMesas(e.target.value === "" ? "" : Number(e.target.value)),
        },
        {
          label: "Capacidad por Mesa",
          value: mesaCapacidad,
          type: "number",
          onChange: (e: any) =>
            setMesaCapacidad(e.target.value === "" ? "" : Number(e.target.value)),
        },
      ].map((field, index) => (
        <TextField
          key={index}
          {...field}
          required
          fullWidth
          InputLabelProps={{
            style: { color: "white" },
          }}
          inputProps={{
            style: { color: "white" },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "white" },
              "&:hover fieldset": { borderColor: "white" },
              "&.Mui-focused fieldset": { borderColor: "white" },
            },
          }}
        />
      ))}

      {/* Select Tipo de Mesa */}
      <TextField
        select
        label="Tipo de Mesa"
        value={mesaTipo} 
        onChange={(e) => setMesaTipo(e.target.value as MesaTipoOption)}
        required
        fullWidth
        InputLabelProps={{ style: { color: "white" } }}
        inputProps={{ style: { color: "white" } }}
        sx={{
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "white" },
            "&:hover fieldset": { borderColor: "white" },
            "&.Mui-focused fieldset": { borderColor: "white" },
            color: "white",
          },
          "& .MuiSelect-select": {
          color: "white",
          },
          "& .MuiMenuItem-root": {
          color: "black", 
          },
        }}
      >
        <MenuItem value="">Seleccione un tipo</MenuItem>
        <MenuItem value="CUADRADA">Cuadrada</MenuItem>
        <MenuItem value="RECTANGULAR">Rectangular</MenuItem>
        <MenuItem value="REDONDA">Redonda</MenuItem>
      </TextField>

      {/* Descripción */}
      <TextField
        label="Descripción (opcional)"
        value={description}
        multiline
        rows={3}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        InputLabelProps={{ style: { color: "white" } }}
        inputProps={{ style: { color: "white" } }}
        sx={{
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "white" },
            "&:hover fieldset": { borderColor: "white" },
            "&.Mui-focused fieldset": { borderColor: "white" },
          },
        }}
      />

      {/* Botón */}
      <Button
        type="submit"
        fullWidth
        sx={{
          backgroundColor: "#ff9800",
          color: "white",
          py: { xs: 1.2, sm: 1.4 },
          fontSize: { xs: "0.95rem", sm: "1rem" },
          borderRadius: 2,
          "&:hover": {
            backgroundColor: "#e86f00",
          },
        }}
      >
        Registrar
      </Button>

      {message && (
        <Typography
          align="center"
          sx={{
            color: "white",
            fontSize: { xs: "0.9rem", sm: "1rem" },
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}
