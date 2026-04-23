'use client';

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Box, Typography, CircularProgress } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Ícono especial para la ubicación del usuario
const userIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:16px;height:16px;background:#ff9800;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #ff9800;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

interface Restaurant {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  profile?: string;
}

interface Props { restaurants: Restaurant[]; }

// Componente que mueve el mapa al centro indicado
function FlyToLocation({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { duration: 1.2 });
  }, [center[0], center[1]]);
  return null;
}

export default function UserMapClient({ restaurants }: Props) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  // Centro del mapa: ubicación del usuario si está disponible, sino Buenos Aires
  const defaultCenter: [number, number] = [-34.617, -58.368];

  useEffect(() => {
    if (!navigator.geolocation) { setLocationLoading(false); return; }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocationLoading(false);
      },
      () => {
        // Si rechaza el permiso, usa el centro default silenciosamente
        setLocationLoading(false);
      },
      { timeout: 6000 }
    );
  }, []);

  const initialCenter = userLocation ?? defaultCenter;

  return (
    <Box sx={{ position: "relative", height: "100%", width: "100%" }}>
      {locationLoading && (
        <Box sx={{
          position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
          zIndex: 1000, backgroundColor: "rgba(0,0,0,0.7)", color: "white",
          px: 2, py: 0.8, borderRadius: 10, display: "flex", alignItems: "center", gap: 1,
        }}>
          <CircularProgress size={14} sx={{ color: "#ff9800" }} />
          <Typography sx={{ fontSize: "0.78rem" }}>Obteniendo tu ubicación...</Typography>
        </Box>
      )}

      <MapContainer center={initialCenter} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Volar a la ubicación del usuario cuando se obtiene */}
        {userLocation && <FlyToLocation center={userLocation} />}

        {/* Marcador del usuario */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <strong>Tu ubicación</strong>
            </Popup>
          </Marker>
        )}

        {/* Marcadores de restaurantes */}
        {restaurants
          .filter(r => typeof r.latitude === "number" && typeof r.longitude === "number")
          .map(r => (
            <Marker key={r.id} position={[r.latitude, r.longitude]}>
              <Popup>
                <strong>{r.name}</strong>
                {r.profile && (
                  <div style={{ marginTop: 8 }}>
                    <img src={r.profile} alt={r.name} width={60} style={{ borderRadius: 6 }} />
                  </div>
                )}
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </Box>
  );
}