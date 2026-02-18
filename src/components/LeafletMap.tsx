'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Next.js
const iconFix = () => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
};

interface LocationMarkerProps {
    position: [number, number];
    setPosition: (pos: [number, number]) => void;
    onLocationFound: (pos: [number, number]) => void;
}

const LocationMarker = ({ position, setPosition, onLocationFound }: LocationMarkerProps) => {
    const map = useMapEvents({
        click(e) {
            const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
            setPosition(newPos);
            onLocationFound(newPos);
        },
    });

    // Update map view when position changes externally
    useEffect(() => {
        if (map) map.flyTo(position, map.getZoom());
    }, [position, map]);

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

interface LeafletMapProps {
    center: [number, number];
    zoom?: number;
    markerPosition: [number, number];
    setMarkerPosition: (pos: [number, number]) => void;
    onMapClick: (pos: [number, number]) => void;
}

// Helper to invalidate map size to fix rendering issues
const MapResizer = () => {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 200);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
};

const LeafletMap = ({ center, zoom = 13, markerPosition, setMarkerPosition, onMapClick }: LeafletMapProps) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        iconFix();
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500">
                Loading Map...
            </div>
        );
    }

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%', minHeight: '100%' }}
        >
            <MapResizer />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker
                position={markerPosition}
                setPosition={setMarkerPosition}
                onLocationFound={onMapClick}
            />
        </MapContainer>
    );
};

export default LeafletMap;
