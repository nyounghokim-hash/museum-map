'use client';
import { useEffect, useRef, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { type Museum } from '@prisma/client';
import { createRoot } from 'react-dom/client';

// Category → SVG icon path
const CATEGORY_ICONS: Record<string, string> = {
  'Contemporary Art': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
  'Modern Art': 'M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-5-7l-3 3.72L10 12l-4 5h16l-6-6z',
  'Fine Arts': 'M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z',
  'Art Gallery': 'M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM4 20V4h16v16H4zm6-2l-3-4 2.27-3.02L12 14l3-4 4 4H5z',
  'General Museum': 'M2 20h20v2H2v-2zm2-4h2v4H4v-4zm4 0h2v4H8v-4zm4 0h2v4h-2v-4zm4 0h2v4h-2v-4zm4 0h2v4h-2v-4zM1 10l11-8 11 8v2H1v-2zm2.18 0h17.64L12 3.82 3.18 10z',
  'Cultural Center': 'M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z',
};

const DEFAULT_ICON = 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z';

function createSvgImage(pathD: string, color: string, size: number = 32): HTMLImageElement {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="${pathD}"/></svg>`;
  const img = new Image(size, size);
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  return img;
}

function museumsToGeoJSON(museums: Museum[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: (museums || []).map(m => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [m.longitude, m.latitude] },
      properties: { id: m.id, name: m.name, type: m.type }
    }))
  };
}

const LIGHT_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const LIGHT_COLOR = '#7C3AED'; // purple-600
const DARK_COLOR = '#C4B5FD';  // purple-300 (lavender)

export default function MapLibreViewer({
  museums,
  onMuseumClick,
  darkMode = false,
}: {
  museums: Museum[],
  onMuseumClick: (id: string) => void,
  darkMode?: boolean,
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const mapLoaded = useRef(false);
  const onMuseumClickRef = useRef(onMuseumClick);
  const pendingData = useRef<Museum[] | null>(null);
  const darkModeRef = useRef(darkMode);

  useEffect(() => { onMuseumClickRef.current = onMuseumClick; }, [onMuseumClick]);

  // Initialize map ONCE
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const color = darkMode ? DARK_COLOR : LIGHT_COLOR;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: darkMode ? DARK_STYLE : LIGHT_STYLE,
      center: [12.0, 50.0],
      zoom: 3,
      pitch: 0,
      minZoom: 2,
    });

    map.on('load', () => {
      mapLoaded.current = true;

      // Register all category icon images
      const categories = Object.keys(CATEGORY_ICONS);
      const allCategories = [...categories, '_default'];

      for (const cat of categories) {
        const img = createSvgImage(CATEGORY_ICONS[cat], color);
        img.onload = () => {
          if (!map.hasImage(`icon-${cat}`)) {
            map.addImage(`icon-${cat}`, img);
          }
        };
      }
      // Default icon
      const defImg = createSvgImage(DEFAULT_ICON, color);
      defImg.onload = () => {
        if (!map.hasImage('icon-_default')) {
          map.addImage('icon-_default', defImg);
        }
      };

      const data = pendingData.current || museums;
      map.addSource('museums', {
        type: 'geojson',
        data: museumsToGeoJSON(data),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // Cluster circles
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'museums',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': color,
          'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 50, 40],
          'circle-opacity': 0.85,
        }
      });
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'museums',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: { 'text-color': '#ffffff' }
      });

      // Unclustered: use category icon images
      // First, add a circle background for the icon
      map.addLayer({
        id: 'unclustered-bg',
        type: 'circle',
        source: 'museums',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': darkMode ? '#1e1b4b' : '#f5f3ff',
          'circle-radius': 18,
          'circle-stroke-width': 2,
          'circle-stroke-color': color,
          'circle-opacity': 0.9,
        }
      });

      // Category icon layer
      map.addLayer({
        id: 'unclustered-icon',
        type: 'symbol',
        source: 'museums',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': [
            'match', ['get', 'type'],
            ...categories.flatMap(cat => [cat, `icon-${cat}`]),
            'icon-_default'
          ] as any,
          'icon-size': 0.6,
          'icon-allow-overlap': true,
          'icon-anchor': 'center',
        },
      });

      // Click handlers
      map.on('click', 'unclustered-bg', (e: any) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        if (props?.id) onMuseumClickRef.current(props.id);
      });
      map.on('click', 'unclustered-icon', (e: any) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        if (props?.id) onMuseumClickRef.current(props.id);
      });
      map.on('click', 'clusters', (e: any) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        if (!features.length) return;
        const clusterId = features[0].properties?.cluster_id;
        const source = map.getSource('museums') as maplibregl.GeoJSONSource;

        // Always fly to it slightly to center
        const geometry = features[0].geometry;
        if (geometry.type === 'Point') {
          map.flyTo({ center: geometry.coordinates as [number, number], zoom: map.getZoom(), duration: 300 });
        }

        source.getClusterLeaves(clusterId, 100, 0).then((leaves) => {
          if (!leaves || leaves.length === 0) return;

          const popupNode = document.createElement('div');
          const root = createRoot(popupNode);

          const listItems = leaves.map((lf: any, idx: number) => {
            const p = lf.properties;
            return (
              <div
                key={idx}
                className="px-4 py-3 border-b border-gray-100 dark:border-neutral-800 last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                onClick={() => {
                  if (p?.id) onMuseumClickRef.current(p.id);
                }}
              >
                <div className="font-bold text-gray-900 dark:text-white text-sm truncate">{p?.name}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate flex items-center gap-1.5">
                  {p?.country ? `${p.city}, ${p.country}` : p?.city}
                  {p?.type && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{p.type}</span>
                    </>
                  )}
                </div>
              </div>
            );
          });

          root.render(
            <div className="max-h-60 overflow-y-auto w-48 bg-white dark:bg-neutral-900 rounded-lg shadow-xl" style={{ overscrollBehavior: 'contain' }}>
              <div className="sticky top-0 bg-gray-100 dark:bg-neutral-800 px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-neutral-700 z-10">
                {leaves.length} Museums
              </div>
              {listItems}
            </div>
          );

          if (geometry.type === 'Point') {
            new maplibregl.Popup({ closeButton: false, maxWidth: '240px', offset: 15 })
              .setLngLat(geometry.coordinates as [number, number])
              .setDOMContent(popupNode)
              .addTo(map);
          }
        }).catch(() => { });
      });
      map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
      map.on('mouseenter', 'unclustered-bg', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'unclustered-bg', () => { map.getCanvas().style.cursor = ''; });
      pendingData.current = null;
    });

    mapRef.current = map;
    darkModeRef.current = darkMode;
    return () => {
      mapLoaded.current = false;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dark mode style swap
  useEffect(() => {
    if (!mapRef.current || darkModeRef.current === darkMode) return;
    darkModeRef.current = darkMode;

    const map = mapRef.current;
    const newStyle = darkMode ? DARK_STYLE : LIGHT_STYLE;
    const color = darkMode ? DARK_COLOR : LIGHT_COLOR;

    // Save current center/zoom
    const center = map.getCenter();
    const zoom = map.getZoom();

    map.setStyle(newStyle);

    map.once('style.load', () => {
      // Re-register icons with new color
      const categories = Object.keys(CATEGORY_ICONS);
      for (const cat of categories) {
        const img = createSvgImage(CATEGORY_ICONS[cat], color);
        img.onload = () => { if (!map.hasImage(`icon-${cat}`)) map.addImage(`icon-${cat}`, img); };
      }
      const defImg = createSvgImage(DEFAULT_ICON, color);
      defImg.onload = () => { if (!map.hasImage('icon-_default')) map.addImage('icon-_default', defImg); };

      // Re-add source & layers
      map.addSource('museums', {
        type: 'geojson',
        data: museumsToGeoJSON(pendingData.current || museums),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      map.addLayer({
        id: 'clusters', type: 'circle', source: 'museums', filter: ['has', 'point_count'],
        paint: { 'circle-color': color, 'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 50, 40], 'circle-opacity': 0.85 },
      });
      map.addLayer({
        id: 'cluster-count', type: 'symbol', source: 'museums', filter: ['has', 'point_count'],
        layout: { 'text-field': '{point_count_abbreviated}', 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], 'text-size': 12 },
        paint: { 'text-color': '#ffffff' },
      });
      map.addLayer({
        id: 'unclustered-bg', type: 'circle', source: 'museums', filter: ['!', ['has', 'point_count']],
        paint: { 'circle-color': darkMode ? '#1e1b4b' : '#f5f3ff', 'circle-radius': 18, 'circle-stroke-width': 2, 'circle-stroke-color': color, 'circle-opacity': 0.9 },
      });
      map.addLayer({
        id: 'unclustered-icon', type: 'symbol', source: 'museums', filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': ['match', ['get', 'type'], ...categories.flatMap(cat => [cat, `icon-${cat}`]), 'icon-_default'] as any,
          'icon-size': 0.6, 'icon-allow-overlap': true, 'icon-anchor': 'center',
        },
      });

      // Re-register click handlers
      map.on('click', 'unclustered-bg', (e: any) => { if (e.features?.[0]?.properties?.id) onMuseumClickRef.current(e.features[0].properties.id); });
      map.on('click', 'unclustered-icon', (e: any) => { if (e.features?.[0]?.properties?.id) onMuseumClickRef.current(e.features[0].properties.id); });
      map.on('click', 'clusters', (e: any) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        if (!features.length) return;
        const source = map.getSource('museums') as maplibregl.GeoJSONSource;
        const clusterId = features[0].properties?.cluster_id;

        const geometry = features[0].geometry;
        if (geometry.type === 'Point') {
          map.flyTo({ center: geometry.coordinates as [number, number], zoom: map.getZoom(), duration: 300 });
        }

        source.getClusterLeaves(clusterId, 100, 0).then((leaves) => {
          if (!leaves || leaves.length === 0) return;

          const popupNode = document.createElement('div');
          const root = createRoot(popupNode);

          const listItems = leaves.map((lf: any, idx: number) => {
            const p = lf.properties;
            return (
              <div
                key={idx}
                className="px-4 py-3 border-b border-gray-100 dark:border-neutral-700 last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                onClick={() => {
                  if (p?.id) onMuseumClickRef.current(p.id);
                }}
              >
                <div className="font-bold text-gray-900 dark:text-neutral-100 text-sm truncate">{p?.name}</div>
                <div className="text-[11px] text-gray-500 dark:text-neutral-400 mt-0.5 truncate flex items-center gap-1.5">
                  {p?.country ? `${p.city}, ${p.country}` : p?.city}
                  {p?.type && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{p.type}</span>
                    </>
                  )}
                </div>
              </div>
            );
          });

          root.render(
            <div className="max-h-60 overflow-y-auto w-48 bg-white dark:bg-neutral-900 rounded-lg shadow-xl" style={{ overscrollBehavior: 'contain' }}>
              <div className="sticky top-0 bg-gray-100 dark:bg-neutral-800 px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-neutral-700 z-10">
                {leaves.length} Museums
              </div>
              {listItems}
            </div>
          );

          if (geometry.type === 'Point') {
            new maplibregl.Popup({ closeButton: false, maxWidth: '240px', offset: 15 })
              .setLngLat(geometry.coordinates as [number, number])
              .setDOMContent(popupNode)
              .addTo(map);
          }
        }).catch(() => { });
      });
      map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
      map.on('mouseenter', 'unclustered-bg', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'unclustered-bg', () => { map.getCanvas().style.cursor = ''; });

      // Restore position
      map.jumpTo({ center, zoom });
    });
  }, [darkMode, museums]);

  // Update data when museums change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded.current) {
      pendingData.current = museums;
      return;
    }
    const source = mapRef.current.getSource('museums') as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(museumsToGeoJSON(museums));
    }
  }, [museums]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
