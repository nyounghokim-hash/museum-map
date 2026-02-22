'use client';
import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export interface RouteStop {
    name: string;
    latitude: number;
    longitude: number;
    order: number;
    museumId?: string;
}

interface Props {
    stops: RouteStop[];
    onStopClick?: (stop: RouteStop) => void;
    darkMode?: boolean;
}

const LIGHT_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export default function RouteMapViewer({ stops = [], onStopClick, darkMode = false }: Props) {
    const validStops = Array.isArray(stops) ? stops : [];
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const initializedRef = useRef(false);

    // Build GeoJSON data helpers
    const buildLineGeoJSON = useCallback((s: RouteStop[]) => ({
        type: 'Feature' as const,
        properties: {},
        geometry: {
            type: 'LineString' as const,
            coordinates: [...s]
                .sort((a, b) => a.order - b.order)
                .map(st => [Number(st.longitude) || 0, Number(st.latitude) || 0] as [number, number]),
        },
    }), []);

    const buildStopsGeoJSON = useCallback((s: RouteStop[]) => ({
        type: 'FeatureCollection' as const,
        features: s.map(st => ({
            type: 'Feature' as const,
            geometry: { type: 'Point' as const, coordinates: [Number(st.longitude) || 0, Number(st.latitude) || 0] },
            properties: { order: st.order + 1, name: st.name, museumId: st.museumId || '' },
        })),
    }), []);

    // Initialize map once
    useEffect(() => {
        if (!mapContainer.current || mapRef.current) return;
        if (!validStops || validStops.length === 0) return;

        const lngs = validStops.map(s => Number(s.longitude) || 0);
        const lats = validStops.map(s => Number(s.latitude) || 0);
        const bounds = new maplibregl.LngLatBounds(
            [Math.min(...lngs) - 0.1, Math.min(...lats) - 0.1],
            [Math.max(...lngs) + 0.1, Math.max(...lats) + 0.1]
        );

        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: darkMode ? DARK_STYLE : LIGHT_STYLE,
            bounds,
            fitBoundsOptions: { padding: 60 },
            minZoom: 2,
        });

        // Save initial darkMode state to compare later
        map.on('style.load', () => {
            // Nothing special needed on style.load right now for route map, but could re-add sources here
        });

        map.on('load', () => {
            // Route line source + layers
            map.addSource('route-line', {
                type: 'geojson',
                data: buildLineGeoJSON(validStops),
            });

            map.addLayer({
                id: 'route-line-layer',
                type: 'line',
                source: 'route-line',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': '#a855f7', 'line-width': 3, 'line-dasharray': [2, 2], 'line-opacity': 0.8 },
            });
            map.addLayer({
                id: 'route-line-bg',
                type: 'line',
                source: 'route-line',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': '#a855f7', 'line-width': 5, 'line-opacity': 0.15 },
            }, 'route-line-layer');

            // Stops source + layers
            map.addSource('route-stops', {
                type: 'geojson',
                data: buildStopsGeoJSON(validStops),
            });

            map.addLayer({
                id: 'route-stop-circles',
                type: 'circle',
                source: 'route-stops',
                paint: { 'circle-color': '#000000', 'circle-radius': 16, 'circle-stroke-width': 3, 'circle-stroke-color': '#ffffff' },
            });
            map.addLayer({
                id: 'route-stop-labels',
                type: 'symbol',
                source: 'route-stops',
                layout: { 'text-field': ['to-string', ['get', 'order']], 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], 'text-size': 13, 'text-allow-overlap': true },
                paint: { 'text-color': '#ffffff' },
            });
            map.addLayer({
                id: 'route-stop-name',
                type: 'symbol',
                source: 'route-stops',
                layout: { 'text-field': ['get', 'name'], 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], 'text-size': 11, 'text-offset': [0, 2.2], 'text-anchor': 'top', 'text-max-width': 12 },
                paint: { 'text-color': '#333333', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 },
            });

            // Click handler for stops
            map.on('click', 'route-stop-circles', (e) => {
                const feature = e.features?.[0];
                if (feature && onStopClick) {
                    const props = feature.properties;
                    const coords = (feature.geometry as any).coordinates;
                    onStopClick({
                        name: props?.name || '',
                        latitude: coords[1],
                        longitude: coords[0],
                        order: (props?.order || 1) - 1,
                        museumId: props?.museumId || '',
                    });
                }
            });

            map.on('mouseenter', 'route-stop-circles', () => { map.getCanvas().style.cursor = 'pointer'; });
            map.on('mouseleave', 'route-stop-circles', () => { map.getCanvas().style.cursor = ''; });

            initializedRef.current = true;
        });

        mapRef.current = map;

        return () => { map.remove(); mapRef.current = null; initializedRef.current = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only mount once

    // Handle dark mode changes
    const darkModeRef = useRef(darkMode);
    useEffect(() => {
        if (!mapRef.current || darkModeRef.current === darkMode) return;
        darkModeRef.current = darkMode;

        const map = mapRef.current;
        map.setStyle(darkMode ? DARK_STYLE : LIGHT_STYLE);

        // Re-add sources and layers when style changes
        map.once('style.load', () => {
            // Route line source + layers
            map.addSource('route-line', {
                type: 'geojson',
                data: buildLineGeoJSON(validStops) as any,
            });

            map.addLayer({
                id: 'route-line-layer',
                type: 'line',
                source: 'route-line',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': '#a855f7', 'line-width': 3, 'line-dasharray': [2, 2], 'line-opacity': 0.8 },
            });
            map.addLayer({
                id: 'route-line-bg',
                type: 'line',
                source: 'route-line',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': '#a855f7', 'line-width': 5, 'line-opacity': 0.15 },
            }, 'route-line-layer');

            // Stops source + layers
            map.addSource('route-stops', {
                type: 'geojson',
                data: buildStopsGeoJSON(validStops) as any,
            });

            map.addLayer({
                id: 'route-stop-circles',
                type: 'circle',
                source: 'route-stops',
                paint: { 'circle-color': '#000000', 'circle-radius': 16, 'circle-stroke-width': 3, 'circle-stroke-color': '#ffffff' },
            });
            map.addLayer({
                id: 'route-stop-labels',
                type: 'symbol',
                source: 'route-stops',
                layout: { 'text-field': ['to-string', ['get', 'order']], 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], 'text-size': 13, 'text-allow-overlap': true },
                paint: { 'text-color': '#ffffff' },
            });
            map.addLayer({
                id: 'route-stop-name',
                type: 'symbol',
                source: 'route-stops',
                layout: { 'text-field': ['get', 'name'], 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], 'text-size': 11, 'text-offset': [0, 2.2], 'text-anchor': 'top', 'text-max-width': 12 },
                paint: { 'text-color': '#333333', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 },
            });
        });
    }, [darkMode, buildLineGeoJSON, buildStopsGeoJSON, validStops]);

    // Update sources when stops change (smooth, no map recreation)
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !initializedRef.current || validStops.length === 0) return;

        const lineSource = map.getSource('route-line') as maplibregl.GeoJSONSource | undefined;
        const stopsSource = map.getSource('route-stops') as maplibregl.GeoJSONSource | undefined;

        if (lineSource) {
            lineSource.setData(buildLineGeoJSON(validStops) as any);
        }
        if (stopsSource) {
            stopsSource.setData(buildStopsGeoJSON(validStops) as any);
        }
    }, [stops, buildLineGeoJSON, buildStopsGeoJSON]);

    return <div ref={mapContainer} className="w-full h-full" />;
}
