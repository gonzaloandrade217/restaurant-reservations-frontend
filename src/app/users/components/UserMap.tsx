'use client';

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Configuración del icono de Leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface UserMapProps {
  restaurants: { id: string; latitude: number; longitude: number; name: string; profile?: string }[];
}

export default function UserMap({ restaurants }: UserMapProps) {
  // Evita renderizar en SSR
  if (typeof window === "undefined") return null;

  return (
    <MapContainer
      center={[-34.617, -58.368]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {restaurants
        .filter((r) => r.latitude !== undefined && r.longitude !== undefined)
        .map((r) => (
          <Marker key={r.id} position={[r.latitude, r.longitude]}>
            <Popup>
              <strong>{r.name}</strong>
              {r.profile && (
                <div>
                  <img src={r.profile} alt={r.name} width={50} />
                </div>
              )}
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
