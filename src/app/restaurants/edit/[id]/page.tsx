'use client';

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { TextField, Button, Typography, Container, MenuItem, Box, Snackbar, Alert } from "@mui/material";
import { parseImage, encodeImage } from "@/app/restaurants/create-restaurant";

interface ImgData { url: string; x: number; y: number; }

// Drag-to-reposition
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
        <Box component="img" src={img.url} draggable={false}
          sx={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${img.x}% ${img.y}%`, pointerEvents: "none", display: "block" }} />
        <Box sx={{
          position: "absolute", left: `${img.x}%`, top: `${img.y}%`, transform: "translate(-50%, -50%)",
          width: 20, height: 20, borderRadius: "50%", border: "2px solid white",
          backgroundColor: "rgba(255,152,0,0.7)", boxShadow: "0 0 0 1px rgba(0,0,0,0.4)", pointerEvents: "none",
        }} />
      </Box>
      <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", mt: 0.4 }}>
        Encuadre: {img.x}% — {img.y}%
      </Typography>
    </Box>
  );
}

function PreviewCarousel({ images, currentIdx, onSelect, onRemove, onReposition }:
  { images: ImgData[]; currentIdx: number; onSelect: (i: number) => void; onRemove: (i: number) => void; onReposition: (i: number, x: number, y: number) => void; }) {
  if (images.length === 0) return null;
  return (
    <Box sx={{ mt: 2 }}>
      <ImageReposition img={images[currentIdx]} onChange={(x, y) => onReposition(currentIdx, x, y)} />
      <Box display="flex" gap={1} mt={1} sx={{ overflowX: "auto", pb: 0.5 }}>
        {images.map((img, i) => (
          <Box key={i} sx={{ position: "relative", flexShrink: 0 }}>
            <Box component="img" src={img.url} onClick={() => onSelect(i)}
              sx={{ width: 60, height: 60, objectFit: "cover", objectPosition: `${img.x}% ${img.y}%`, borderRadius: 1, cursor: "pointer",
                border: i === currentIdx ? "2px solid #ff9800" : "2px solid rgba(255,255,255,0.2)",
                opacity: i === currentIdx ? 1 : 0.55, transition: "all 0.15s" }} />
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

export default function EditRestaurantPage() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();

  const [currentPreview, setCurrentPreview] = useState(0);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success'|'error' }>({ open: false, msg: '', severity: 'success' });
  const showSnack = (msg: string, severity: 'success'|'error' = 'success') => setSnack({ open: true, msg, severity });
  const [restaurant, setRestaurant] = useState({
    name: "", city: "", address: "", phone: "", description: "",
    capacity: 0, cantidadMesas: 0, mesaTipo: "", mesaCapacidad: 0,
    images: [] as ImgData[],
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
        mesaCapacidad: data.mesaCapacidad ?? 0,
        images: (data.images ?? []).map((s: string) => parseImage(s)),
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
    if (oversized.length > 0) showSnack(`${oversized.length} imagen(es) superan los 2 MB y no se agregarán.`, 'error');
    files.filter(f => f.size <= 2 * 1024 * 1024).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => setRestaurant(prev => ({ ...prev, images: [...prev.images, { url: reader.result as string, x: 50, y: 50 }] }));
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleSave = async () => {
    const token = localStorage.getItem("authToken");
    const payload = {
      name: restaurant.name, city: restaurant.city, address: restaurant.address,
      phone: restaurant.phone, description: restaurant.description,
      capacity: Number(restaurant.capacity), cantidadMesas: Number(restaurant.cantidadMesas),
      mesaTipo: restaurant.mesaTipo || null,
      mesaCapacidad: restaurant.mesaCapacidad ? Number(restaurant.mesaCapacidad) : null,
      images: restaurant.images.map(img => encodeImage(img.url, img.x, img.y)),
    };
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (!res.ok) { showSnack("Error al actualizar el restaurante.", 'error'); return; }
    showSnack("Restaurante actualizado correctamente.");
    router.push("/admin/dashboard");
  };

  const inputSx = { style: { color: "#fff" }, sx: { "& fieldset": { borderColor: "white" } } };

  return (
    <Container maxWidth="sm" sx={{ mt: 6, bgcolor: "#000", p: 4, borderRadius: 3, color: "white", boxShadow: "0 0 15px rgba(255,255,255,0.08)" }}>
      <Typography variant="h4" sx={{ textAlign: "center", mb: 3, fontWeight: "bold" }}>
        Editar Restaurante
      </Typography>

      {[
        { label: "Nombre", name: "name" }, { label: "Ciudad", name: "city" },
        { label: "Dirección", name: "address" }, { label: "Teléfono", name: "phone" },
      ].map((f) => (
        <TextField key={f.name} label={f.label} name={f.name} value={(restaurant as any)[f.name]}
          onChange={handleChange} fullWidth sx={{ mb: 2 }} InputLabelProps={{ style: { color: "#fff" } }} InputProps={inputSx} />
      ))}

      <TextField label="Descripción" name="description" value={restaurant.description} onChange={handleChange}
        fullWidth multiline rows={3} sx={{ mb: 2 }} InputLabelProps={{ style: { color: "#fff" } }} InputProps={inputSx} />
      <TextField label="Capacidad total" type="number" name="capacity" value={restaurant.capacity} onChange={handleChange}
        fullWidth sx={{ mb: 2 }} InputLabelProps={{ style: { color: "#fff" } }} InputProps={inputSx} />
      <TextField label="Cantidad de mesas" type="number" name="cantidadMesas" value={restaurant.cantidadMesas} onChange={handleChange}
        fullWidth sx={{ mb: 2 }} InputLabelProps={{ style: { color: "#fff" } }} InputProps={inputSx} />
      <TextField select label="Tipo de mesa" name="mesaTipo" value={restaurant.mesaTipo} onChange={handleChange}
        fullWidth sx={{ mb: 2 }} InputLabelProps={{ style: { color: "white" } }} InputProps={inputSx}>
        <MenuItem value="CUADRADA">Cuadrada</MenuItem>
        <MenuItem value="RECTANGULAR">Rectangular</MenuItem>
        <MenuItem value="REDONDA">Redonda</MenuItem>
      </TextField>
      <TextField label="Capacidad por mesa" type="number" name="mesaCapacidad" value={restaurant.mesaCapacidad} onChange={handleChange}
        fullWidth sx={{ mb: 3 }} InputLabelProps={{ style: { color: "#fff" } }} InputProps={inputSx} />

      {/* Fotos */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ mb: 1, fontSize: "0.9rem" }}>Fotos del restaurante (opcional)</Typography>
        <Button variant="outlined" component="label" sx={{ color: "white", borderColor: "white" }}>
          📷 Adjuntar fotos
          <input type="file" accept="image/*" multiple hidden onChange={handleAddImages} />
        </Button>
        <PreviewCarousel
          images={restaurant.images}
          currentIdx={currentPreview}
          onSelect={setCurrentPreview}
          onRemove={(i) => { setRestaurant(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) })); setCurrentPreview(p => Math.min(p, restaurant.images.length - 2)); }}
          onReposition={(i, x, y) => setRestaurant(prev => ({ ...prev, images: prev.images.map((img, idx) => idx === i ? { ...img, x, y } : img) }))}
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
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Container>
  );
}