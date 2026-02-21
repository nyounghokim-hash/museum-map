'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/AppContext';
import { useModal } from '@/components/ui/Modal';
import { t } from '@/lib/i18n';

const RouteMapViewer = dynamic(() => import('@/components/map/RouteMapViewer'), { ssr: false });

export default function PlanDetailPage() {
    const { id } = useParams();
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { locale } = useApp();
    const { showAlert, showConfirm } = useModal();
    const router = useRouter();

    // Drag reorder state
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [overIndex, setOverIndex] = useState<number | null>(null);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [hydrated, setHydrated] = useState(false);
    const [activeTripId, setActiveTripId] = useState<string | null>(null);
    const [stops, setStops] = useState<any[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    // Initial fetch
    useEffect(() => {
        fetch(`/api/plans/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setPlan(data.data);
                    // Initialize stops array respecting db order or array index
                    const dbStops = data.data.stops?.sort((a: any, b: any) => a.order - b.order) || [];
                    setStops(dbStops);
                } else {
                    setError('Plan not found');
                }
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to load plan');
                setLoading(false);
            });

        // Hydrate active trip
        const stored = localStorage.getItem('activeTrip');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed?.planId) setActiveTripId(parsed.planId);
            } catch (e) {
                console.error('Failed to parse parse active trip', e);
            }
        }
        setHydrated(true); // Set hydrated to true after initial load
    }, [id]);

    // Removed useMemo for stops as it's now a state variable

    const routeStops = useMemo(() => {
        return stops
            .filter((s: any) => s.museum?.latitude && s.museum?.longitude)
            .map((s: any, i: number) => ({
                name: s.museum.name,
                latitude: s.museum.latitude,
                longitude: s.museum.longitude,
                order: i,
                museumId: s.museum.id,
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
            setStops(updated); // Update the state variable
            setPlan((prev: any) => ({ ...prev, stops: updated })); // Also update plan for consistency

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

    const handleSave = useCallback(async () => {
        if (!plan?.stops) return;
        const body = { stops: stops.map((s: any, i: number) => ({ id: s.id, order: i })) };
        try {
            await fetch(`/api/plans/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            showAlert(t('plans.saved', locale));
        } catch {
            showAlert('Failed to save');
        }
    }, [stops, id, showAlert, locale]);

    const handleStartTrip = useCallback(() => {
        if (!plan) return;
        const tripData = {
            planId: id,
            title: plan.title || 'AutoRoute',
            stops: stops, // Changed from routeStops to stops
            startTime: new Date().toISOString() // Changed from startedAt to startTime
        };
        localStorage.setItem('activeTrip', JSON.stringify(tripData));
        setActiveTripId(id as string); // Set activeTripId
        showAlert(t('plans.tripStarted', locale));
        router.push('/'); // Redirect to home
    }, [plan, stops, id, router, showAlert, locale]);

    const handleEndTrip = useCallback(() => {
        showConfirm(t('plans.confirmEndTrip', locale) || '정말로 투어를 종료하시겠습니까?', () => {
            localStorage.removeItem('activeTrip');
            setActiveTripId(null);
            showAlert(t('plans.tripEnded', locale) || '투어가 종료되었습니다.');
        });
    }, [locale, showAlert, showConfirm]);

    const handleStopClick = useCallback((stop: any) => {
        if (stop.museumId) {
            router.push(`/museums/${stop.museumId}`);
        }
    }, [router]);

    const handlePointerCancel = useCallback(() => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        setDragIndex(null);
        setOverIndex(null);
        setIsDragging(false);
    }, []);

    if (loading) return <div className="p-20 text-center text-lg font-semibold animate-pulse dark:text-gray-300">{t('plans.loading', locale)}</div>;

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
                            <p className="text-sm text-gray-400 dark:text-gray-500 pl-12">{t('plans.noStops', locale)}</p>
                        )}
                    </div>

                    {isDragging && (
                        <p className="text-xs text-blue-500 dark:text-blue-400 text-center mt-3 animate-pulse">
                            {t('plans.dragReorder', locale)}
                        </p>
                    )}

                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 dark:border-neutral-800 space-y-3">
                        <button
                            onClick={handleSave}
                            className="w-full bg-gray-100 dark:bg-neutral-800 text-black dark:text-white py-3 rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors active:scale-[0.98]"
                        >
                            {t('plans.saveButton', locale)}
                        </button>
                        {activeTripId === plan?.id ? (
                            <button
                                onClick={handleEndTrip}
                                className="w-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 py-3 rounded-lg font-bold hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors active:scale-[0.98]"
                            >
                                🛑 {t('plans.endTrip', locale)}
                            </button>
                        ) : (
                            <button
                                onClick={handleStartTrip}
                                className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-bold hover:bg-neutral-800 dark:hover:bg-gray-200 transition-colors active:scale-[0.98]"
                            >
                                {t('plans.startTripButton', locale)}
                            </button>
                        )}
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
                    <RouteMapViewer stops={routeStops} onStopClick={handleStopClick} />
                ) : (
                    <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                        <span className="text-zinc-500 font-medium bg-white/50 dark:bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
                            {t('plans.noRouteData', locale)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
