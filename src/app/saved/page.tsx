'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GlassPanel } from '@/components/ui/glass';
import { useApp } from '@/components/AppContext';
import { useModal } from '@/components/ui/Modal';
import { t } from '@/lib/i18n';
import * as gtag from '@/lib/gtag';

export default function SavedPage() {
    const router = useRouter();
    const [saves, setSaves] = useState<any[]>([]);
    const [folders, setFolders] = useState<any[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [selectedMuseums, setSelectedMuseums] = useState<Set<string>>(new Set());
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const { locale } = useApp();
    const { showAlert, showConfirm } = useModal();

    useEffect(() => {
        fetchSaves(selectedFolder);
    }, [selectedFolder]);

    // Re-fetch when coming back from detail page (unsave reflected)
    useEffect(() => {
        const onFocus = () => fetchSaves(selectedFolder);
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [selectedFolder]);

    const fetchSaves = async (folderId: string | null) => {
        setLoading(true);
        let url = '/api/me/saves';
        if (folderId) url += `?folderId=${folderId}`;
        try {
            const res = await fetch(url).then(r => r.json());
            if (res.data) setSaves(res.data);
        } finally {
            setLoading(false);
        }
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
        gtag.event('generate_autoroute', {
            category: 'autoroute',
            label: ids,
            value: selectedMuseums.size
        });
        router.push(`/plans/new?museums=${ids}`);
    };

    return (
        <div className="w-full max-w-[1080px] mx-auto px-4 py-4 sm:px-6 sm:py-8 md:px-8 mt-4 sm:mt-8">
            <div className="mb-6 sm:mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight dark:text-white">{t('saved.title', locale)}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 sm:mt-2 text-sm">{t('saved.subtitle', locale)}</p>
                </div>
                {saves.length > 0 && (
                    <button
                        onClick={() => {
                            setIsSelectMode(!isSelectMode);
                            if (isSelectMode) setSelectedMuseums(new Set());
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors border shadow-sm ${isSelectMode ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700 dark:hover:bg-neutral-700'}`}
                    >
                        {isSelectMode ? t('modal.cancel', locale) || 'Cancel' : t('global.select', locale)}
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-6 sm:gap-8">
                {/* Saves grid */}
                <div className="flex-1">
                    {selectedMuseums.size > 0 && (
                        <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800 rounded-xl p-4 mb-6 flex justify-between items-center">
                            <span className="text-purple-800 dark:text-purple-300 font-semibold text-sm">{selectedMuseums.size} {t('saved.selected', locale)}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCreateAutoRoute}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-purple-700 transition"
                                >
                                    {t('saved.createAutoRoute', locale)}
                                </button>
                                <button
                                    onClick={() => {
                                        showConfirm(t('modal.deleteCollection', locale), async () => {
                                            const ids = saves.filter(s => selectedMuseums.has(s.museum.id)).map(s => s.id);
                                            await Promise.all(ids.map(id => fetch(`/api/me/saves/${id}`, { method: 'DELETE' })));
                                            setSaves(prev => prev.filter(s => !selectedMuseums.has(s.museum.id)));
                                            setSelectedMuseums(new Set());
                                        });
                                    }}
                                    className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                                    title="Delete selected"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full col-span-full">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <GlassPanel key={i} className="overflow-hidden">
                                    <div className="h-40 bg-gray-200 dark:bg-neutral-800 animate-pulse relative">
                                        <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-black/10 dark:bg-white/10" />
                                        <div className="absolute top-3 right-3 w-16 h-6 rounded-full bg-white/50 dark:bg-black/50" />
                                    </div>
                                    <div className="p-4 bg-white/50 dark:bg-neutral-900/50">
                                        <div className="h-5 bg-gray-200 dark:bg-neutral-800 rounded w-3/4 mb-2 animate-pulse" />
                                        <div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded w-1/2 animate-pulse" />
                                    </div>
                                </GlassPanel>
                            ))}
                        </div>
                    ) : saves.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full col-span-full">
                            {saves.map(s => (
                                <GlassPanel
                                    key={s.id}
                                    className="overflow-hidden group cursor-pointer"
                                    onClick={() => {
                                        if (isSelectMode) toggleSelect(s.museum.id);
                                        else router.push(`/museums/${s.museum.id}`);
                                    }}
                                >
                                    <div className="h-40 bg-gray-200 dark:bg-neutral-800 relative overflow-hidden">
                                        <img src={s.museum.imageUrl || '/defaultimg.png'} alt={s.museum.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).src = '/defaultimg.png'; }} />

                                        {isSelectMode && (
                                            <div className={`absolute top-3 left-3 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-colors ${selectedMuseums.has(s.museum.id) ? 'bg-purple-500 border-purple-200' : 'bg-black/20 backdrop-blur-md'}`}>
                                                {selectedMuseums.has(s.museum.id) && <span className="text-white text-xs">✓</span>}
                                            </div>
                                        )}
                                        {s.museum.type && (
                                            <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md shadow-sm">
                                                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 capitalize">
                                                    {s.museum.type}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md">
                                        <h3 className="font-bold text-lg mb-1 dark:text-white capitalize truncate">{s.museum.name}</h3>
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase truncate">{s.museum.city}, {s.museum.country}</p>
                                    </div>
                                </GlassPanel>
                            ))}
                        </div>
                    ) : (
                        <div className="col-span-full py-16 sm:py-20 text-center text-gray-400 dark:text-gray-500 w-full">
                            {t('saved.noSaves', locale)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
