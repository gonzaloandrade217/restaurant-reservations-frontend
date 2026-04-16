'use client';

import { useState, useEffect, useRef } from "react";
import { Box, TextField, Button, Typography, MenuItem } from "@mui/material";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface CreateRestaurantFormProps { onCreated?: () => void; }
type MesaTipoOption = "CUADRADA" | "RECTANGULAR" | "REDONDA";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Codificar/decodificar imagen con posición
export function encodeImage(url: string, x: number, y: number) {
  return JSON.stringify({ url, x, y });
}
export function parseImage(str: string): { url: string; x: number; y: number } {
  try { const p = JSON.parse(str); if (p.url) return p; } catch {}
  return { url: str, x: 50, y: 50 };
}

interface ImgData { url: string; x: number; y: number; }

// Componente drag-to-reposition
function ImageReposition({ img, onChange }: { img: ImgData; onChange: (x: number, y: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePos = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    onChange(Math.round(x), Math.round(y));
  };

  return (
    <Box sx={{ mb: 1 }}>
      <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.78rem", mb: 0.5 }}>
        🖱 Arrastrá el punto para ajustar el encuadre
      </Typography>
      <Box
        ref={containerRef}
        onMouseDown={(e) => { dragging.current = true; updatePos(e.clientX, e.clientY); }}
        onMouseMove={(e) => { if (dragging.current) updatePos(e.clientX, e.clientY); }}
        onMouseUp={() => { dragging.current = false; }}
        onMouseLeave={() => { dragging.current = false; }}
        onTouchStart={(e) => { dragging.current = true; updatePos(e.touches[0].clientX, e.touches[0].clientY); }}
        onTouchMove={(e) => { if (dragging.current) updatePos(e.touches[0].clientX, e.touches[0].clientY); }}
        onTouchEnd={() => { dragging.current = false; }}
        sx={{ position: "relative", height: 220, borderRadius: 1, overflow: "hidden", cursor: "crosshair", border: "1px solid rgba(255,255,255,0.2)", userSelect: "none" }}
      >
        <Box
          component="img"
          src={img.url}
          draggable={false}
          sx={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${img.x}% ${img.y}%`, pointerEvents: "none", display: "block" }}
        />
        {/* Punto de enfoque */}
        <Box sx={{
          position: "absolute",
          left: `${img.x}%`, top: `${img.y}%`,
          transform: "translate(-50%, -50%)",
          width: 20, height: 20, borderRadius: "50%",
          border: "2px solid white",
          backgroundColor: "rgba(255,152,0,0.7)",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
          pointerEvents: "none",
        }} />
      </Box>
      <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", mt: 0.4 }}>
        Encuadre: {img.x}% — {img.y}%
      </Typography>
    </Box>
  );
}

// Carrusel de preview con thumbnails
function PreviewCarousel({ images, currentIdx, onSelect, onRemove, onReposition }:
  { images: ImgData[]; currentIdx: number; onSelect: (i: number) => void; onRemove: (i: number) => void; onReposition: (i: number, x: number, y: number) => void; }) {
  if (images.length === 0) return null;
  return (
    <Box sx={{ mt: 2 }}>
      <ImageReposition img={images[currentIdx]} onChange={(x, y) => onReposition(currentIdx, x, y)} />
      {/* Thumbnails */}
      <Box display="flex" gap={1} mt={1} sx={{ overflowX: "auto", pb: 0.5 }}>
        {images.map((img, i) => (
          <Box key={i} sx={{ position: "relative", flexShrink: 0 }}>
            <Box
              component="img" src={img.url} onClick={() => onSelect(i)}
              sx={{ width: 60, height: 60, objectFit: "cover", objectPosition: `${img.x}% ${img.y}%`, borderRadius: 1, cursor: "pointer",
                border: i === currentIdx ? "2px solid #ff9800" : "2px solid rgba(255,255,255,0.2)",
                opacity: i === currentIdx ? 1 : 0.55, transition: "all 0.15s" }}
            />
            <Box onClick={() => onRemove(i)} sx={{
              position: "absolute", top: -6, right: -6, width: 18, height: 18,
              backgroundColor: "#e53935", borderRadius: "50%", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.6rem", color: "white", fontWeight: "bold",
            }}>✕</Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

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
  const [images, setImages] = useState<ImgData[]>([]);
  const [currentPreview, setCurrentPreview] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function geocode() {
      if (!city && !address) return;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${address}, ${city}`)}`);
        const data = await res.json();
        if (data?.length > 0) { setLatitude(parseFloat(data[0].lat)); setLongitude(parseFloat(data[0].lon)); }
      } catch {}
    }
    geocode();
  }, [city, address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Creando restaurante...");
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No se encontró el token.");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name, city, address, phone, description,
          capacity: capacity === "" ? undefined : capacity,
          cantidadMesas: cantidadMesas === "" ? undefined : cantidadMesas,
          mesaCapacidad: mesaCapacidad === "" ? undefined : mesaCapacidad,
          mesaTipo: mesaTipo || undefined, latitude, longitude,
          images: images.length > 0 ? images.map(img => encodeImage(img.url, img.x, img.y)) : undefined,
        }),
      });
      if (!response.ok) { const e = await response.json(); throw new Error(e.message || "Error al crear el restaurante"); }
      const data = await response.json();
      setMessage(`Restaurante creado con éxito: ${data.name}`);
      setName(""); setCity(""); setAddress(""); setPhone(""); setDescription("");
      setCapacity(""); setCantidadMesas(""); setMesaCapacidad(""); setMesaTipo("");
      setLatitude(-34.617); setLongitude(-58.368); setImages([]); setCurrentPreview(0);
      if (onCreated) onCreated();
    } catch (error: any) { setMessage(`Error: ${error.message}`); }
  };

  function DraggableMarker() {
    const map = useMap();
    useEffect(() => { map.setView([latitude, longitude], 13); }, [latitude, longitude]);
    return (
      <Marker position={[latitude, longitude]} draggable
        eventHandlers={{ dragend: (e) => { const p = e.target.getLatLng(); setLatitude(p.lat); setLongitude(p.lng); } }} />
    );
  }

  const handleNumberChange = (value: string, setter: (val: number | "") => void) => {
    setter(value === "" ? "" : Number(value));
  };

  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "white" },
      "&:hover fieldset": { borderColor: "white" },
      "&.Mui-focused fieldset": { borderColor: "white" },
    },
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{
      p: { xs: 2, sm: 3, md: 4 }, width: "100%", maxWidth: 500, mx: "auto", mt: { xs: 2, sm: 4 },
      border: "1px solid white", borderRadius: 2, boxShadow: 3,
      display: "flex", flexDirection: "column", gap: { xs: 2, sm: 2.5, md: 3 },
    }}>
      <Typography variant="h5" align="center" sx={{ color: "white", fontSize: { xs: "1.4rem", sm: "1.8rem" } }}>
        Crear Nuevo Restaurante
      </Typography>

      {[
        { label: "Nombre", value: name, onChange: setName },
        { label: "Ciudad", value: city, onChange: setCity },
        { label: "Dirección", value: address, onChange: setAddress },
        { label: "Teléfono", value: phone, onChange: setPhone },
      ].map((field, i) => (
        <TextField key={i} label={field.label} value={field.value} onChange={(e) => field.onChange(e.target.value)}
          required fullWidth InputLabelProps={{ style: { color: "white" } }} inputProps={{ style: { color: "white" } }} sx={textFieldSx} />
      ))}

      {[
        { label: "Capacidad Total", value: capacity, setter: setCapacity },
        { label: "Cantidad de Mesas", value: cantidadMesas, setter: setCantidadMesas },
        { label: "Capacidad por Mesa", value: mesaCapacidad, setter: setMesaCapacidad },
      ].map((field, i) => (
        <TextField key={i} label={field.label} type="number" value={field.value}
          onChange={(e) => handleNumberChange(e.target.value, field.setter)}
          required fullWidth InputLabelProps={{ style: { color: "white" } }} inputProps={{ style: { color: "white" } }} sx={textFieldSx} />
      ))}

      <TextField select label="Tipo de Mesa" value={mesaTipo} onChange={(e) => setMesaTipo(e.target.value as MesaTipoOption)}
        required fullWidth InputLabelProps={{ style: { color: "white" } }} inputProps={{ style: { color: "white" } }}
        sx={{ ...textFieldSx, "& .MuiSelect-select": { color: "white" } }}>
        <MenuItem value="">Seleccione un tipo</MenuItem>
        <MenuItem value="CUADRADA">Cuadrada</MenuItem>
        <MenuItem value="RECTANGULAR">Rectangular</MenuItem>
        <MenuItem value="REDONDA">Redonda</MenuItem>
      </TextField>

      <TextField label="Descripción (opcional)" value={description} multiline rows={3}
        onChange={(e) => setDescription(e.target.value)} fullWidth
        InputLabelProps={{ style: { color: "white" } }} inputProps={{ style: { color: "white" } }} sx={textFieldSx} />

      {/* Fotos */}
      <Box>
        <Typography sx={{ color: "white", mb: 1, fontSize: "0.9rem" }}>Fotos del restaurante (opcional)</Typography>
        <Button variant="outlined" component="label" sx={{ color: "white", borderColor: "white" }}>
          📷 Adjuntar fotos
          <input type="file" accept="image/*" multiple hidden onChange={(e) => {
            const files = Array.from(e.target.files || []);
            const oversized = files.filter(f => f.size > 2 * 1024 * 1024);
            if (oversized.length > 0) alert(`${oversized.length} imagen(es) superan los 2 MB y no se agregarán.`);
            files.filter(f => f.size <= 2 * 1024 * 1024).forEach(file => {
              const reader = new FileReader();
              reader.onload = () => setImages(prev => [...prev, { url: reader.result as string, x: 50, y: 50 }]);
              reader.readAsDataURL(file);
            });
            e.target.value = "";
          }} />
        </Button>

        <PreviewCarousel
          images={images}
          currentIdx={currentPreview}
          onSelect={setCurrentPreview}
          onRemove={(i) => { setImages(prev => prev.filter((_, idx) => idx !== i)); setCurrentPreview(p => Math.min(p, images.length - 2)); }}
          onReposition={(i, x, y) => setImages(prev => prev.map((img, idx) => idx === i ? { ...img, x, y } : img))}
        />
      </Box>

      {/* Mapa */}
      <Box sx={{ height: 300, width: "100%", borderRadius: 2, overflow: "hidden" }}>
        <MapContainer center={[latitude, longitude]} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <DraggableMarker />
        </MapContainer>
      </Box>

      <Button type="submit" fullWidth sx={{
        backgroundColor: "#ff9800", color: "white", py: { xs: 1.2, sm: 1.4 },
        fontSize: { xs: "0.95rem", sm: "1rem" }, borderRadius: 2, "&:hover": { backgroundColor: "#e86f00" },
      }}>Registrar</Button>

      {message && <Typography align="center" sx={{ color: "white" }}>{message}</Typography>}
    </Box>
  );
}