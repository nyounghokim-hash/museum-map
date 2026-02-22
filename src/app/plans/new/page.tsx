'use client';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GlassPanel } from '@/components/ui/glass';
import { useApp } from '@/components/AppContext';
import { t } from '@/lib/i18n';
import dynamic from 'next/dynamic';

const RouteMapViewer = dynamic(() => import('@/components/map/RouteMapViewer'), { ssr: false });

function AutoRouteContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [route, setRoute] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { locale } = useApp();

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
                router.push('/plans');
            } else {
                alert(`${t('plans.saveError', locale)} ` + (data.error?.message || ''));
                setSaving(false);
            }
        } catch {
            alert(t('global.networkError', locale));
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center text-lg font-semibold animate-pulse dark:text-gray-300">{t('plans.generating', locale)}</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 mt-6">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 dark:text-white">{t('plans.reviewAutoRoute', locale)}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t('plans.reviewAutoRouteDesc', locale)}</p>

            {/* Mini Route Map Preview */}
            {routeStops.length > 0 && (
                <div className="w-full h-64 rounded-2xl overflow-hidden border border-gray-200 shadow-sm mb-8">
                    <RouteMapViewer stops={routeStops} />
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-4">
                    <form onSubmit={handleSavePlan} className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm mb-6">
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('plans.tripTitle', locale)}</label>
                            <input name="title" required type="text" placeholder={t('plans.tripTitlePlaceholder', locale)} className="w-full border-gray-300 dark:border-neutral-700 rounded-lg p-3 bg-gray-50 dark:bg-neutral-800 border focus:bg-white dark:focus:bg-neutral-900 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition dark:text-white" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('plans.startingDate', locale)}</label>
                            <input name="date" required type="date" className="w-full border-gray-300 dark:border-neutral-700 rounded-lg p-3 bg-gray-50 dark:bg-neutral-800 border focus:bg-white dark:focus:bg-neutral-900 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition dark:text-white" />
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
                    <GlassPanel className="p-6 relative">
                        <h3 className="text-lg font-bold mb-6 dark:text-white">{t('plans.routeItinerary', locale)}</h3>
                        <div className="absolute left-10 top-20 bottom-10 w-0.5 bg-gray-200 dark:bg-neutral-700 z-0"></div>

                        <div className="space-y-6 relative z-10">
                            {route.map((stop, i) => (
                                <div key={stop.museumId || i} className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                                        {i + 1}
                                    </div>
                                    <div className="bg-white/80 dark:bg-neutral-900/80 p-3 rounded-lg border border-gray-100 dark:border-neutral-800 flex-1 backdrop-blur-sm shadow-sm">
                                        <h4 className="font-bold text-sm dark:text-white">{stop.name}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {t('plans.est', locale)} {new Date(stop.expectedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassPanel>
                </div>
            </div>
        </div>
    );
}

export default function AutoRoutePlanPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center text-lg font-semibold animate-pulse">Loading...</div>}>
            <AutoRouteContent />
        </Suspense>
    );
}
