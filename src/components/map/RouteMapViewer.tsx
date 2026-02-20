'use client';
import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export interface RouteStop {
    name: string;
    latitude: number;
    longitude: number;
    order: number;
}

export default function RouteMapViewer({ stops }: { stops: RouteStop[] }) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);

    useEffect(() => {
        if (!mapContainer.current || mapRef.current) return;
        if (stops.length === 0) return;

        // Calculate bounds to fit all stops
        const lngs = stops.map(s => s.longitude);
        const lats = stops.map(s => s.latitude);
        const bounds = new maplibregl.LngLatBounds(
            [Math.min(...lngs) - 1, Math.min(...lats) - 1],
            [Math.max(...lngs) + 1, Math.max(...lats) + 1]
        );

        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
            bounds,
            fitBoundsOptions: { padding: 60 },
            minZoom: 2,
        });

        map.on('load', () => {
            // ── Route line ──
            const coordinates = stops
                .sort((a, b) => a.order - b.order)
                .map(s => [s.longitude, s.latitude] as [number, number]);

            map.addSource('route-line', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: { type: 'LineString', coordinates }
                }
            });

            // Dashed route line
            map.addLayer({
                id: 'route-line-layer',
                type: 'line',
                source: 'route-line',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: {
                    'line-color': '#000000',
                    'line-width': 3,
                    'line-dasharray': [2, 2],
                    'line-opacity': 0.6,
                }
            });

            // Solid route line behind it for visual weight
            map.addLayer({
                id: 'route-line-bg',
                type: 'line',
                source: 'route-line',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: {
                    'line-color': '#000000',
                    'line-width': 5,
                    'line-opacity': 0.08,
                }
            }, 'route-line-layer');

            // ── Stop markers (numbered circles) ──
            map.addSource('route-stops', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: stops.map(s => ({
                        type: 'Feature' as const,
                        geometry: { type: 'Point' as const, coordinates: [s.longitude, s.latitude] },
                        properties: { order: s.order + 1, name: s.name }
                    }))
                }
            });

            // Black circle for each stop
            map.addLayer({
                id: 'route-stop-circles',
                type: 'circle',
                source: 'route-stops',
                paint: {
                    'circle-color': '#000000',
                    'circle-radius': 16,
                    'circle-stroke-width': 3,
                    'circle-stroke-color': '#ffffff',
                }
            });

            // Order number label
            map.addLayer({
                id: 'route-stop-labels',
                type: 'symbol',
                source: 'route-stops',
                layout: {
                    'text-field': ['to-string', ['get', 'order']],
                    'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                    'text-size': 13,
                    'text-allow-overlap': true,
                },
                paint: { 'text-color': '#ffffff' }
            });

            // Museum name label offset below the circle
            map.addLayer({
                id: 'route-stop-name',
                type: 'symbol',
                source: 'route-stops',
                layout: {
                    'text-field': ['get', 'name'],
                    'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                    'text-size': 11,
                    'text-offset': [0, 2.2],
                    'text-anchor': 'top',
                    'text-max-width': 12,
                },
                paint: {
                    'text-color': '#333333',
                    'text-halo-color': '#ffffff',
                    'text-halo-width': 1.5,
                }
            });
        });

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [stops]);

    return <div ref={mapContainer} className="w-full h-full" />;
}
