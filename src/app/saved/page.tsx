'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GlassPanel } from '@/components/ui/glass';

export default function SavedPage() {
    const router = useRouter();
    const [saves, setSaves] = useState<any[]>([]);
    const [folders, setFolders] = useState<any[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [selectedMuseums, setSelectedMuseums] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchSaves(selectedFolder);
        // Ideally fetch folders here too
    }, [selectedFolder]);

    const fetchSaves = async (folderId: string | null) => {
        let url = '/api/me/saves';
        if (folderId) url += `?folderId=${folderId}`;
        const res = await fetch(url).then(r => r.json());
        if (res.data) setSaves(res.data);
    };

    const toggleSelect = (museumId: string) => {
        const next = new Set(selectedMuseums);
        if (next.has(museumId)) next.delete(museumId);
        else next.add(museumId);
        setSelectedMuseums(next);
    };

    const handleCreateAutoRoute = () => {
        if (selectedMuseums.size === 0) return alert('Select at least one museum');

        // Store in session storage or send to /plans/new via query
        const ids = Array.from(selectedMuseums).join(',');
        router.push(`/plans/new?museums=${ids}`);
    };

    return (
        <div className="max-w-5xl mx-auto p-6 mt-6">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight">My Pick</h1>
                <p className="text-gray-500 mt-2 text-sm">Organize your saved museums and plan your next route.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Folders List (Sidebar) */}
                <div className="w-full md:w-64 space-y-2">
                    <button
                        onClick={() => setSelectedFolder(null)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${selectedFolder === null ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                        All Saved
                    </button>
                    {/* Map folders here when API is ready */}
                </div>

                {/* Saves Grid */}
                <div className="flex-1">
                    {selectedMuseums.size > 0 && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex justify-between items-center">
                            <span className="text-blue-800 font-semibold">{selectedMuseums.size} selected</span>
                            <button
                                onClick={handleCreateAutoRoute}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition"
                            >
                                Create AutoRoute
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {saves.map(s => (
                            <GlassPanel key={s.id} className="overflow-hidden group cursor-pointer" onClick={() => toggleSelect(s.museum.id)}>
                                <div className="h-40 bg-gray-200 relative">
                                    {s.museum.imageUrl ? (
                                        <img src={s.museum.imageUrl} alt={s.museum.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium bg-gradient-to-br from-gray-100 to-gray-200">
                                            No Image
                                        </div>
                                    )}
                                    {/* Select Checkbox */}
                                    <div className={`absolute top-3 left-3 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-colors ${selectedMuseums.has(s.museum.id) ? 'bg-blue-600' : 'bg-black/20 backdrop-blur-md'}`}>
                                        {selectedMuseums.has(s.museum.id) && <span className="text-white text-xs">✓</span>}
                                    </div>
                                </div>
                                <div className="p-4 bg-white/50 backdrop-blur-md">
                                    <h3 className="font-bold text-lg mb-1">{s.museum.name}</h3>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">{s.museum.city}, {s.museum.country}</p>
                                </div>
                            </GlassPanel>
                        ))}
                        {saves.length === 0 && (
                            <div className="col-span-full py-20 text-center text-gray-400">
                                No saved museums found. Go to the map to save some!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
