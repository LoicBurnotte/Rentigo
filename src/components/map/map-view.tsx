"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Link from "next/link";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/constants";
import type { ItemWithOwner } from "@/types";
import type { Icon } from "leaflet";

interface MapViewProps {
  items: ItemWithOwner[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

export function MapView({
  items,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
}: MapViewProps) {
  const [icon, setIcon] = useState<Icon | null>(null);

  useEffect(() => {
    // Dynamic import to avoid SSR issues with Leaflet
    import("leaflet").then((L) => {
      setIcon(
        L.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })
      );
    });
  }, []);

  if (!icon) return null;

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      className="h-full w-full rounded-xl"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {items.map((item) => (
        <Marker
          key={item.id}
          position={[item.latitude, item.longitude]}
          icon={icon}
        >
          <Popup>
            <div className="w-48">
              {item.images?.[0] && (
                <img
                  src={getImageUrl(item.images[0])}
                  alt={item.title}
                  className="mb-2 h-24 w-full rounded object-cover"
                />
              )}
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm text-emerald-600">
                {formatCurrency(item.price_per_day)}/day
              </p>
              <p className="text-xs text-gray-500">{item.city}</p>
              <Link
                href={`/items/${item.slug}`}
                className="mt-2 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                View details &rarr;
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
