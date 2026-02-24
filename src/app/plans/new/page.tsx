'use client';
import { useState, useEffect, useMemo, Suspense, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/components/AppContext';
import { useModal } from '@/components/ui/Modal';
import { GlassPanel } from '@/components/ui/glass';
import { t } from '@/lib/i18n';
import dynamic from 'next/dynamic';
import * as gtag from '@/lib/gtag';
import LoadingAnimation from '@/components/ui/LoadingAnimation';

const RouteMapViewer = dynamic(() => import('@/components/map/RouteMapViewer'), { ssr: false });

function AutoRouteContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showAlert } = useModal();
    const [route, setRoute] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { locale, darkMode } = useApp();

    // Drag reorder state
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [overIndex, setOverIndex] = useState<number | null>(null);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const ids = searchParams.get('museums');
        if (!ids) {
            // Demo mode: fetch first 5 museums as sample route
            fetch('/api/museums?limit=5')
                .then(r => r.json())
                .then(res => {
                    const list = res.data?.data || res.data || [];
                    const demoRoute = list.map((m: any, i: number) => ({
                        museumId: m.id,
                        name: m.name,
                        latitude: m.latitude,
                        longitude: m.longitude,
                        order: i,
                        expectedArrival: new Date(Date.now() + i * 2 * 60 * 60 * 1000),
                    }));
                    setRoute(demoRoute);
                    setLoading(false);
                })
                .catch(console.error);
            return;
        }

        // Call TSP generator
        fetch('/api/route/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ museumIds: ids.split(',') })
        })
            .then(r => r.json())
            .then(res => {
                if (res.data?.route) {
                    // Enrich with coordinates by fetching each museum
                    const stops = res.data.route;
                    // Fetch museum details for coordinates
                    Promise.all(
                        stops.map((s: any) =>
                            fetch(`/api/museums/${s.museumId}`)
                                .then(r => r.json())
                                .then(d => ({ ...s, latitude: d.data?.latitude, longitude: d.data?.longitude }))
                                .catch(() => s)
                        )
                    ).then(enriched => {
                        setRoute(enriched);
                        setLoading(false);
                    });
                } else {
                    setLoading(false);
                }
            })
            .catch(console.error);
    }, [searchParams]);

    const routeStops = useMemo(() =>
        route.filter(s => s.latitude && s.longitude).map(s => ({
            name: s.name,
            latitude: s.latitude,
            longitude: s.longitude,
            order: s.order,
        })),
        [route]
    );

    const handleSavePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const formData = new FormData(e.target as HTMLFormElement);
        const title = formData.get('title') as string;
        const date = formData.get('date') as string;

        try {
            const res = await fetch('/api/plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, date, stops: route })
            });
            const data = await res.json();
            if (data.data) {
                gtag.event('save_plan', {
                    category: 'plan',
                    label: title,
                    value: route.length
                });
                router.push('/plans');
            } else {
                showAlert(`${t('plans.saveError', locale)} ` + (data.error?.message || ''));
                setSaving(false);
            }
        } catch {
            showAlert(t('global.networkError', locale));
            setSaving(false);
        }
    };

    // --- Long press + drag handlers ---
    const handlePointerDown = useCallback((index: number) => {
        longPressTimer.current = setTimeout(() => {
            setDragIndex(index);
            setIsDragging(true);
            if (navigator.vibrate) navigator.vibrate(50);
        }, 500); // 500ms long press to start dragging
    }, []);

    const handlePointerUp = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        if (isDragging && dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
            setRoute(prevRoute => {
                const newRoute = [...prevRoute];
                const [moved] = newRoute.splice(dragIndex, 1);
                newRoute.splice(overIndex, 0, moved);
                // Re-assign expectedArrival and order based on new index positions
                return newRoute.map((s, i) => ({
                    ...s,
                    order: i,
                    expectedArrival: new Date(Date.now() + i * 2 * 60 * 60 * 1000)
                }));
            });
        }
        setDragIndex(null);
        setOverIndex(null);
        setIsDragging(false);
    }, [isDragging, dragIndex, overIndex]);

    const handlePointerCancel = useCallback(() => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        setDragIndex(null);
        setOverIndex(null);
        setIsDragging(false);
    }, []);

    if (loading) return <div className="p-20 text-center text-lg font-semibold animate-pulse dark:text-gray-300">{t('plans.generating', locale)}</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 mt-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 dark:text-white">{t('plans.reviewAutoRoute', locale)}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t('plans.reviewAutoRouteDesc', locale)}</p>

            {/* Mini Route Map Preview */}
            {routeStops.length > 0 && (
                <div className="w-full h-64 rounded-2xl overflow-hidden border border-gray-200 shadow-sm mb-8">
                    <RouteMapViewer stops={routeStops} darkMode={darkMode} />
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-4">
                    <form onSubmit={handleSavePlan} className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('plans.tripTitle', locale)}</label>
                                <input name="title" required type="text" placeholder={t('plans.tripTitlePlaceholder', locale)} className="w-full border-gray-300 dark:border-neutral-700 rounded-lg p-3 bg-gray-50 dark:bg-neutral-800 border focus:bg-white dark:focus:bg-neutral-900 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('plans.startingDate', locale)}</label>
                                <input name="date" required type="date" className="w-full border-gray-300 dark:border-neutral-700 rounded-lg p-3 bg-gray-50 dark:bg-neutral-800 border focus:bg-white dark:focus:bg-neutral-900 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition dark:text-white" />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3 rounded-xl shadow-lg hover:bg-neutral-800 dark:hover:bg-gray-200 transition active:scale-95 disabled:opacity-50"
                        >
                            {saving ? t('plans.saving', locale) : t('plans.confirmSave', locale)}
                        </button>
                    </form>
                </div>

                <div className="w-full md:w-96">
                    <GlassPanel className="p-6 relative max-h-[calc(100vh-8rem)] overflow-y-auto hide-scrollbar">
                        <h3 className="text-lg font-bold mb-6 dark:text-white">{t('plans.routeItinerary', locale)}</h3>
                        <div className="absolute left-10 top-20 bottom-10 w-0.5 bg-gray-200 dark:bg-neutral-700 z-0"></div>

                        <div className="space-y-6 relative z-10">
                            {route.map((stop, i) => {
                                const isBeingDragged = dragIndex === i;
                                const isDropTarget = overIndex === i && dragIndex !== i;

                                return (
                                    <div
                                        key={stop.museumId || i}
                                        className={`flex gap-4 items-start transition-all cursor-grab active:cursor-grabbing select-none touch-none
                                            ${isBeingDragged ? 'opacity-50 scale-105 rounded-xl bg-gray-100 p-2 -m-2 z-20' : ''}
                                            ${isDropTarget ? 'border-t-2 border-primary pt-2 mt-2 -t-2' : ''}
                                        `}
                                        onPointerDown={() => handlePointerDown(i)}
                                        onPointerUp={handlePointerUp}
                                        onPointerCancel={handlePointerCancel}
                                        onPointerLeave={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
                                        onPointerEnter={() => { if (isDragging) setOverIndex(i); }}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-md ${isBeingDragged ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'}`}>
                                            {i + 1}
                                        </div>
                                        <div className={`flex-1 p-3 rounded-lg border flex justify-between items-center shadow-sm backdrop-blur-sm
                                            ${isBeingDragged ? 'border-purple-400 bg-purple-50/50 dark:bg-purple-900/30 dark:border-purple-700' : 'bg-white/80 dark:bg-neutral-900/80 border-gray-100 dark:border-neutral-800'}`}>
                                            <div>
                                                <h4 className="font-bold text-sm dark:text-white">{stop.name}</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {t('plans.est', locale)} {new Date(stop.expectedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            {isDragging && (
                                                <div className="text-gray-400 dark:text-gray-500">
                                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {isDragging && (
                            <p className="text-xs text-purple-500 dark:text-purple-400 text-center mt-6 animate-pulse">
                                {t('plans.dragReorder', locale)}
                            </p>
                        )}
                    </GlassPanel>
                </div>
            </div>
        </div>
    );
}

export default function AutoRoutePlanPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><LoadingAnimation size={120} /></div>}>
            <AutoRouteContent />
        </Suspense>
    );
}
