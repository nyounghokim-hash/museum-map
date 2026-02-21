'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GlassPanel } from '@/components/ui/glass';
import { useApp } from '@/components/AppContext';
import { useModal } from '@/components/ui/Modal';
import { t } from '@/lib/i18n';

export default function SavedPage() {
    const router = useRouter();
    const [saves, setSaves] = useState<any[]>([]);
    const [folders, setFolders] = useState<any[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [selectedMuseums, setSelectedMuseums] = useState<Set<string>>(new Set());
    const { locale } = useApp();
    const { showAlert } = useModal();

    useEffect(() => {
        fetchSaves(selectedFolder);
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
        if (selectedMuseums.size === 0) {
            showAlert(t('saved.selectAtLeast', locale));
            return;
        }
        const ids = Array.from(selectedMuseums).join(',');
        router.push(`/plans/new?museums=${ids}`);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-4 sm:p-6 sm:mt-6">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight dark:text-white">{t('saved.title', locale)}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 sm:mt-2 text-sm">{t('saved.subtitle', locale)}</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
                {/* Folders sidebar */}
                <div className="w-full md:w-64 space-y-2">
                    <button
                        onClick={() => setSelectedFolder(null)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${selectedFolder === null
                            ? 'bg-black dark:bg-white text-white dark:text-black'
                            : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
                            }`}
                    >
                        {t('saved.allSaved', locale)}
                    </button>
                </div>

                {/* Saves grid */}
                <div className="flex-1">
                    {selectedMuseums.size > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mb-6 flex justify-between items-center">
                            <span className="text-blue-800 dark:text-blue-300 font-semibold text-sm">{selectedMuseums.size} {t('saved.selected', locale)}</span>
                            <button
                                onClick={handleCreateAutoRoute}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition"
                            >
                                {t('saved.createAutoRoute', locale)}
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {saves.map(s => (
                            <GlassPanel key={s.id} className="overflow-hidden group cursor-pointer" onClick={() => toggleSelect(s.museum.id)}>
                                <div className="h-40 bg-gray-200 dark:bg-neutral-800 relative">
                                    {s.museum.imageUrl ? (
                                        <img src={s.museum.imageUrl} alt={s.museum.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium bg-gradient-to-br from-gray-100 to-gray-200 dark:from-neutral-800 dark:to-neutral-700">
                                            No Image
                                        </div>
                                    )}
                                    <div className={`absolute top-3 left-3 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-colors ${selectedMuseums.has(s.museum.id) ? 'bg-blue-600' : 'bg-black/20 backdrop-blur-md'}`}>
                                        {selectedMuseums.has(s.museum.id) && <span className="text-white text-xs">✓</span>}
                                    </div>
                                </div>
                                <div className="p-4 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md">
                                    <h3 className="font-bold text-lg mb-1 dark:text-white">{s.museum.name}</h3>
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{s.museum.city}, {s.museum.country}</p>
                                </div>
                            </GlassPanel>
                        ))}
                        {saves.length === 0 && (
                            <div className="col-span-full py-16 sm:py-20 text-center text-gray-400 dark:text-gray-500">
                                {t('saved.noSaves', locale)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
