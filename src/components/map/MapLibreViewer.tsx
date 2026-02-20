'use client';
import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
interface Museum {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: string;
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
export default function MapLibreViewer({
  museums,
  onMuseumClick
}: {
  museums: Museum[],
  onMuseumClick: (id: string) => void
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const mapLoaded = useRef(false);
  const onMuseumClickRef = useRef(onMuseumClick);
  const pendingData = useRef<Museum[] | null>(null);
  useEffect(() => { onMuseumClickRef.current = onMuseumClick; }, [onMuseumClick]);
  // ── Initialize map ONCE ──
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [12.0, 50.0],
      zoom: 3,
      pitch: 0,
      minZoom: 2,
    });
    map.on('load', () => {
      mapLoaded.current = true;
      const data = pendingData.current || museums;
      map.addSource('museums', {
        type: 'geojson',
        data: museumsToGeoJSON(data),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'museums',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#000000',
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
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'museums',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#ff4d4f',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
          'circle-opacity': 1,
          'circle-opacity-transition': { duration: 300, delay: 0 },
          'circle-radius-transition': { duration: 300, delay: 0 },
        }
      });
      map.on('click', 'unclustered-point', (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        if (props?.id) onMuseumClickRef.current(props.id);
      });
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        if (!features.length) return;
        const clusterId = features[0].properties?.cluster_id;
        const source = map.getSource('museums') as maplibregl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          const geometry = features[0].geometry;
          if (geometry.type === 'Point') {
            map.flyTo({
              center: geometry.coordinates as [number, number],
              zoom: zoom ?? 10,
              duration: 600,
              essential: true,
            });
          }
        }).catch(() => {});
      });
      map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
      map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = ''; });
      pendingData.current = null;
    });
    mapRef.current = map;
    return () => {
      mapLoaded.current = false;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // ── Update data when museums change ──
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
