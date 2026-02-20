'use client';
import { useState, useEffect } from 'react';
import { GlassPanel, FilterChip } from '@/components/ui/glass';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Dynamic import to avoid SSR issues with MapLibre GL
const MapLibreViewer = dynamic(() => import('@/components/map/MapLibreViewer'), { ssr: false });

export default function MainPage() {
  const router = useRouter();
  const [museums, setMuseums] = useState<any[]>([]);
  const [selectedMuseum, setSelectedMuseum] = useState<any | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  useEffect(() => {
    // Fetch all museums
    fetch('/api/museums?limit=2000')
      .then(r => r.json())
      .then(res => setMuseums(res.data?.data || res.data || []))
      .catch(console.error);
  }, []);

  const handleMuseumClick = async (id: string) => {
    const res = await fetch(`/api/museums/${id}`);
    const data = await res.json();
    if (data.data) {
      setSelectedMuseum(data.data);
    }
  };

  const handleSave = async (id: string) => {
    await fetch('/api/saves', { method: 'POST', body: JSON.stringify({ museumId: id }) });
    alert('Saved!');
  };

  const filteredMuseums = activeFilter === 'All'
    ? museums
    : museums.filter(m => m.type === activeFilter);

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)]">
      {/* 1. Map Layer */}
      <div className="absolute inset-0 z-0">
        <MapLibreViewer museums={filteredMuseums} onMuseumClick={handleMuseumClick} />
      </div>

      {/* 2. Top UI: Search & Filter Chips (Glassmorphism) */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-col sm:flex-row gap-3 pointer-events-none">
        <div className="pointer-events-auto max-w-sm w-full">
          <input
            type="text"
            placeholder="Search contemporary museums..."
            className="w-full bg-white/80 backdrop-blur-md border border-white p-3 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div className="flex gap-2 pointer-events-auto overflow-x-auto pb-2 sm:pb-0">
          {['All', 'Public', 'Private', 'Foundation'].map(f => (
            <FilterChip key={f} active={activeFilter === f} onClick={() => setActiveFilter(f)}>
              {f}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Museum count badge */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
        <span className="bg-black/80 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-md">
          {filteredMuseums.length.toLocaleString()} museums
        </span>
      </div>

      {/* 3. Bottom Sheet / Side Panel for Selected Museum */}
      {selectedMuseum && (
        <div className="absolute bottom-4 left-4 right-4 sm:top-24 sm:bottom-auto sm:left-4 sm:right-auto sm:w-96 z-20">
          <GlassPanel className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 leading-tight">
                {selectedMuseum.name}
              </h2>
              <button onClick={() => setSelectedMuseum(null)} className="text-gray-400 hover:text-black mt-1">✕</button>
            </div>

            <p className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">
              {selectedMuseum.type} • {selectedMuseum.city}, {selectedMuseum.country}
            </p>

            <p className="text-sm text-gray-700 mb-6 line-clamp-3">
              {selectedMuseum.description || "A premier contemporary art museum offering diverse exhibitions and immersive experiences."}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSave(selectedMuseum.id)}
                className="bg-black text-white py-3 rounded-xl font-bold shadow-lg shadow-black/20 hover:bg-neutral-800 transition-all active:scale-95 text-sm"
              >
                Save to Folder
              </button>
              <button
                onClick={() => router.push(`/museums/${selectedMuseum.id}`)}
                className="bg-white text-black border border-gray-200 py-3 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-all active:scale-95 text-sm"
              >
                View Details
              </button>
            </div>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
