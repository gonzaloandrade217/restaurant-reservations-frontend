'use client';

import { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, MenuItem } from "@mui/material";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Tipos y Props
interface CreateRestaurantFormProps {
  onCreated?: () => void;
}

type MesaTipoOption = "CUADRADA" | "RECTANGULAR" | "REDONDA";

// Configuración del icono de Leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function CreateRestaurantForm({ onCreated }: CreateRestaurantFormProps) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState<number | "">("");
  const [cantidadMesas, setCantidadMesas] = useState<number | "">("");
  const [mesaCapacidad, setMesaCapacidad] = useState<number | "">("");
  const [mesaTipo, setMesaTipo] = useState<MesaTipoOption | "">(""); 
  const [latitude, setLatitude] = useState<number>(-34.617);
  const [longitude, setLongitude] = useState<number>(-58.368);
  const [images, setImages] = useState<string[]>([]);
  const [currentPreview, setCurrentPreview] = useState(0);
  const [message, setMessage] = useState("");

  // Geocoding: centra el mapa según ciudad/dirección
  useEffect(() => {
    async function geocode() {
      if (!city && !address) return;
      const query = encodeURIComponent(`${address}, ${city}`);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
        const data = await res.json();
        if (data && data.length > 0) {
          setLatitude(parseFloat(data[0].lat));
          setLongitude(parseFloat(data[0].lon));
        }
      } catch (err) {
        console.error("Error al geocodificar:", err);
      }
    }
    geocode();
  }, [city, address]);

  // Envía el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Creando restaurante...");
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No se encontró el token.");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          city,
          address,
          phone,
          description,
          capacity: capacity === "" ? undefined : capacity,
          cantidadMesas: cantidadMesas === "" ? undefined : cantidadMesas,
          mesaCapacidad: mesaCapacidad === "" ? undefined : mesaCapacidad,
          mesaTipo: mesaTipo || undefined,
          latitude,
          longitude,
          images: images.length > 0 ? images : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear el restaurante");
      }

      const restaurantData = await response.json();
      setMessage(`Restaurante creado con éxito: ${restaurantData.name}`);

      // Limpiar formulario
      setName(""); setCity(""); setAddress(""); setPhone(""); setDescription("");
      setCapacity(""); setCantidadMesas(""); setMesaCapacidad(""); setMesaTipo("");
      setLatitude(-34.617); setLongitude(-58.368); setImages([]); setCurrentPreview(0);

      if (onCreated) onCreated();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  // Marker draggable
  function DraggableMarker() {
    const map = useMap();
    useEffect(() => {
      map.setView([latitude, longitude], 13);
    }, [latitude, longitude, map]);

    return (
      <Marker
        position={[latitude, longitude]}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const pos = e.target.getLatLng();
            setLatitude(pos.lat);
            setLongitude(pos.lng);
          },
        }}
      />
    );
  }

  // Función helper para manejar inputs numéricos
  const handleNumberChange = (value: string, setter: (val: number | "") => void) => {
    if (value === "") setter("");
    else setter(Number(value));
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        width: "100%",
        maxWidth: 500,
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
      <Typography variant="h5" align="center" sx={{ color: "white", fontSize: { xs: "1.4rem", sm: "1.6rem", md: "1.8rem" } }}>
        Crear Nuevo Restaurante
      </Typography>

      {[
        { label: "Nombre", value: name, onChange: setName },
        { label: "Ciudad", value: city, onChange: setCity },
        { label: "Dirección", value: address, onChange: setAddress },
        { label: "Teléfono", value: phone, onChange: setPhone },
      ].map((field, i) => (
        <TextField
          key={i}
          label={field.label}
          type="text"
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          required
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
      ))}

      {[
        { label: "Capacidad Total", value: capacity, setter: setCapacity },
        { label: "Cantidad de Mesas", value: cantidadMesas, setter: setCantidadMesas },
        { label: "Capacidad por Mesa", value: mesaCapacidad, setter: setMesaCapacidad },
      ].map((field, i) => (
        <TextField
          key={i}
          label={field.label}
          type="number"
          value={field.value}
          onChange={(e) => handleNumberChange(e.target.value, field.setter)}
          required
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
      ))}

      {/* Tipo de Mesa */}
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
          },
          "& .MuiSelect-select": { color: "white" },
          "& .MuiMenuItem-root": { color: "black" },
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

      {/* Fotos del restaurante */}
      <Box>
        <Typography sx={{ color: "white", mb: 1, fontSize: "0.9rem" }}>
          Fotos del restaurante (opcional)
        </Typography>
        <Button variant="outlined" component="label" sx={{ color: "white", borderColor: "white" }}>
          📷 Adjuntar fotos
          <input
            type="file" accept="image/*" multiple hidden
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              const oversized = files.filter(f => f.size > 2 * 1024 * 1024);
              if (oversized.length > 0) alert(`${oversized.length} imagen(es) superan los 2 MB y no se agregarán.`);
              files.filter(f => f.size <= 2 * 1024 * 1024).forEach(file => {
                const reader = new FileReader();
                reader.onload = () => setImages(prev => [...prev, reader.result as string]);
                reader.readAsDataURL(file);
              });
              e.target.value = "";
            }}
          />
        </Button>

        {/* Carrusel de preview */}
        {images.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {/* Imagen principal */}
            <Box sx={{ position: "relative", height: 220, backgroundColor: "#000", borderRadius: 1, overflow: "hidden", border: "1px solid rgba(255,255,255,0.2)" }}>
              <Box component="img" src={images[currentPreview]} alt={`Foto ${currentPreview + 1}`}
                sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              {images.length > 1 && (
                <>
                  <Box onClick={() => setCurrentPreview(p => (p - 1 + images.length) % images.length)}
                    sx={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", fontSize: "1.1rem", userSelect: "none" }}>‹</Box>
                  <Box onClick={() => setCurrentPreview(p => (p + 1) % images.length)}
                    sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", fontSize: "1.1rem", userSelect: "none" }}>›</Box>
                  <Box sx={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: "5px" }}>
                    {images.map((_, i) => (
                      <Box key={i} onClick={() => setCurrentPreview(i)}
                        sx={{ width: i === currentPreview ? 8 : 6, height: i === currentPreview ? 8 : 6, borderRadius: "50%", cursor: "pointer", backgroundColor: i === currentPreview ? "white" : "rgba(255,255,255,0.45)", transition: "all 0.2s" }} />
                    ))}
                  </Box>
                  <Box sx={{ position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.55)", color: "white", fontSize: "0.72rem", px: 1, py: 0.3, borderRadius: 10 }}>
                    {currentPreview + 1}/{images.length}
                  </Box>
                </>
              )}
            </Box>

            {/* Thumbnails */}
            <Box display="flex" gap={1} mt={1.5} sx={{ overflowX: "auto", pb: 0.5 }}>
              {images.map((img, i) => (
                <Box key={i} sx={{ position: "relative", flexShrink: 0 }}>
                  <Box component="img" src={img} onClick={() => setCurrentPreview(i)}
                    sx={{ width: 60, height: 60, objectFit: "cover", borderRadius: 1, cursor: "pointer", border: i === currentPreview ? "2px solid #ff9800" : "2px solid rgba(255,255,255,0.2)", opacity: i === currentPreview ? 1 : 0.55, transition: "all 0.15s" }} />
                  <Box
                    onClick={() => { setImages(prev => prev.filter((_, idx) => idx !== i)); setCurrentPreview(p => Math.min(p, images.length - 2)); }}
                    sx={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, backgroundColor: "#e53935", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "white", fontWeight: "bold" }}>✕</Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Mapa */}
      <Box sx={{ height: 300, width: "100%", borderRadius: 2, overflow: "hidden" }}>
        <MapContainer center={[latitude, longitude]} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <DraggableMarker />
        </MapContainer>
      </Box>

      <Button
        type="submit"
        fullWidth
        sx={{
          backgroundColor: "#ff9800",
          color: "white",
          py: { xs: 1.2, sm: 1.4 },
          fontSize: { xs: "0.95rem", sm: "1rem" },
          borderRadius: 2,
          "&:hover": { backgroundColor: "#e86f00" },
        }}
      >
        Registrar
      </Button>

      {message && (
        <Typography align="center" sx={{ color: "white", fontSize: { xs: "0.9rem", sm: "1rem" } }}>
          {message}
        </Typography>
      )}
    </Box>
  );
}