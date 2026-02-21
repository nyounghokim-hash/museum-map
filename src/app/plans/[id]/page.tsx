'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useApp } from '@/components/AppContext';
import { t } from '@/lib/i18n';

const RouteMapViewer = dynamic(() => import('@/components/map/RouteMapViewer'), { ssr: false });

export default function PlanDetailPage() {
    const { id } = useParams();
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { locale } = useApp();

    // Drag reorder state
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [overIndex, setOverIndex] = useState<number | null>(null);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        fetch(`/api/plans/${id}`)
            .then(r => r.json())
            .then(res => {
                if (res.data) setPlan(res.data);
                else setError(res.error?.message || 'Plan not found');
                setLoading(false);
            })
            .catch(() => { setError('Failed to load plan'); setLoading(false); });
    }, [id]);

    const stops = useMemo(() => {
        if (!plan?.stops) return [];
        return [...plan.stops].sort((a: any, b: any) => a.order - b.order);
    }, [plan]);

    const routeStops = useMemo(() => {
        return stops
            .filter((s: any) => s.museum?.latitude && s.museum?.longitude)
            .map((s: any, i: number) => ({
                name: s.museum.name,
                latitude: s.museum.latitude,
                longitude: s.museum.longitude,
                order: i,
            }));
    }, [stops]);

    // --- Long press + drag handlers ---
    const handlePointerDown = useCallback((index: number) => {
        longPressTimer.current = setTimeout(() => {
            setDragIndex(index);
            setIsDragging(true);
            // Haptic feedback on mobile if available
            if (navigator.vibrate) navigator.vibrate(50);
        }, 800);
    }, []);

    const handlePointerUp = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        if (isDragging && dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
            // Reorder stops
            const newStops = [...stops];
            const [moved] = newStops.splice(dragIndex, 1);
            newStops.splice(overIndex, 0, moved);
            // Update order field
            const updated = newStops.map((s, i) => ({ ...s, order: i }));
            setPlan((prev: any) => ({ ...prev, stops: updated }));

            // Persist to API (fire and forget)
            fetch(`/api/plans/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stops: updated.map((s, i) => ({ id: s.id, order: i })) }),
            }).catch(() => { });
        }
        setDragIndex(null);
        setOverIndex(null);
        setIsDragging(false);
    }, [isDragging, dragIndex, overIndex, stops, id]);

    const handlePointerCancel = useCallback(() => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        setDragIndex(null);
        setOverIndex(null);
        setIsDragging(false);
    }, []);

    if (loading) return <div className="p-20 text-center text-lg font-semibold animate-pulse dark:text-white">Loading plan...</div>;

    if (error) return (
        <div className="p-20 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
            <Link href="/plans" className="text-blue-600 font-semibold hover:underline">{t('detail.backToMap', locale)}</Link>
        </div>
    );

    const dateStr = plan?.date ? new Date(plan.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '';
    const now = new Date();

    return (
        <div className="flex flex-col sm:flex-row h-[calc(100vh-3.5rem)]">
            {/* Mobile toggle bar */}
            <button
                onClick={() => setSidebarOpen(prev => !prev)}
                className="sm:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 text-sm font-bold dark:text-white"
            >
                <span>{plan?.title || 'AutoRoute'} • {stops.length} {t('plans.stops', locale)}</span>
                <svg className={`w-4 h-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Sidebar: Route List */}
            <div className={`${sidebarOpen ? 'max-h-[50vh] sm:max-h-none' : 'max-h-0'} sm:!max-h-none overflow-hidden sm:overflow-y-auto transition-all duration-300 w-full sm:w-96 bg-white dark:bg-neutral-900 sm:border-r border-gray-200 dark:border-neutral-800 shrink-0`}>
                <div className="p-4 sm:p-6 flex flex-col">
                    <Link href="/plans" className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white mb-3 inline-flex items-center gap-1 transition-colors">
                        ← {t('plans.title', locale)}
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-bold mb-1 dark:text-white">{plan?.title || 'AutoRoute'}</h1>
                    {dateStr && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">📅 {dateStr}</p>}

                    <div className="space-y-3 relative">
                        {/* Vertical timeline line */}
                        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-neutral-700 z-0"></div>

                        {stops.map((stop: any, i: number) => {
                            const arrival = stop.expectedArrival
                                ? new Date(stop.expectedArrival)
                                : new Date(now.getTime() + i * 2 * 60 * 60 * 1000);
                            const timeStr = arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const isBeingDragged = dragIndex === i;
                            const isDropTarget = overIndex === i && dragIndex !== i;

                            return (
                                <div
                                    key={stop.id || i}
                                    className={`relative z-10 flex gap-3 sm:gap-4 p-3 rounded-xl border transition-all select-none touch-none
                                        ${isBeingDragged
                                            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 shadow-lg scale-[1.02] opacity-80'
                                            : isDropTarget
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600 border-dashed'
                                                : 'bg-white dark:bg-neutral-900 border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-md'
                                        }`}
                                    onPointerDown={() => handlePointerDown(i)}
                                    onPointerUp={handlePointerUp}
                                    onPointerCancel={handlePointerCancel}
                                    onPointerLeave={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
                                    onPointerEnter={() => { if (isDragging) setOverIndex(i); }}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${isBeingDragged ? 'bg-blue-600 text-white' : 'bg-black dark:bg-white text-white dark:text-black'
                                        }`}>
                                        {i + 1}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-sm sm:text-base truncate dark:text-white">{stop.museum?.name || `Stop ${i + 1}`}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {stop.museum?.city && `${stop.museum.city}, ${stop.museum.country} • `}
                                            Est. {timeStr}
                                        </p>
                                    </div>
                                    {isDragging && (
                                        <div className="flex items-center text-gray-300 dark:text-gray-600">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {stops.length === 0 && (
                            <p className="text-sm text-gray-400 dark:text-gray-500 pl-12">No stops in this plan.</p>
                        )}
                    </div>

                    {isDragging && (
                        <p className="text-xs text-blue-500 dark:text-blue-400 text-center mt-3 animate-pulse">
                            Drag to reorder → tap to place
                        </p>
                    )}

                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 dark:border-neutral-800 space-y-3">
                        <button className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-bold hover:bg-neutral-800 dark:hover:bg-gray-200 transition-colors active:scale-[0.98]">
                            Start Trip
                        </button>
                        <Link
                            href="/plans"
                            className="block w-full text-center bg-white dark:bg-neutral-900 text-black dark:text-white border border-gray-200 dark:border-neutral-700 py-3 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                            {t('plans.title', locale)}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Content: Route Map */}
            <div className="flex-1 relative min-h-[300px]">
                {routeStops.length > 0 ? (
                    <RouteMapViewer stops={routeStops} />
                ) : (
                    <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                        <span className="text-zinc-500 font-medium bg-white/50 dark:bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
                            No route data available
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
