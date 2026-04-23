'use client';

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function DraggableMarker({ lat, lng, onDrag }: { lat: number; lng: number; onDrag: (lat: number, lng: number) => void }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], 13); }, [lat, lng]);
  return (
    <Marker position={[lat, lng]} draggable
      eventHandlers={{ dragend: (e) => { const p = e.target.getLatLng(); onDrag(p.lat, p.lng); } }} />
  );
}

interface Props {
  latitude: number;
  longitude: number;
  onDrag: (lat: number, lng: number) => void;
}

export default function RestaurantMapPicker({ latitude, longitude, onDrag }: Props) {
  return (
    <MapContainer center={[latitude, longitude]} zoom={13} style={{ height: "300px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <DraggableMarker lat={latitude} lng={longitude} onDrag={onDrag} />
    </MapContainer>
  );
}