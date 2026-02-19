'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState, useMemo } from 'react';

// Fix for default marker icon in Next.js/React
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
    onLocationSelect?: (lat: number, lng: number, address?: string) => void;
}

// Component to handle map clicks
function LocationMarker({ onSelect }: { onSelect?: (lat: number, lng: number, address?: string) => void }) {
    const [position, setPosition] = useState<L.LatLng | null>(null);

    // Initial position (Kupang, East Nusa Tenggara)
    const initialPos = useMemo(() => new L.LatLng(-10.1772, 123.6070), []);

    useEffect(() => {
        setPosition(initialPos);
        // Don't auto-select on init to avoid overwriting existing address if any
    }, [initialPos]);

    const map = useMapEvents({
        async click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());

            let address = '';
            try {
                // Simple reverse geocoding using Nominatim (Client-side)
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
                const data = await res.json();
                if (data && data.display_name) {
                    // Filter out "Lesser Sunda Islands"
                    address = data.display_name.replace(/,?\s*Lesser Sunda Islands,?\s*/gi, '');
                    // Clean up potential double commas or leading/trailing commas
                    address = address.replace(/,(\s*,)+/g, ',').replace(/^,\s*/, '').replace(/,\s*$/, '');
                }
            } catch (err) {
                console.error("Failed to reverse geocode", err);
            }

            if (onSelect) onSelect(e.latlng.lat, e.latlng.lng, address);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

export default function Map({ onLocationSelect }: MapProps) {
    const [mapKey, setMapKey] = useState<number | null>(null);

    useEffect(() => {
        // Generate a unique key on client mount to ensure React recreates the DOM node
        // preventing "Map container is already initialized" errors in Strict Mode
        setMapKey(Date.now());
    }, []);

    // Default center: Kupang, East Nusa Tenggara
    const center = [-10.1772, 123.6070] as L.LatLngExpression;

    if (!mapKey) {
        return <div style={{ height: '300px', width: '100%', borderRadius: '12px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="text-slate-500">Memuat Peta...</span>
        </div>;
    }

    return (
        <MapContainer
            key={mapKey}
            center={center}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: '300px', width: '100%', borderRadius: '12px', zIndex: 10 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker onSelect={onLocationSelect} />
        </MapContainer>
    );
}
